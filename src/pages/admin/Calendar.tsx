import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  getMonthDayInfo, generateTimeSlots, generateBookingRef, computeEndTime, formatDisplayTime,
} from "@/services/bookingEngine";
import { notificationService } from "@/services/notificationService";
import type { Booking } from "@/data/seed";

const STATUS_COLORS: Record<string, string> = {
  pending:     "#f59e0b",
  confirmed:   "#10b981",
  rescheduled: "#3b82f6",
  completed:   "#6b7280",
  cancelled:   "#ef4444",
  no_show:     "#7c3aed",
};

export default function AdminCalendar() {
  const { bookings, bookings_, bookingSettings, services, customers } = useAdmin();
  const { toast } = useToast();
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<Booking | null>(null);

  // New booking form state
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", type: "",
    date: "", time: "", serviceId: "", status: "confirmed" as Booking["status"],
    notes: "", projectDetails: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const dayInfos = useMemo(
    () => getMonthDayInfo(calMonth.year, calMonth.month, bookingSettings, bookings),
    [calMonth, bookingSettings, bookings]
  );

  const slots = useMemo(
    () => form.date ? generateTimeSlots(form.date, bookingSettings, bookings) : [],
    [form.date, bookingSettings, bookings]
  );

  const firstDay = new Date(calMonth.year, calMonth.month, 1).getDay();
  const monthName = new Date(calMonth.year, calMonth.month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const selectedDayBookings = selectedDate
    ? bookings.filter((b) => b.date === selectedDate)
    : [];

  const selectedDayType = selectedDate
    ? dayInfos.find((d) => d.date === selectedDate)?.status
    : null;

  function prevMonth() {
    setCalMonth((p) => { const d = new Date(p.year, p.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  }
  function nextMonth() {
    setCalMonth((p) => { const d = new Date(p.year, p.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  }

  async function handleCreate() {
    if (!form.name || !form.email || !form.date || !form.time || !form.type) {
      toast.error("Missing fields", "Please fill all required fields");
      return;
    }
    setSubmitting(true);
    const ref = generateBookingRef();
    const dur = bookingSettings.defaultDuration;
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      bookingRef: ref,
      name: form.name, email: form.email, phone: form.phone,
      company: form.company, type: form.type,
      date: form.date, time: form.time, status: form.status,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      serviceId: form.serviceId,
      duration: dur,
      endTime: computeEndTime(form.time, dur),
      projectDetails: form.projectDetails,
      rescheduleHistory: [], notificationLog: [],
    };
    bookings_.add(booking);
    await notificationService.emit({ type: "booking_created", booking });
    toast.success("Booking created", `${ref} scheduled for ${form.date}`);
    setNewBookingOpen(false);
    setForm({ name: "", email: "", phone: "", company: "", type: "", date: "", time: "", serviceId: "", status: "confirmed", notes: "", projectDetails: "" });
    setSubmitting(false);
  }

  function handleCancel(booking: Booking) {
    bookings_.edit(booking.id, { status: "cancelled" });
    toast.success("Booking cancelled", booking.bookingRef);
    setCancelConfirm(null);
  }

  function handleConfirm(booking: Booking) {
    bookings_.edit(booking.id, { status: "confirmed" });
    toast.success("Booking confirmed", booking.bookingRef);
  }

  return (
    <AdminLayout>
      <div className="admin-page" style={{ maxWidth: "100%", padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#e6edf3", marginBottom: 4 }}>Calendar</h1>
            <p style={{ color: "#484f58", fontSize: 13 }}>
              {bookings.filter((b) => !["cancelled","no_show"].includes(b.status)).length} active bookings
            </p>
          </div>
          <button className="btn-primary" onClick={() => setNewBookingOpen(true)}>+ New Booking</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr 320px" : "1fr", gap: 20, alignItems: "start" }}>
          {/* Calendar */}
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 10, overflow: "hidden" }}>
            {/* Month nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #21262d" }}>
              <button onClick={prevMonth} style={navBtn}>‹</button>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#e6edf3" }}>{monthName}</span>
              <button onClick={nextMonth} style={navBtn}>›</button>
            </div>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #21262d" }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} style={{ textAlign: "center", padding: "10px 0", fontSize: 11, fontWeight: 600, color: "#484f58", letterSpacing: "0.06em" }}>{d}</div>
              ))}
            </div>
            {/* Days */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ borderRight: "1px solid #21262d", borderBottom: "1px solid #21262d", minHeight: 90 }} />
              ))}
              {dayInfos.map((info) => {
                const d = parseInt(info.date.split("-")[2]);
                const dayBookings = bookings.filter((b) => b.date === info.date && !["cancelled","no_show"].includes(b.status));
                const isSelected = info.date === selectedDate;
                const isToday = info.date === new Date().toISOString().slice(0,10);
                return (
                  <div
                    key={info.date}
                    onClick={() => setSelectedDate(info.date === selectedDate ? null : info.date)}
                    style={{
                      borderRight: "1px solid #21262d",
                      borderBottom: "1px solid #21262d",
                      minHeight: 90,
                      padding: "8px 6px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(255,90,0,0.05)" : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#1c2128"; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: isToday ? "#ff5a00" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: isToday ? 700 : 400,
                      color: isToday ? "#fff" : info.status === "available" ? "#8b949e" : "#30363d",
                      marginBottom: 4,
                    }}>
                      {d}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {dayBookings.slice(0, 3).map((b) => (
                        <div key={b.id} style={{
                          fontSize: 10, padding: "2px 5px", borderRadius: 3,
                          background: `${STATUS_COLORS[b.status]}20`,
                          color: STATUS_COLORS[b.status],
                          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                        }}>
                          {b.time} {b.name.split(" ")[0]}
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div style={{ fontSize: 10, color: "#484f58" }}>+{dayBookings.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          {selectedDate && (
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p style={{ fontSize: 11, color: "#484f58", marginTop: 2 }}>
                    {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? "s" : ""}
                    {selectedDayType && selectedDayType !== "available" && (
                      <span style={{ marginLeft: 8, color: "#ef4444" }}>· {selectedDayType}</span>
                    )}
                  </p>
                </div>
                <button onClick={() => setSelectedDate(null)} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                {selectedDayBookings.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#484f58", textAlign: "center", padding: 24 }}>No active bookings</p>
                ) : (
                  selectedDayBookings.sort((a, b) => a.time.localeCompare(b.time)).map((booking) => (
                    <div key={booking.id} style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>{booking.name}</p>
                          <p style={{ fontSize: 11, color: "#484f58" }}>{booking.email}</p>
                        </div>
                        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: `${STATUS_COLORS[booking.status]}15`, color: STATUS_COLORS[booking.status], fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {booking.status.replace("_", " ")}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                        <p style={{ fontSize: 12, color: "#8b949e" }}>🕐 {formatDisplayTime(booking.time)}{booking.endTime ? ` → ${formatDisplayTime(booking.endTime)}` : ""}</p>
                        <p style={{ fontSize: 12, color: "#8b949e" }}>📋 {booking.type}</p>
                        {booking.company && <p style={{ fontSize: 12, color: "#8b949e" }}>🏢 {booking.company}</p>}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {booking.status === "pending" && (
                          <button onClick={() => handleConfirm(booking)} style={{ ...actionBtn, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                            Confirm
                          </button>
                        )}
                        {!["cancelled","completed","no_show"].includes(booking.status) && (
                          <button onClick={() => setCancelConfirm(booking)} style={{ ...actionBtn, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status legend */}
        <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
          {Object.entries(STATUS_COLORS).map(([s, c]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 11, color: "#484f58", textTransform: "capitalize" }}>{s.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* New Booking SlideOver */}
      <SlideOver
        open={newBookingOpen}
        onClose={() => setNewBookingOpen(false)}
        title="New Booking"
        subtitle="Manually schedule a booking"
        width="lg"
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button className="btn-secondary" onClick={() => setNewBookingOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? "Scheduling…" : "Schedule Booking"}
            </button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { key: "name", label: "Full name *", type: "text" },
            { key: "email", label: "Email *", type: "email" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "company", label: "Company", type: "text" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input type={type} className="form-input" value={form[key as keyof typeof form] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="form-label">Service</label>
            <select className="form-input" value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}>
              <option value="">Select service</option>
              {services.filter((s) => s.visible).map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Appointment type *</label>
            <select className="form-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="">Select type</option>
              {bookingSettings.appointmentTypes.filter((t) => t.active).map((t) => (
                <option key={t.id} value={t.name}>{t.name} ({t.duration}m)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Date *</label>
            <input type="date" className="form-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, time: "" }))} />
          </div>
          <div>
            <label className="form-label">Time *</label>
            <select className="form-input" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}>
              <option value="">Select time</option>
              {slots.filter((s) => s.available).map((s) => (
                <option key={s.time} value={s.time}>{s.displayTime}</option>
              ))}
              {form.date && slots.length === 0 && <option disabled>No slots available</option>}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Booking["status"] }))}>
              {["pending","confirmed","completed"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={!!cancelConfirm}
        title="Cancel booking"
        description={`Cancel ${cancelConfirm?.bookingRef} for ${cancelConfirm?.name}? This cannot be undone.`}
        confirmLabel="Cancel booking"
        destructive
        onConfirm={() => cancelConfirm && handleCancel(cancelConfirm)}
        onCancel={() => setCancelConfirm(null)}
      />
    </AdminLayout>
  );
}

const navBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "#8b949e", fontSize: 20, padding: "4px 12px", borderRadius: 6, lineHeight: 1,
};

const actionBtn: React.CSSProperties = {
  padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
  cursor: "pointer", letterSpacing: "0.04em", transition: "opacity 0.15s",
};
