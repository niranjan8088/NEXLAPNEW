import { NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";
import { dispatchPipelineEvent } from "@/lib/pipelineEvents";
import {
  calculateInvoiceTotals,
  sanitizeInvoiceItems,
  validateMobile,
  validateEmail,
  validatePincode,
  validateGSTIN,
} from "@/lib/billingUtils";

export async function GET(request: Request) {
  try {
    const admin = await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("search") || "").toLowerCase().trim();
    const status = searchParams.get("status") || "all";
    const gstFilter = searchParams.get("gst") || "all";

    const allInvoices = await dbHelper.invoices.list();

    let filtered = allInvoices.filter((inv: any) => {
      const numStr = (inv.invoiceNumber || inv.invoice_number || "").toLowerCase();
      const nameStr = (inv.customerName || inv.customer_name || "").toLowerCase();
      const mobileStr = (inv.mobile || "").toLowerCase();

      const matchesSearch =
        !query ||
        numStr.includes(query) ||
        nameStr.includes(query) ||
        mobileStr.includes(query);

      const payStatus = inv.paymentStatus || inv.payment_status || "pending";
      const matchesStatus = status === "all" || payStatus === status;

      const isGst = !!(inv.gstEnabled ?? inv.gst_enabled);
      const matchesGst =
        gstFilter === "all" ||
        (gstFilter === "enabled" && isGst) ||
        (gstFilter === "disabled" && !isGst);

      return matchesSearch && matchesStatus && matchesGst;
    });

    return NextResponse.json({ invoices: filtered });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["admin"]);

    const body = await request.json();
    const {
      customerId,
      customerName,
      mobile,
      email,
      address,
      city,
      state,
      pincode,
      items,
      globalDiscount,
      gstEnabled,
      gstin,
      paymentMethod,
      paymentStatus,
      amountPaid,
      paymentReference,
      paymentBank,
      bankTransferType,
      cardType,
    } = body;

    if (!customerName || !String(customerName).trim()) {
      return NextResponse.json(
        { error: "Customer Name is required." },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile || "").trim();
    if (!cleanMobile || !validateMobile(cleanMobile)) {
      return NextResponse.json(
        { error: "Mobile number must be exactly 10 Indian digits starting with 6-9." },
        { status: 400 }
      );
    }

    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address format." },
        { status: 400 }
      );
    }

    if (pincode && !validatePincode(pincode)) {
      return NextResponse.json(
        { error: "Invalid Indian 6-digit Pincode format." },
        { status: 400 }
      );
    }

    if (gstEnabled && gstin && !validateGSTIN(gstin)) {
      return NextResponse.json(
        { error: "Invalid 15-character Indian GSTIN format." },
        { status: 400 }
      );
    }

    const validPaymentMethods = ["cash", "upi", "bank_transfer", "card", "other"];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
    }

    for (const [label, value] of [
      ["Payment reference", paymentReference],
      ["Bank name", paymentBank],
    ] as const) {
      if (value != null && (typeof value !== "string" || value.length > 120)) {
        return NextResponse.json(
          { error: `${label} must be 120 characters or fewer.` },
          { status: 400 }
        );
      }
    }

    if (bankTransferType && !["neft", "rtgs"].includes(bankTransferType)) {
      return NextResponse.json({ error: "Invalid bank transfer type." }, { status: 400 });
    }
    if (cardType && !["debit", "credit"].includes(cardType)) {
      return NextResponse.json({ error: "Invalid card type." }, { status: 400 });
    }

    const sanitizedItems = sanitizeInvoiceItems(items);
    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "At least one valid product/service item with a name is required." },
        { status: 400 }
      );
    }

    const calculated = calculateInvoiceTotals({
      items,
      globalDiscount: Number(globalDiscount) || 0,
      gstEnabled: !!gstEnabled,
      gstin: (gstin || "").trim(),
      paymentStatus: paymentStatus || "paid",
      amountPaid: Number(amountPaid) || 0,
    });

    const invoiceRecord = await dbHelper.invoices.create({
      customerId: customerId || null,
      customerName: String(customerName).trim(),
      mobile: cleanMobile,
      email: email ? String(email).trim() : "",
      address: address ? String(address).trim() : "",
      city: city ? String(city).trim() : "",
      state: state ? String(state).trim() : "",
      pincode: pincode ? String(pincode).trim() : "",
      items: calculated.items,
      subtotalPaise: calculated.subtotalPaise,
      subtotal: calculated.subtotal,
      globalDiscountPaise: calculated.globalDiscountPaise,
      globalDiscount: calculated.globalDiscount,
      taxableAmountPaise: calculated.taxableAmountPaise,
      taxableAmount: calculated.taxableAmount,
      gstEnabled: calculated.gstEnabled,
      gstin: calculated.gstin,
      cgstPaise: calculated.cgstPaise,
      cgst: calculated.cgst,
      sgstPaise: calculated.sgstPaise,
      sgst: calculated.sgst,
      gstTotalPaise: calculated.gstTotalPaise,
      gstTotal: calculated.gstTotal,
      grandTotalPaise: calculated.grandTotalPaise,
      grandTotal: calculated.grandTotal,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: calculated.paymentStatus,
      paymentReference: ["upi", "bank_transfer", "card"].includes(paymentMethod)
        ? String(paymentReference || "").trim()
        : "",
      paymentBank: ["bank_transfer", "card"].includes(paymentMethod)
        ? String(paymentBank || "").trim()
        : "",
      bankTransferType: paymentMethod === "bank_transfer" ? bankTransferType || "neft" : "",
      cardType: paymentMethod === "card" ? cardType || "debit" : "",
      amountPaidPaise: calculated.amountPaidPaise,
      amountPaid: calculated.amountPaid,
      balanceDuePaise: calculated.balanceDuePaise,
      balanceDue: calculated.balanceDue,
      createdBy: admin.name || admin.email || "Admin Officer",
    });

    // PIPELINE EVENT (ADMIN → CUSTOMER BILLING INVOICE)
    const invNum = invoiceRecord.invoiceNumber || invoiceRecord.invoice_number;
    await dispatchPipelineEvent({
      eventType: "INVOICE_CREATED",
      title: "New Tax Invoice Issued 📄",
      message: `Your official invoice ${invNum} for ₹${calculated.grandTotal.toLocaleString("en-IN")} is now available.`,
      recipientRole: "user",
      recipientUserId: customerId || undefined,
      referenceType: "invoice",
      referenceId: invNum,
      actorRole: "admin",
    });

    return NextResponse.json({ invoice: invoiceRecord }, { status: 201 });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
