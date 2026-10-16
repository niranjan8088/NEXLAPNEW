/**
 * lib/pipelineEvents.ts
 * Centralized Event & Pipeline Notification Dispatch Engine for NexLapTech.
 * 
 * Handles Admin ↔ Customer ↔ Reseller pipelines:
 * - Creates stored notification with role-scoped recipient (recipient_user_id or recipient_role).
 * - Prevents duplicates via 10s idempotency memory map.
 * - Broadcasts realtime sync to connected clients.
 */

import { dbHelper } from "@/lib/dbHelper";

export type EventType =
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "ORDER_PROCESSING"
  | "ORDER_SHIPPED"
  | "ORDER_COMPLETED"
  | "ORDER_CANCELLED"
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_IN_PROGRESS"
  | "BOOKING_COMPLETED"
  | "BOOKING_CANCELLED"
  | "SERVICE_CREATED"
  | "SERVICE_CONFIRMED"
  | "SERVICE_IN_PROGRESS"
  | "SERVICE_COMPLETED"
  | "MESSAGE_RECEIVED"
  | "INVOICE_CREATED"
  | "INTERNSHIP_SUBMITTED"
  | "INTERNSHIP_APPROVED"
  | "INTERNSHIP_REJECTED"
  | "INTERNSHIP_INFO_REQUIRED"
  | "TRAINING_SUBMITTED"
  | "TRAINING_CONFIRMED"
  | "TRAINING_BATCH_ASSIGNED"
  | "TRAINING_COMPLETED"
  | "RESELLER_APPLIED"
  | "RESELLER_APPROVED"
  | "RESELLER_REJECTED"
  | "RESELLER_SUSPENDED"
  | "STOCK_REQUEST"
  | "OFFER_CREATED"
  | "OFFER_ACTIVATED"
  | "OFFER_DEACTIVATED"
  | "OFFER_REDEMPTION"
  | "LAPTOP_ENQUIRY_CREATED"
  | "LAPTOP_ENQUIRY_UPDATED";

export interface PipelineEventInput {
  eventType: EventType;
  title: string;
  message: string;
  recipientUserId?: string;
  recipientRole?: "admin" | "reseller" | "user";
  actorUserId?: string;
  actorRole?: "admin" | "reseller" | "user" | "system";
  referenceType?: "order" | "booking" | "service" | "message" | "invoice" | "internship" | "training" | "reseller" | "offer" | "laptop_enquiry";
  referenceId?: string;
  metadata?: Record<string, any>;
  isAlert?: boolean;
}

// In-memory idempotency deduplication cache (10 seconds retention)
const recentEventsCache = new Set<string>();

export async function dispatchPipelineEvent(input: PipelineEventInput) {
  try {
    const dedupeKey = `${input.eventType}:${input.recipientUserId || input.recipientRole}:${input.referenceId || input.title}`;
    if (recentEventsCache.has(dedupeKey)) {
      return null;
    }
    recentEventsCache.add(dedupeKey);
    setTimeout(() => {
      recentEventsCache.delete(dedupeKey);
    }, 10000);

    const notificationPayload = {
      title: input.title,
      message: input.message,
      type: input.referenceType || "system",
      event_type: input.eventType,
      recipient_user_id: input.recipientUserId || null,
      recipient_role: input.recipientRole || null,
      actor_user_id: input.actorUserId || null,
      actor_role: input.actorRole || "system",
      reference_type: input.referenceType || null,
      reference_id: input.referenceId || null,
      metadata: input.metadata || {},
      status: "unread",
      is_read: false,
      is_alert: input.isAlert || false,
      created_at: new Date().toISOString(),
    };

    // Save notification to database / store
    const saved = await dbHelper.notifications.create(notificationPayload);

    // Audit log if action was performed by admin or reseller
    if (input.actorRole === "admin" || input.actorRole === "reseller") {
      await dbHelper.activityLogs.create({
        user_name: input.actorRole.toUpperCase(),
        role: input.actorRole,
        action: input.eventType,
        details: `${input.title}: ${input.message}`,
        ip: "Internal Server API",
      });
    }

    return saved;
  } catch (err) {
    console.error("Pipeline Event Dispatch Error:", err);
    return null;
  }
}
