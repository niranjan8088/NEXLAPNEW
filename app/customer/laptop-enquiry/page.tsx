"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Laptop, Send, CheckCircle2, RefreshCw, Cpu, HardDrive, ShieldCheck, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerLaptopEnquiryPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [laptopType, setLaptopType] = useState("Business Laptop");
  const [budget, setBudget] = useState("₹30,000 – ₹40,000");
  const [brandPref, setBrandPref] = useState("Lenovo");
  const [ram, setRam] = useState("16GB DDR4");
  const [storage, setStorage] = useState("512GB NVMe SSD");
  const [processor, setProcessor] = useState("Intel Core i5 / AMD Ryzen 5");
  const [quantity, setQuantity] = useState("1 Unit");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfileAndEnquiries();
  }, []);

  const fetchProfileAndData = async () => {
    try {
      const profRes = await safeJsonFetch("/api/customer/profile");
      if (profRes.ok && profRes.data?.profile) {
        const p = profRes.data.profile;
        setCustomerName(p.full_name || "");
        setPhone(p.phone || "");
        setEmail(p.email || "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await safeJsonFetch("/api/laptop-enquiries");
      if (res.ok && res.data?.enquiries) {
        setEnquiries(res.data.enquiries);
      } else {
        setEnquiries([]);
        console.error("Failed to load customer enquiries.", res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileAndEnquiries = async () => {
    await fetchProfileAndData();
    await fetchEnquiries();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        name: customerName,
        phone,
        email,
        laptop_type: laptopType,
        budget,
        brand_preference: brandPref,
        ram,
        storage,
        processor,
        quantity,
        message: message.trim() || `Requirement for ${laptopType} within ${budget} (${brandPref}, ${ram}, ${storage})`,
      };

      const res = await safeJsonFetch("/api/laptop-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/customer/signin?next=${encodeURIComponent(next)}`);
        return;
      }
      if (!res.ok || !res.data?.success) {
        throw new Error(res.data?.message || res.error || "Failed to submit enquiry.");
      }

      setSuccessMsg("Your laptop requirement enquiry has been received! Our tech experts will contact you with matched options shortly.");
      setMessage("");
      await fetchEnquiries();
    } catch (err: any) {
      console.error("Laptop enquiry submission failed.", err);
      setErrorMsg(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0D0D0F] border border-[#E5E7EB] dark:border-[#27272A] p-6 sm:p-8 text-[#111827] dark:text-white shadow-xs">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#1E1638] border border-[#4F46E5]/20 dark:border-[#7C5CFF]/30 px-3 py-1 text-xs font-bold text-[#4F46E5] dark:text-[#7C5CFF]">
            <Laptop className="h-4 w-4" /> Personal Laptop Matchmaker
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Laptop &amp; Device Requirement Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-[#A1A1AA] max-w-2xl font-medium">
            Tell us your specs, budget, and preference. NexLapTech engineers will handpick the best refurbished or new laptop matching your exact workload.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requirement Form */}
        <div className="lg:col-span-2 rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="font-display text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-[#4F46E5] dark:text-[#7C5CFF]" />
            <span>Submit Laptop Specification</span>
          </h2>

          {successMsg && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Device Category</label>
                <select
                  value={laptopType}
                  onChange={(e) => setLaptopType(e.target.value)}
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="Business Laptop">Business Laptop (ThinkPad, Latitude)</option>
                  <option value="Gaming PC / Laptop">High Performance Gaming PC / Laptop</option>
                  <option value="Student Laptop">Budget Student Laptop</option>
                  <option value="MacBook / Apple">Apple MacBook (Air / Pro)</option>
                  <option value="Desktop Workstation">Custom Desktop Workstation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Target Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="₹15,000 – ₹25,000">₹15,000 – ₹25,000 (Entry Level)</option>
                  <option value="₹30,000 – ₹40,000">₹30,000 – ₹40,000 (Mid-Range Business)</option>
                  <option value="₹45,000 – ₹60,000">₹45,000 – ₹60,000 (High Performance)</option>
                  <option value="₹70,000+">₹70,000+ (Premium / Gaming Workstation)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Preferred Brand</label>
                <select
                  value={brandPref}
                  onChange={(e) => setBrandPref(e.target.value)}
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="Lenovo">Lenovo</option>
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
                  <option value="Apple">Apple</option>
                  <option value="ASUS / ROG">ASUS / ROG</option>
                  <option value="Any Trusted Brand">Any Trusted Brand</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">RAM &amp; Storage Specs</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-2.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                  >
                    <option value="8GB RAM">8GB RAM</option>
                    <option value="16GB RAM">16GB RAM</option>
                    <option value="32GB RAM">32GB RAM</option>
                  </select>
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-2.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                  >
                    <option value="256GB SSD">256GB SSD</option>
                    <option value="512GB SSD">512GB SSD</option>
                    <option value="1TB NVMe SSD">1TB NVMe SSD</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Specific Workload / Remarks</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention software you use (e.g. AutoCAD, VS Code, Premier Pro) or battery requirements..."
                className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary !px-6 !py-3 text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Requirement to Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Previous Enquiries History */}
        <div className="space-y-4">
          <h2 className="font-display text-base font-bold text-[#111827] dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#4F46E5] dark:text-[#7C5CFF]" />
            <span>My Enquiry History</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#667085] dark:text-[#A1A1AA]">
              Loading enquiries...
            </div>
          ) : enquiries.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 text-center text-xs text-[#667085] dark:text-[#A1A1AA] space-y-2">
              <Laptop className="h-8 w-8 mx-auto text-[#98A2B3]" />
              <p className="font-bold">No previous enquiries submitted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="rounded-2xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-4 text-xs space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111827] dark:text-white">{enq.laptop_type || "Business Laptop"}</span>
                    <span className="rounded-full bg-[#EEF2FF] dark:bg-[#1E1638] text-[#4F46E5] dark:text-[#7C5CFF] border border-[#4F46E5]/20 px-2 py-0.5 text-[10px] font-bold">
                      {enq.status || "Received"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#667085] dark:text-[#A1A1AA] line-clamp-2">{enq.message}</p>

                  <div className="text-[10px] text-[#98A2B3] flex items-center justify-between border-t border-[#E5E7EB] dark:border-[#27272A] pt-2">
                    <span>Budget: {enq.budget}</span>
                    <span>{new Date(enq.created_at || Date.now()).toLocaleDateString("en-IN")}</span>
                  </div>

                  {enq.admin_notes && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                      <span className="font-bold block">Admin Suggestion:</span>
                      <p>{enq.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
