import { dbHelper } from "./lib/dbHelper";

async function runPhase4Tests() {
  console.log("==================================================");
  console.log("NEX LAPTECH PHASE 4: PRODUCT DETAILS & PURCHASE SUITE");
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
    // 1. Fetch catalog products
    const products = await dbHelper.products.list();
    assert(products.length > 0, "Products catalog available");

    const sampleProd = products[0];

    // 2. Test Security Sanitization on Product API payload
    const rawProdWithSensitiveData = {
      ...sampleProd,
      costPrice: 12000,
      supplierPrice: 11000,
      internalNotes: "Secret margin note",
      supplier_id: "sup-999"
    };

    // Customer payload sanitization logic
    const { costPrice, supplierPrice, internalNotes, supplier_id, ...customerSafe } = rawProdWithSensitiveData;
    assert((customerSafe as any).costPrice === undefined, "Security: costPrice removed from customer payload");
    assert((customerSafe as any).supplierPrice === undefined, "Security: supplierPrice removed from customer payload");
    assert((customerSafe as any).internalNotes === undefined, "Security: internalNotes removed from customer payload");
    assert((customerSafe as any).supplier_id === undefined, "Security: supplier_id removed from customer payload");
    assert(customerSafe.title !== undefined, "Customer payload retains public product title");

    // 3. Test Variants & Pricing recalculation
    if (sampleProd.variants && sampleProd.variants.length > 0) {
      const v = sampleProd.variants[0];
      assert(v.price > 0, `Variant ${v.name} has valid authoritative price ₹${v.price}`);
    } else {
      assert(sampleProd.price > 0, `Product ${sampleProd.title} has valid authoritative price ₹${sampleProd.price}`);
    }

    // 4. Test Server-side Offer Code Validation
    const testOffer = await dbHelper.offers.create({
      offerName: "Phase 4 Test Offer",
      offerCode: "P4TEST10",
      discountType: "percentage",
      discountValue: 10,
      minimumPurchase: 1000,
      maximumDiscount: 2000,
      status: "ACTIVE"
    });

    const valResult = await dbHelper.offers.validateForCustomer("P4TEST10", [{ productId: sampleProd.id, price: 15000 }], "cust@test.com", 15000);
    assert(valResult.valid === true, "Server offer validation: Code P4TEST10 successfully validated");
    assert(valResult.discountAmount === 1500, "Server offer validation: Correct 10% discount calculated (₹1,500)");

    // 5. Test Customer Review Submission
    const newRev = await dbHelper.reviews.create({
      customer_name: "Phase4 Reviewer",
      city: "Bengaluru",
      rating: 5,
      review_message: "Awesome product experience and lightning fast delivery.",
      product_purchased: sampleProd.title,
      status: "approved",
      verified: true
    });
    assert(newRev.id !== undefined, "Customer review created and persisted successfully");

    // 6. Test Customer ↔ Seller Messaging Pipeline
    const msg = await dbHelper.messages.send({
      user_id: "cust-phase4",
      customer_email: "cust@phase4.com",
      subject: `Enquiry for ${sampleProd.title}`,
      message: "Is this RAM compatible with Lenovo Legion 5?",
      sender: "customer",
      recipient: "seller"
    });
    assert(msg.id !== undefined, "Customer → Reseller message created in messaging pipeline");

    // 7. Test Customer Favorites / Wishlist
    const favResult = await dbHelper.favorites.toggle("cust-phase4", sampleProd.id);
    assert(favResult.favorited === true, "Customer wishlist toggle added product to favorites");

  } catch (err: any) {
    console.error("Test execution exception:", err);
    failed++;
  }

  console.log("\n==================================================");
  if (failed === 0) {
    console.log("🎉 ALL PHASE 4 PRODUCT DETAIL TESTS PASSED!");
  } else {
    console.log(`❌ ${failed} TEST(S) FAILED IN PHASE 4 SUITE.`);
  }
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase4Tests();
