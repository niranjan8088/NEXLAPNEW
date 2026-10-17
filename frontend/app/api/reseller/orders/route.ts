import { NextRequest, NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";

/** GET /api/reseller/orders — reseller sees only their orders */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["reseller", "admin"]);
    const { dbHelper } = await import("@/lib/dbHelper");

    let orders: any[];
    if (user.role === "admin") {
      orders = await dbHelper.orders.list();
    } else {
      orders = await dbHelper.orders.listBySeller(user.resellerId || user.id);
    }

    return NextResponse.json({ orders });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
