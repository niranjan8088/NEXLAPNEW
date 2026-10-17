"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Wrench,
  Package,
  MessageSquare,
  Tag,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Clock,
  Check,
  Laptop,
} from "lucide-react";
import { useNotificationStore } from "@/lib/notificationStore";

interface QuickNotificationsPopoverProps {
  role?: "customer" | "reseller" | "admin";
}

const TYPE_ICONS: Record<string, any> = {
  order: Package,
  booking: Wrench,
  service: Wrench,
  message: MessageSquare,
  contact: MessageSquare,
  offer: Tag,
  laptop_enquiry: Laptop,
  internship: CheckCircle2,
  training: CheckCircle2,
  default: Bell,
};

export default function QuickNotificationsPopover({ role = "customer" }: QuickNotificationsPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: any) => {
    await markAsRead(n.id);
    setOpen(false);

    const refId = n.reference_id || n.referenceId || "";

    // Route directly to exact relevant resource with deep link support (Req #10, #20, #48)
    if (n.reference_type === "laptop_enquiry" || n.type === "laptop_enquiry") {
      router.push(role === "admin" ? `/admin/laptop-enquiries?id=${refId}` : `/customer/requests`);
    } else if (n.reference_type === "message" || n.type === "message") {
      router.push(role === "admin" ? `/admin/contacts?id=${refId}` : role === "reseller" ? "/reseller/messages" : "/customer/messages");
    } else if (n.reference_type === "offer" || n.type === "offer") {
      router.push(role === "admin" ? "/admin/offers" : "/customer/offers");
    } else if (n.reference_type === "order" || n.type === "order") {
      router.push(role === "admin" ? `/admin/orders?id=${refId}` : role === "reseller" ? "/reseller/orders" : `/customer/orders`);
    } else if (n.reference_type === "booking" || n.reference_type === "service" || n.type === "service") {
      router.push(role === "admin" ? `/admin/bookings?id=${refId}` : "/customer/requests");
    } else {
      router.push(role === "admin" ? "/admin/notifications" : role === "reseller" ? "/reseller/notifications" : "/customer/notifications");
    }
  };

  const getTargetUrl = () => {
    if (role === "admin") return "/admin/notifications";
    if (role === "reseller") return "/reseller/notifications";
    return "/customer/notifications";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Quick Notifications"
        className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown (Requirement #20) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-0 shadow-2xl z-50 overflow-hidden"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6EAF0] dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600" />
                <h3 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#E6EAF0] dark:divide-white/5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <Bell className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No notifications yet</p>
                  <p className="text-[11px]">Updates regarding your orders &amp; requests will appear here.</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((n: any) => {
                  const IconComp = TYPE_ICONS[n.type] || TYPE_ICONS[n.reference_type] || TYPE_ICONS.default;
                  const isUnread = n.status === "unread" || !n.is_read;

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        isUnread
                          ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isUnread ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                        <IconComp className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs truncate ${isUnread ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                            {n.title}
                          </h4>
                          {isUnread && <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 ml-2" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          {new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Popover Footer */}
            <div className="p-2.5 border-t border-[#E6EAF0] dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 text-center">
              <Link
                href={getTargetUrl()}
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View all notifications</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
