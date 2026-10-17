import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload.", error: "Invalid JSON", code: "BAD_REQUEST" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    console.log("API Called", "/api/enrollments", body);

    // Validate required fields
    if (!body.fullName || !body.phone || !body.email || !body.college || !body.branch || !body.semester) {
      return NextResponse.json(
        { success: false, message: "Missing required enrollment fields.", error: "Missing required fields.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // Call dbHelper to save
    const saved = await dbHelper.enrollments.create(body);

    return NextResponse.json(
      {
        success: true,
        enrollment: saved,
        message: "Enrollment Submitted Successfully",
      },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("Enrollment API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit enrollment application.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const enrollId = searchParams.get("enrollmentId");

    const list = await dbHelper.enrollments.list();

    if (phone && enrollId) {
      const match = list.find(
        (e: any) =>
          e.phone === phone &&
          e.enrollmentId?.toLowerCase() === enrollId?.toLowerCase()
      );
      if (match) {
        return NextResponse.json({ success: true, enrollment: match }, { status: 200, headers: JSON_HEADERS });
      } else {
        return NextResponse.json(
          { success: false, message: "Enrollment application not found.", error: "Not found.", code: "NOT_FOUND" },
          { status: 404, headers: JSON_HEADERS }
        );
      }
    }

    return NextResponse.json({ success: true, enrollments: list }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
