"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Package, Clock, CheckCircle2, XCircle, ArrowRight, Plus, Wrench } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", icon: Package },
  pending: { label: "Pending", color: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", icon: CheckCircle2 },
  processing: { label: "Processing", color: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", icon: Wrench },
  in_progress: { label: "In Progress", color: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", icon: Wrench },
  completed: { label: "Completed", color: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", icon: XCircle },
};

export default function CustomerBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadBookings();
    const handler = () => loadBookings();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await safeJsonFetch("/api/customer/bookings");
      if (res.ok && res.data?.bookings) {
        // Sort by newest first
        const sorted = [...res.data.bookings].sort(
          (a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
        );
        setBookings(sorted);
      }
    } catch (e) {
      console.error("Bookings load error", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const statusCounts = {
    all: bookings.length,
    new: bookings.filter((b) => b.status === "new").length,
    accepted: bookings.filter((b) => b.status === "accepted" || b.status === "processing" || b.status === "in_progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-extrabold text-[#111827] dark:text-[#F8FAFC]">My Bookings</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Track your service bookings and repair requests in real-time.
          </p>
        </div>
        <Link
          href="/customer/services"
          className="btn-primary inline-flex !px-4 !py-2.5"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "all", label: `All (${statusCounts.all})` },
          { id: "new", label: `New (${statusCounts.new})` },
          { id: "accepted", label: `Active (${statusCounts.accepted})` },
          { id: "completed", label: `Completed (${statusCounts.completed})` },
          { id: "cancelled", label: `Cancelled (${statusCounts.cancelled})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? "bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#080B12] shadow-sm"
                : "bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263247] text-[#64748B] dark:text-[#94A3B8] hover:border-[#2563EB]/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="horizon-card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-48 skeleton rounded" />
                <div className="h-5 w-20 skeleton rounded-full" />
              </div>
              <div className="h-3 w-64 skeleton rounded" />
              <div className="h-3 w-32 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="horizon-card p-10 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-[#EEF6FF] dark:bg-[#1a2744] flex items-center justify-center mx-auto">
            <Calendar className="h-7 w-7 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#111827] dark:text-[#F8FAFC]">No bookings found</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto mt-1">
              {filter === "all"
                ? "Book a service or repair request to get started."
                : `No ${filter} bookings at the moment.`}
            </p>
          </div>
          <Link href="/customer/services" className="btn-primary inline-flex !px-5 !py-2.5">
            <Calendar className="h-3.5 w-3.5" />
            Book a Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => {
            const statusKey = (booking.status || "new").toLowerCase().replace(/ /g, "_");
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.new;
            const StatusIcon = cfg.icon;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="horizon-card p-5 hover:border-[#2563EB]/30 dark:hover:border-[#60A5FA]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Booking ID + Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] bg-[#EEF6FF] dark:bg-[#1a2744] px-2 py-0.5 rounded-md">
                        {booking.bookingId || booking.booking_id || `#${booking.id?.slice(0, 8)}`}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Service Name */}
                    <h3 className="font-display text-sm font-bold text-[#111827] dark:text-[#F8FAFC] truncate">
                      {booking.productName || booking.service_name || booking.serviceName || "Service Booking"}
                    </h3>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span>📅 {booking.preferredDate || booking.booking_date || new Date(booking.createdAt || booking.created_at).toLocaleDateString("en-IN")}</span>
                      {booking.preferredTime && <span>🕐 {booking.preferredTime}</span>}
                      {booking.technician && <span>👨‍🔧 {booking.technician}</span>}
                    </div>

                    {/* Admin Reply / Notes */}
                    {booking.replyMessage && (
                      <div className="mt-2 p-3 rounded-xl bg-[#EEF6FF] dark:bg-[#1a2744] border border-[#2563EB]/20 dark:border-[#60A5FA]/20">
                        <p className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] mb-1">Nex LapTech Response:</p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{booking.replyMessage}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    <p className="text-[10px] text-[#94A3B8]">
                      {new Date(booking.createdAt || booking.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <Link
                      href="/customer/messages"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                    >
                      Contact Support <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
