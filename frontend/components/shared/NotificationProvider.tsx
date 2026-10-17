"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Calendar, 
  Star, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  ShoppingBag, 
  Wrench, 
  Users, 
  X,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Boxes,
} from "lucide-react";
import { realtimeSync } from "@/lib/realtimeSync";
import { useNotificationStore } from "@/lib/notificationStore";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  actionText?: string;
  audience?: "admin" | "customer" | "reseller";
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  booking: { 
    icon: <Wrench className="h-5 w-5 text-sky-600 dark:text-sky-400" />, 
    color: "border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300", 
    bgColor: "bg-sky-50 dark:bg-sky-950/60" 
  },
  order: { 
    icon: <Boxes className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, 
    color: "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300", 
    bgColor: "bg-emerald-50 dark:bg-emerald-950/60" 
  },
  review: { 
    icon: <Star className="h-5 w-5 text-amber-500 fill-amber-500" />, 
    color: "border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300", 
    bgColor: "bg-amber-50 dark:bg-amber-950/60" 
  },
  contact: { 
    icon: <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />, 
    color: "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300", 
    bgColor: "bg-blue-50 dark:bg-blue-950/60" 
  },
  message: { 
    icon: <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />, 
    color: "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300", 
    bgColor: "bg-blue-50 dark:bg-blue-950/60" 
  },
  laptop_enquiry: { 
    icon: <Laptop className="h-5 w-5 text-purple-600 dark:text-purple-400" />, 
    color: "border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300", 
    bgColor: "bg-purple-50 dark:bg-purple-950/60" 
  },
  internship: { 
    icon: <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />, 
    color: "border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300", 
    bgColor: "bg-purple-50 dark:bg-purple-950/60" 
  },
  training: { 
    icon: <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" />, 
    color: "border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300", 
    bgColor: "bg-teal-50 dark:bg-teal-950/60" 
  },
  offer: { 
    icon: <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />, 
    color: "border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300", 
    bgColor: "bg-amber-50 dark:bg-amber-950/60" 
  },
  default: { 
    icon: <Bell className="h-5 w-5 text-sky-600 dark:text-sky-400" />, 
    color: "border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300", 
    bgColor: "bg-sky-50 dark:bg-sky-950/60" 
  },
};

