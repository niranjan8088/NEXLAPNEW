import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.cookies.delete("nexbyte_customer_session");
  response.cookies.delete("nexbyte_customer_name");
  response.cookies.delete("nexbyte_reseller_session");
  response.cookies.delete("nexbyte_admin_session");
  return response;
}
