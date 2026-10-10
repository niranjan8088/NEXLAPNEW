import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { dispatchPipelineEvent } from "@/lib/pipelineEvents";
import { getServerSession } from "@/lib/auth";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: Request) {
  try {
    const authUser = await getServerSession();
    if (!authUser || authUser.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Sign in with a customer account to submit an enquiry.", code: "AUTH_REQUIRED" },
        { status: 401, headers: JSON_HEADERS }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload.", error: "Invalid JSON", code: "BAD_REQUEST" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const name = body.customer_name || body.customerName || body.name;
    const phone = body.phone;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Customer name and phone number are required.", error: "Missing required fields.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const saved = await dbHelper.laptopEnquiries.create({
      customer_name: name,
      phone,
      email: body.email || "",
      city: body.city || "",
      laptop_type: body.laptop_type || body.laptopRequirement || "General Laptop",
      budget: body.budget || "Unspecified",
      brand_preference: body.brand_preference || body.preferredBrand || "Any Brand",
      processor_preference: body.processor_preference || body.processor || "No Preference",
      ram_preference: body.ram_preference || body.ram || "No Preference",
      storage_preference: body.storage_preference || body.storage || "No Preference",
      gpu_preference: body.gpu_preference || body.gpu || "No Preference",
      condition: body.condition || "Any",
      use_case: body.use_case || body.use || "General Use",
      requirements: body.requirements || body.additionalRequirements || body.message || "",
      message: body.requirements || body.additionalRequirements || body.message || "",
      preferred_contact: body.preferred_contact || body.preferredContact || "WhatsApp",
      user_id: authUser.id,
    });

    // Dispatch real-time Admin notification with deep link reference
    await dispatchPipelineEvent({
      eventType: "LAPTOP_ENQUIRY_CREATED",
      title: "💻 New Laptop Enquiry",
      message: `${name} submitted a laptop requirement (${saved.laptop_type}). Budget: ${saved.budget || "Unspecified"}. Reference: ${saved.reference_id || saved.id}`,
      recipientRole: "admin",
      referenceType: "laptop_enquiry",
      referenceId: saved.reference_id || saved.id,
      metadata: { enquiryId: saved.id, referenceId: saved.reference_id, customerName: name, phone }
    });

    return NextResponse.json(
      {
        success: true,
        referenceId: saved.reference_id,
        enquiry: saved,
        message: "Laptop Enquiry Submitted Successfully",
      },
      { status: 201, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("Laptop Enquiry POST API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit laptop enquiry.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authUser = await getServerSession();
    if (!authUser || authUser.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Sign in with a customer account to view enquiries.", code: "AUTH_REQUIRED" },
        { status: 401, headers: JSON_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const allEnquiries = await dbHelper.laptopEnquiries.list();
    const list = allEnquiries.filter((enquiry: any) =>
      enquiry.user_id === authUser.id ||
      enquiry.customer_id === authUser.id ||
      enquiry.email?.toLowerCase() === authUser.email.toLowerCase()
    );

    if (id) {
      const match = list.find((e: any) => e.id === id || e.reference_id?.toLowerCase() === id.toLowerCase());
      if (!match) {
        return NextResponse.json(
          { success: false, message: "Enquiry not found." },
          { status: 404, headers: JSON_HEADERS }
        );
      }
      return NextResponse.json({ success: true, enquiry: match }, { status: 200, headers: JSON_HEADERS });
    }

    return NextResponse.json({ success: true, enquiries: list }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch enquiries.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Enquiry ID is required for update." },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const updated = await dbHelper.laptopEnquiries.update(id, updates);

    // If updated, notify customer
    if (updated && (updated.user_id || updated.customer_id)) {
      await dispatchPipelineEvent({
        eventType: "LAPTOP_ENQUIRY_UPDATED",
        title: "💻 Laptop Enquiry Update",
        message: `Your laptop enquiry ${updated.reference_id || updated.id} status is now: ${updated.status}.`,
        recipientUserId: updated.user_id || updated.customer_id,
        referenceType: "laptop_enquiry",
        referenceId: updated.reference_id || updated.id,
        metadata: { enquiryId: updated.id, status: updated.status }
      });
    }

    return NextResponse.json(
      { success: true, enquiry: updated, message: "Enquiry updated successfully." },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update enquiry.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Enquiry ID is required for deletion." },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    await dbHelper.laptopEnquiries.delete(id);

    return NextResponse.json(
      { success: true, message: "Enquiry deleted successfully." },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete enquiry.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
