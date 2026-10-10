import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminSession = request.cookies.get("nexbyte_admin_session")?.value;
  const resellerSession = request.cookies.get("nexbyte_reseller_session")?.value;
  const userSession = request.cookies.get("nexbyte_customer_session")?.value;

  // ── CUSTOMER ACTION PAGES ──────────────────────────────────────────────────
  const requiresCustomerSession =
    pathname === "/checkout" ||
    pathname === "/book-laptop" ||
    pathname === "/book-service";
  if (requiresCustomerSession && !userSession) {
    const next = `${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(
      new URL(`/customer/signin?next=${encodeURIComponent(next)}`, request.url)
    );
  }

  // ── ROOT "/" — Authentication Gateway ─────────────────────────────────────
  if (pathname === "/") {
    return NextResponse.next();
  }

  // ── AUTH PAGES — Redirect if already authenticated ───────────────────────
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/customer/signin" ||
    pathname === "/customer/signup" ||
    pathname === "/customer/forgot-password" ||
    pathname === "/customer/login";

  if (isAuthPage) {
    const roleParam = request.nextUrl.searchParams.get("role");

    if (roleParam === "admin" && adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (roleParam === "reseller" && resellerSession) {
      return NextResponse.redirect(new URL("/reseller", request.url));
    }
    if ((roleParam === "user" || !roleParam) && userSession) {
      return NextResponse.redirect(new URL("/customer", request.url));
    }
    if (adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (resellerSession) {
      return NextResponse.redirect(new URL("/reseller", request.url));
    }
  }

  // ── /admin/login — redirect if authenticated ─────────────────────────────
  if (pathname === "/admin/login") {
    if (adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // ── /admin/* — require admin session ──────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!adminSession) {
      if (userSession) {
        return NextResponse.redirect(new URL("/customer", request.url));
      }
      return NextResponse.redirect(new URL("/login?role=admin", request.url));
    }

    if (adminSession === "mock-admin-session-token") {
      return NextResponse.next();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl) {
      try {
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error } = await supabaseClient.auth.getUser(adminSession);

        if (error || !user?.email) {
          const res = NextResponse.redirect(new URL("/login?role=admin", request.url));
          res.cookies.delete("nexbyte_admin_session");
          return res;
        }

        const allowedEmails = (process.env.ADMIN_EMAILS || "admin@nexbyte.com")
          .split(",")
          .map((email) => email.trim().toLowerCase());

        if (!allowedEmails.includes(user.email.toLowerCase())) {
          const res = NextResponse.redirect(new URL("/login?role=admin", request.url));
          res.cookies.delete("nexbyte_admin_session");
          return res;
        }
      } catch {
        const res = NextResponse.redirect(new URL("/login?role=admin", request.url));
        res.cookies.delete("nexbyte_admin_session");
        return res;
      }
    } else if (adminSession !== "mock-admin-session-token") {
      const res = NextResponse.redirect(new URL("/login?role=admin", request.url));
      res.cookies.delete("nexbyte_admin_session");
      return res;
    }
  }

  // ── /reseller/login ───────────────────────────────────────────────────────
  if (pathname === "/reseller/login") {
    if (resellerSession) {
      return NextResponse.redirect(new URL("/reseller", request.url));
    }
  }

  // ── /reseller/* — require reseller session ────────────────────────────────
  if (pathname.startsWith("/reseller") && pathname !== "/reseller/login") {
    if (!resellerSession) {
      if (userSession) {
        return NextResponse.redirect(new URL("/customer", request.url));
      }
      return NextResponse.redirect(new URL("/login?role=reseller", request.url));
    }
  }

  // ── /customer/* — require user session (excluding customer auth pages) ────
  const isCustomerAuthPage =
    pathname === "/customer/signin" ||
    pathname === "/customer/signup" ||
    pathname === "/customer/forgot-password" ||
    pathname === "/customer/login";

  if (pathname.startsWith("/customer") && !isCustomerAuthPage) {
    if (!userSession) {
      return NextResponse.redirect(new URL("/customer/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/checkout",
    "/book-laptop",
    "/book-service",
    "/contact",
    "/admin/:path*",
    "/reseller/:path*",
    "/customer/:path*",
  ],
};
