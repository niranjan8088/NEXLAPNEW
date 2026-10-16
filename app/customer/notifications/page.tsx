"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, ShieldAlert, Package, Tag, Wrench } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "notif-1",
      title: "Welcome to Nex LapTech Customer Portal",
      message: "Track repair bookings, browse genuine PC hardware, and enjoy instant technician support.",
      time: "Just now",
      type: "system",
      read: false,
    },
    {
      id: "notif-2",
      title: "10% OFF Accessories Offer Available",
      message: "Use code NEX10 at checkout for flat 10% off computer accessories.",
      time: "2 hours ago",
      type: "offer",
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Bell className="h-3.5 w-3.5 text-amber-500" /> Account Alerts &amp; Updates
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Real-time updates regarding order status changes, repair completion alerts, and promotional offers.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 divide-y divide-[#E6EAF0] dark:divide-white/5 shadow-sm overflow-hidden">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 flex items-start gap-4 transition-colors ${
              !n.read ? "bg-sky-50/40 dark:bg-sky-950/20" : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600 shrink-0">
              {n.type === "offer" ? <Tag className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
