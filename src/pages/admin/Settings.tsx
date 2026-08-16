import { useState } from "react";
import { Save, AlertTriangle, RotateCcw } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { SystemSettings } from "@/contexts/AdminContext";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: value ? "#ff5a00" : "#30363d",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: value ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

export default function AdminSettings() {
  const ctx = useAdmin();
  const { toast } = useToast(); const success = toast.success;
  const [form, setForm] = useState<SystemSettings>({ ...ctx.settings });
  const [resetOpen, setResetOpen] = useState(false);

  const set = <K extends keyof SystemSettings>(k: K, v: SystemSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    ctx.updateSettings(form);
    success("Settings saved successfully.");
  };

  const handleReset = () => {
    ctx.resetStore();
    success("Admin store has been reset to defaults.");
    setResetOpen(false);
  };

  return (
    <AdminLayout>
      <div className="admin-page" style={{ maxWidth: 860 }}>
        <div className="admin-page-header">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#484f58", textTransform: "uppercase", marginBottom: 4 }}>SYSTEM</p>
            <h1 className="admin-heading">Settings</h1>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleSave}>
            <Save size={14} /> Save Changes
          </button>
        </div>

        {/* Maintenance mode banner */}
        {form.maintenanceMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(210,153,34,0.1)", border: "1px solid rgba(210,153,34,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 24 }}>
            <AlertTriangle size={16} color="#d29922" />
            <p style={{ fontSize: 13, color: "#d29922", fontWeight: 500 }}>Maintenance Mode is active. The public-facing site is currently unavailable to visitors.</p>
          </div>
        )}

        {/* Studio Info */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #21262d" }}>Studio Info</p>
          <div className="admin-form-grid" style={{ marginBottom: 16 }}>
            <div className="admin-field">
              <label className="admin-field-label">Studio Name</label>
              <input className="admin-input" value={form.studioName} onChange={(e) => set("studioName", e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Email</label>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>
          <div className="admin-form-grid" style={{ marginBottom: 16 }}>
            <div className="admin-field">
              <label className="admin-field-label">Phone</label>
              <input className="admin-input" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Address</label>
            <textarea
              className="admin-input admin-textarea"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Financial */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #21262d" }}>Financial</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div className="admin-field">
              <label className="admin-field-label">Currency</label>
              <select className="admin-input admin-select" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Tax Rate (%)</label>
              <input
                className="admin-input"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.taxRate}
                onChange={(e) => set("taxRate", Number(e.target.value))}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Deposit (%)</label>
              <input
                className="admin-input"
                type="number"
                min={0}
                max={100}
                step={5}
                value={form.depositPercent}
                onChange={(e) => set("depositPercent", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Localization */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #21262d" }}>Localization</p>
          <div style={{ maxWidth: 320 }}>
            <div className="admin-field">
              <label className="admin-field-label">Timezone</label>
              <select className="admin-input admin-select" value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #21262d" }}>Features</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {([
              { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Puts the public site into maintenance mode. Visitors will see a maintenance page." },
              { key: "emailNotifications" as const, label: "Email Notifications", desc: "Send automated email notifications for new orders, bookings, and messages." },
              { key: "bookingEnabled" as const, label: "Booking System", desc: "Allow clients to book discovery calls and consultations through the site." },
            ] as { key: keyof Pick<SystemSettings, "maintenanceMode" | "emailNotifications" | "bookingEnabled">; label: string; desc: string }[]).map((f, i, arr) => (
              <div
                key={f.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  padding: "14px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid #21262d" : "none",
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 2 }}>{f.label}</p>
                  <p style={{ fontSize: 12, color: "#7d8590" }}>{f.desc}</p>
                </div>
                <Toggle value={form[f.key]} onChange={(v) => set(f.key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ border: "1px solid rgba(248,81,73,0.3)", borderRadius: 8, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#f85149", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Danger Zone</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 4 }}>Reset Admin Store</p>
              <p style={{ fontSize: 12, color: "#7d8590" }}>Wipes all admin data and resets the store to seed defaults. This cannot be undone.</p>
            </div>
            <button className="admin-btn admin-btn-danger" onClick={() => setResetOpen(true)}>
              <RotateCcw size={13} /> Reset Store
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset Admin Store"
        description="This will delete all data and restore the store to its seed defaults. Are you absolutely sure?"
        confirmLabel="Reset Everything"
        destructive
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </AdminLayout>
  );
}
