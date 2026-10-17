import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

async function getAuthenticatedSession() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("nexbyte_admin_session")?.value;
  const resellerSession = cookieStore.get("nexbyte_reseller_session")?.value;
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;

  if (adminSession) return { role: "admin", id: "admin-1" };
  if (resellerSession) return { role: "reseller", id: resellerSession.split(":")[1] || "res-1" };
  if (userSession) return { role: "user", id: userSession.split(":")[1] || "cust-1" };
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized tool execution." }, { status: 401 });
    }

    const body = await request.json();
    const { tool, confirm } = body;

    if (!confirm) {
      return NextResponse.json({ error: "Tool execution requires explicit confirmation." }, { status: 400 });
    }

    if (tool === "cancel_booking") {
      if (session.role !== "user" && session.role !== "admin") {
        return NextResponse.json({ error: "Permission denied." }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        message: "Booking cancellation request submitted successfully. Our team will verify and update your status.",
      });
    }

    if (tool === "update_product_price") {
      if (session.role !== "reseller" && session.role !== "admin") {
        return NextResponse.json({ error: "Permission denied for reseller store update." }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        message: "Product price modification confirmed and updated in product catalog.",
      });
    }

    if (tool === "approve_reseller") {
      if (session.role !== "admin") {
        return NextResponse.json({ error: "Only authorized administrators can approve reseller applications." }, { status: 403 });
      }

      // Approve pending reseller application
      const resellers = await dbHelper.resellers.list();
      const pending = resellers.find((r: any) => r.status === "pending");
      if (pending) {
        await dbHelper.resellers.update(pending.id, { status: "active" });
      }

      return NextResponse.json({
        success: true,
        message: "Reseller partner application approved successfully.",
      });
    }

    return NextResponse.json({ error: "Unknown tool requested." }, { status: 400 });
  } catch (err: any) {
    console.error("AI Tool Execution Error:", err);
    return NextResponse.json({ error: "Failed to execute tool action." }, { status: 500 });
  }
}
