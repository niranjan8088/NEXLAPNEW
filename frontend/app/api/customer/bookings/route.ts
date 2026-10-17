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

    const allBookings = await dbHelper.bookings.list();
    const ownBookings = allBookings.filter(
      (b: any) =>
        b.customer_id === authUser.id ||
        (b.email && b.email.toLowerCase() === authUser.email.toLowerCase())
    );

    return NextResponse.json({ bookings: ownBookings });
  } catch (err: any) {
    console.error("GET Customer Bookings Error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}
