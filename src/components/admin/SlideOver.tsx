import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "md" | "lg" | "xl";
  footer?: ReactNode;
}

const WIDTHS = { md: 480, lg: 600, xl: 720 };

export default function SlideOver({ open, onClose, title, subtitle, children, width = "md", footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const w = WIDTHS[width];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 800 }} onClick={onClose} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: w, maxWidth: "100vw", background: "#161b22", borderLeft: "1px solid #30363d", zIndex: 801, display: "flex", flexDirection: "column", animation: "slideover-in 0.28s cubic-bezier(0.16,1,0.3,1)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3", margin: 0 }}>{title}</p>
            {subtitle && <p style={{ fontSize: 12, color: "#7d8590", margin: "3px 0 0" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", padding: 6, display: "flex", borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #21262d", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
