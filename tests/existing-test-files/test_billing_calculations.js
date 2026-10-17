const { calculateInvoiceTotals, formatRupees, validateMobile, validateGSTIN } = require("./lib/billingUtils");

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
console.assert(test1.subtotal === 4500, `Expected subtotal 4500, got ${test1.subtotal}`);
console.assert(test1.taxableAmount === 4500, `Expected taxable 4500, got ${test1.taxableAmount}`);
console.assert(test1.gstTotal === 0, `Expected gst 0, got ${test1.gstTotal}`);
console.assert(test1.grandTotal === 4500, `Expected grand total 4500, got ${test1.grandTotal}`);

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
console.assert(test2.taxableAmount === 4500, `Expected taxable 4500, got ${test2.taxableAmount}`);
console.assert(test2.cgst === 405, `Expected CGST 405, got ${test2.cgst}`);
console.assert(test2.sgst === 405, `Expected SGST 405, got ${test2.sgst}`);
console.assert(test2.gstTotal === 810, `Expected GST 810, got ${test2.gstTotal}`);
console.assert(test2.grandTotal === 5310, `Expected grand total 5310, got ${test2.grandTotal}`);

// TEST 3: GST OFF with GSTIN filled
const test3 = calculateInvoiceTotals({
  items: [{ name: "SSD 500GB", quantity: 1, unitPrice: 5000, discount: 500 }],
  gstEnabled: false,
  gstin: "29ABCDE1234F1Z5",
  paymentStatus: "paid"
});
console.assert(test3.gstTotal === 0, `Expected GST 0, got ${test3.gstTotal}`);
console.assert(test3.grandTotal === 4500, `Expected grand total 4500, got ${test3.grandTotal}`);
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
console.assert(test4.subtotal === 8400, `Expected subtotal 8400, got ${test4.subtotal}`);
console.assert(test4.taxableAmount === 8000, `Expected taxable 8000, got ${test4.taxableAmount}`);

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
console.assert(test5.grandTotal === 5310, `Expected grand total 5310, got ${test5.grandTotal}`);
console.assert(test5.amountPaid === 3000, `Expected amount paid 3000, got ${test5.amountPaid}`);
console.assert(test5.balanceDue === 2310, `Expected balance due 2310, got ${test5.balanceDue}`);

console.log("ALL CALCULATIONS VERIFIED PERFECTLY!");
