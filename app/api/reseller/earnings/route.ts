import { NextRequest, NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["reseller", "admin"]);
    const resellerId = user.resellerId || user.id;

    const allOrders = await dbHelper.orders.listBySeller(resellerId);
    const payouts = await dbHelper.resellerPayouts.getByReseller(resellerId);

    let grossSales = 0;
    let totalCommission = 0;
    let netEarnings = 0;

    allOrders.forEach((ord: any) => {
      const items = Array.isArray(ord.items) ? ord.items : [];
      items.forEach((item: any) => {
        const itemPrice = Number(item.unitPrice || item.price) || 0;
        const itemQty = Number(item.quantity) || 1;
        const calc = dbHelper.commissionEngine.calculate(
          item.productId || item.id,
          item.category || "General",
          resellerId,
          itemPrice,
          itemQty
        );
        grossSales += calc.lineSubtotal;
        totalCommission += calc.platformCommission;
        netEarnings += calc.sellerEarning;
      });
    });

    const paidPayoutsTotal = payouts
      .filter((p: any) => p.status === "Paid")
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const pendingPayoutTotal = Math.max(0, netEarnings - paidPayoutsTotal);

    return NextResponse.json({
      success: true,
      resellerId,
      summary: {
        grossSales,
        totalCommission,
        netEarnings,
        paidPayoutsTotal,
        pendingPayoutTotal,
        totalOrdersCount: allOrders.length,
      },
      payouts,
      orders: allOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number || o.order_id,
        totalAmount: o.total_amount,
        status: o.status,
        createdAt: o.created_at,
      })),
    });
  } catch (err: any) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
