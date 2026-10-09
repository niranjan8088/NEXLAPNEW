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
      return (
        status === "ACTIVE" &&
        today <= expiry &&
        today >= start
      );
    });

    return NextResponse.json({ offers: active });
  } catch (err: any) {
    console.error("GET Public Offers Error:", err);
    return NextResponse.json({ error: "Failed to fetch offers." }, { status: 500 });
  }
}
