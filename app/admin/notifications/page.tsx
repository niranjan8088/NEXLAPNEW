"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Calendar, MessageSquare, Laptop, Mail, GraduationCap, BookOpen, Star, Trash2 } from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { useRouter } from "next/navigation";

import { Building2 } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; route: string }> = {
  booking: { icon: <Calendar className="h-4 w-4" />, color: "text-nex-blueLight bg-nex-blue/10 border-nex-blue/20", route: "/admin/bookings" },
  review: { icon: <Star className="h-4 w-4" />, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", route: "/admin/reviews" },
  contact: { icon: <Mail className="h-4 w-4" />, color: "text-green-400 bg-green-500/10 border-green-500/20", route: "/admin/contacts" },
  message: { icon: <MessageSquare className="h-4 w-4" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", route: "/admin/contacts" },
  laptop_enquiry: { icon: <Laptop className="h-4 w-4" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", route: "/admin/laptop-enquiries" },
  internship: { icon: <GraduationCap className="h-4 w-4" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", route: "/admin/internships" },
  training: { icon: <BookOpen className="h-4 w-4" />, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", route: "/admin/training" },
  reseller_application: { icon: <Building2 className="h-4 w-4" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", route: "/admin/resellers" },
  reseller_registration: { icon: <Building2 className="h-4 w-4" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", route: "/admin/resellers" },
  reseller_status: { icon: <Building2 className="h-4 w-4" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", route: "/admin/resellers" },
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const load = async () => {
    const list = await dbHelper.notifications.list();
    setNotifications(list);
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const handleMarkAllRead = async () => {
    await dbHelper.notifications.markAllRead();
    load();
  };

  const handleClick = async (n: any) => {
    await dbHelper.notifications.markRead(n.id);
    const refId = n.reference_id || n.referenceId || "";
    const cfg = TYPE_CONFIG[n.type];

    // Use reference_id for deep linking to exact record
    if (n.type === "laptop_enquiry" || n.reference_type === "laptop_enquiry") {
      router.push(`/admin/laptop-enquiries?id=${refId}`);
    } else if (n.type === "message" || n.reference_type === "message") {
      router.push(`/admin/contacts${refId ? `?id=${refId}` : ""}`);
    } else if (n.type === "order" || n.reference_type === "order") {
      router.push(`/admin/orders${refId ? `?id=${refId}` : ""}`);
    } else if (n.type === "booking" || n.reference_type === "booking") {
      router.push(`/admin/bookings${refId ? `?id=${refId}` : ""}`);
    } else if (cfg?.route) {
      router.push(refId ? `${cfg.route}?id=${refId}` : cfg.route);
    } else {
      router.push("/admin/notifications");
    }
    load();
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return n.status === "unread";
    return n.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-nex-blueLight" /> Notification Center
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All notifications read"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary !py-2 !px-4 text-xs">
            <CheckCircle className="h-4 w-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "reseller_application", label: "Resellers" },
          { key: "booking", label: "Bookings" },
          { key: "review", label: "Reviews" },
          { key: "contact", label: "Contacts" },
          { key: "laptop_enquiry", label: "Laptop" },
          { key: "internship", label: "Internships" },
          { key: "training", label: "Training" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
              filter === tab.key
                ? "bg-nex-blue text-white shadow-glow-blue"
                : "glass-panel bg-nex-ink border border-white/10 text-nex-mist hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
          <p className="text-xs text-white">No notifications match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.booking;
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`glass-panel p-4 rounded-2xl bg-nex-ink border cursor-pointer transition-all hover:border-nex-blue/30 ${
                  n.status === "unread" ? "border-nex-blue/20 bg-nex-blue/[0.03]" : "border-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-xs truncate">{n.title}</h4>
                      {n.status === "unread" && (
                        <span className="h-2 w-2 rounded-full bg-nex-blue shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-nex-mist mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[9px] text-white/30 mt-1 block">
                      {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border shrink-0 ${cfg.color}`}>
                    {n.type?.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
