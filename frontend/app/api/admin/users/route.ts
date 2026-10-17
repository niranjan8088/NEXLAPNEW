import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { requireRole, authErrorResponse } from "@/lib/auth";

export async function GET() {
  try {
    const adminUser = await requireRole(["admin"]);
    const users = await dbHelper.users.list();
    return NextResponse.json({ success: true, users, currentUser: adminUser });
  } catch (err: any) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);
    const body = await req.json();
    const newUser = await dbHelper.users.create(body);
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: any) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    await requireRole(["admin"]);
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    const updated = await dbHelper.users.update(id, updates);
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole(["admin"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    await dbHelper.users.delete(id);
    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err: any) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
