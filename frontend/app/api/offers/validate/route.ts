import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offerCode, cartItems, customerEmail, subtotalAmount } = body;

    if (!offerCode || !String(offerCode).trim()) {
      return NextResponse.json({ valid: false, error: "Offer code is required." }, { status: 400 });
    }

    const items = Array.isArray(cartItems) ? cartItems : [];
    const result = await dbHelper.offers.validateForCustomer(
      offerCode,
      items,
      customerEmail,
      Number(subtotalAmount) || undefined
    );

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.message || "Invalid or expired referral code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      offer: result.offer,
      discountAmount: result.discountAmount
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err.message || "Failed to validate offer code." },
      { status: 500 }
    );
  }
}
