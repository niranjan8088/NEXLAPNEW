import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regid = searchParams.get("regid");

    if (!regid) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    // Normalize input: trim and uppercase
    const normalizedRegId = regid.trim().toUpperCase();

    // Fetch from database
    const certificate = await dbHelper.certificates.getByRegId(normalizedRegId);

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Strip sensitive info and return only what's necessary for public verification
    const safeData = {
      registrationId: certificate.registrationId,
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      trainingType: certificate.trainingType,
      internshipType: certificate.internshipType,
      projectTitle: certificate.projectTitle,
      completionDate: certificate.completionDate,
      issueDate: certificate.issueDate || certificate.created_at,
      college: certificate.college || "",
      status: certificate.status,
      qrCodeUrl: certificate.qrCodeUrl || null,
      pdfUrl: certificate.pdfUrl || certificate.fileUrl || null,
      photoUrl: certificate.photoUrl || null,
    };

    return NextResponse.json(safeData);
  } catch (error) {
    console.error("Verify API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
