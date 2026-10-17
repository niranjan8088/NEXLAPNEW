import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(req: Request) {
  try {
    const list = await dbHelper.certificates.list();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch certificates." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.studentName || !body.courseTitle) {
      return NextResponse.json({ error: "Student Name and Course Title are required." }, { status: 400 });
    }

    // Force server-side sequential Registration ID allocation if missing or preview text passed
    if (!body.registrationId || !body.registrationId.startsWith("NBT-TR-") || body.registrationId.includes("AUTO")) {
      delete body.registrationId;
    }

    const saved = await dbHelper.certificates.create(body);

    return NextResponse.json({
      success: true,
      registrationId: saved.registrationId,
      certificate: saved,
      message: "Certificate issued successfully",
    });
  } catch (error: any) {
    console.error("Certificate API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create certificate." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Certificate ID is required for update." }, { status: 400 });
    }
    const updated = await dbHelper.certificates.update(id, updates);
    return NextResponse.json({ success: true, certificate: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update certificate." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }
    await dbHelper.certificates.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete certificate." }, { status: 500 });
  }
}
