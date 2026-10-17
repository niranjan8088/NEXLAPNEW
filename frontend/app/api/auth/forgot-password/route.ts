import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, dateOfBirth } = body;

    if (!emailOrPhone || !dateOfBirth) {
      return NextResponse.json(
        { error: "Email/Phone number and Date of Birth are required." },
        { status: 400 }
      );
    }

    const input = String(emailOrPhone).trim().toLowerCase();
    const cleanPhone = input.replace(/\D/g, "");
    const isEmail = input.includes("@");

    // Fetch user profiles
    const users = await dbHelper.users.list();
    const user = users.find((u: any) => {
      if (isEmail) {
        return u.email?.toLowerCase() === input;
      }
      return (u.phone || "").replace(/\D/g, "") === cleanPhone;
    });

    // Security check: Generic safe failure if account doesn't exist or DOB doesn't match
    const normalizedInputDob = new Date(dateOfBirth).toISOString().split("T")[0];
    const userDob = user?.date_of_birth ? new Date(user.date_of_birth).toISOString().split("T")[0] : null;

    if (!user || userDob !== normalizedInputDob) {
      // Return generic security-safe response without leaking user existence
      return NextResponse.json(
        {
          error: "Verification failed. Please ensure the email/phone and Date of Birth match your account record.",
        },
        { status: 400 }
      );
    }

    // Generate secure single-use reset token valid for 15 minutes
    const resetToken = `rst-${crypto.randomBytes(16).toString("hex")}`;
    const tokenExpiry = Date.now() + 15 * 60 * 1000;

    await dbHelper.users.update(user.id, {
      reset_token: resetToken,
      reset_token_expiry: tokenExpiry,
    });

    return NextResponse.json({
      success: true,
      message: "Identity verified successfully. You may now reset your password.",
      resetToken,
      redirectUrl: `/reset-password?token=${resetToken}`,
    });
  } catch (err: any) {
    console.error("Forgot Password Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during password recovery verification." },
      { status: 500 }
    );
  }
}
