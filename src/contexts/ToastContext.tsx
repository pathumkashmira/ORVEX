import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastAPI {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

interface ToastCtx {
  toasts: Toast[];
  toast: ToastAPI;
  dismiss: (id: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const ICON = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const CLR = {
  success: { icon: "#3fb950", border: "rgba(63,185,80,0.35)" },
  error:   { icon: "#f85149", border: "rgba(248,81,73,0.35)" },
  warning: { icon: "#d29922", border: "rgba(210,153,34,0.35)" },
  info:    { icon: "#58a6ff", border: "rgba(88,166,255,0.35)" },
};

export function ToastContainer() {
  const ctx = useContext(Ctx);
  if (!ctx || ctx.toasts.length === 0) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column-reverse", gap: 8, pointerEvents: "none" }}>
      {ctx.toasts.map((t) => {
        const Icon = ICON[t.type];
        const c = CLR[t.type];
        return (
          <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#161b22", border: `1px solid ${c.border}`, borderRadius: 8, padding: "14px 16px", minWidth: 280, maxWidth: 380, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", pointerEvents: "all", animation: "toast-slide 0.25s ease" }}>
            <Icon size={16} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", margin: 0, lineHeight: 1.4 }}>{t.title}</p>
              {t.message && <p style={{ fontSize: 12, color: "#7d8590", margin: "3px 0 0", lineHeight: 1.4 }}>{t.message}</p>}
            </div>
            <button onClick={() => ctx.dismiss(t.id)} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", padding: 2, flexShrink: 0, display: "flex" }}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((p) => [...p, { id, type, title, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const toast: ToastAPI = {
    success: (t, m) => add("success", t, m),
    error:   (t, m) => add("error",   t, m),
    warning: (t, m) => add("warning", t, m),
    info:    (t, m) => add("info",    t, m),
  };

  return <Ctx.Provider value={{ toasts, toast, dismiss }}>{children}</Ctx.Provider>;
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
