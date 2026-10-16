import { NextRequest, NextResponse } from "next/server";

const ONE_DAY = 60 * 60 * 24;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password, rememberMe } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const sessionDuration = rememberMe ? THIRTY_DAYS : ONE_DAY;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  // ── MOCK/DEV MODE ─────────────────────────────────────────────────────────
  if (!supabaseUrl) {
    // In dev mode, accept any reseller who is in the mock DB
    const { dbHelper } = await import("@/lib/dbHelper");
    const resellers = await dbHelper.resellers.list();
    const reseller = resellers.find(
      (r: any) => r.email?.toLowerCase() === email.trim().toLowerCase()
    );

    if (!reseller) {
      return NextResponse.json(
        { error: "No reseller account found with this email. Please register first." },
        { status: 401 }
      );
    }

    if (reseller.status === "pending") {
      return NextResponse.json(
        { error: "Your reseller account is pending admin approval. Please wait for approval notification." },
        { status: 403 }
      );
    }

    if (reseller.status === "suspended") {
      return NextResponse.json(
        { error: "Your reseller account has been suspended. Contact admin." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      role: "reseller",
      reseller: {
        id: reseller.id,
        email: reseller.email,
        businessName: reseller.business_name || reseller.businessName,
        status: reseller.status,
      },
    });

    // Session token: "mock-reseller:{id}:{email}"
    response.cookies.set(
      "nexbyte_reseller_session",
      `mock-reseller:${reseller.id}:${reseller.email}`,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: sessionDuration,
        path: "/",
      }
    );
    // Also store readable name for client
    response.cookies.set(
      "nexbyte_reseller_name",
      reseller.business_name || reseller.owner_name || "Reseller",
      { httpOnly: false, path: "/", maxAge: sessionDuration }
    );
    response.cookies.set(
      "nexbyte_reseller_email",
      reseller.email,
      { httpOnly: false, path: "/", maxAge: sessionDuration }
    );
    return response;
  }

  // ── SUPABASE MODE ─────────────────────────────────────────────────────────
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || "Invalid credentials." }, { status: 401 });
    }

    // Check profile role
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,role,status,full_name,email")
      .eq("auth_user_id", data.user.id)
      .single();

    if (!profile || profile.role !== "reseller") {
      return NextResponse.json({ error: "This account is not a reseller account." }, { status: 403 });
    }

    if (profile.status === "pending") {
      return NextResponse.json({ error: "Reseller account pending approval." }, { status: 403 });
    }
    if (profile.status === "suspended") {
      return NextResponse.json({ error: "Reseller account suspended." }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, role: "reseller" });
    response.cookies.set("nexbyte_reseller_session", data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: rememberMe ? THIRTY_DAYS : (data.session.expires_in || 3600),
      path: "/",
    });
    return response;
  } catch (err: any) {
    console.error("Reseller login error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
