"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Building2,
  Shield,
  ArrowRight,
  HelpCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [selectedRole, setSelectedRole] = useState<"user" | "reseller" | "admin">("user");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotDob, setForgotDob] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const redirectTarget = searchParams.get("redirect");

  useEffect(() => {
    if (roleParam === "admin" || roleParam === "reseller" || roleParam === "user") {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !forgotDob) {
      return setErrorMsg("Please enter both Email/Phone and Date of Birth.");
    }
    setForgotLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone,
          dateOfBirth: forgotDob,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset identity verification failed.");
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setErrorMsg("Identity verified. Check your recovery instructions.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Please check your credentials.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) {
      return setErrorMsg("Please enter both Email/Phone and Password.");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone,
          password,
          role: selectedRole,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      if (selectedRole === "admin") {
        router.replace("/admin");
      } else if (selectedRole === "reseller") {
        router.replace("/reseller");
      } else if (redirectTarget) {
        router.replace(redirectTarget);
      } else {
        router.replace("/customer");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.15fr_0.85fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_35%)]" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-full border border-white/30 bg-white/10 p-2 backdrop-blur-sm">
                  <BrandLogo width={64} height={64} sizes="36px" priority className="h-9 w-9" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">NexLapTech</p>
                  <p className="text-xl font-bold">Smart tech commerce</p>
                </div>
              </div>

              <h1 className="max-w-sm text-4xl font-black leading-tight">Your tech ecosystem, safely connected.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-blue-50/90">
                Shop devices, manage service bookings, oversee partner performance, and access your operations in one premium dashboard.
              </p>
            </div>

            <div className="relative z-10 grid gap-3 text-sm text-blue-50/90">
              {[
                "Fast product discovery",
                "Trusted reseller ecosystem",
                "Operations with secure access",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-base font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between gap-3">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="NexLapTech home">
                <div className="rounded-full border border-slate-200 bg-slate-50 p-2">
                  <BrandLogo width={72} height={72} sizes="36px" priority className="h-9 w-9" />
                </div>
                <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">NEXLAPTECH</span>
              </Link>

              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                Back home
              </Link>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Secure sign in</p>
              <h2 className="font-display text-3xl font-black text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-600">Select your account role and continue to your portal.</p>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
                {[
                  { label: "Customer", value: "user", Icon: User },
                  { label: "Reseller", value: "reseller", Icon: Building2 },
                  { label: "Admin", value: "admin", Icon: Shield },
                ].map(({ label, value, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(value as "user" | "reseller" | "admin");
                      setErrorMsg("");
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-[11px] font-bold transition-all ${
                      selectedRole === value
                        ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <Icon className="mb-1 h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {selectedRole === "admin" && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[12px] leading-6 text-amber-800">
                <strong className="font-bold">Admin access:</strong> admin@nexbyte.com / admin123
              </div>
            )}

            {selectedRole === "reseller" && (
              <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50 p-3 text-[12px] leading-6 text-violet-800">
                <strong className="font-bold">Reseller access:</strong> reseller@nexbyte.com / any password
              </div>
            )}

            {showForgot ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-900">Forgot password</h3>
                  <p className="mt-1 text-xs text-slate-500">Verify your identity to reset access</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email or Phone</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="name@domain.com or phone"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Date of birth</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      value={forgotDob}
                      onChange={(e) => setForgotDob(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowForgot(false)} className="btn-secondary w-1/3 py-3 text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={forgotLoading} className="btn-primary w-2/3 py-3 text-xs">
                    {forgotLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : "Verify identity"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email address or mobile number</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder={selectedRole === "admin" ? "admin@nexbyte.com" : selectedRole === "reseller" ? "reseller@nexbyte.com" : "name@domain.com or phone"}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-[11px] font-semibold text-blue-700 hover:underline">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Remember me
                  </label>

                  <Link href="/signup" className="text-sm font-semibold text-blue-700 hover:underline">
                    Need an account?
                  </Link>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      Sign in as {selectedRole.toUpperCase()}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
              {selectedRole === "reseller" ? (
                <p>
                  Want to sell on NexLapTech? <Link href="/signup" className="font-bold text-violet-700 hover:underline">Become a partner</Link>
                </p>
              ) : (
                <p>
                  Back to <Link href="/" className="font-bold text-blue-700 hover:underline">customer website</Link>
                </p>
              )}

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
                Secure access
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
