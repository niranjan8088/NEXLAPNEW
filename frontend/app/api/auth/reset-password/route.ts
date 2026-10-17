import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Reset token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long for security." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const users = await dbHelper.users.list();
    const user = users.find(
      (u: any) => u.reset_token === token && u.reset_token_expiry && u.reset_token_expiry > Date.now()
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link/token. Please request a new verification." },
        { status: 400 }
      );
    }

    // Update user password and invalidate reset token
    await dbHelper.users.update(user.id, {
      password: newPassword,
      reset_token: null,
      reset_token_expiry: null,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
      redirectUrl: "/login",
    });
  } catch (err: any) {
    console.error("Reset Password Error:", err);
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
