import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ONE_DAY = 60 * 60 * 24;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password, rememberMe } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const sessionDuration = rememberMe ? THIRTY_DAYS : ONE_DAY;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // ── LOCAL DEV FALLBACK (no Supabase configured) ──────────────────────────
  // When Supabase env vars are absent, accept the hardcoded dev credentials.
  if (!supabaseUrl) {
    const DEV_ADMIN_EMAILS = ["admin@nexbyte.com", "niranjan@nexbyte.com"];
    const DEV_PASSWORD = "admin123";

    if (
      DEV_ADMIN_EMAILS.includes(email.trim().toLowerCase()) &&
      password === DEV_PASSWORD
    ) {
      const response = NextResponse.json({
        success: true,
        message: "Logged in via local dev auth.",
        role: "admin",
      });
      response.cookies.set("nexbyte_admin_session", "mock-admin-session-token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: sessionDuration,
        path: "/",
      });
      return response;
    }

    return NextResponse.json(
      {
        error:
          "Invalid credentials. Use admin@nexbyte.com with password admin123 for local development.",
      },
      { status: 401 }
    );
  }

  // ── SUPABASE AUTH PATH ────────────────────────────────────────────────────
  // Validate against ADMIN_EMAILS allowlist when Supabase is configured.
  const allowedEmails = (process.env.ADMIN_EMAILS || "admin@nexbyte.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!allowedEmails.includes(email.trim().toLowerCase())) {
    return NextResponse.json(
      { error: "Access denied. This email is not authorized as an admin." },
      { status: 403 }
    );
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, role: "admin" });
    response.cookies.set("nexbyte_admin_session", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? THIRTY_DAYS : (data.session.expires_in || 3600),
      path: "/",
    });
    return response;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