const NotificationContext = createContext<any>(null);

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname() || "";
  const isAdminRoute = pathname.startsWith("/admin");
  const isResellerRoute = pathname.startsWith("/reseller");

  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const processedEventKeys = useRef(new Set<string>());

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.3);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.4);
      }, 100);
    } catch (e) {
      // ignore browser audio context restrictions
    }
  };

  const showToast = (
    title: string,
    message: string,
    type: string = "default",
    actionUrl?: string,
    actionText?: string,
    audience: "admin" | "customer" | "reseller" = "customer"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Max visible toast stack size: 3 (Requirement #29)
    setToasts((prev) => {
      const nextStack = [...prev, { id, title, message, type, actionUrl, actionText, audience }];
      return nextStack.slice(-3);
    });

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    // Fetch notifications store for active role
    fetchNotifications();

    // Init realtime sync
    realtimeSync.init();

    const handleRealtimeEvent = (e: any) => {
      const { table, eventType, new: newRecord } = e.detail || {};

      if (!table || table === "activity_logs" || table === "customers") {
        return;
      }

      const recordId = newRecord?.id || newRecord?.bookingId || newRecord?.created_at || Math.random();
      const dedupeKey = `${table}-${eventType}-${recordId}`;
      if (processedEventKeys.current.has(dedupeKey)) {
        return;
      }
      processedEventKeys.current.add(dedupeKey);
      setTimeout(() => {
        processedEventKeys.current.delete(dedupeKey);
      }, 10000);

      if (table === "notifications") {
        addNotification(newRecord);
        fetchNotifications();

        if (newRecord?.title && newRecord?.message) {
          const recipientRole = newRecord.recipient_role;
          const currentRole = isAdminRoute ? "admin" : isResellerRoute ? "reseller" : "customer";
          
          if (!recipientRole || recipientRole === currentRole) {
            // Build deep-link action URL based on reference type and role
            let actionUrl: string | undefined;
            const refId = newRecord.reference_id || newRecord.referenceId || "";

            if (currentRole === "admin") {
              if (newRecord.reference_type === "laptop_enquiry" || newRecord.type === "laptop_enquiry") {
                actionUrl = `/admin/laptop-enquiries?id=${refId}`;
              } else if (newRecord.reference_type === "message" || newRecord.type === "message") {
                actionUrl = `/admin/contacts${refId ? `?id=${refId}` : ""}`;
              } else if (newRecord.reference_type === "order" || newRecord.type === "order") {
                actionUrl = `/admin/orders${refId ? `?id=${refId}` : ""}`;
              } else if (newRecord.reference_type === "booking" || newRecord.type === "booking") {
                actionUrl = `/admin/bookings${refId ? `?id=${refId}` : ""}`;
              } else if (newRecord.reference_type === "offer" || newRecord.type === "offer") {
                actionUrl = "/admin/offers";
              } else {
                actionUrl = "/admin/notifications";
              }
            } else {
              if (newRecord.reference_type === "order" || newRecord.type === "order") {
                actionUrl = "/customer/orders";
              } else if (newRecord.reference_type === "booking" || newRecord.type === "booking") {
                actionUrl = "/customer/requests";
              } else if (newRecord.reference_type === "offer" || newRecord.type === "offer") {
                actionUrl = "/customer/offers";
              } else if (newRecord.reference_type === "message" || newRecord.type === "message") {
                actionUrl = "/customer/messages";
              } else {
                actionUrl = "/customer/notifications";
              }
            }

            showToast(
              newRecord.title,
              newRecord.message,
              newRecord.type || "default",
              actionUrl,
              "View",
              currentRole as any
            );
            playNotificationSound();
          }
        }
        return;
      }

      if (eventType === "INSERT") {
        if (isAdminRoute) {
          let title = "";
          let message = "";
          let toastType = "default";
          let actionUrl = "/admin";

          const newId = newRecord?.id || newRecord?.reference_id || "";

          if (table === "bookings") {
            title = "New Booking Received 📅";
            message = `${newRecord.customerName || "A customer"} booked ${newRecord.productName || "a service"}`;
            toastType = "booking";
            actionUrl = `/admin/bookings${newId ? `?id=${newId}` : ""}`;
          } else if (table === "laptop_enquiries") {
            title = "💻 New Laptop Enquiry";
            message = `${newRecord.customer_name || "Customer"} submitted a laptop requirement. Budget: ${newRecord.budget || "Unspecified"}. Ref: ${newRecord.reference_id || newRecord.id}`;
            toastType = "laptop_enquiry";
            actionUrl = `/admin/laptop-enquiries?id=${newRecord.reference_id || newRecord.id}`;
          } else if (table === "contacts" || table === "messages") {
            title = "💬 New Customer Message";
            message = `${newRecord.name || newRecord.customer_name || "Customer"}: ${(newRecord.message || newRecord.subject || "Enquiry").substring(0, 60)}`;
            toastType = "contact";
            actionUrl = table === "messages" ? `/admin/contacts${newId ? `?id=${newId}` : ""}` : "/admin/contacts";
          } else if (table === "reviews") {
            title = "New Review Submitted ⭐";
            message = `${newRecord.customer_name || "Customer"} rated ${newRecord.rating} Stars`;
            toastType = "review";
            actionUrl = "/admin/reviews";
          } else {
            return;
          }

          showToast(title, message, toastType, actionUrl, "Open", "admin");
          playNotificationSound();
          fetchNotifications();
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("nexbyte-realtime", handleRealtimeEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("nexbyte-realtime", handleRealtimeEvent);
      }
    };
  }, [fetchNotifications, addNotification, isAdminRoute, isResellerRoute]);

  return (
    <NotificationContext.Provider value={{ showToast, playNotificationSound }}>
      {children}

      {/* Floating Toast Notification Container (Max stack 3, safe areas) */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.default;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border ${cfg.color} shadow-xl max-w-full`}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bgColor}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{toast.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
                  {toast.actionUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href={toast.actionUrl}
                        onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-600 hover:bg-sky-700 px-3 py-1 text-[10px] font-bold text-white shadow-sm transition-colors"
                      >
                        {toast.actionText || "View"} →
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0 self-start transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
