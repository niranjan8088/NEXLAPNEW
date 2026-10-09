import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { dispatchPipelineEvent } from "@/lib/pipelineEvents";

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
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload.", error: "Invalid JSON", code: "BAD_REQUEST" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const customerName = body.customerName || body.customer_name || body.name;
    const phone = body.phone;
    const requestType = body.requestType || body.request_type || "product";

    if (!customerName || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name and phone number are required.",
          error: "Missing required fields.",
          code: "VALIDATION_ERROR",
        },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const newBooking = {
      customerName,
      phone,
      email: body.email || "",
      address: body.address || "",
      city: body.city || "Bengaluru",
      state: body.state || "Karnataka",
      pincode: body.pincode || "560001",
      bookingType: requestType,
      productName: body.selectedItem || body.productName || body.service_name || body.laptop_type || "Hardware Booking", 
      configuration: body.configuration || body.config || "Standard",
      quantity: Number(body.quantity || 1),
      preferredDate: body.preferredDate || new Date().toISOString().split("T")[0],
      preferredTime: body.preferredTime || "10:30 AM",
      remarks: body.description || body.remarks || body.message || "",
      description: body.description || body.remarks || body.message || "",
      budget: body.budget || "Standard",
      status: "new",
      productId: body.selectedItem || body.productId || "",
      message: body.description || body.remarks || body.message || "",
    };

    const saved = await dbHelper.bookings.create(newBooking);

    // PIPELINE EVENT DISPATCH (CUSTOMER → ADMIN & ADMIN → CUSTOMER)
    await dispatchPipelineEvent({
      eventType: "BOOKING_CREATED",
      title: "New Service Booking Received 🔧",
      message: `${customerName} submitted booking ${saved.bookingId} for ${newBooking.productName}`,
      recipientRole: "admin",
      referenceType: "booking",
      referenceId: saved.bookingId,
      actorRole: "user",
    });

    await dispatchPipelineEvent({
      eventType: "BOOKING_CREATED",
      title: "Service Request Received ✓",
      message: `Your service booking ${saved.bookingId} for ${newBooking.productName} has been received.`,
      recipientRole: "user",
      recipientUserId: saved.user_id || undefined,
      referenceType: "booking",
      referenceId: saved.bookingId,
      actorRole: "system",
    });

    return NextResponse.json(
      {
        success: true,
        bookingId: saved.bookingId,
        booking: saved,
        message: "Booking Submitted Successfully",
      },
      { status: 201, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("[BOOKING DB ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit booking.",
        error: error.message || "Internal Server Error",
        code: "SERVER_ERROR",
      },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const bookingId = searchParams.get("bookingId");
    const id = searchParams.get("id");

    if (id) {
      const list = await dbHelper.bookings.list();
      const match = list.find((b: any) => b.id === id || b.bookingId === id);
      if (match) {
        return NextResponse.json({ success: true, booking: match }, { status: 200, headers: JSON_HEADERS });
      }
      return NextResponse.json(
        { success: false, message: "Booking not found.", error: "Booking not found.", code: "NOT_FOUND" },
        { status: 404, headers: JSON_HEADERS }
      );
    }

    if (phone && bookingId) {
      const match = await dbHelper.bookings.getByPhoneAndId(phone, bookingId);
      if (match) {
        return NextResponse.json({ success: true, booking: match }, { status: 200, headers: JSON_HEADERS });
      } else {
        return NextResponse.json(
          { success: false, message: "Booking not found.", error: "Booking not found.", code: "NOT_FOUND" },
          { status: 404, headers: JSON_HEADERS }
        );
      }
    }

    const allBookings = await dbHelper.bookings.list();
    return NextResponse.json({ success: true, bookings: allBookings }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function PUT(req: Request) {
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

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required parameter: id.", error: "Missing id.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    if (body.chatMessage) {
      const list = await dbHelper.bookings.list();
      const existing = list.find((b: any) => b.id === id);
      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Booking not found.", error: "Booking not found.", code: "NOT_FOUND" },
          { status: 404, headers: JSON_HEADERS }
        );
      }

      const now = new Date().toISOString();
      const sender = body.sender || "customer";
      const chatItem = {
        type: "chat",
        sender,
        message: body.chatMessage.trim(),
        timestamp: now
      };

      const updatedTimeline = [...(existing.timeline || []), chatItem];
      const updated = await dbHelper.bookings.update(existing.id, {
        timeline: updatedTimeline,
        ...(body.replyMessage ? { replyMessage: body.replyMessage } : {}),
        ...(body.replyDate ? { replyDate: body.replyDate } : {}),
        ...(body.replyBy ? { replyBy: body.replyBy } : {}),
        ...(body.status ? { status: body.status } : {}),
      });

      // PIPELINE EVENT DISPATCH FOR CHAT MESSAGE
      if (sender === "customer") {
        await dispatchPipelineEvent({
          eventType: "MESSAGE_RECEIVED",
          title: "New Customer Message 💬",
          message: `${existing.customerName || "Customer"} sent a message on ${existing.bookingId}`,
          recipientRole: "admin",
          referenceType: "booking",
          referenceId: existing.bookingId,
          actorRole: "user",
        });
      } else {
        await dispatchPipelineEvent({
          eventType: "MESSAGE_RECEIVED",
          title: "New Support Message 💬",
          message: `Technician replied to your booking ${existing.bookingId}`,
          recipientRole: "user",
          recipientUserId: existing.user_id || undefined,
          referenceType: "booking",
          referenceId: existing.bookingId,
          actorRole: "admin",
        });
      }

      return NextResponse.json({ success: true, booking: updated }, { status: 200, headers: JSON_HEADERS });
    }

    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.assignedTo !== undefined) { updates.assignedTo = body.assignedTo; updates.technician = body.assignedTo; }
    if (body.technician !== undefined) { updates.technician = body.technician; updates.assignedTo = body.technician; }
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.booking_date !== undefined) updates.booking_date = body.booking_date;
    if (body.booking_time !== undefined) updates.booking_time = body.booking_time;
    if (body.replyMessage !== undefined) updates.replyMessage = body.replyMessage;
    if (body.replyDate !== undefined) updates.replyDate = body.replyDate;
    if (body.replyBy !== undefined) updates.replyBy = body.replyBy;
    if (body.timeline !== undefined) updates.timeline = body.timeline;
    if (body.updatedBy !== undefined) updates.updatedBy = body.updatedBy;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No update fields provided.", error: "No updates.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const updated = await dbHelper.bookings.update(id, updates);

    // PIPELINE EVENT DISPATCH (ADMIN → CUSTOMER STATUS UPDATES)
    if (updates.status) {
      const reqId = updated.bookingId || updated.id;
      let title = "Service Status Updated 🔧";
      let msg = `Your service request ${reqId} is now ${updates.status}.`;

      if (updates.status === "confirmed") {
        title = "Service Booking Confirmed ✓";
        msg = `Your repair request ${reqId} has been confirmed. A technician is assigned.`;
      } else if (updates.status === "in_progress" || updates.status === "processing") {
        title = "Service In Progress ⚙️";
        msg = `Your repair request ${reqId} is now in progress.`;
      } else if (updates.status === "completed" || updates.status === "delivered") {
        title = "Service Completed 🎉";
        msg = `Your repair request ${reqId} has been completed!`;
      } else if (updates.status === "cancelled") {
        title = "Service Request Cancelled ❌";
        msg = `Your service request ${reqId} was cancelled.`;
      }

      await dispatchPipelineEvent({
        eventType: updates.status === "confirmed" ? "BOOKING_CONFIRMED" : updates.status === "completed" ? "BOOKING_COMPLETED" : "BOOKING_IN_PROGRESS",
        title,
        message: msg,
        recipientRole: "user",
        recipientUserId: updated.user_id || undefined,
        referenceType: "booking",
        referenceId: reqId,
        actorRole: "admin",
      });
    }

    return NextResponse.json({ success: true, booking: updated }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    console.error("[BOOKING UPDATE ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
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
        { success: false, message: "Missing required parameter: id.", error: "Missing id.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    await dbHelper.bookings.delete(id);

    return NextResponse.json({ success: true, message: "Booking deleted successfully." }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    console.error("[BOOKING DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
