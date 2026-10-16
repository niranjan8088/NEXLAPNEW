"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Phone,
  FileText,
  CheckCircle2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<"user" | "reseller">("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return setErrorMsg("Please fill in all required fields.");
    }
    if (password.length < 6) {
      return setErrorMsg("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }
    if (!phone.trim()) {
      return setErrorMsg("Phone number is required.");
    }
    if (selectedRole === "user") {
      if (!dateOfBirth) {
        return setErrorMsg("Date of Birth is required for customer accounts.");
      }
      const dobDate = new Date(dateOfBirth);
      if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
        return setErrorMsg("Date of Birth cannot be a future date or invalid.");
      }
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          dateOfBirth: selectedRole === "user" ? dateOfBirth : undefined,
          role: selectedRole,
          businessName: selectedRole === "reseller" ? businessName : undefined,
          gstin: selectedRole === "reseller" ? gstin : undefined,
          businessDescription: selectedRole === "reseller" ? businessDescription : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      if (selectedRole === "reseller") {
        setSuccessMsg("Reseller application submitted! An admin will review and approve your account.");
      } else {
        setSuccessMsg("Account created successfully! Redirecting to sign in...");
      }
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_35%)]" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-full border border-white/30 bg-white/10 p-2 backdrop-blur-sm">
                  <BrandLogo width={64} height={64} sizes="36px" priority className="h-9 w-9" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">NexLapTech</p>
                  <p className="text-xl font-bold">Join the network</p>
                </div>
              </div>

              <h1 className="max-w-sm text-4xl font-black leading-tight">Build an account designed for growth.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-blue-50/90">
                Create a customer or reseller account and unlock faster shopping, stronger support, and business-ready tools.
              </p>
            </div>

            <div className="relative z-10 grid gap-3 text-sm text-blue-50/90">
              {[
                "Instant access to your portal",
                "Trusted commerce and support",
                "Fast onboarding for partners",
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

              <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                Sign in
              </Link>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Create account</p>
              <h2 className="font-display text-3xl font-black text-slate-900">Get started</h2>
              <p className="mt-2 text-sm text-slate-600">Choose your account type and complete your profile.</p>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("user");
                    setErrorMsg("");
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-[11px] font-bold transition-all ${
                    selectedRole === "user" ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200" : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <User className="mb-1 h-4 w-4" />
                  CUSTOMER
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("reseller");
                    setErrorMsg("");
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-[11px] font-bold transition-all ${
                    selectedRole === "reseller" ? "bg-white text-violet-700 shadow-sm ring-1 ring-violet-200" : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Building2 className="mb-1 h-4 w-4" />
                  RESELLER
                </button>
              </div>
            </div>

            {selectedRole === "reseller" && (
              <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50 p-3 text-[12px] leading-6 text-violet-800">
                <strong className="font-bold">Reseller application:</strong> your account will be reviewed by NexLapTech admin before approval.
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  {selectedRole === "reseller" ? "Full Name / Business Owner" : "Full Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {selectedRole === "reseller" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Business Name *</label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="TechZone Computers"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">GSTIN (Optional)</label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="29ABCDE1234F1Z5"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Business Description</label>
                    <textarea
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Tell us about your business, products you sell, areas you serve..."
                      rows={2}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {selectedRole === "user" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Date of Birth *</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Password *</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="mt-1 text-[10px] text-red-600">Passwords do not match.</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {selectedRole === "reseller" ? "Submit Reseller Application" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-5 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
              Already have an account? <Link href="/login" className="font-bold text-blue-700 hover:underline">Sign in</Link>
            </div>

            <div className="mt-3 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
                Secure onboarding
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
