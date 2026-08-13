import { useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div className="admin-dialog-backdrop" onClick={onCancel}>
      <div
        className="admin-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              destructive ? "bg-[#f85149]/10" : "bg-[#d29922]/10"
            }`}
          >
            {destructive ? (
              <Trash2 size={16} className="text-[#f85149]" />
            ) : (
              <AlertTriangle size={16} className="text-[#d29922]" />
            )}
          </div>
          <div>
            <h3 id="confirm-title" className="admin-heading-sm mb-1">
              {title}
            </h3>
            <p className="admin-body-sm text-[#7d8590]">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="admin-btn admin-btn-ghost"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`admin-btn ${destructive ? "admin-btn-danger" : "admin-btn-primary"}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="admin-spinner" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
