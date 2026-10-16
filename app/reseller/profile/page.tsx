"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, MapPin, Loader2, Save, CheckCircle, AlertCircle } from "lucide-react";

export default function ResellerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [businessType, setBusinessType] = useState("individual");
  const [gstin, setGstin] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/reseller/profile")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load profile.");
        return data.profile;
      })
      .then((profile) => {
        if (!active) return;
        setName(profile.owner_name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setBusinessName(profile.business_name || "");
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setState(profile.state || "");
        setBusinessType(profile.business_type || "individual");
        setGstin(profile.gstin || "");
        setDescription(profile.description || "");
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || "Failed to load profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/reseller/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName, ownerName: name, phone, address, city, state,
          businessType, gstin, description,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update profile.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (saveError: any) {
      setError(saveError.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your reseller and business information.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}
        {saved && (
          <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Profile updated successfully.
          </div>
        )}
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-500" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reseller-business" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Building2 className="h-3.5 w-3.5 text-blue-600" /> Business Name
            </label>
            <input id="reseller-business" required value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="Your business name" className={inputCls} />
          </div>
          <div>
            <label htmlFor="reseller-owner" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <User className="h-3.5 w-3.5 text-blue-600" /> Owner Name
            </label>
            <input id="reseller-owner" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" className={inputCls} />
          </div>
          <div>
            <label htmlFor="reseller-email" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Mail className="h-3.5 w-3.5 text-blue-600" /> Email
            </label>
            <input id="reseller-email" type="email" value={email} readOnly disabled
              className={inputCls} aria-describedby="reseller-email-note" />
            <p id="reseller-email-note" className="mt-1 text-[11px] text-slate-500">Contact support to change your account email.</p>
          </div>
          <div>
            <label htmlFor="reseller-phone" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Phone className="h-3.5 w-3.5 text-blue-600" /> Phone
            </label>
            <input id="reseller-phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="9876543210" className={inputCls} />
          </div>
          <div>
            <label htmlFor="reseller-city" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-blue-600" /> City
            </label>
            <input id="reseller-city" required value={city} onChange={e => setCity(e.target.value)}
              placeholder="Bengaluru" className={inputCls} />
          </div>
          <div>
            <label htmlFor="reseller-state" className="mb-1.5 block text-xs font-semibold text-slate-700">State</label>
            <input id="reseller-state" value={state} onChange={e => setState(e.target.value)}
              placeholder="Karnataka" className={inputCls} />
          </div>
          <div>
            <label htmlFor="reseller-address" className="mb-1.5 block text-xs font-semibold text-slate-700">Business Address</label>
            <input id="reseller-address" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Street address" className={inputCls} />
          </div>
          <div>
            <label htmlFor="reseller-type" className="mb-1.5 block text-xs font-semibold text-slate-700">Business Type</label>
            <select id="reseller-type" value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputCls}>
              <option value="individual">Individual</option>
              <option value="partnership">Partnership</option>
              <option value="private_limited">Private limited</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="reseller-gstin" className="mb-1.5 block text-xs font-semibold text-slate-700">GSTIN</label>
            <input id="reseller-gstin" value={gstin} onChange={e => setGstin(e.target.value)}
              placeholder="Optional GST identification number" className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="reseller-description" className="mb-1.5 block text-xs font-semibold text-slate-700">Business Description</label>
          <textarea id="reseller-description" value={description} onChange={e => setDescription(e.target.value)} rows={3}
            placeholder="Brief description of your business..." className={inputCls + " resize-none"} />
        </div>
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
          </>
        )}
      </form>
    </div>
  );
}
