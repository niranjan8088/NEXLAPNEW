import { NextRequest, NextResponse } from "next/server";
import { dispatchPipelineEvent } from "@/lib/pipelineEvents";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    businessName, ownerName, email, phone, address, city, state,
    businessType, gstin, description, password
  } = body;

  if (!businessName || !ownerName || !email || !phone || !city || !password) {
    return NextResponse.json(
      { error: "Business name, owner name, email, phone, city, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const { dbHelper } = await import("@/lib/dbHelper");

    const existing = await dbHelper.resellers.getByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "A reseller account with this email already exists." },
        { status: 409 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let authUserId = null;
    if (supabaseUrl) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: ownerName,
            business_name: businessName,
            role: "reseller",
            status: "pending",
          },
        },
      });

      if (authError && !authError.message.includes("User already registered")) {
        console.warn("Supabase Auth registration warning:", authError.message);
      }
      if (authData?.user) {
        authUserId = authData.user.id;
      }
    }

    const newReseller = await dbHelper.resellers.create({
      auth_user_id: authUserId,
      business_name: businessName,
      owner_name: ownerName,
      email: cleanEmail,
      phone,
      address: address || "",
      city,
      state: state || "",
      business_type: businessType || "individual",
      gstin: gstin || "",
      description: description || "",
      status: "pending",
      role: "reseller",
    });

    // PIPELINE EVENT (RESELLER → ADMIN & ADMIN → RESELLER)
    await dispatchPipelineEvent({
      eventType: "RESELLER_APPLIED",
      title: "New Reseller Partner Application 🏪",
      message: `${businessName} (${ownerName}) registered for a reseller account in ${city}.`,
      recipientRole: "admin",
      referenceType: "reseller",
      referenceId: newReseller.id,
      actorRole: "reseller",
    });

    await dispatchPipelineEvent({
      eventType: "RESELLER_APPLIED",
      title: "Reseller Application Submitted 🏪",
      message: "Your NexLapTech reseller application has been submitted and is under admin review.",
      recipientRole: "reseller",
      recipientUserId: newReseller.id,
      referenceType: "reseller",
      referenceId: newReseller.id,
      actorRole: "system",
    });

    return NextResponse.json({
      success: true,
      message: "Registration submitted! Admin will review and approve your account. You'll be notified once activated.",
      resellerId: newReseller.id,
    });
  } catch (err: any) {
    console.error("Reseller register error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
