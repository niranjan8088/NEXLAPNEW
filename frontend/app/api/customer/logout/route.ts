import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.cookies.delete("nexbyte_customer_session");
  response.cookies.delete("nexbyte_customer_name");
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  response.cookies.delete("nexbyte_customer_session");
  response.cookies.delete("nexbyte_customer_name");
  return response;
}
