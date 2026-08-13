import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onDismiss]);

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle size={15} className="text-[#3fb950] flex-shrink-0" />,
    error: <XCircle size={15} className="text-[#f85149] flex-shrink-0" />,
    warning: <AlertTriangle size={15} className="text-[#d29922] flex-shrink-0" />,
    info: <Info size={15} className="text-[#58a6ff] flex-shrink-0" />,
  };

  const accents: Record<ToastType, string> = {
    success: "border-l-[#3fb950]",
    error: "border-l-[#f85149]",
    warning: "border-l-[#d29922]",
    info: "border-l-[#58a6ff]",
  };

  return (
    <div
      className={`admin-toast border-l-2 ${accents[toast.type]}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="mt-[1px]">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#e6edf3] leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-[12px] text-[#7d8590] mt-0.5 leading-snug">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-[#7d8590] hover:text-[#e6edf3] transition-colors flex-shrink-0 ml-1"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;
  return (
    <div className="admin-toast-container" aria-label="Notifications">
      {ctx.toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={ctx.dismiss} />
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const toast = {
    success: (title: string, message?: string) => add("success", title, message),
    error: (title: string, message?: string) => add("error", title, message),
    warning: (title: string, message?: string) => add("warning", title, message),
    info: (title: string, message?: string) => add("info", title, message),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
