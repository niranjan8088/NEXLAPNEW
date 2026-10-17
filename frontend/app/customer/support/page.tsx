"use client";

import { useState } from "react";
import Link from "next/link";
import { Headphones, MessageSquare, Phone, Mail, MapPin, Send, CheckCircle2, HelpCircle, ChevronDown, RefreshCw } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Hardware Support");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await safeJsonFetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) throw new Error(res.data?.error || "Failed to submit support message.");

      setSuccessMsg("Support ticket created successfully! An Admin support agent will respond in your Message Center.");
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit support message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const FAQS = [
    {
      q: "How do I track my laptop repair booking status?",
      a: "Go to your Bookings tab in the Customer Portal. You will see real-time updates as your assigned technician diagnoses and completes your service."
    },
    {
      q: "What is covered under the NexLapTech E-Warranty?",
      a: "Our E-Warranty covers hardware failures, motherboard faults, RAM/SSD issues, and keyboard defects. You can view full terms on the E-Warranty page."
    },
    {
      q: "How can I apply a promo code or referral discount?",
      a: "Enter your promo code (e.g. NEX10) in the Cart Drawer before placing your order. The discount is automatically calculated on eligible items."
    },
    {
      q: "How do I verify my training certificate?",
      a: "Navigate to the Certificates tab and click 'Verify Certificate', or visit /verify?regid=YOUR_REG_ID."
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0D0D0F] border border-[#E5E7EB] dark:border-[#27272A] p-6 sm:p-8 text-[#111827] dark:text-white shadow-xs">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#1E1638] border border-[#4F46E5]/20 dark:border-[#7C5CFF]/30 px-3 py-1 text-xs font-bold text-[#4F46E5] dark:text-[#7C5CFF]">
            <Headphones className="h-4 w-4" /> 24/7 Customer Help Desk
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Customer Support &amp; Contact Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-[#A1A1AA] max-w-2xl font-medium">
            Need help with an order, repair booking, or warranty claim? Reach our expert technicians and customer care team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Ticket Form */}
        <div className="lg:col-span-2 rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="font-display text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#4F46E5] dark:text-[#7C5CFF]" />
            <span>Submit a Support Ticket</span>
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
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Hardware Support">Hardware Support &amp; Repair Query</option>
                <option value="Order Tracking">Order &amp; Delivery Tracking</option>
                <option value="Warranty Claim">E-Warranty &amp; RMA Claim</option>
                <option value="Billing & Invoice">Billing &amp; Invoice Request</option>
                <option value="Training & Internship">Training &amp; Academy Support</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Message Details *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or request in detail..."
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
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message to Support</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info & FAQs */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-[#111827] dark:text-white">
              Direct Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1638] text-[#4F46E5] dark:text-[#7C5CFF]">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] dark:text-[#A1A1AA] block">Helpline &amp; WhatsApp</span>
                  <span className="font-bold text-[#111827] dark:text-white">+91 8088979706</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1638] text-[#4F46E5] dark:text-[#7C5CFF]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] dark:text-[#A1A1AA] block">Support Email</span>
                  <span className="font-bold text-[#111827] dark:text-white">info@nexbytetechnologies.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1638] text-[#4F46E5] dark:text-[#7C5CFF]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] dark:text-[#A1A1AA] block">Branch Address</span>
                  <span className="font-bold text-[#111827] dark:text-white">Uttarahalli Main Rd, Bengaluru 560070</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 shadow-xs space-y-3">
            <h3 className="font-display text-base font-bold text-[#111827] dark:text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#4F46E5] dark:text-[#7C5CFF]" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-2">
              {FAQS.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="rounded-2xl border border-[#E5E7EB] dark:border-[#27272A] overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-3 text-left text-xs font-bold text-[#111827] dark:text-white flex items-center justify-between gap-2 hover:bg-[#F7F8FC] dark:hover:bg-[#151518]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-[#98A2B3] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="p-3 pt-0 text-[11px] text-[#667085] dark:text-[#A1A1AA] leading-relaxed border-t border-[#E5E7EB] dark:border-[#27272A] bg-[#F7F8FC] dark:bg-[#111113]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
