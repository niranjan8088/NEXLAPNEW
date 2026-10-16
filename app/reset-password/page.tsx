"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      return setErrorMsg("Invalid reset session token. Please request password reset again.");
    }
    if (newPassword.length < 6) {
      return setErrorMsg("Password must be at least 6 characters long.");
    }
    if (newPassword !== confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccessMsg("Password reset successfully! Redirecting to sign in page...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card border border-white/10 bg-nex-ink p-7 shadow-glow-blue sm:p-8">
      {errorMsg && (
        <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {!token ? (
        <div className="text-center py-4 space-y-3">
          <KeyRound className="h-10 w-10 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Invalid Reset Link</h3>
          <p className="text-xs text-nex-mist leading-relaxed">
            No valid security token was found in your password reset link. Please perform identity verification again.
          </p>
          <Link href="/login" className="btn-primary inline-flex py-2.5 px-6 text-xs mt-2">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">New Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-12 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-nex-mist hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Confirm New Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className={`w-full rounded-xl bg-white/[0.04] border pl-10 pr-12 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-red-500/30 focus:border-red-500/50 focus:ring-red-500/30"
                    : "border-white/[0.08] focus:border-nex-blue/50 focus:ring-nex-blue/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-nex-mist hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[10px] text-red-400 mt-1">Passwords do not match.</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-glow-blue"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center bg-nex-black px-5 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-80" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nex-blue/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding Header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full bg-nex-blue/30 blur-md group-hover:bg-nex-blue/50 transition-colors" />
              <BrandLogo width={80} height={80} sizes="40px" priority className="relative h-full w-full" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              NEX <span className="text-nex-blueLight">LAPTECH</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Reset Your <span className="text-gradient-blue">Password.</span>
          </h1>
          <p className="mt-1 text-xs text-nex-mist">
            Set a new secure password for your NexLapTech account.
          </p>
        </div>

        <Suspense fallback={
          <div className="glass-card border border-white/10 bg-nex-ink p-8 text-center text-xs text-nex-mist">
            Loading reset interface...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-nex-mist hover:text-white hover:underline">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
