import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invoice = await dbHelper.invoices.getByShareToken(token);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice share link is invalid or expired." }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load shared invoice" }, { status: 500 });
  }
}
