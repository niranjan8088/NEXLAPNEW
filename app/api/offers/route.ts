import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

/**
 * GET /api/offers
 * Public endpoint — returns active, non-expired offers for customer portal.
 * No authentication required (used in customer homepage, offers page).
 */
export async function GET() {
  try {
    const offers = await dbHelper.offers.list();
    const today = new Date().toISOString().split("T")[0];

    const active = offers.filter((o: any) => {
      const status = (o.status || "").toUpperCase();
      const expiry = o.expiryDate || o.expiry_date || "2099-12-31";
      const start = o.startDate || o.start_date || "2000-01-01";
      const usageCount = Number(o.usageCount ?? o.usage_count) || 0;
      const usageLimit = Number(o.usageLimit ?? o.usage_limit) || 100;
      return (
        status === "ACTIVE" &&
        today <= expiry &&
        today >= start &&
        usageCount < usageLimit
      );
    }).map((offer: any) => ({
      id: offer.id,
      offerName: offer.offerName || offer.offer_name || "",
      offerCode: offer.offerCode || offer.offer_code || "",
      description: offer.description || "",
      discountType: offer.discountType || offer.discount_type || "percentage",
      discountValue: Number(offer.discountValue ?? offer.discount_value) || 0,
      eligibleProducts: offer.eligibleProducts || offer.eligible_products || ["all"],
      minimumPurchase: Number(offer.minimumPurchase ?? offer.minimum_purchase) || 0,
      maximumDiscount: Number(offer.maximumDiscount ?? offer.maximum_discount) || 0,
      startDate: offer.startDate || offer.start_date || "",
      expiryDate: offer.expiryDate || offer.expiry_date || "",
    }));

    return NextResponse.json({ offers: active });
  } catch (err: any) {
    console.error("GET Public Offers Error:", err);
    return NextResponse.json({ error: "Failed to fetch offers." }, { status: 500 });
  }
}
