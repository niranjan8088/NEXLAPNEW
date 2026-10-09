import { NextResponse } from "next/server";
import { db } from "@/lib/dbHelper";

export async function GET() {
  try {
    const settings = await db.systemSettings.get();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      { policy: "personal", forcedTheme: "day" },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { policy, forcedTheme } = body;

    const updated = await db.systemSettings.update(
      policy || "personal",
      forcedTheme || "day"
    );

    return NextResponse.json({
      success: true,
      message: "Global appearance settings updated.",
      ...updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update global theme settings" },
      { status: 500 }
    );
  }
}
