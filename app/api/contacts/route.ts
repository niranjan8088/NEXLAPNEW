import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authUser = await getServerSession();
    if (!authUser || authUser.role !== "user") {
      return NextResponse.json(
        { success: false, error: "Sign in with a customer account to send a message.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const saved = await dbHelper.contacts.create({ ...body, user_id: authUser.id });

    return NextResponse.json({
      success: true,
      id: saved.id,
      contact: saved,
      message: "Message Sent Successfully",
    });
  } catch (error: any) {
    console.error("Contacts API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message." },
      { status: 500 }
    );
  }
}
