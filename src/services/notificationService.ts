/**
 * ORVEX Notification Service
 * Event-driven notification architecture. Register handlers to receive events.
 * In production, swap stubs for real email/SMS integrations.
 */

import type { Booking } from "@/data/seed";

export type NotificationEventType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_rescheduled"
  | "booking_reminder";

export interface NotificationEvent {
  type: NotificationEventType;
  booking: Booking;
  meta?: Record<string, string>;
}

export type NotificationHandler = (event: NotificationEvent) => void | Promise<void>;

class NotificationService {
  private handlers: NotificationHandler[] = [];

  register(handler: NotificationHandler): () => void {
    this.handlers.push(handler);
    return () => { this.handlers = this.handlers.filter((h) => h !== handler); };
  }

  async emit(event: NotificationEvent): Promise<void> {
    for (const handler of this.handlers) {
      try { await handler(event); } catch (err) { console.error("[NotificationService] handler error", err); }
    }
  }
}

export const notificationService = new NotificationService();

// ── Default handlers ───────────────────────────────────────────────────────

notificationService.register((event) => {
  const labels: Record<NotificationEventType, string> = {
    booking_created:     "New booking created",
    booking_confirmed:   "Booking confirmed",
    booking_cancelled:   "Booking cancelled",
    booking_rescheduled: "Booking rescheduled",
    booking_reminder:    "Booking reminder",
  };
  console.info(
    `[Notification → Client Email] ${labels[event.type]}`,
    `To: ${event.booking.email}`,
    `Ref: ${event.booking.bookingRef}`,
    `Date: ${event.booking.date} ${event.booking.time}`
  );
});

notificationService.register((event) => {
  console.info(
    `[Notification → Admin] ${event.type}`,
    `Booking: ${event.booking.bookingRef}`,
    `Client: ${event.booking.name} (${event.booking.email})`
  );
});
