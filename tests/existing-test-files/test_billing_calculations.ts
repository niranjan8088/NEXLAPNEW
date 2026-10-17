import { calculateInvoiceTotals, formatRupees, validateMobile, validateGSTIN } from "./lib/billingUtils";

console.log("=== RUNNING BILLING ENGINE VERIFICATION TESTS ===");

// TEST 1: GST OFF
const test1 = calculateInvoiceTotals({
  items: [{ name: "SSD 500GB", quantity: 1, unitPrice: 5000, discount: 500 }],
  gstEnabled: false,
  paymentStatus: "paid"
});
console.log("TEST 1 (GST OFF):", {
  subtotal: test1.subtotal,
  discount: test1.globalDiscount,
  taxable: test1.taxableAmount,
  cgst: test1.cgst,
  sgst: test1.sgst,
  gstTotal: test1.gstTotal,
  grandTotal: test1.grandTotal
});
if (test1.subtotal !== 4500 || test1.taxableAmount !== 4500 || test1.gstTotal !== 0 || test1.grandTotal !== 4500) {
  throw new Error("Test 1 Failed!");
}

// TEST 2: GST ON
const test2 = calculateInvoiceTotals({
  items: [{ name: "SSD 500GB", quantity: 1, unitPrice: 5000, discount: 500 }],
  gstEnabled: true,
  paymentStatus: "paid"
});
console.log("TEST 2 (GST ON):", {
  taxable: test2.taxableAmount,
  cgst: test2.cgst,
  sgst: test2.sgst,
  gstTotal: test2.gstTotal,
  grandTotal: test2.grandTotal
});
if (test2.taxableAmount !== 4500 || test2.cgst !== 405 || test2.sgst !== 405 || test2.gstTotal !== 810 || test2.grandTotal !== 5310) {
  throw new Error("Test 2 Failed!");
}

// TEST 3: GST OFF with GSTIN filled
const test3 = calculateInvoiceTotals({
  items: [{ name: "SSD 500GB", quantity: 1, unitPrice: 5000, discount: 500 }],
  gstEnabled: false,
  gstin: "29ABCDE1234F1Z5",
  paymentStatus: "paid"
});
if (test3.gstTotal !== 0 || test3.grandTotal !== 4500) {
  throw new Error("Test 3 Failed!");
}
console.log("TEST 3 (GST OFF + GSTIN): PASS");

// TEST 4: Multiple items + global discount
const test4 = calculateInvoiceTotals({
  items: [
    { name: "SSD", quantity: 1, unitPrice: 5000, discount: 500 }, // 4500
    { name: "RAM", quantity: 2, unitPrice: 2000, discount: 100 }  // 3900
  ],
  globalDiscount: 400, // Subtotal 8400 - 400 = 8000
  gstEnabled: true,
  paymentStatus: "paid"
});
console.log("TEST 4 (Multiple items + Global Discount):", {
  subtotal: test4.subtotal,
  globalDiscount: test4.globalDiscount,
  taxableAmount: test4.taxableAmount,
  grandTotal: test4.grandTotal
});
if (test4.subtotal !== 8400 || test4.taxableAmount !== 8000) {
  throw new Error("Test 4 Failed!");
}

// TEST 5: Partial payment
const test5 = calculateInvoiceTotals({
  items: [{ name: "SSD", quantity: 1, unitPrice: 5000, discount: 500 }],
  gstEnabled: true,
  paymentStatus: "partially_paid",
  amountPaid: 3000
});
console.log("TEST 5 (Partial Payment):", {
  grandTotal: test5.grandTotal,
  amountPaid: test5.amountPaid,
  balanceDue: test5.balanceDue
});
if (test5.grandTotal !== 5310 || test5.amountPaid !== 3000 || test5.balanceDue !== 2310) {
  throw new Error("Test 5 Failed!");
}

console.log("ALL 5 CALCULATIONS VERIFIED PERFECTLY!");
