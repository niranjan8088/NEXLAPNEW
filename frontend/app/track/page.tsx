"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Loader2, Calendar, ClipboardCheck, Laptop, CheckCircle2, Send, ShoppingBag, GraduationCap, Award, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { dbHelper } from "@/lib/dbHelper";
import { safeJsonFetch } from "@/lib/apiHelper";
import { getSafeImageSrc } from "@/lib/utils";

const STATUS_STEPS = ["pending", "approved", "contacted", "in_progress", "completed"];
const LAPTOP_STEPS = ["new", "reviewing", "contacted", "recommendation_sent", "converted"];
const INTERNSHIP_STEPS = ["pending", "under_review", "approved", "in_progress", "completed"];

export default function TrackPage() {
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<{
    bookings: any[];
    enrollments: any[];
    laptopEnquiries: any[];
    internships: any[];
  }>({
    bookings: [],
    enrollments: [],
    laptopEnquiries: [],
    internships: [],
  });
  const [chatReplies, setChatReplies] = useState<Record<string, string>>({});
  const [infoReplyText, setInfoReplyText] = useState<Record<string, string>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const handleSearchQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    try {
      const res = await safeJsonFetch(`/api/track?search=${encodeURIComponent(queryText.trim())}`);
      if (res.ok && res.data?.success) {
        setResults({
          bookings: res.data.results.bookings || [],
          enrollments: res.data.results.enrollments || [],
          laptopEnquiries: res.data.results.laptopEnquiries || [],
          internships: res.data.results.internships || [],
        });
      } else {
        alert(res.error || "Search failed.");
      }
    } catch {
      alert("Error tracking request.");
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSearchQuery(searchVal);
  };

  // URL Query auto-search parameter parsing on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get("search") || urlParams.get("ref");
      if (urlSearch) {
        setSearchVal(urlSearch);
        handleSearchQuery(urlSearch);
      }
    }
  }, []);

  // Listen to realtime events and trigger automatic reload
  useEffect(() => {
    const handleRealtime = () => {
      if (hasSearched && searchVal.trim()) {
        handleSearchQuery(searchVal);
      }
    };
    window.addEventListener("nexbyte-realtime", handleRealtime);
    return () => window.removeEventListener("nexbyte-realtime", handleRealtime);
  }, [hasSearched, searchVal]);

  const handleSendCustomerChat = async (bookingId: string, text: string) => {
    if (!text.trim()) return;
    try {
      const target = results.bookings.find((b) => b.id === bookingId);
      if (!target) return;
      const now = new Date().toISOString();
      const chatItem = {
        type: "chat",
        sender: "customer",
        message: text.trim(),
        timestamp: now
      };
      await dbHelper.bookings.update(bookingId, {
        timeline: [...(target.timeline || []), chatItem]
      });
      setChatReplies((prev) => ({ ...prev, [bookingId]: "" }));
      handleSearchQuery(searchVal);
    } catch {
      alert("Failed to send message.");
    }
  };

  const handleSendInfoResponse = async (internshipId: string, text: string) => {
    if (!text.trim()) return;
    try {
      await dbHelper.internships.update(internshipId, {
        customer_reply: text.trim(),
        status: "under_review",
        info_request_text: ""
      });
      setInfoReplyText((prev) => ({ ...prev, [internshipId]: "" }));
      handleSearchQuery(searchVal);
      alert("Your response has been sent to the NexLapTech team.");
    } catch {
      alert("Failed to send response.");
    }
  };

  const handleCustomerDocUpload = async (internshipId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size allowed is 5 MB.");
      return;
    }
    setUploadingDocId(internshipId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await safeJsonFetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || "Failed to upload document.");
      }

      const target = results.internships.find((i) => i.id === internshipId);
      const existingDocs = target?.documents || [];
      const newDoc = {
        name: file.name,
        url: res.data.fileUrl || res.data.path || "",
        file_type: file.type,
      };

      await dbHelper.internships.update(internshipId, {
        documents: [...existingDocs, newDoc],
        status: "under_review",
      });

      handleSearchQuery(searchVal);
      alert("Document uploaded successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to upload document.");
    } finally {
      setUploadingDocId(null);
    }
  };

  const renderTimeline = (currentStatus: string, steps = STATUS_STEPS) => {
    const activeIndex = steps.indexOf(currentStatus?.toLowerCase() || "pending");
    const safeIndex = activeIndex >= 0 ? activeIndex : 0;

    return (
      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
        <div className="absolute left-4 top-4 bottom-4 w-0.5 md:left-6 md:right-6 md:top-1/2 md:h-0.5 md:w-auto bg-white/10 -z-10" />
        
        {steps.map((step, idx) => {
          const isDone = idx <= safeIndex;
          const isCurrent = idx === safeIndex;

          return (
            <div key={step} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 z-10 w-full">
              <div 
                className={`h-8 w-8 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
                  isDone 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                    : "bg-nex-ink border-white/10 text-white/40"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6" /> : <span className="text-xs font-bold">{idx + 1}</span>}
              </div>
              <div className="text-left md:text-center">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDone ? "text-cyan-400" : "text-white/40"}`}>
                  {step.replace("_", " ")}
                </span>
                {isCurrent && (
                  <span className="inline-block text-[8px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-black uppercase mt-1 animate-pulse">
                    Current Phase
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-aurora pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-anim opacity-20 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-glow-blue" />
              Realtime Tracking Console
            </span>
            <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
              Track My <span className="text-gradient-blue">Request.</span>
            </h1>
            <p className="mt-3 text-xs text-nex-mist leading-relaxed">
              Enter your Phone Number, Application ID (`INT-2026-000001`), Enrollment ID (`ENR-2026-000001`), or Reference ID to view realtime status &amp; progress.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="glass-rog p-6 border border-cyan-500/20 shadow-glow-blue max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40" />
                <input
                  type="text"
                  required
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Enter Phone Number, INT-2026-..., ENR-2026-..."
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary !rounded-2xl !py-3.5 !px-8 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Status"}
              </button>
            </form>
          </div>

          {/* Results display */}
          <div className="space-y-8 max-w-3xl mx-auto">
            {loading && !hasSearched && (
              <div className="text-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs text-nex-mist mt-3">Searching database records...</p>
              </div>
            )}

            {hasSearched &&
              results.bookings.length === 0 &&
              results.enrollments.length === 0 &&
              (results.laptopEnquiries || []).length === 0 &&
              (results.internships || []).length === 0 && (
                <div className="text-center py-16 glass-rog border-red-500/20 rounded-3xl p-8">
                  <span className="text-3xl block mb-3">❌</span>
                  <h3 className="font-display text-base font-bold text-white">No active records found</h3>
                  <p className="text-xs text-nex-mist mt-1 max-w-sm mx-auto">
                    Double check your Application ID (e.g. `INT-2026-000001`) or search by your primary Phone number used during submission.
                  </p>
                </div>
              )}

            {hasSearched && (
              <div className="space-y-6">

                {/* Internship Applications Results */}
                {results.internships && results.internships.map((intern) => (
                  <motion.div
                    key={intern.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-rog p-6 border-cyan-500/20 shadow-glow-blue relative overflow-hidden space-y-6"
                  >
                    <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none transform translate-x-4 -translate-y-4">
                      <GraduationCap size={140} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Academic Internship &amp; Project Portal</span>
                        <h3 className="font-display text-base font-bold text-white mt-0.5">{intern.domain}</h3>
                        <p className="text-xs text-nex-mist">{intern.college} ({intern.branch})</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-nex-mist uppercase block">Application ID</span>
                        <span className="font-mono text-sm font-bold text-white">{intern.application_id || intern.id}</span>
                        {intern.enrollment_id && (
                          <div className="font-mono text-xs font-bold text-green-400 mt-0.5">ENR: {intern.enrollment_id}</div>
                        )}
                      </div>
                    </div>

                    {renderTimeline(intern.status, INTERNSHIP_STEPS)}

                    <div className="border-t border-white/5 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Student Name</span>
                        <span className="font-medium text-white block mt-0.5">{intern.full_name || intern.student_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Duration &amp; Mode</span>
                        <span className="font-medium text-white block mt-0.5">{intern.duration} ({intern.internship_type})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Assigned Mentor</span>
                        <span className="font-medium text-cyan-300 block mt-0.5">{intern.mentor || "Assigning expert"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Batch</span>
                        <span className="font-medium text-white block mt-0.5">{intern.batch || "Upcoming Batch"}</span>
                      </div>
                    </div>

                    {/* Progress Bar & Tasks Checklist (If enrolled / in_progress / completed) */}
                    {(intern.status === "approved" || intern.status === "enrolled" || intern.status === "in_progress" || intern.status === "completed") && (
                      <div className="border-t border-white/5 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider">Overall Internship Progress</span>
                          <span className="text-xs font-bold text-cyan-400">{intern.progress || 0}% Completed</span>
                        </div>
                        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-green-400 transition-all duration-500"
                            style={{ width: `${intern.progress || 0}%` }}
                          />
                        </div>

                        {intern.tasks && intern.tasks.length > 0 && (
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[10px] text-nex-mist uppercase font-semibold block">Curriculum Tasks Checklist</span>
                            {intern.tasks.map((t: any) => (
                              <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${t.status === "completed" ? "bg-green-500/20 border-green-400 text-green-400" : "border-white/20"}`}>
                                    {t.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                                  </div>
                                  <span className={t.status === "completed" ? "line-through text-white/40" : "text-white"}>{t.title}</span>
                                </div>
                                <span className="text-[9px] uppercase font-bold text-cyan-400">{t.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Required: Information Request */}
                    {intern.status === "more_info_required" && (
                      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                        <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                          <span>Action Required from Student</span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">{intern.info_request_text || intern.customer_reply}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <input
                            type="text"
                            value={infoReplyText[intern.id] || ""}
                            onChange={(e) => setInfoReplyText((prev) => ({ ...prev, [intern.id]: e.target.value }))}
                            placeholder="Type your response to NexLapTech team..."
                            className="flex-1 bg-nex-ink border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleSendInfoResponse(intern.id, infoReplyText[intern.id] || "")}
                            className="btn-primary !py-2 !px-4 text-xs shrink-0"
                          >
                            Send Response
                          </button>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <label className="btn-secondary !py-1.5 !px-3 text-[11px] flex items-center gap-1.5 cursor-pointer">
                            <Upload className="h-3.5 w-3.5" />
                            <span>{uploadingDocId === intern.id ? "Uploading..." : "Upload Requested Document"}</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleCustomerDocUpload(intern.id, f);
                              }}
                              className="hidden"
                              disabled={uploadingDocId === intern.id}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Rejection Message Card */}
                    {intern.status === "rejected" && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-white space-y-1">
                        <span className="font-bold text-red-400 block">Application Status: Rejected</span>
                        <p className="leading-relaxed text-white/90">{intern.customer_reply || intern.rejection_reason || "Application could not be approved at this time."}</p>
                      </div>
                    )}

                    {/* Customer-Facing Reply Message */}
                    {intern.customer_reply && intern.status !== "more_info_required" && intern.status !== "rejected" && (
                      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-white space-y-1">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase block">Message from NEXLAPTECH Team:</span>
                        <p className="leading-relaxed">{intern.customer_reply}</p>
                      </div>
                    )}

                    {/* Certificate Badge & Link */}
                    {intern.certificate_id && (
                      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-teal-400 shrink-0" />
                          <div>
                            <h4 className="font-bold text-white text-xs">Official NEXLAPTECH Completion Certificate Issued</h4>
                            <p className="text-[10px] text-teal-300 font-mono mt-0.5">Registration ID: {intern.certificate_id}</p>
                          </div>
                        </div>
                        <a
                          href={`/verify?regid=${encodeURIComponent(intern.certificate_id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary !py-2 !px-4 text-xs bg-teal-600 hover:bg-teal-500 border-none shrink-0"
                        >
                          Verify Certificate
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Laptop Enquiries Results */}
                {results.laptopEnquiries && results.laptopEnquiries.map((enquiry) => (
                  <motion.div
                    key={enquiry.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-rog p-6 border-cyan-500/20 shadow-glow-blue relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none transform translate-x-4 -translate-y-4">
                      <Laptop size={120} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Laptop Requirement Portal</span>
                        <h3 className="font-display text-base font-bold text-white mt-0.5">{enquiry.laptop_type}</h3>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-nex-mist uppercase block">Reference ID</span>
                        <span className="font-mono text-sm font-bold text-white">{enquiry.reference_id || enquiry.id}</span>
                      </div>
                    </div>

                    {renderTimeline(enquiry.status, LAPTOP_STEPS)}

                    <div className="mt-8 border-t border-white/5 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Customer Name</span>
                        <span className="font-medium text-white block mt-0.5">{enquiry.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Target Budget Range</span>
                        <span className="font-medium text-amber-300 block mt-0.5">{enquiry.budget}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Preferred Contact</span>
                        <span className="font-medium text-white block mt-0.5">{enquiry.preferred_contact || "WhatsApp"}</span>
                      </div>
                    </div>

                    {/* Customer Facing Reply Message */}
                    {enquiry.customer_reply && (
                      <div className="mt-6 border-t border-white/5 pt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-white">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">Message from NEXLAPTECH Team:</span>
                        <p className="leading-relaxed">{enquiry.customer_reply}</p>
                      </div>
                    )}

                    {/* Recommended Products */}
                    {enquiry.recommended_products && enquiry.recommended_products.length > 0 && (
                      <div className="mt-6 border-t border-white/5 pt-4 space-y-3">
                        <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider block">Recommended Laptops by NEXLAPTECH</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {enquiry.recommended_products.map((prod: any) => (
                            <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/5 p-1 flex items-center justify-center shrink-0 border border-white/5">
                                  <img src={getSafeImageSrc(prod.image)} alt={prod.title} className="object-contain max-h-full max-w-full" />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs truncate max-w-[140px]">{prod.title}</div>
                                  <div className="text-[11px] text-cyan-400 font-semibold mt-0.5">Rs. {(prod.price ?? 0).toLocaleString("en-IN")}</div>
                                </div>
                              </div>
                              <Link
                                href="/products"
                                className="btn-primary !py-1.5 !px-3 text-[10px] shrink-0 flex items-center gap-1"
                              >
                                <ShoppingBag className="h-3 w-3" /> Book
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Bookings Results */}
                {results.bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-rog p-6 border-cyan-500/20 shadow-glow-blue relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none transform translate-x-4 -translate-y-4">
                      <Calendar size={120} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Service Booking Portal</span>
                        <h3 className="font-display text-base font-bold text-white mt-0.5">{booking.productName}</h3>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-nex-mist uppercase block">Booking ID</span>
                        <span className="font-mono text-sm font-bold text-white">{booking.bookingId}</span>
                      </div>
                    </div>

                    {renderTimeline(booking.status, STATUS_STEPS)}

                    <div className="mt-8 border-t border-white/5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Technician Assigned</span>
                        <span className="font-medium text-white block mt-0.5">{booking.technician || "Assigning expert shortly"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Preferred Appointment Date</span>
                        <span className="font-medium text-white block mt-0.5">
                          {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString("en-IN") : "Flexible Schedule"}
                        </span>
                      </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="mt-6 border-t border-white/5 pt-5 space-y-4">
                      <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider block">Live Chat Discussion</span>
                      <div className="max-h-[220px] overflow-y-auto space-y-2.5 bg-white/[0.01] border border-white/5 rounded-2xl p-4 scrollbar-thin">
                        {!(booking.timeline || []).some((t: any) => t.type === "chat") ? (
                          <p className="text-center text-[10px] text-nex-mist italic py-6">
                            No messages in this chat yet. Send a message to start discussion.
                          </p>
                        ) : (
                          (booking.timeline || [])
                            .filter((t: any) => t.type === "chat")
                            .map((msg: any, idx: number) => {
                              const isSelf = msg.sender === "customer";
                              return (
                                <div key={idx} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                                  <div className={`max-w-[80%] rounded-xl p-2.5 text-xs ${
                                    isSelf 
                                      ? "bg-cyan-600 text-white rounded-tr-none" 
                                      : "bg-white/5 text-white/95 rounded-tl-none border border-white/10"
                                  }`}>
                                    <p>{msg.message}</p>
                                  </div>
                                  <span className="text-[8px] text-nex-mist mt-0.5 px-1 block">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              );
                            })
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatReplies[booking.id] || ""}
                          onChange={(e) => setChatReplies((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                          onClick={() => handleSendCustomerChat(booking.id, chatReplies[booking.id] || "")}
                          className="btn-primary !p-2 bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
