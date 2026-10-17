import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

function getAuthUser(cookieStore: any) {
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;
  if (!userSession) return null;
  const parts = userSession.split(":");
  return { id: parts[1] || parts[0], email: parts[2] || parts[0] };
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmNewPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    }

    // Verify current password if account has stored password
    const user = await dbHelper.profiles.getById(authUser.id);
    if (user && user.password && currentPassword && user.password !== currentPassword) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    // Update password
    await dbHelper.users.update(authUser.id, {
      password: newPassword,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err: any) {
    console.error("Change Password Error:", err);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
