import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("nexbyte_reseller_session");
  response.cookies.delete("nexbyte_reseller_name");
  response.cookies.delete("nexbyte_reseller_email");
  return response;
}
