import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type { AppointmentType } from "@/contexts/AdminContext";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminBookingSettings() {
  const { bookingSettings, updateBookingSettings } = useAdmin();
  const { toast } = useToast();

  const [settings, setSettings] = useState({ ...bookingSettings });
  const [apptTypes, setApptTypes] = useState<AppointmentType[]>([...bookingSettings.appointmentTypes]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newHoliday, setNewHoliday] = useState("");
  const [newType, setNewType] = useState<Omit<AppointmentType, "id">>({ name: "", description: "", duration: 60, color: "#3b82f6", active: true });
  const [editingType, setEditingType] = useState<string | null>(null);

  function save() {
    updateBookingSettings({ ...settings, appointmentTypes: apptTypes });
    toast.success("Saved", "Booking settings updated");
  }

  function toggleDay(i: number) {
    const next = [...settings.workingDays];
    next[i] = !next[i];
    setSettings((s) => ({ ...s, workingDays: next }));
  }

  function addBlockedDate() {
    if (!newBlockedDate || settings.blockedDates.includes(newBlockedDate)) return;
    setSettings((s) => ({ ...s, blockedDates: [...s.blockedDates, newBlockedDate].sort() }));
    setNewBlockedDate("");
  }

  function removeBlockedDate(d: string) {
    setSettings((s) => ({ ...s, blockedDates: s.blockedDates.filter((x) => x !== d) }));
  }

  function addHoliday() {
    if (!newHoliday || settings.holidays.includes(newHoliday)) return;
    setSettings((s) => ({ ...s, holidays: [...s.holidays, newHoliday].sort() }));
    setNewHoliday("");
  }

  function removeHoliday(h: string) {
    setSettings((s) => ({ ...s, holidays: s.holidays.filter((x) => x !== h) }));
  }

  function addType() {
    if (!newType.name) return;
    const t: AppointmentType = { ...newType, id: `apt-${Date.now()}` };
    setApptTypes((prev) => [...prev, t]);
    setNewType({ name: "", description: "", duration: 60, color: "#3b82f6", active: true });
  }

  function editTypeField(id: string, field: keyof AppointmentType, value: unknown) {
    setApptTypes((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  }

  function deleteType(id: string) {
    setApptTypes((prev) => prev.filter((t) => t.id !== id));
  }

  const TIMEZONES = [
    "America/Los_Angeles", "America/New_York", "America/Chicago", "America/Denver",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Tokyo",
    "Asia/Singapore", "Australia/Sydney", "UTC",
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#e6edf3", marginBottom: 4 }}>Booking Settings</h1>
            <p style={{ color: "#484f58", fontSize: 13 }}>Configure scheduling rules, working hours, and appointment types</p>
          </div>
          <button className="btn-primary" onClick={save}>Save changes</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Working days */}
          <Section title="Working days">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  style={{
                    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${settings.workingDays[i] ? "#ff5a00" : "#21262d"}`,
                    background: settings.workingDays[i] ? "rgba(255,90,0,0.1)" : "transparent",
                    color: settings.workingDays[i] ? "#ff5a00" : "#484f58",
                    transition: "all 0.15s",
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </Section>

          {/* Working hours */}
          <Section title="Working hours">
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <label className="form-label">Start time</label>
                <input type="time" className="form-input" value={settings.workingHoursStart} onChange={(e) => setSettings((s) => ({ ...s, workingHoursStart: e.target.value }))} style={{ width: 160 }} />
              </div>
              <div>
                <label className="form-label">End time</label>
                <input type="time" className="form-input" value={settings.workingHoursEnd} onChange={(e) => setSettings((s) => ({ ...s, workingHoursEnd: e.target.value }))} style={{ width: 160 }} />
              </div>
              <div>
                <label className="form-label">Timezone</label>
                <select className="form-input" value={settings.timezone} onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))} style={{ width: 240 }}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>
          </Section>

          {/* Durations & buffer */}
          <Section title="Session rules">
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <label className="form-label">Default duration (min)</label>
                <select className="form-input" value={settings.defaultDuration} onChange={(e) => setSettings((s) => ({ ...s, defaultDuration: Number(e.target.value) }))} style={{ width: 160 }}>
                  {[15,30,45,60,90,120].map((v) => <option key={v} value={v}>{v} min</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Buffer between sessions</label>
                <select className="form-input" value={settings.bufferTime} onChange={(e) => setSettings((s) => ({ ...s, bufferTime: Number(e.target.value) }))} style={{ width: 160 }}>
                  {[0,5,10,15,20,30].map((v) => <option key={v} value={v}>{v} min</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Minimum notice (hours)</label>
                <input type="number" className="form-input" min={0} max={168} value={settings.minimumNoticeHours} onChange={(e) => setSettings((s) => ({ ...s, minimumNoticeHours: Number(e.target.value) }))} style={{ width: 120 }} />
              </div>
              <div>
                <label className="form-label">Maximum advance (days)</label>
                <input type="number" className="form-input" min={1} max={365} value={settings.maximumAdvanceDays} onChange={(e) => setSettings((s) => ({ ...s, maximumAdvanceDays: Number(e.target.value) }))} style={{ width: 120 }} />
              </div>
            </div>
          </Section>

          {/* Blocked dates */}
          <Section title="Blocked dates">
            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-end" }}>
              <div>
                <label className="form-label">Add blocked date</label>
                <input type="date" className="form-input" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} style={{ width: 180 }} />
              </div>
              <button className="btn-secondary" onClick={addBlockedDate}>Add</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {settings.blockedDates.length === 0 && <span style={{ fontSize: 13, color: "#484f58" }}>No blocked dates</span>}
              {settings.blockedDates.map((d) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1c2128", border: "1px solid #21262d", borderRadius: 6, padding: "4px 10px" }}>
                  <span style={{ fontSize: 12, color: "#8b949e" }}>{d}</span>
                  <button onClick={() => removeBlockedDate(d)} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          </Section>

          {/* Holidays */}
          <Section title="Holidays">
            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-end" }}>
              <div>
                <label className="form-label">Add holiday</label>
                <input type="date" className="form-input" value={newHoliday} onChange={(e) => setNewHoliday(e.target.value)} style={{ width: 180 }} />
              </div>
              <button className="btn-secondary" onClick={addHoliday}>Add</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {settings.holidays.length === 0 && <span style={{ fontSize: 13, color: "#484f58" }}>No holidays configured</span>}
              {settings.holidays.map((h) => (
                <div key={h} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1c2128", border: "1px solid #21262d", borderRadius: 6, padding: "4px 10px" }}>
                  <span style={{ fontSize: 12, color: "#8b949e" }}>{h}</span>
                  <button onClick={() => removeHoliday(h)} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          </Section>

          {/* Appointment types */}
          <Section title="Appointment types">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {apptTypes.map((t) => (
                <div key={t.id} style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
                  {editingType === t.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <label className="form-label">Name</label>
                          <input className="form-input" value={t.name} onChange={(e) => editTypeField(t.id, "name", e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Duration (min)</label>
                          <select className="form-input" value={t.duration} onChange={(e) => editTypeField(t.id, "duration", Number(e.target.value))} style={{ width: 120 }}>
                            {[15,30,45,60,90,120].map((v) => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Color</label>
                          <input type="color" value={t.color} onChange={(e) => editTypeField(t.id, "color", e.target.value)} style={{ width: 50, height: 38, padding: 4, borderRadius: 6, border: "1px solid #21262d", background: "#161b22", cursor: "pointer" }} />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Description</label>
                        <input className="form-input" value={t.description} onChange={(e) => editTypeField(t.id, "description", e.target.value)} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-primary" style={{ fontSize: 12, padding: "6px 16px" }} onClick={() => setEditingType(null)}>Done</button>
                        <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 16px", color: "#f85149" }} onClick={() => deleteType(t.id)}>Delete</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{t.name}</p>
                          <p style={{ fontSize: 11, color: "#484f58" }}>{t.duration} min · {t.description}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          onClick={() => editTypeField(t.id, "active", !t.active)}
                          style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: t.active ? "rgba(16,185,129,0.12)" : "#1c2128", color: t.active ? "#10b981" : "#484f58", fontWeight: 600 }}
                        >
                          {t.active ? "Active" : "Inactive"}
                        </button>
                        <button onClick={() => setEditingType(t.id)} className="btn-secondary" style={{ fontSize: 11, padding: "4px 12px" }}>Edit</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add new type */}
            <div style={{ background: "#1c2128", border: "1px dashed #30363d", borderRadius: 8, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#484f58", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Add appointment type</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label className="form-label">Name</label>
                  <input className="form-input" placeholder="e.g. Strategy Call" value={newType.name} onChange={(e) => setNewType((n) => ({ ...n, name: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Duration</label>
                  <select className="form-input" value={newType.duration} onChange={(e) => setNewType((n) => ({ ...n, duration: Number(e.target.value) }))} style={{ width: 110 }}>
                    {[15,30,45,60,90,120].map((v) => <option key={v} value={v}>{v} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Color</label>
                  <input type="color" value={newType.color} onChange={(e) => setNewType((n) => ({ ...n, color: e.target.value }))} style={{ width: 50, height: 38, padding: 4, borderRadius: 6, border: "1px solid #21262d", background: "#161b22", cursor: "pointer" }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Brief description of this session type" value={newType.description} onChange={(e) => setNewType((n) => ({ ...n, description: e.target.value }))} />
              </div>
              <button className="btn-primary" style={{ fontSize: 12, padding: "8px 20px" }} onClick={addType} disabled={!newType.name}>+ Add type</button>
            </div>
          </Section>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
            <button className="btn-primary" onClick={save} style={{ padding: "12px 32px" }}>Save all changes</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 10, padding: 24 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3", marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
      {children}
    </div>
  );
}
