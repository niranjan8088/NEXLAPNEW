"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertTriangle, Send, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setErrorMsg("Please enter both email and password.");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      router.replace("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100svh] w-full items-center justify-center bg-[#f5f8fc] px-4 py-10 text-slate-900 sm:px-6">
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="mb-8 text-center">
          <span className="section-eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
            Security Gateway
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Admin <span className="text-blue-700">Control Panel</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Authorized administrative access only.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {errorMsg && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Development helper tip */}
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs leading-relaxed text-blue-800">
            <strong>Development access</strong> — Email: <code className="rounded bg-white px-1 font-mono">admin@nexbyte.com</code> &nbsp;·&nbsp; Password: <code className="rounded bg-white px-1 font-mono">admin123</code>
          </div>

          {showForgot ? (
            /* Forgot Password Panel */
            <div className="space-y-5">
              <div className="text-center">
                <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-blue-700" />
                <h3 className="font-display text-base font-bold text-slate-950">Reset Password</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Contact the system administrator or use your Supabase dashboard to reset your admin password.
                </p>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <p><strong className="text-slate-900">Option 1:</strong> Go to your Supabase project → Authentication → Users → Reset password</p>
                <p><strong className="text-slate-900">Option 2:</strong> Contact <span className="text-blue-700">admin@nexbyte.com</span> for password recovery</p>
              </div>

              <button
                onClick={() => setShowForgot(false)}
                className="w-full btn-secondary text-xs !py-3"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nexbytetechnologies.com"
                    className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span className="text-xs text-slate-600">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-medium text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Authenticate
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Role badge */}
        <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            <ShieldCheck className="h-3 w-3 text-blue-700" />
            Role-Based Access Control Active
          </span>
        </div>
      </div>
    </div>
  );
}
