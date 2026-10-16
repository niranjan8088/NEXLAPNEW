"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  User,
  Building2,
  Shield,
  ArrowRight,
  Sparkles,
  Monitor,
  Wrench,
  GraduationCap,
  ShoppingBag,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface AuthGatewayProps {
  hasAdminSession?: boolean;
  hasResellerSession?: boolean;
  hasUserSession?: boolean;
}

export default function AuthGateway({
  hasAdminSession = false,
  hasResellerSession = false,
  hasUserSession = false,
}: AuthGatewayProps) {
  return (
    <div className="relative flex min-h-[100svh] w-full flex-col items-center justify-center bg-nex-black px-5 py-12 overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-80" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nex-blue/12 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[12%] left-[8%] h-1.5 w-1.5 rounded-full bg-nex-blueLight/40 animate-pulse" />
        <div className="absolute top-[22%] right-[12%] h-2 w-2 rounded-full bg-purple-400/30 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[25%] left-[15%] h-1.5 w-1.5 rounded-full bg-nex-blueLight/30 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[55%] right-[20%] h-1.5 w-1.5 rounded-full bg-cyan-400/25 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        {/* Logo & Brand Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative h-20 w-20 mb-3">
            <div className="absolute inset-0 rounded-full bg-nex-blue/25 blur-xl animate-pulse" />
            <BrandLogo width={160} height={160} priority className="relative h-full w-full drop-shadow-[0_0_25px_rgba(30,94,255,0.4)]" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            NEX <span className="text-nex-blueLight">LAPTECH</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium tracking-[0.2em] text-nex-blueLight/90 uppercase">
            Laptops | PC Components | Accessories | More
          </p>
        </div>

        {/* Active Session Notification Banner if logged in */}
        {hasAdminSession && (
          <div className="mb-6 max-w-md mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0 text-amber-400" />
              <span>You have an active <strong>Admin Session</strong></span>
            </div>
            <Link
              href="/admin"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg transition-all shrink-0 shadow-md"
            >
              Go to Admin Console →
            </Link>
          </div>
        )}
        {hasResellerSession && !hasAdminSession && (
          <div className="mb-6 max-w-md mx-auto rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5 text-xs text-purple-300 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-purple-400" />
              <span>You have an active <strong>Reseller Session</strong></span>
            </div>
            <Link
              href="/reseller"
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all shrink-0 shadow-md"
            >
              Go to Reseller Panel →
            </Link>
          </div>
        )}
        {hasUserSession && !hasAdminSession && !hasResellerSession && (
          <div className="mb-6 max-w-md mx-auto rounded-xl border border-nex-blue/30 bg-nex-blue/10 p-3.5 text-xs text-nex-blueLight flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-nex-blueLight" />
              <span>You have an active <strong>Customer Session</strong></span>
            </div>
            <Link
              href="/customer"
              className="px-3.5 py-1.5 btn-primary font-bold text-xs rounded-lg transition-all shrink-0 shadow-md"
            >
              Go to Website →
            </Link>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-10 max-w-md mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome to <span className="text-gradient-blue">Nex LapTech</span>
          </h2>
          <p className="text-xs sm:text-sm text-nex-mist leading-relaxed">
            Choose how you want to continue:
          </p>
        </div>

        {/* 3 Account Option Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mb-10">
          
          {/* Card 1: CUSTOMER / USER */}
          <div className="group glass-card border border-white/10 hover:border-nex-blue/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:bg-nex-blue/[0.04] hover:shadow-[0_0_30px_rgba(30,94,255,0.15)] relative">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nex-blue/15 text-nex-blueLight mb-4 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-nex-blueLight block mb-1">
                Account Access
              </span>
              <h3 className="font-display text-lg font-bold text-white mb-3">
                CUSTOMER / USER
              </h3>
              <ul className="space-y-2 text-xs text-nex-mist mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-nex-blueLight shrink-0" />
                  <span>Browse &amp; search products</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-nex-blueLight shrink-0" />
                  <span>Book IT &amp; repair services</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-nex-blueLight shrink-0" />
                  <span>Academy hardware training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-nex-blueLight shrink-0" />
                  <span>Order tracking &amp; support</span>
                </li>
              </ul>
            </div>
            <Link
              href={hasUserSession ? "/customer" : "/customer/signin"}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-glow-blue group-hover:shadow-[0_0_25px_rgba(30,94,255,0.5)]"
            >
              <span>{hasUserSession ? "Go to Customer Website" : "Continue as Customer"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 2: RESELLER / SELLER */}
          <div className="group glass-card border border-white/10 hover:border-purple-500/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:bg-purple-600/[0.04] hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] relative">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/15 text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                Partner Portal
              </span>
              <h3 className="font-display text-lg font-bold text-white mb-3">
                RESELLER / SELLER
              </h3>
              <ul className="space-y-2 text-xs text-nex-mist mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Manage product catalog</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Manage stock &amp; pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Reseller orders &amp; invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Customer messages &amp; support</span>
                </li>
              </ul>
            </div>
            <Link
              href={hasResellerSession ? "/reseller" : "/reseller/login"}
              className="w-full py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
            >
              <span>{hasResellerSession ? "Go to Reseller Panel" : "Continue as Reseller"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 3: ADMIN */}
          <div className="group glass-card border border-white/10 hover:border-amber-500/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:bg-amber-500/[0.04] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] relative">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> System Administration
              </span>
              <h3 className="font-display text-lg font-bold text-white mb-3">
                ADMIN CONSOLE
              </h3>
              <ul className="space-y-2 text-xs text-nex-mist mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Full system administration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>User &amp; reseller management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Products, orders &amp; bookings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Analytics &amp; system reports</span>
                </li>
              </ul>
            </div>
            <Link
              href={hasAdminSession ? "/admin" : "/admin/login"}
              className="w-full py-3 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] font-extrabold"
            >
              <span>{hasAdminSession ? "Go to Admin Console" : "Admin Login"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          <div className="flex flex-col items-center gap-1.5">
            <Monitor className="h-4 w-4 text-nex-blueLight/70" />
            <span className="text-[10px] font-semibold text-nex-mist">Hardware &amp; PCs</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Wrench className="h-4 w-4 text-nex-blueLight/70" />
            <span className="text-[10px] font-semibold text-nex-mist">IT &amp; CCTV Services</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-nex-blueLight/70" />
            <span className="text-[10px] font-semibold text-nex-mist">Hardware Academy</span>
          </div>
        </div>

        {/* Footer Tagline */}
        <p className="text-[11px] text-white/30">
          © {new Date().getFullYear()} Nex LapTech. All rights reserved. Server-side RBAC active.
        </p>
      </div>
    </div>
  );
}
