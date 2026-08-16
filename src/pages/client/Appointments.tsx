import { useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  generateTimeSlots, formatDisplayTime, formatDateDisplay, computeEndTime,
} from "@/services/bookingEngine";
import { notificationService } from "@/services/notificationService";
import type { Booking } from "@/data/seed";

const STATUS_COLORS: Record<string, string> = {
  confirmed:   "badge-green",
  pending:     "badge-gray",
  completed:   "badge-cyan",
  cancelled:   "badge-red",
  rescheduled: "badge-orange",
  no_show:     "badge-red",
};

export default function ClientAppointments() {
  const { bookings, bookings_, bookingSettings } = useAdmin();
  const { user } = useApp();
  const { toast } = useToast();

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Filter by logged-in email; fallback to all if no user
  const myBookings = user?.email
    ? bookings.filter((b) => b.email === user.email)
    : bookings;

  const upcoming = myBookings.filter((b) => ["pending", "confirmed", "rescheduled"].includes(b.status));
  const past = myBookings.filter((b) => ["completed", "cancelled", "no_show"].includes(b.status));

  const slots = rescheduleDate && rescheduleTarget
    ? generateTimeSlots(rescheduleDate, bookingSettings, bookings.filter((b) => b.id !== rescheduleTarget.id), rescheduleTarget.duration)
    : [];

  function handleCancel() {
    if (!cancelTarget) return;
    bookings_.edit(cancelTarget.id, { status: "cancelled" });
    notificationService.emit({ type: "booking_cancelled", booking: { ...cancelTarget, status: "cancelled" } });
    toast.success("Booking cancelled", cancelTarget.bookingRef);
    setCancelTarget(null);
  }

  function handleReschedule() {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
      toast.error("Missing fields", "Please select a new date and time");
      return;
    }
    const history = [...(rescheduleTarget.rescheduleHistory ?? []), {
      date: rescheduleTarget.date,
      time: rescheduleTarget.time,
      changedAt: new Date().toISOString(),
      reason: rescheduleReason || "Client requested reschedule",
    }];
    const dur = rescheduleTarget.duration ?? bookingSettings.defaultDuration;
    bookings_.edit(rescheduleTarget.id, {
      date: rescheduleDate,
      time: rescheduleTime,
      endTime: computeEndTime(rescheduleTime, dur),
      status: "rescheduled",
      rescheduleHistory: history,
    });
    notificationService.emit({ type: "booking_rescheduled", booking: { ...rescheduleTarget, date: rescheduleDate, time: rescheduleTime, status: "rescheduled" } });
    toast.success("Booking rescheduled", `Now on ${rescheduleDate} at ${formatDisplayTime(rescheduleTime)}`);
    setRescheduleTarget(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
  }

  return (
    <ClientLayout>
      <div className="p-8 max-w-[800px]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
            <h1 className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>APPOINTMENTS</h1>
          </div>
          <Link to="/book" className="btn-primary text-sm flex items-center gap-1">
            BOOK CALL <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Upcoming */}
        <div className="mb-10">
          <p className="label-sm mb-4">UPCOMING ({upcoming.length})</p>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((booking) => (
                <div key={booking.id} className="border border-white/8 bg-[#14171b]/40 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-700 text-[#f5f7f8] text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{booking.type}</p>
                      <p className="label-sm text-[#bfc5cc]/40">{booking.bookingRef}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[booking.status] ?? "badge-gray"}`}>
                      {booking.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-[#ff5a00]" />
                      <p className="text-[#bfc5cc] text-xs">{booking.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-[#ff5a00]" />
                      <p className="text-[#bfc5cc] text-xs">
                        {formatDisplayTime(booking.time)}
                        {booking.endTime ? ` → ${formatDisplayTime(booking.endTime)}` : ""}
                      </p>
                    </div>
                    {booking.duration && (
                      <p className="text-[#bfc5cc]/40 text-xs">{booking.duration} min</p>
                    )}
                  </div>
                  {booking.serviceName && (
                    <p className="text-[#bfc5cc]/50 text-xs mb-2">Service: {booking.serviceName}</p>
                  )}
                  {booking.projectDetails && (
                    <p className="text-[#bfc5cc]/40 text-xs border-t border-white/5 pt-3 mt-3 line-clamp-2">{booking.projectDetails}</p>
                  )}
                  <div className="flex gap-3 mt-4 pt-3 border-t border-white/5 flex-wrap">
                    {!["cancelled","completed"].includes(booking.status) && (
                      <>
                        <button
                          className="btn-ghost text-xs"
                          onClick={() => { setRescheduleTarget(booking); setRescheduleDate(""); setRescheduleTime(""); }}
                        >
                          RESCHEDULE
                        </button>
                        <button
                          className="label-sm text-[#bfc5cc]/40 hover:text-red-400 transition-colors ml-auto"
                          onClick={() => setCancelTarget(booking)}
                        >
                          CANCEL
                        </button>
                      </>
                    )}
                  </div>

                  {/* Inline reschedule panel */}
                  {rescheduleTarget?.id === booking.id && (
                    <div style={{ marginTop: 16, padding: 16, background: "#14171b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                      <p className="label-sm mb-3" style={{ color: "#ff5a00" }}>RESCHEDULE</p>
                      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                        <div>
                          <label className="label-sm mb-1 block" style={{ color: "#bfc5cc", opacity: 0.6 }}>New date</label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleTime(""); }}
                            style={{ background: "#1a1d22", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", padding: "8px 12px", borderRadius: 6, fontSize: 13 }}
                          />
                        </div>
                        {rescheduleDate && (
                          <div>
                            <label className="label-sm mb-1 block" style={{ color: "#bfc5cc", opacity: 0.6 }}>New time</label>
                            <select
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                              style={{ background: "#1a1d22", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", padding: "8px 12px", borderRadius: 6, fontSize: 13 }}
                            >
                              <option value="">Select time</option>
                              {slots.filter((s) => s.available).map((s) => (
                                <option key={s.time} value={s.time}>{s.displayTime}</option>
                              ))}
                              {slots.length === 0 && <option disabled>No slots</option>}
                            </select>
                          </div>
                        )}
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label className="label-sm mb-1 block" style={{ color: "#bfc5cc", opacity: 0.6 }}>Reason (optional)</label>
                        <input
                          placeholder="Reason for rescheduling..."
                          value={rescheduleReason}
                          onChange={(e) => setRescheduleReason(e.target.value)}
                          style={{ width: "100%", background: "#1a1d22", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", padding: "8px 12px", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-primary text-xs" onClick={handleReschedule}>CONFIRM RESCHEDULE</button>
                        <button className="btn-ghost text-xs" onClick={() => setRescheduleTarget(null)}>CANCEL</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/5 p-8 text-center">
              <Calendar size={24} className="text-[#bfc5cc]/20 mx-auto mb-3" />
              <p className="text-[#bfc5cc]/40 text-sm mb-4">No upcoming appointments</p>
              <Link to="/book" className="btn-primary text-sm">BOOK A SESSION</Link>
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <p className="label-sm mb-4">PAST APPOINTMENTS</p>
            <div className="space-y-2">
              {past.sort((a, b) => b.date.localeCompare(a.date)).map((booking) => (
                <div key={booking.id} className="border border-white/5 p-4 flex items-center justify-between gap-4">
                  <div style={{ minWidth: 0 }}>
                    <p className="text-[#bfc5cc] text-sm truncate">{booking.type}</p>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <p className="label-sm text-[#bfc5cc]/40">{booking.date}</p>
                      <p className="label-sm text-[#bfc5cc]/40">{formatDisplayTime(booking.time)}</p>
                      <p className="label-sm text-[#bfc5cc]/30">{booking.bookingRef}</p>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[booking.status] ?? "badge-gray"}`} style={{ flexShrink: 0 }}>
                    {booking.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel booking"
        description={`Cancel ${cancelTarget?.bookingRef} on ${cancelTarget?.date}? This action cannot be undone.`}
        confirmLabel="Yes, cancel"
        destructive
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </ClientLayout>
  );
}
