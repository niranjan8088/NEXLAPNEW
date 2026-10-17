"use client";

import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

type RealtimeEvent = {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
};

type RealtimeCallback = (event: RealtimeEvent) => void;

const WATCHED_TABLES = [
  "bookings",
  "reviews",
  "contacts",
  "laptop_enquiries",
  "internships",
  "training",
  "notifications",
  "products",
  "services",
  "users",
  "certificates",
  "enrollments",
  "customers",
  "media",
];

class RealtimeSyncManager {
  private supabase: SupabaseClient | null = null;
  private channels: RealtimeChannel[] = [];
  private listeners: Map<string, Set<RealtimeCallback>> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private initialized = false;
  private eventSource: EventSource | null = null;
  private sseReconnectTimer: ReturnType<typeof setTimeout> | null = null;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      this.supabase = createClient(url, key);
      // Subscribe to Supabase Realtime as primary when configured
      this.subscribeToTables();
    }
    
    // ALWAYS start our custom pipelines to guarantee events 
    // are broadcasted from local dbHelper mutations and API routes.
    this.startPolling();
    this.connectSSE();
  }

  private subscribeToTables() {
    if (!this.supabase) return;

    WATCHED_TABLES.forEach((table) => {
      const channel = this.supabase!.channel(`realtime-${table}`)
        .on(
          "postgres_changes" as any,
          { event: "*", schema: "public", table },
          (payload: any) => {
            const event: RealtimeEvent = {
              table,
              eventType: payload.eventType,
              new: payload.new || {},
              old: payload.old || {},
            };

            console.log("Realtime Event Received", event);
            this.emit(table, event);
            this.emit("*", event); // wildcard listeners

            // Dispatch browser CustomEvent for components
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("nexbyte-realtime", { detail: event })
              );
            }
          }
        )
        .subscribe();

      this.channels.push(channel);
    });
  }

  /**
   * Connect to the server's SSE stream to receive server-side events.
   * This is the critical link between server-side mutations (e.g., customer booking
   * created via API route) and client-side admin components.
   */
  private connectSSE() {
    if (typeof window === "undefined") return;

    try {
      this.eventSource = new EventSource("/api/realtime-stream");

      this.eventSource.onmessage = (e) => {
        try {
          const eventData = JSON.parse(e.data);
          if (eventData && eventData.table) {
            console.log("[SSE] Server event received:", eventData.table, eventData.eventType);
            const event: RealtimeEvent = {
              table: eventData.table,
              eventType: eventData.eventType || "INSERT",
              new: eventData.new || {},
              old: eventData.old || {},
            };
            this.emit(eventData.table, event);
            this.emit("*", event);
            window.dispatchEvent(new CustomEvent("nexbyte-realtime", { detail: event }));
          }
        } catch {
          // Ignore parse errors (heartbeats, etc.)
        }
      };

      this.eventSource.onerror = () => {
        console.warn("[SSE] Connection lost. Reconnecting in 3s...");
        this.eventSource?.close();
        this.eventSource = null;
        // Reconnect after delay
        if (this.sseReconnectTimer) clearTimeout(this.sseReconnectTimer);
        this.sseReconnectTimer = setTimeout(() => this.connectSSE(), 3000);
      };
    } catch (e) {
      console.error("[SSE] Failed to connect:", e);
    }
  }

  private startPolling() {
    if (typeof window === "undefined") return;

    // Setup BroadcastChannel for cross-tab communication within the same browser
    const bc = new BroadcastChannel("nexbyte-sync-channel");
    
    // When this tab receives a local data change from dbHelper, broadcast it to other tabs!
    window.addEventListener("nexbyte-data-changed", ((e: CustomEvent) => {
      const { table, action, data } = e.detail || {};
      if (table) {
        const event: RealtimeEvent = {
          table,
          eventType: action === "delete" ? "DELETE" : action === "update" ? "UPDATE" : "INSERT",
          new: data || {},
          old: {},
        };
        console.log("Realtime Event Received locally, broadcasting...", event);
        this.emit(table, event);
        this.emit("*", event);
        window.dispatchEvent(new CustomEvent("nexbyte-realtime", { detail: event }));
        
        // Broadcast to other tabs
        bc.postMessage(event);
      }
    }) as EventListener);

    // Listen for broadcasts from OTHER tabs
    bc.onmessage = (e) => {
      const eventData = e.data;
      if (eventData && eventData.table) {
        console.log("[CLIENT] BroadcastChannel message received:", eventData);
        const event: RealtimeEvent = {
          table: eventData.table,
          eventType: eventData.eventType,
          new: eventData.new || {},
          old: eventData.old || {},
        };
        this.emit(eventData.table, event);
        this.emit("*", event);
        window.dispatchEvent(new CustomEvent("nexbyte-realtime", { detail: event }));
      }
    };
  }

  on(table: string, callback: RealtimeCallback) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set());
    }
    this.listeners.get(table)!.add(callback);

    return () => {
      this.listeners.get(table)?.delete(callback);
    };
  }

  private emit(table: string, event: RealtimeEvent) {
    this.listeners.get(table)?.forEach((cb) => cb(event));
  }

  cleanup() {
    this.channels.forEach((ch) => ch.unsubscribe());
    this.channels = [];
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.sseReconnectTimer) clearTimeout(this.sseReconnectTimer);
    this.initialized = false;
  }
}

// Singleton instance
export const realtimeSync = new RealtimeSyncManager();

// Helper to dispatch data change events from dbHelper (mock mode)
export function notifyDataChange(table: string, action: string, data?: any) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("nexbyte-data-changed", {
        detail: { table, action, data },
      })
    );
  }
}
