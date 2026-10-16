import { NextRequest, NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getReseller(request: NextRequest) {
  const session = request.cookies.get("nexbyte_reseller_session")?.value;
  if (!session) return null;

  if (session.startsWith("mock-reseller:")) {
    const resellerId = session.split(":")[1];
    return resellerId ? dbHelper.resellers.getById(resellerId) : null;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const { data, error } = await supabase.auth.getUser(session);
  if (error || !data.user) return null;

  const { data: byAuthId, error: authIdError } = await supabaseAdmin
    .from("resellers")
    .select("*")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();
  if (authIdError) throw authIdError;
  if (byAuthId) return byAuthId;

  if (!data.user.email) return null;
  const { data: byEmail, error: emailError } = await supabaseAdmin
    .from("resellers")
    .select("*")
    .eq("email", data.user.email.toLowerCase())
    .maybeSingle();
  if (emailError) throw emailError;
  return byEmail;
}

function safeProfile(reseller: any) {
  const { password, password_hash, reset_token, reset_token_expiry, ...profile } = reseller;
  return profile;
}

const editableFields = {
  businessName: "business_name",
  ownerName: "owner_name",
  phone: "phone",
  address: "address",
  city: "city",
  state: "state",
  businessType: "business_type",
  gstin: "gstin",
  description: "description",
} as const;

export async function GET(request: NextRequest) {
  try {
    const reseller = await getReseller(request);
    if (!reseller) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }
    return NextResponse.json({ success: true, profile: safeProfile(reseller) });
  } catch (error) {
    console.error("GET Reseller Profile Error:", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const reseller = await getReseller(request);
    if (!reseller) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }
    if (reseller.status === "suspended") {
      return NextResponse.json({ error: "This reseller account is suspended." }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, string> = {};
    for (const [inputKey, fieldName] of Object.entries(editableFields)) {
      const value = body[inputKey];
      if (value !== undefined) {
        if (typeof value !== "string") {
          return NextResponse.json({ error: "Profile fields must be text." }, { status: 400 });
        }
        updates[fieldName] = value.trim().slice(0, fieldName === "description" ? 1000 : 200);
      }
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: "No profile changes were provided." }, { status: 400 });
    }
    if (updates.business_name !== undefined && !updates.business_name) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }
    if (updates.owner_name !== undefined && !updates.owner_name) {
      return NextResponse.json({ error: "Owner name is required." }, { status: 400 });
    }
    if (updates.phone !== undefined && updates.phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    if (updates.city !== undefined && !updates.city) {
      return NextResponse.json({ error: "City is required." }, { status: 400 });
    }

    const updated = await dbHelper.resellers.update(reseller.id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }
    const response = NextResponse.json({ success: true, profile: safeProfile(updated) });
    response.cookies.set(
      "nexbyte_reseller_name",
      updated.business_name || updated.owner_name || "Reseller",
      { httpOnly: false, path: "/", maxAge: 60 * 60 * 24 * 30 }
    );
    return response;
  } catch (error) {
    console.error("PUT Reseller Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}