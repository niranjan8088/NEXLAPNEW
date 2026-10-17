import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

function getAuthUser(cookieStore: any) {
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;
  if (!userSession) return null;
  const parts = userSession.split(":");
  return { id: parts[1] || parts[0], email: parts[2] || parts[0] };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const allOrders = await dbHelper.orders.list();
    // Filter to return ONLY customer's own orders
    const ownOrders = allOrders.filter(
      (o: any) => o.user_id === authUser.id || (o.email && o.email.toLowerCase() === authUser.email.toLowerCase())
    );

    return NextResponse.json({ orders: ownOrders });
  } catch (err: any) {
    console.error("GET Customer Orders Error:", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
