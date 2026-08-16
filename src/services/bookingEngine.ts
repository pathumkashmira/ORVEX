/**
 * ORVEX Booking Engine
 * All business rules live here — slot generation, conflict detection,
 * availability checks, booking ref generation.
 */

import type { Booking } from "@/data/seed";
import type { BookingSettings } from "@/contexts/AdminContext";

export interface TimeSlot {
  time: string;         // "HH:MM" 24h
  displayTime: string;  // "9:00 AM"
  available: boolean;
  reason?: string;      // why unavailable
}

export interface SlotAvailability {
  date: string;
  available: boolean;
  reason?: string;
  slots: TimeSlot[];
}

export type DateStatus = "available" | "unavailable" | "past" | "too-soon" | "too-far" | "blocked" | "holiday" | "weekend" | "fully-booked";

export interface DayInfo {
  date: string;
  status: DateStatus;
  bookingCount: number;
}

// ── Utilities ──────────────────────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDisplayTime(time: string): string {
  const mins = timeToMinutes(time);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDateDisplay(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dateFromString(dateStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d);
}

export function dateToString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ── Booking ref ────────────────────────────────────────────────────────────

export function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `ORVEX-BOOK-${year}-${num}`;
}

// ── Date-level availability ────────────────────────────────────────────────

export function getDateStatus(
  dateStr: string,
  settings: BookingSettings,
  bookings: Booking[]
): DateStatus {
  const today = todayString();

  // Past
  if (dateStr < today) return "past";

  const date = dateFromString(dateStr);

  // Working day check (0=Sun)
  if (!settings.workingDays[date.getDay()]) return "weekend";

  // Blocked dates
  if (settings.blockedDates.includes(dateStr)) return "blocked";

  // Holidays
  if (settings.holidays.includes(dateStr)) return "holiday";

  // Minimum notice: compare end-of-day slot
  const endOfDayMinutes = timeToMinutes(settings.workingHoursEnd);
  const endOfDayDate = new Date(date.getTime());
  endOfDayDate.setHours(Math.floor(endOfDayMinutes / 60), endOfDayMinutes % 60, 0, 0);
  const nowPlusNotice = new Date(Date.now() + settings.minimumNoticeHours * 3600 * 1000);
  if (endOfDayDate <= nowPlusNotice) return "too-soon";

  // Maximum advance
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + settings.maximumAdvanceDays);
  if (date > maxDate) return "too-far";

  // Check if any slots available
  const slots = generateTimeSlots(dateStr, settings, bookings);
  if (slots.length > 0 && slots.every((s) => !s.available)) return "fully-booked";

  return "available";
}

export function isDateBookable(
  dateStr: string,
  settings: BookingSettings,
  bookings: Booking[]
): boolean {
  return getDateStatus(dateStr, settings, bookings) === "available";
}

// ── Slot generation ────────────────────────────────────────────────────────

export function generateTimeSlots(
  dateStr: string,
  settings: BookingSettings,
  bookings: Booking[],
  overrideDuration?: number
): TimeSlot[] {
  const duration = overrideDuration ?? settings.defaultDuration;
  const start = timeToMinutes(settings.workingHoursStart);
  const end = timeToMinutes(settings.workingHoursEnd);
  const step = duration + settings.bufferTime;
  const nowPlusNotice = new Date(Date.now() + settings.minimumNoticeHours * 3600 * 1000);

  // Active bookings for this date (not cancelled/no-show)
  const dayBookings = bookings.filter(
    (b) =>
      b.date === dateStr &&
      !["cancelled", "no_show"].includes(b.status)
  );

  const slots: TimeSlot[] = [];
  let current = start;

  while (current + duration <= end) {
    const timeStr = minutesToTime(current);
    const slotEnd = current + duration;

    // Minimum notice check per-slot
    const [y, mo, d] = dateStr.split("-").map(Number);
    const slotDateTime = new Date(y, mo - 1, d, Math.floor(current / 60), current % 60);
    if (slotDateTime <= nowPlusNotice) {
      slots.push({ time: timeStr, displayTime: formatDisplayTime(timeStr), available: false, reason: "too soon" });
      current += step;
      continue;
    }

    // Conflict detection with buffer
    const conflict = dayBookings.some((b) => {
      const bStart = timeToMinutes(b.time);
      const bDur = (b as any).duration ?? settings.defaultDuration;
      const bEnd = bStart + bDur;
      // Slot overlaps if: slot starts before booking+buffer ends AND slot+buffer ends after booking starts
      return current < bEnd + settings.bufferTime && slotEnd + settings.bufferTime > bStart;
    });

    slots.push({
      time: timeStr,
      displayTime: formatDisplayTime(timeStr),
      available: !conflict,
      reason: conflict ? "booked" : undefined,
    });

    current += step;
  }

  return slots;
}

// ── Month calendar ─────────────────────────────────────────────────────────

export function getMonthDayInfo(
  year: number,
  month: number, // 0-indexed
  settings: BookingSettings,
  bookings: Booking[]
): DayInfo[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: DayInfo[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const status = getDateStatus(dateStr, settings, bookings);
    const bookingCount = bookings.filter(
      (b) => b.date === dateStr && !["cancelled", "no_show"].includes(b.status)
    ).length;
    result.push({ date: dateStr, status, bookingCount });
  }

  return result;
}

// ── Booking validation ─────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBookingRequest(
  date: string,
  time: string,
  duration: number,
  settings: BookingSettings,
  existingBookings: Booking[],
  excludeBookingId?: string
): ValidationResult {
  const errors: string[] = [];

  const status = getDateStatus(date, settings, existingBookings);
  if (status === "past") errors.push("Selected date is in the past");
  if (status === "weekend") errors.push("Selected date is not a working day");
  if (status === "blocked") errors.push("Selected date is blocked");
  if (status === "holiday") errors.push("Selected date is a holiday");
  if (status === "too-soon") errors.push(`Bookings require at least ${settings.minimumNoticeHours}h notice`);
  if (status === "too-far") errors.push(`Bookings must be within ${settings.maximumAdvanceDays} days from today`);

  if (errors.length > 0) return { valid: false, errors };

  // Slot check
  const relevantBookings = excludeBookingId
    ? existingBookings.filter((b) => b.id !== excludeBookingId)
    : existingBookings;

  const slots = generateTimeSlots(date, settings, relevantBookings, duration);
  const slot = slots.find((s) => s.time === time);

  if (!slot) {
    errors.push("Selected time is outside working hours");
  } else if (!slot.available) {
    errors.push("Selected time slot is no longer available");
  }

  return { valid: errors.length === 0, errors };
}

// ── Appointment end time ───────────────────────────────────────────────────

export function computeEndTime(startTime: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}
