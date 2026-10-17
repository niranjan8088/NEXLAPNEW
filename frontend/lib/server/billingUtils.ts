/**
 * lib/billingUtils.ts
 * Single shared calculation engine for NexLapTech Admin Billing & Invoice Module.
 * Financial calculations MUST use INTEGER PAISE internally to prevent floating point inaccuracies.
 */

export interface LineItemInput {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in Rupees
  discount?: number; // in Rupees
}

export interface AppliedOfferInput {
  id: string;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount?: number;
}

export interface CalculationInput {
  items: LineItemInput[];
  globalDiscount?: number; // in Rupees
  appliedOffer?: AppliedOfferInput;
  gstEnabled: boolean;
  gstin?: string;
  paymentStatus: "paid" | "pending" | "partially_paid";
  amountPaid?: number; // in Rupees
}

export interface CalculatedLineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  unitPricePaise: number;
  discountPaise: number;
  lineGrossPaise: number;
  lineDiscountPaise: number;
  lineTotalPaise: number;
  lineTotal: number;
}

export interface CalculationResult {
  items: CalculatedLineItem[];
  subtotalPaise: number;
  subtotal: number;
  globalDiscountPaise: number;
  globalDiscount: number;
  offerDiscountPaise: number;
  offerDiscount: number;
  appliedOffer: AppliedOfferInput | null;
  taxableAmountPaise: number;
  taxableAmount: number;
  gstEnabled: boolean;
  gstin: string;
  cgstPaise: number;
  cgst: number;
  sgstPaise: number;
  sgst: number;
  gstTotalPaise: number;
  gstTotal: number;
  grandTotalPaise: number;
  grandTotal: number;
  paymentStatus: "paid" | "pending" | "partially_paid";
  amountPaidPaise: number;
  amountPaid: number;
  balanceDuePaise: number;
  balanceDue: number;
}

/** Convert a rupee float/number safely to integer paise */
export function toPaise(rupees: number | undefined | null): number {
  if (!rupees || isNaN(rupees) || rupees < 0) return 0;
  return Math.round(rupees * 100);
}

/** Convert integer paise to rupee number with 2 decimal precision */
export function toRupees(paise: number): number {
  if (!paise || isNaN(paise) || paise < 0) return 0;
  return Number((paise / 100).toFixed(2));
}

/** Format currency in Indian standard ₹1,25,000.00 */
export function formatRupees(amountInRupees: number | undefined | null): string {
  const val = amountInRupees ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/** Formats integer paise directly to standard Indian currency string */
export function formatPaise(paise: number | undefined | null): string {
  return formatRupees(toRupees(paise ?? 0));
}

/**
 * Shared Sanitization Function for Invoice Line Items
 * Removes empty placeholder rows while preserving valid zero-priced items (e.g., Free Diagnostics).
 */
export function sanitizeInvoiceItems(items: LineItemInput[] | undefined | null): LineItemInput[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    if (!item) return false;
    const cleanName = (item.name || "").trim();
    if (!cleanName) return false;
    // Reject default empty placeholder "Item" when unitPrice is 0 and description is empty
    if (cleanName === "Item" && (Number(item.unitPrice) || 0) === 0 && !(item.description || "").trim()) {
      return false;
    }
    const qty = Number(item.quantity);
    if (isNaN(qty) || qty <= 0) return false;
    return true;
  });
}

/** 
 * Central Calculation Function for Invoice & Offer Totals
 * Used by UI form, live preview, backend API, PDF generator, and verification tests.
 */
