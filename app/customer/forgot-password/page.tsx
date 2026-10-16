"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMsg("Please enter your email address or phone number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Call existing secure forgot-password endpoint
      await safeJsonFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          dateOfBirth: dateOfBirth || undefined,
        }),
      });

      // Always display generic security-safe success response (never reveal user existence)
      setSuccess(true);
    } catch (err: any) {
      // Even on failure, show security-safe guidance without account enumeration
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between selection:bg-nex-blue selection:text-white">
      {/* Minimal Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9">
            <BrandLogo width={72} height={72} sizes="36px" priority className="h-full w-full" />
          </div>
          <span className="font-display text-lg font-bold">
            NEXLAPTECH
          </span>
        </Link>

        <Link
          href="/customer/signin"
          className="rounded-full bg-nex-blue/10 hover:bg-nex-blue/20 text-nex-blue dark:text-nex-blueLight border border-nex-blue/20 px-4 py-1.5 text-xs font-bold transition-all"
        >
          Back to Sign In
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl">
            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Check your email</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    We&apos;ve sent instructions to securely reset your password if a matching account exists.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    href="/customer/signin"
                    className="w-full rounded-xl bg-nex-blue text-white py-3 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Back to Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-nex-blue/10 border border-nex-blue/20 px-3 py-1 text-[11px] font-bold text-nex-blue dark:text-nex-blueLight mb-3">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure Password Recovery
                  </div>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Reset your password
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Enter your email or phone number and we&apos;ll help you securely recover your account.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3.5 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleResetRequest} className="space-y-4 text-xs">
                  {/* Email or Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="forgot-identity" className="font-semibold text-slate-700 dark:text-slate-300">
                      Email Address or Phone Number *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="forgot-identity"
                        type="text"
                        required
                        autoComplete="username"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="e.g. customer@gmail.com or 9876543210"
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-nex-blue"
                      />
                    </div>
                  </div>

                  {/* Optional Date of Birth verification signal */}
                  <div className="space-y-1.5">
                    <label htmlFor="forgot-dob" className="font-semibold text-slate-700 dark:text-slate-300">
                      Date of Birth (Optional Verification Signal)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="forgot-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-nex-blue"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-nex-blue hover:bg-blue-600 text-white font-bold py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center text-xs text-slate-500">
                  Remembered your password?{" "}
                  <Link href="/customer/signin" className="font-bold text-nex-blue dark:text-nex-blueLight hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Minimal Auth Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 NexLapTech. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/contact" className="hover:text-nex-blue">Contact</Link>
          <Link href="/contact" className="hover:text-nex-blue">Privacy</Link>
          <Link href="/contact" className="hover:text-nex-blue">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
