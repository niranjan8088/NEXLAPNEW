import { NextResponse } from "next/server";
import { POST as handleBookingsPost, GET as handleBookingsGet, PUT as handleBookingsPut, OPTIONS as handleBookingsOptions } from "@/app/api/bookings/route";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function OPTIONS() {
  return handleBookingsOptions();
}

export async function POST(req: Request) {
  return handleBookingsPost(req);
}

export async function GET(req: Request) {
  return handleBookingsGet(req);
}

export async function PUT(req: Request) {
  return handleBookingsPut(req);
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: "Method Not Allowed", error: "HTTP Method Not Allowed", code: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: JSON_HEADERS }
  );
}
