import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { SystemSettings } from "@/contexts/AdminContext";

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? "#ff5a00" : "#30363d",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: checked ? "calc(100% - 20px)" : 4,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#21262d] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#e6edf3]">{label}</p>
        {description && <p className="text-xs text-[#7d8590] mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function AdminSettings() {
  const { settings, updateSettings, resetStore } = useAdmin();
  const { toast } = useToast();
  const [form, setForm] = useState<SystemSettings>({ ...settings });
  const [showReset, setShowReset] = useState(false);

  const set = <K extends keyof SystemSettings>(k: K, v: SystemSettings[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    updateSettings(form);
    toast.success("Settings saved");
  };

  const handleReset = () => {
    resetStore();
    toast.success("Store reset to defaults");
    setShowReset(false);
  };

  return (
    <AdminLayout>
      <div className="admin-page" style={{ maxWidth: 800 }}>
        {/* Maintenance Banner */}
        {form.maintenanceMode && (
          <div
            style={{
              background: "rgba(210,153,34,0.1)",
              border: "1px solid rgba(210,153,34,0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#d29922",
              fontSize: 14,
            }}
          >
            <span style={{ fontSize: 18 }}>⚠</span>
            <span>
              <strong>Maintenance Mode is ON.</strong> The public site is currently inaccessible to visitors.
            </span>
          </div>
        )}

        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Site Settings</h1>
            <p className="text-sm text-[#7d8590] mt-1">Studio configuration and feature flags</p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          {/* Studio Info */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Studio Info</h2>
            <div className="space-y-4">
              <div className="admin-field">
                <label className="admin-field-label">Studio Name</label>
                <input
                  className="admin-input"
                  value={form.studioName}
                  onChange={(e) => set("studioName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-field">
                  <label className="admin-field-label">Contact Email</label>
                  <input
                    className="admin-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label">Phone</label>
                  <input
                    className="admin-input"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Address</label>
                <textarea
                  className="admin-input admin-textarea"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  rows={2}
                  style={{ minHeight: 64 }}
                />
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Financial</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="admin-field">
                <label className="admin-field-label">Currency</label>
                <select
                  className="admin-input admin-select"
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Tax Rate (%)</label>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={form.taxRate}
                  onChange={(e) => set("taxRate", parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => set("depositPercent", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Localization */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Localization</h2>
            <div className="admin-field" style={{ maxWidth: 320 }}>
              <label className="admin-field-label">Timezone</label>
              <select
                className="admin-input admin-select"
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Features */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-2">Features</h2>
            <ToggleRow
              label="Maintenance Mode"
              description="Puts the public site into maintenance mode"
              checked={form.maintenanceMode}
              onChange={(v) => set("maintenanceMode", v)}
            />
            <ToggleRow
              label="Email Notifications"
              description="Send email alerts for new orders, bookings, and messages"
              checked={form.emailNotifications}
              onChange={(v) => set("emailNotifications", v)}
            />
            <ToggleRow
              label="Booking Enabled"
              description="Allow clients to book discovery calls through the site"
              checked={form.bookingEnabled}
              onChange={(v) => set("bookingEnabled", v)}
            />
          </div>

          {/* Danger Zone */}
          <div
            className="admin-card"
            style={{ border: "1px solid rgba(248,81,73,0.25)" }}
          >
            <h2 className="admin-heading-sm mb-2" style={{ color: "#f85149" }}>Danger Zone</h2>
            <p className="text-sm text-[#7d8590] mb-4">
              Destructive actions that cannot be undone. Proceed with caution.
            </p>
            <button
              className="admin-btn admin-btn-danger"
              onClick={() => setShowReset(true)}
            >
              Reset Admin Store
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={showReset}
          title="Reset Admin Store"
          description="This will permanently reset all data to factory defaults. All orders, customers, and content will be lost. Are you sure?"
          confirmLabel="Reset Everything"
          destructive
          onConfirm={handleReset}
          onCancel={() => setShowReset(false)}
        />
      </div>
    </AdminLayout>
  );
}
