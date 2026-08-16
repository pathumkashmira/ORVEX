import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAdmin } from "@/contexts/AdminContext";
import {
  generateTimeSlots, getMonthDayInfo, generateBookingRef,
  validateBookingRequest, computeEndTime, formatDateDisplay, formatDisplayTime,
  todayString, dateFromString,
} from "@/services/bookingEngine";
import { notificationService } from "@/services/notificationService";
import type { Booking } from "@/data/seed";

type Step = "service" | "type" | "date" | "time" | "details" | "review" | "confirmation";

const STEPS: Step[] = ["service", "type", "date", "time", "details", "review", "confirmation"];
const STEP_LABELS = ["Service", "Type", "Date", "Time", "Details", "Review", "Confirm"];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
      {STEPS.slice(0, -1).map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, border: `2px solid ${done || active ? "#ff5a00" : "#333"}`,
              background: done ? "#ff5a00" : active ? "rgba(255,90,0,0.12)" : "transparent",
              color: done ? "#fff" : active ? "#ff5a00" : "#555",
              transition: "all 0.2s",
            }}>
              {done ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 2 && (
              <div style={{ width: 32, height: 1, background: done ? "#ff5a00" : "#222" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BookAppointment() {
  const { services, bookings, bookingSettings, bookings_ } = useAdmin();

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [details, setDetails] = useState({ name: "", email: "", phone: "", company: "", projectDetails: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const availableServices = services.filter((s) => s.visible);
  const activeTypes = bookingSettings.appointmentTypes.filter((t) => t.active);
  const selectedTypeObj = activeTypes.find((t) => t.id === selectedType);
  const selectedServiceObj = availableServices.find((s) => s.id === selectedService);
  const duration = selectedTypeObj?.duration ?? bookingSettings.defaultDuration;

  const dayInfos = useMemo(
    () => getMonthDayInfo(calMonth.year, calMonth.month, bookingSettings, bookings),
    [calMonth, bookingSettings, bookings]
  );

  const slots = useMemo(
    () => selectedDate ? generateTimeSlots(selectedDate, bookingSettings, bookings, duration) : [],
    [selectedDate, bookingSettings, bookings, duration]
  );

  function prevMonth() {
    setCalMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }
  function nextMonth() {
    setCalMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  async function handleSubmit() {
    setErrors([]);
    const validation = validateBookingRequest(selectedDate, selectedTime, duration, bookingSettings, bookings);
    if (!validation.valid) { setErrors(validation.errors); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const ref = generateBookingRef();
    const endTime = computeEndTime(selectedTime, duration);
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      bookingRef: ref,
      name: details.name,
      email: details.email,
      phone: details.phone,
      company: details.company,
      type: selectedTypeObj?.name ?? "Consultation",
      date: selectedDate,
      time: selectedTime,
      status: "pending",
      notes: "",
      createdAt: new Date().toISOString(),
      serviceId: selectedService,
      serviceName: selectedServiceObj?.title,
      appointmentTypeId: selectedType,
      duration,
      endTime,
      projectDetails: details.projectDetails,
      timezone: bookingSettings.timezone,
      rescheduleHistory: [],
      notificationLog: [],
    };
    bookings_.add(booking);
    await notificationService.emit({ type: "booking_created", booking });
    setConfirmedBooking(booking);
    setSubmitting(false);
    setStep("confirmation");
  }

  const canGoNext = (): boolean => {
    if (step === "service") return !!selectedService;
    if (step === "type") return !!selectedType;
    if (step === "date") return !!selectedDate;
    if (step === "time") return !!selectedTime;
    if (step === "details") return !!(details.name && details.email && details.phone);
    return true;
  };

  function goNext() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }
  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  const firstDayOfMonth = new Date(calMonth.year, calMonth.month, 1).getDay();
  const monthName = new Date(calMonth.year, calMonth.month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: "#080808", color: "#e0e0e0", paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

          {step !== "confirmation" && (
            <>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#ff5a00", marginBottom: 12, textTransform: "uppercase" }}>
                Book an Appointment
              </p>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.1 }}>
                Schedule a session
              </h1>
              <p style={{ color: "#666", fontSize: 15, marginBottom: 40 }}>
                Step {STEPS.indexOf(step) + 1} of {STEPS.length - 1} — {STEP_LABELS[STEPS.indexOf(step)]}
              </p>
              <StepIndicator current={step} />
            </>
          )}

          {/* Step: Service */}
          {step === "service" && (
            <div>
              <h2 style={sh2}>Select a service</h2>
              <p style={sp}>Which area would you like to explore?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
                {availableServices.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    style={{
                      ...serviceCard,
                      borderColor: selectedService === s.id ? "#ff5a00" : "#222",
                      background: selectedService === s.id ? "rgba(255,90,0,0.06)" : "#111",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4 }}>{s.title}</p>
                        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{s.description}</p>
                      </div>
                      {selectedService === s.id && (
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ff5a00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>
                          <span style={{ color: "#fff", fontSize: 11 }}>✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Appointment Type */}
          {step === "type" && (
            <div>
              <h2 style={sh2}>Appointment type</h2>
              <p style={sp}>What kind of session do you need?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
                {activeTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    style={{
                      ...serviceCard,
                      borderColor: selectedType === t.id ? t.color : "#222",
                      background: selectedType === t.id ? `${t.color}12` : "#111",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                          <p style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{t.name}</p>
                          <span style={{ fontSize: 11, color: "#555", background: "#1a1a1a", padding: "2px 8px", borderRadius: 20 }}>{t.duration} min</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5, paddingLeft: 20 }}>{t.description}</p>
                      </div>
                      {selectedType === t.id && (
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>
                          <span style={{ color: "#fff", fontSize: 11 }}>✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Date */}
          {step === "date" && (
            <div>
              <h2 style={sh2}>Select a date</h2>
              <p style={sp}>Choose an available day for your {selectedTypeObj?.name}.</p>
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24, marginTop: 24 }}>
                {/* Month header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <button onClick={prevMonth} style={navBtn}>‹</button>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{monthName}</span>
                  <button onClick={nextMonth} style={navBtn}>›</button>
                </div>
                {/* Day headers */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                    <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#444", fontWeight: 600, padding: "4px 0" }}>{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {dayInfos.map((info) => {
                    const d = parseInt(info.date.split("-")[2]);
                    const isAvailable = info.status === "available";
                    const isSelected = info.date === selectedDate;
                    return (
                      <button
                        key={info.date}
                        disabled={!isAvailable}
                        onClick={() => { setSelectedDate(info.date); setSelectedTime(""); }}
                        style={{
                          aspectRatio: "1",
                          borderRadius: 8,
                          border: isSelected ? "2px solid #ff5a00" : "2px solid transparent",
                          background: isSelected ? "rgba(255,90,0,0.15)" : isAvailable ? "rgba(255,255,255,0.03)" : "transparent",
                          color: isSelected ? "#ff5a00" : isAvailable ? "#e0e0e0" : "#333",
                          cursor: isAvailable ? "pointer" : "not-allowed",
                          fontSize: 13, fontWeight: isSelected ? 700 : 400,
                          position: "relative",
                          transition: "all 0.15s",
                        }}
                      >
                        {d}
                        {info.bookingCount > 0 && isAvailable && (
                          <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#ff5a00" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                  {[
                    { color: "rgba(255,90,0,0.15)", label: "Selected" },
                    { color: "rgba(255,255,255,0.03)", label: "Available" },
                    { color: "transparent", label: "Unavailable" },
                  ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: "1px solid #333" }} />
                      <span style={{ fontSize: 11, color: "#555" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedDate && (
                <p style={{ marginTop: 16, fontSize: 13, color: "#ff5a00" }}>
                  Selected: {formatDateDisplay(selectedDate)}
                </p>
              )}
            </div>
          )}

          {/* Step: Time */}
          {step === "time" && (
            <div>
              <h2 style={sh2}>Select a time</h2>
              <p style={sp}>{formatDateDisplay(selectedDate)} · {duration} min session</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10, marginTop: 24 }}>
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    style={{
                      padding: "12px 8px",
                      borderRadius: 8,
                      border: `1px solid ${selectedTime === slot.time ? "#ff5a00" : slot.available ? "#2a2a2a" : "#1a1a1a"}`,
                      background: selectedTime === slot.time ? "rgba(255,90,0,0.12)" : slot.available ? "#111" : "transparent",
                      color: selectedTime === slot.time ? "#ff5a00" : slot.available ? "#e0e0e0" : "#333",
                      cursor: slot.available ? "pointer" : "not-allowed",
                      fontSize: 13, fontWeight: selectedTime === slot.time ? 700 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {slot.displayTime}
                  </button>
                ))}
              </div>
              {slots.length === 0 && (
                <p style={{ color: "#555", fontSize: 14, marginTop: 24 }}>No slots available for this date. Please select another date.</p>
              )}
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div>
              <h2 style={sh2}>Your details</h2>
              <p style={sp}>Tell us about yourself and your project.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
                {[
                  { key: "name", label: "Full name *", placeholder: "Jane Smith", type: "text" },
                  { key: "email", label: "Email address *", placeholder: "jane@company.com", type: "email" },
                  { key: "phone", label: "Phone number *", placeholder: "+1 555 000 0000", type: "tel" },
                  { key: "company", label: "Company", placeholder: "Your Studio", type: "text" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: "#666", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={details[key as keyof typeof details]}
                      onChange={(e) => setDetails((d) => ({ ...d, [key]: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: "#666", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Project details</label>
                  <textarea
                    placeholder="Briefly describe your project goals, scope, and any key context..."
                    value={details.projectDetails}
                    onChange={(e) => setDetails((d) => ({ ...d, projectDetails: e.target.value }))}
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div>
              <h2 style={sh2}>Review your booking</h2>
              <p style={sp}>Confirm the details before we lock in your session.</p>
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 28, marginTop: 24, display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Service", value: selectedServiceObj?.title ?? "—" },
                  { label: "Appointment", value: selectedTypeObj?.name ?? "—" },
                  { label: "Duration", value: `${duration} minutes` },
                  { label: "Date", value: formatDateDisplay(selectedDate) },
                  { label: "Time", value: `${formatDisplayTime(selectedTime)} → ${formatDisplayTime(computeEndTime(selectedTime, duration))}` },
                  { label: "Timezone", value: bookingSettings.timezone },
                  { label: "Name", value: details.name },
                  { label: "Email", value: details.email },
                  { label: "Phone", value: details.phone },
                  { label: "Company", value: details.company || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
                    <span style={{ fontSize: 11, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" } as React.CSSProperties}>{label}</span>
                    <span style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value}</span>
                  </div>
                ))}
                {details.projectDetails && (
                  <div style={{ padding: "12px 0" }}>
                    <span style={{ fontSize: 11, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Project details</span>
                    <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>{details.projectDetails}</p>
                  </div>
                )}
              </div>
              {errors.length > 0 && (
                <div style={{ marginTop: 16, background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.2)", borderRadius: 8, padding: 16 }}>
                  {errors.map((e) => <p key={e} style={{ color: "#f85149", fontSize: 13, margin: "2px 0" }}>✕ {e}</p>)}
                </div>
              )}
            </div>
          )}

          {/* Step: Confirmation */}
          {step === "confirmation" && confirmedBooking && (
            <div style={{ textAlign: "center", paddingTop: 40 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
                ✓
              </div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
                Booking confirmed
              </h1>
              <p style={{ color: "#666", fontSize: 16, marginBottom: 32 }}>
                Your session has been requested. We will confirm within 24 hours.
              </p>
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 28, maxWidth: 440, margin: "0 auto 32px", textAlign: "left" }}>
                <p style={{ fontSize: 12, color: "#ff5a00", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>Booking reference</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 20 }}>{confirmedBooking.bookingRef}</p>
                {[
                  { label: "Date", value: formatDateDisplay(confirmedBooking.date) },
                  { label: "Time", value: `${formatDisplayTime(confirmedBooking.time)} → ${formatDisplayTime(computeEndTime(confirmedBooking.time, confirmedBooking.duration ?? 60))}` },
                  { label: "Type", value: confirmedBooking.type },
                  { label: "Status", value: "Pending confirmation" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a" }}>
                    <span style={{ fontSize: 11, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                    <span style={{ fontSize: 13, color: "#e0e0e0" }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/client/appointments" style={{ ...btnPrimary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  Manage bookings
                </Link>
                <Link to="/" style={{ ...btnSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  Back to home
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step !== "confirmation" && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid #1a1a1a" }}>
              {step !== "service" ? (
                <button onClick={goBack} style={btnSecondary}>← Back</button>
              ) : (
                <div />
              )}
              {step === "review" ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Booking…" : "Confirm booking →"}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  style={{ ...btnPrimary, opacity: canGoNext() ? 1 : 0.4 }}
                >
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ── Shared micro-styles ────────────────────────────────────────────────────

const sh2: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 24,
  fontWeight: 700,
  color: "#fff",
  marginBottom: 8,
};

const sp: React.CSSProperties = {
  fontSize: 14,
  color: "#666",
  marginBottom: 0,
};

const serviceCard: React.CSSProperties = {
  background: "#111",
  border: "1px solid #222",
  borderRadius: 10,
  padding: "16px 20px",
  cursor: "pointer",
  textAlign: "left",
  transition: "border-color 0.15s, background 0.15s",
  width: "100%",
};

const navBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#aaa",
  fontSize: 22,
  padding: "4px 12px",
  borderRadius: 6,
  lineHeight: 1,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  padding: "12px 14px",
  color: "#e0e0e0",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif",
};

const btnPrimary: React.CSSProperties = {
  background: "#ff5a00",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 28px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Space Grotesk', sans-serif",
  letterSpacing: "0.04em",
  transition: "opacity 0.15s",
};

const btnSecondary: React.CSSProperties = {
  background: "none",
  color: "#aaa",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
};
