import { NextRequest, NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { dispatchPipelineEvent } from "@/lib/pipelineEvents";

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("nexbyte_admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const list = await dbHelper.resellers.list();
    return NextResponse.json({ success: true, resellers: list });
  } catch (err: any) {
    console.error("GET Admin Resellers error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("nexbyte_admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Reseller ID and status are required." }, { status: 400 });
    }

    const updated = await dbHelper.resellers.update(id, { status });

    // PIPELINE EVENT (ADMIN → RESELLER ONBOARDING STATUS)
    let eventType: any = "RESELLER_APPROVED";
    let title = "Reseller Account Approved 🎉";
    let msg = `Your NexByte reseller application for ${updated?.business_name || "your business"} has been approved!`;

    if (status === "suspended") {
      eventType = "RESELLER_SUSPENDED";
      title = "Reseller Account Suspended ⚠️";
      msg = `Your reseller partner account has been suspended. Please contact NexByte Admin.`;
    } else if (status === "rejected") {
      eventType = "RESELLER_REJECTED";
      title = "Reseller Application Status";
      msg = `Your reseller partner application was not approved at this time.`;
    }

    await dispatchPipelineEvent({
      eventType,
      title,
      message: msg,
      recipientRole: "reseller",
      recipientUserId: id,
      referenceType: "reseller",
      referenceId: id,
      actorRole: "admin",
    });

    return NextResponse.json({ success: true, reseller: updated });
  } catch (err: any) {
    console.error("PATCH Admin Resellers error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