export function calculateInvoiceTotals(input: CalculationInput): CalculationResult {
  const rawItems = sanitizeInvoiceItems(input.items);
  
  let subtotalPaise = 0;
  const calculatedItems: CalculatedLineItem[] = rawItems.map((item, idx) => {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const unitPricePaise = toPaise(Number(item.unitPrice) || 0);
    const lineGrossPaise = qty * unitPricePaise;
    
    // Line discount cannot exceed line gross
    const requestedDiscountPaise = toPaise(Number(item.discount) || 0);
    const lineDiscountPaise = Math.min(requestedDiscountPaise, lineGrossPaise);
    const lineTotalPaise = lineGrossPaise - lineDiscountPaise;
    
    subtotalPaise += lineTotalPaise;

    return {
      id: item.id || `item-${idx + 1}-${Date.now()}`,
      name: (item.name || "").trim(),
      description: (item.description || "").trim(),
      quantity: qty,
      unitPrice: toRupees(unitPricePaise),
      discount: toRupees(lineDiscountPaise),
      unitPricePaise,
      discountPaise: lineDiscountPaise,
      lineGrossPaise,
      lineDiscountPaise,
      lineTotalPaise,
      lineTotal: toRupees(lineTotalPaise),
    };
  });

  // Global discount cannot exceed subtotal
  const requestedGlobalDiscountPaise = toPaise(Number(input.globalDiscount) || 0);
  const globalDiscountPaise = Math.min(requestedGlobalDiscountPaise, subtotalPaise);
  
  let netSubtotalPaise = subtotalPaise - globalDiscountPaise;

  // Offer / Referral discount
  let offerDiscountPaise = 0;
  let verifiedAppliedOffer: AppliedOfferInput | null = null;

  if (input.appliedOffer) {
    const offer = input.appliedOffer;
    if (offer.discountAmount != null && !isNaN(offer.discountAmount)) {
      offerDiscountPaise = Math.min(toPaise(offer.discountAmount), netSubtotalPaise);
    } else if (offer.discountType === "percentage") {
      offerDiscountPaise = Math.min(Math.round(netSubtotalPaise * (offer.discountValue / 100)), netSubtotalPaise);
    } else if (offer.discountType === "fixed") {
      offerDiscountPaise = Math.min(toPaise(offer.discountValue), netSubtotalPaise);
    }

    verifiedAppliedOffer = {
      ...offer,
      discountAmount: toRupees(offerDiscountPaise)
    };
  }

  // Taxable Amount = Subtotal - Global Discount - Offer Discount
  const taxableAmountPaise = Math.max(0, netSubtotalPaise - offerDiscountPaise);

  let cgstPaise = 0;
  let sgstPaise = 0;
  let gstTotalPaise = 0;

  if (input.gstEnabled) {
    // 18% GST split equally into 9% CGST and 9% SGST calculated AFTER referral discount
    cgstPaise = Math.round(taxableAmountPaise * 0.09);
    sgstPaise = Math.round(taxableAmountPaise * 0.09);
    gstTotalPaise = cgstPaise + sgstPaise;
  }

  const grandTotalPaise = taxableAmountPaise + gstTotalPaise;

  // Payment Status calculations
  let amountPaidPaise = 0;
  let balanceDuePaise = grandTotalPaise;

  if (input.paymentStatus === "paid") {
    amountPaidPaise = grandTotalPaise;
    balanceDuePaise = 0;
  } else if (input.paymentStatus === "pending") {
    amountPaidPaise = 0;
    balanceDuePaise = grandTotalPaise;
  } else if (input.paymentStatus === "partially_paid") {
    const rawPaidPaise = toPaise(Number(input.amountPaid) || 0);
    amountPaidPaise = Math.min(Math.max(0, rawPaidPaise), grandTotalPaise);
    balanceDuePaise = grandTotalPaise - amountPaidPaise;
  }

  return {
    items: calculatedItems,
    subtotalPaise,
    subtotal: toRupees(subtotalPaise),
    globalDiscountPaise,
    globalDiscount: toRupees(globalDiscountPaise),
    offerDiscountPaise,
    offerDiscount: toRupees(offerDiscountPaise),
    appliedOffer: verifiedAppliedOffer,
    taxableAmountPaise,
    taxableAmount: toRupees(taxableAmountPaise),
    gstEnabled: !!input.gstEnabled,
    gstin: (input.gstin || "").trim().toUpperCase(),
    cgstPaise,
    cgst: toRupees(cgstPaise),
    sgstPaise,
    sgst: toRupees(sgstPaise),
    gstTotalPaise,
    gstTotal: toRupees(gstTotalPaise),
    grandTotalPaise,
    grandTotal: toRupees(grandTotalPaise),
    paymentStatus: input.paymentStatus,
    amountPaidPaise,
    amountPaid: toRupees(amountPaidPaise),
    balanceDuePaise,
    balanceDue: toRupees(balanceDuePaise),
  };
}

/** Validation Helpers */
export function validateMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}

export function validateEmail(email?: string): boolean {
  if (!email || !email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePincode(pincode?: string): boolean {
  if (!pincode || !pincode.trim()) return true;
  return /^[1-9]\d{5}$/.test(pincode.trim());
}

export function validateGSTIN(gstin?: string): boolean {
  if (!gstin || !gstin.trim()) return true;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase());
}
