import { NextRequest, NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customer,
      shippingAddress,
      deliveryOption,
      gstDetails,
      paymentMethod,
      offerCode,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (!customer?.email || !customer?.name || !customer?.phone) {
      return NextResponse.json({ error: "Customer name, email and phone are required." }, { status: 400 });
    }

    if (!shippingAddress?.addressLine1 || !shippingAddress?.city || !shippingAddress?.pincode) {
      return NextResponse.json({ error: "Complete shipping address is required." }, { status: 400 });
    }

    // 1. Fetch DB Products for authoritative price verification
    const dbProducts = await dbHelper.products.list();

    let serverSubtotal = 0;
    const verifiedItems = items.map((item: any) => {
      const prod = dbProducts.find((p: any) => p.id === item.productId || p.id === item.id);
      let unitPrice = Number(item.price) || 0;

      if (prod) {
        // If variant price exists
        if (prod.variants && prod.variants.length > 0) {
          const v = prod.variants.find((varObj: any) => varObj.name === item.variant || varObj.id === item.variantId);
          if (v && v.price) unitPrice = Number(v.price);
          else unitPrice = Number(prod.price);
        } else {
          unitPrice = Number(prod.price);
        }
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = unitPrice * qty;
      serverSubtotal += lineTotal;

      return {
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: item.productId || item.id,
        title: item.title || prod?.title || "Hardware Item",
        variant: item.variant || "",
        quantity: qty,
        unitPrice,
        price: unitPrice,
        total: lineTotal,
        image: item.image || prod?.image || "/images/poster-products.png",
      };
    });

    // 2. Validate Offer Discount Server-side
    let discountAmount = 0;
    let appliedOfferCode = "";

    if (offerCode && String(offerCode).trim()) {
      const valResult = await dbHelper.offers.validateForCustomer(
        String(offerCode).trim(),
        verifiedItems,
        customer.email,
        serverSubtotal
      );

      if (valResult.valid) {
        discountAmount = valResult.discountAmount || 0;
        appliedOfferCode = String(offerCode).trim().toUpperCase();
      }
    }

    // 3. Shipping Calculation
    let shippingFee = 0;
    if (deliveryOption === "express") {
      shippingFee = 199;
    } else if (serverSubtotal < 1000) {
      shippingFee = 99;
    }

    // 4. GST & Tax Calculation (18% inclusive/added breakdown)
    const netTaxable = Math.max(0, serverSubtotal - discountAmount);
    const gstRate = 0.18;
    const gstAmount = Math.round(netTaxable * gstRate);
    const cgstAmount = Math.round(gstAmount / 2);
    const sgstAmount = gstAmount - cgstAmount;
    const grandTotal = netTaxable + gstAmount + shippingFee;

    // 5. Auth User linking
    const cookieStore = await cookies();
    const customerSession = cookieStore.get("nexbyte_customer_session")?.value;
    let userId = "guest-user";
    if (customerSession) {
      const parts = customerSession.split(":");
      userId = parts[1] || parts[0];
    }

    // 6. Generate Order record
    const nextOrderId = await dbHelper.orders.getNextOrderId();
    const orderPayload = {
      order_id: nextOrderId,
      order_number: nextOrderId,
      user_id: userId,
      customer_name: customer.name,
      email: customer.email,
      phone: customer.phone,
      shipping_address: shippingAddress,
      delivery_option: deliveryOption || "standard",
      payment_method: paymentMethod || "COD",
      payment_status: paymentMethod === "COD" ? "Pending (COD)" : "Paid",
      status: "Confirmed",
      items: verifiedItems,
      subtotal_amount: serverSubtotal,
      discount_amount: discountAmount,
      applied_offer_code: appliedOfferCode,
      gst_amount: gstAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      shipping_fee: shippingFee,
      total_amount: grandTotal,
      gst_details: gstDetails?.isGstInvoice ? gstDetails : null,
      courier: deliveryOption === "express" ? "NexByte Priority Express" : "NexByte Standard Logistics",
      tracking_number: `NEX-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      created_at: new Date().toISOString(),
    };

    const savedOrder = await dbHelper.orders.create(orderPayload);

    // 7. Auto-Generate GST Invoice Record
    try {
      await dbHelper.invoices.create({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: `${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
        gstin: gstDetails?.gstin || "",
        companyName: gstDetails?.companyName || "",
        items: verifiedItems.map((i: any) => ({
          description: `${i.title}${i.variant ? ` (${i.variant})` : ""}`,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        subtotal: serverSubtotal,
        discount: discountAmount,
        tax: gstAmount,
        cgst: cgstAmount,
        sgst: sgstAmount,
        total: grandTotal,
        paymentStatus: paymentMethod === "COD" ? "Unpaid" : "Paid",
        notes: `Auto-generated Tax Invoice for Order #${nextOrderId}`,
      });
    } catch (invErr) {
      console.error("Auto Invoice Creation Warning:", invErr);
    }

    // 8. Admin Realtime Notification
    try {
      await dbHelper.notifications.create({
        title: "🛒 New Hardware Order Placed!",
        message: `Order #${nextOrderId} by ${customer.name} (₹${grandTotal.toLocaleString("en-IN")})`,
        type: "order",
        recipient_role: "admin",
        reference_type: "order",
        reference_id: savedOrder.id || nextOrderId,
      });
    } catch (notifErr) {
      console.error("Order notification error:", notifErr);
    }

    return NextResponse.json({
      success: true,
      order: savedOrder,
      message: "Order placed successfully!",
    });
  } catch (err: any) {
    console.error("Checkout POST Error:", err);
    return NextResponse.json({ error: err.message || "Checkout failed." }, { status: 500 });
  }
}
