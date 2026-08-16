import { useState } from "react";
import { User, Bell, Lock, Shield } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/contexts/ToastContext";

type Tab = "account" | "notifications" | "security";

const TABS: { key: Tab; icon: typeof User; label: string }[] = [
  { key: "account", icon: User, label: "Account" },
  { key: "notifications", icon: Bell, label: "Notifications" },
  { key: "security", icon: Lock, label: "Security" },
];

export default function ClientProfile() {
  const { user } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("account");

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [company, setCompany] = useState("Apex Brands Ltd.");
  const [phone, setPhone] = useState("+1 (415) 555-0182");
  const [timezone, setTimezone] = useState("America/New_York");

  const [notifs, setNotifs] = useState({
    projectUpdates: true,
    invoiceReady: true,
    messageReceived: true,
    appointmentReminder: true,
    deliveryReady: true,
    newsletter: false,
  });

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleAccountSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated", "Your account details have been saved.");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw) { toast.error("Current password required"); return; }
    if (newPw.length < 8) { toast.error("Password too short", "New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
    toast.success("Password changed", "Your password has been updated successfully.");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "C";

  return (
    <ClientLayout>
      <div style={{ padding: "40px 48px", maxWidth: 720 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>Client Portal</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: "#f5f7f8", lineHeight: 1.1 }}>Profile</h1>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40, padding: "24px 28px", background: "#080a0c", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 56, height: 56, background: "#ff5a00", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f7f8", marginBottom: 3 }}>{name || "Client"}</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Shield size={10} color="#10b981" />
              <p style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>Verified client</p>
              <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.1)" }} />
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Client since Aug 2026</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 1, marginBottom: 32, background: "rgba(255,255,255,0.03)" }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 0", background: tab === t.key ? "#080a0c" : "transparent",
              border: tab === t.key ? "1px solid rgba(255,255,255,0.06)" : "none",
              color: tab === t.key ? "#f5f7f8" : "rgba(255,255,255,0.3)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
            }}>
              <t.icon size={11} /> {t.label}
            </button>
          ))}
        </div>

        {/* Account tab */}
        {tab === "account" && (
          <form onSubmit={handleAccountSave}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Full name" value={name} onChange={setName} placeholder="Your full name" />
                <Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Company" value={company} onChange={setCompany} placeholder="Company name (optional)" />
                <Field label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="+1 (000) 000-0000" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <p style={labelStyle}>Timezone</p>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle as any}>
                    {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Dubai", "Australia/Sydney"].map((tz) => (
                      <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <button type="submit" style={primaryBtn}>Save changes</button>
            </div>
          </form>
        )}

        {/* Notifications tab */}
        {tab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(Object.keys(notifs) as (keyof typeof notifs)[]).map((key) => {
              const labels: Record<keyof typeof notifs, string> = {
                projectUpdates: "Project stage updates",
                invoiceReady: "New invoice ready",
                messageReceived: "New message from ORVEX",
                appointmentReminder: "Appointment reminders",
                deliveryReady: "Delivery ready notifications",
                newsletter: "ORVEX newsletter",
              };
              const descriptions: Record<keyof typeof notifs, string> = {
                projectUpdates: "Notified when your project moves to a new phase",
                invoiceReady: "Receive an email when a new invoice is issued",
                messageReceived: "Alerted when the studio sends you a message",
                appointmentReminder: "Reminders 24h and 1h before your appointment",
                deliveryReady: "Notified when your deliverables are ready for download",
                newsletter: "Occasional updates about ORVEX services and work",
              };
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#080a0c", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f7f8", marginBottom: 3 }}>{labels[key]}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{descriptions[key]}</p>
                  </div>
                  <Toggle value={notifs[key]} onChange={(v) => setNotifs((prev) => ({ ...prev, [key]: v }))} />
                </div>
              );
            })}
            <div style={{ marginTop: 20 }}>
              <button onClick={() => toast.success("Preferences saved", "Your notification settings have been updated.")} style={primaryBtn}>Save preferences</button>
            </div>
          </div>
        )}

        {/* Security tab */}
        {tab === "security" && (
          <form onSubmit={handlePasswordChange}>
            <div style={{ padding: "20px 24px", background: "#080a0c", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 16 }}>CHANGE PASSWORD</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Current password" value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="New password" value={newPw} onChange={setNewPw} type="password" placeholder="Min. 8 characters" />
                  <Field label="Confirm new password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Repeat new password" />
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 24px", background: "#080a0c", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>TWO-FACTOR AUTHENTICATION</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Add an additional layer of security to your account.</p>
              <button type="button" onClick={() => toast.info("Coming soon", "2FA setup will be available in a future update.")} style={{ ...primaryBtn, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                Enable 2FA
              </button>
            </div>
            <button type="submit" style={primaryBtn}>Update password</button>
          </form>
        )}
      </div>
    </ClientLayout>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, background: value ? "#ff5a00" : "rgba(255,255,255,0.08)",
        border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 21 : 3, width: 16, height: 16,
        background: "#fff", transition: "left 0.2s",
      }} />
    </button>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8, display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0d0f12", border: "1px solid rgba(255,255,255,0.08)",
  color: "#f5f7f8", fontSize: 13, padding: "10px 14px", outline: "none",
  fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 24px", background: "#ff5a00", border: "none", cursor: "pointer",
  color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
  fontFamily: "'Space Grotesk', sans-serif",
};
