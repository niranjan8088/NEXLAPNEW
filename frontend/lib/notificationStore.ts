import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: "read" | "unread";
  created_at: string;
}

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  setUnreadCount: (count: number) => void;
  setNotifications: (notifications: Notification[]) => void;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => n.status === "unread").length,
    }),
  fetchNotifications: async () => {
    try {
      // Fetch from API (server-side source of truth) instead of client-side dbHelper
      const res = await fetch("/api/notifications", {
        headers: { "Accept": "application/json" },
      });
      const text = await res.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        console.error("[NotificationStore] Non-JSON response from /api/notifications");
        return;
      }
      if (res.ok && parsed.success && Array.isArray(parsed.notifications)) {
        const list = parsed.notifications;
        set({
          notifications: list,
          unreadCount: list.filter((n: any) => n.status === "unread").length,
        });
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  },
  addNotification: (notification) => {
    const { notifications } = get();
    // Avoid duplicates if realtime and custom event fire for the same event
    if (notifications.some((n) => n.id === notification.id)) return;
    
    const updatedList = [notification, ...notifications];
    set({
      notifications: updatedList,
      unreadCount: updatedList.filter((n) => n.status === "unread").length,
    });
  },
  markAllAsRead: async () => {
    try {
      // Use API for server-side persistence
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      const updatedList = get().notifications.map((n) => ({
        ...n,
        status: "read" as const,
      }));
      set({
        notifications: updatedList,
        unreadCount: 0,
      });
      // Trigger a realtime event so other parts of the UI know data changed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
      }
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  },
  markAsRead: async (id) => {
    try {
      // Use API for server-side persistence
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", id }),
      });
      const updatedList = get().notifications.map((n) =>
        n.id === id ? { ...n, status: "read" as const } : n
      );
      set({
        notifications: updatedList,
        unreadCount: updatedList.filter((n) => n.status === "unread").length,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
      }
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  },
}));
