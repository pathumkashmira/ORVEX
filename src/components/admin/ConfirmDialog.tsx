import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", destructive, onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }} onClick={onCancel}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 24, maxWidth: 420, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: destructive ? "rgba(248,81,73,0.12)" : "rgba(88,166,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={18} style={{ color: destructive ? "#f85149" : "#58a6ff" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3", margin: "0 0 6px" }}>{title}</p>
            <p style={{ fontSize: 13, color: "#7d8590", margin: 0, lineHeight: 1.5 }}>{description}</p>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", padding: 4, display: "flex", flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="admin-btn admin-btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className={`admin-btn ${destructive ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
