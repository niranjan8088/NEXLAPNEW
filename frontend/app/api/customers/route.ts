import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(req: Request) {
  try {
    const list = await dbHelper.customers.list();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch customers directory." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Customer ID is required." }, { status: 400 });
    }

    const updated = await dbHelper.customers.update(id, updates);
    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update customer profile." }, { status: 500 });
  }
}
