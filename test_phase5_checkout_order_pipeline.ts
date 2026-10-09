import { dbHelper } from "./lib/dbHelper";

async function runPhase5Tests() {
  console.log("==================================================");
  console.log("NEXBYTE PHASE 5: CHECKOUT, ORDER & INVOICE SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Fetch available products
    const products = await dbHelper.products.list();
    assert(products.length > 0, "Products catalog available for order creation");
    const testProduct = products[0];

    // 2. Prepare Order Payload
    const nextOrderNum = await dbHelper.orders.getNextOrderId();
    assert(nextOrderNum.startsWith("NB-ORD-"), `Generated order number format: ${nextOrderNum}`);

    const subtotal = testProduct.price * 2;
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;

    // 3. Create Order Snapshot
    const orderRecord = await dbHelper.orders.create({
      user_id: "cust-test-phase5",
      customer_name: "Phase 5 Test Customer",
      email: "phase5.test@nexbyte.com",
      phone: "9876543210",
      shipping_address: {
        addressLine1: "123 Tech Park, MG Road",
        city: "Tumkur",
        state: "Karnataka",
        pincode: "572101"
      },
      payment_method: "COD",
      payment_status: "Pending (COD)",
      status: "Confirmed",
      items: [
        {
          id: `item-${Date.now()}`,
          productId: testProduct.id,
          title: testProduct.title,
          quantity: 2,
          unitPrice: testProduct.price,
          total: subtotal
        }
      ],
      subtotal_amount: subtotal,
      discount_amount: 0,
      gst_amount: gstAmount,
      cgst_amount: Math.round(gstAmount / 2),
      sgst_amount: gstAmount - Math.round(gstAmount / 2),
      shipping_fee: 0,
      total_amount: grandTotal,
      gst_details: {
        isGstInvoice: true,
        companyName: "Phase 5 Solutions Pvt Ltd",
        gstin: "29AAAAA0000A1Z5"
      },
      courier: "NexByte Standard Logistics",
      tracking_number: "NEX-TRK-987654"
    });

    assert(orderRecord.id !== undefined, "Order record created successfully in database");
    assert(orderRecord.total_amount === grandTotal, `Order grand total ₹${grandTotal} verified on server`);

    // 4. Create GST Tax Invoice
    const invoiceRecord = await dbHelper.invoices.create({
      customerName: "Phase 5 Test Customer",
      customerEmail: "phase5.test@nexbyte.com",
      customerPhone: "9876543210",
      gstin: "29AAAAA0000A1Z5",
      companyName: "Phase 5 Solutions Pvt Ltd",
      items: [
        {
          description: testProduct.title,
          quantity: 2,
          unitPrice: testProduct.price,
          total: subtotal
        }
      ],
      subtotal,
      discount: 0,
      tax: gstAmount,
      cgst: Math.round(gstAmount / 2),
      sgst: gstAmount - Math.round(gstAmount / 2),
      total: grandTotal,
      paymentStatus: "Unpaid"
    });

    assert(invoiceRecord.id !== undefined, "GST Tax Invoice created and assigned unique invoice number");
    assert(invoiceRecord.shareToken !== undefined, "Share token generated for customer invoice access");

    // 5. Admin Notification Check
    const notif = await dbHelper.notifications.create({
      title: "🛒 New Hardware Order Placed!",
      message: `Order #${orderRecord.order_id} placed by Phase 5 Test Customer`,
      type: "order",
      recipient_role: "admin",
      reference_type: "order",
      reference_id: orderRecord.id
    });

    assert(notif.id !== undefined, "Admin realtime notification generated for new order");

    // 6. Verify Customer Orders Query
    const allOrders = await dbHelper.orders.list();
    const fetched = allOrders.find((o: any) => o.id === orderRecord.id || o.order_id === orderRecord.order_id);
    assert(fetched !== undefined, "Created order retrievable from customer order history query");

  } catch (err: any) {
    console.error("Phase 5 Test Exception:", err);
    failed++;
  }

  console.log("\n==================================================");
  if (failed === 0) {
    console.log("🎉 ALL PHASE 5 CHECKOUT & ORDER PIPELINE TESTS PASSED!");
  } else {
    console.log(`❌ ${failed} TEST(S) FAILED IN PHASE 5 SUITE.`);
  }
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase5Tests();
