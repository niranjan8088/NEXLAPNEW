import { NextRequest, NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = request.cookies.get("nexbyte_admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const { id } = await params;
    const reseller = await dbHelper.resellers.getById(id);

    if (!reseller) {
      return NextResponse.json({ error: "Reseller not found." }, { status: 404 });
    }

    const listings = await dbHelper.resellerListings.getByReseller(id);
    const orders = await dbHelper.orders.listBySeller(id);
    const payouts = await dbHelper.resellerPayouts.getByReseller(id);

    let grossSales = 0;
    let totalCommission = 0;
    let sellerEarnings = 0;

    orders.forEach((ord: any) => {
      const items = Array.isArray(ord.items) ? ord.items : [];
      items.forEach((item: any) => {
        const itemPrice = Number(item.unitPrice || item.price) || 0;
        const itemQty = Number(item.quantity) || 1;
        const calc = dbHelper.commissionEngine.calculate(
          item.productId || item.id,
          item.category || "General",
          id,
          itemPrice,
          itemQty
        );
        grossSales += calc.lineSubtotal;
        totalCommission += calc.platformCommission;
        sellerEarnings += calc.sellerEarning;
      });
    });

    return NextResponse.json({
      success: true,
      reseller,
      listings,
      orders,
      payouts,
      summary: {
        grossSales,
        totalCommission,
        sellerEarnings,
        totalListingsCount: listings.length,
        totalOrdersCount: orders.length,
      },
    });
  } catch (err: any) {
    console.error("GET Admin Reseller Detail error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
