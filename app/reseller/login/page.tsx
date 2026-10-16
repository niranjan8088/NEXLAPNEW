"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  Building2, Mail, Phone, Lock, ArrowRight, CheckCircle,
  User, MapPin, Briefcase, FileText, Eye, EyeOff, Loader2,
  ShieldCheck
} from "lucide-react";

type Mode = "login" | "register";

export default function ResellerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regState, setRegState] = useState("");
  const [businessType, setBusinessType] = useState("individual");
  const [gstin, setGstin] = useState("");
  const [description, setDescription] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reseller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.replace("/reseller");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reseller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName, ownerName, email: regEmail, phone: regPhone,
          city: regCity, state: regState, businessType, gstin, description,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors";
  const labelCls = "text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5";

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="mb-5 inline-flex items-center justify-center gap-2.5">
            <div className="relative h-11 w-11">
              <BrandLogo width={88} height={88} sizes="44px" priority className="relative h-full w-full" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-950">
              NEX LAPTECH
            </span>
          </Link>

          {/* Mode toggle */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 gap-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`rounded-md px-5 py-2.5 text-xs font-semibold transition-all ${mode === "login" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
            >
              Reseller Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`rounded-md px-5 py-2.5 text-xs font-semibold transition-all ${mode === "register" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
            >
              Become a Reseller
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-600">
            {mode === "login"
              ? "Sign in to manage your products, orders, and customers."
              : "Register as a Nex LapTech partner. Admin approval required."}
          </p>
        </div>

        <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          {/* ── LOGIN MODE ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">Reseller Portal</h2>
                  <p className="text-xs text-slate-500">Nex LapTech Partner Management System</p>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
              )}

              <div>
                <label className={labelCls}><Mail className="h-3.5 w-3.5 text-blue-700" /> Email Address *</label>
                <input id="res-email" type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="e.g. reseller@nexbyte.com" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}><Lock className="h-3.5 w-3.5 text-blue-700" /> Password *</label>
                <div className="relative">
                  <input id="res-pass" type={showPassword ? "text" : "password"} required value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className={inputCls + " pr-10"} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Sign In to Reseller Dashboard</>}
                </button>
              </div>

              <div className="pt-1 text-center text-xs text-slate-500">
                <span>Dev credentials: </span>
                <span className="font-mono text-blue-700">reseller@nexbyte.com</span>
                <span> / any password</span>
              </div>
            </form>
          )}

          {/* ── REGISTER MODE ── */}
          {mode === "register" && (
            success ? (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-950">Application Submitted!</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-600">
                  Your reseller application has been submitted to Nex LapTech admin for review.
                  You will be notified via email once approved.
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <ShieldCheck className="h-4 w-4 text-blue-700" />
                  <span className="text-xs font-semibold text-blue-700">Application under review</span>
                </div>
                <button onClick={() => { setMode("login"); setSuccess(false); }}
                  className="btn-primary !py-2.5 !px-6 text-xs mt-2">
                  Go to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-teal-700">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-950">Partner Registration</h2>
                    <p className="text-xs text-slate-500">Pending admin approval after signup</p>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}><Building2 className="h-3.5 w-3.5 text-blue-700" /> Business Name *</label>
                    <input required value={businessName} onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. TechZone Store" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><User className="h-3.5 w-3.5 text-blue-700" /> Owner Name *</label>
                    <input required value={ownerName} onChange={e => setOwnerName(e.target.value)}
                      placeholder="e.g. Kiran B." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Mail className="h-3.5 w-3.5 text-blue-700" /> Email *</label>
                    <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      placeholder="business@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Phone className="h-3.5 w-3.5 text-blue-700" /> Phone *</label>
                    <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      placeholder="9876543210" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><MapPin className="h-3.5 w-3.5 text-blue-700" /> City *</label>
                    <input required value={regCity} onChange={e => setRegCity(e.target.value)}
                      placeholder="e.g. Bengaluru" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><MapPin className="h-3.5 w-3.5 text-blue-700" /> State</label>
                    <input value={regState} onChange={e => setRegState(e.target.value)}
                      placeholder="Karnataka" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Briefcase className="h-3.5 w-3.5 text-blue-700" /> Business Type</label>
                    <select value={businessType} onChange={e => setBusinessType(e.target.value)}
                      className={inputCls}>
                      <option value="individual">Individual / Freelancer</option>
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="pvt_ltd">Private Limited</option>
                      <option value="llp">LLP</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}><FileText className="h-3.5 w-3.5 text-blue-700" /> GSTIN (Optional)</label>
                    <input value={gstin} onChange={e => setGstin(e.target.value)}
                      placeholder="22AAAAA0000A1Z5" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}><FileText className="h-3.5 w-3.5 text-blue-700" /> Business Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    placeholder="Brief description of your business and products you plan to sell..."
                    className={inputCls + " resize-none"} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}><Lock className="h-3.5 w-3.5 text-blue-700" /> Password *</label>
                    <input type="password" required minLength={8} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min 8 characters" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Lock className="h-3.5 w-3.5 text-blue-700" /> Confirm Password *</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password" className={inputCls} />
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Your account will be reviewed by Nex LapTech admin before activation.
                </div>

                <button type="submit" disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Briefcase className="h-4 w-4" /> Submit Reseller Application</>}
                </button>
              </form>
            )
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link href="/admin/login" className="transition-colors hover:text-blue-700">Admin Login</Link>
          <span className="mx-2">·</span>
          <Link href="/customer/signin" className="transition-colors hover:text-blue-700">Customer Login</Link>
          <span className="mx-2">·</span>
          <Link href="/" className="transition-colors hover:text-blue-700">Back to Website</Link>
        </div>
      </div>
    </main>
  );
}
