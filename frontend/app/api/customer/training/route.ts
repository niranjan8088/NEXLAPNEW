import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

function getAuthUser(cookieStore: any) {
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;
  if (!userSession) return null;
  const parts = userSession.split(":");
  return { id: parts[1] || parts[0], email: parts[2] || parts[0] };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const enrollments = await dbHelper.enrollments.list();
    const certificates = await dbHelper.certificates.list();

    const ownEnrollments = enrollments.filter(
      (e: any) =>
        e.user_id === authUser.id ||
        (e.email && e.email.toLowerCase() === authUser.email.toLowerCase())
    );

    const ownCertificates = certificates.filter(
      (c: any) =>
        c.user_id === authUser.id ||
        (c.email && c.email.toLowerCase() === authUser.email.toLowerCase())
    );

    return NextResponse.json({
      training: ownEnrollments,
      certificates: ownCertificates,
    });
  } catch (err: any) {
    console.error("GET Customer Training Error:", err);
    return NextResponse.json({ error: "Failed to fetch training records." }, { status: 500 });
  }
}
