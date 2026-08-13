import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg" | "xl";
}

const widths = { md: "480px", lg: "600px", xl: "780px" };

export default function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "lg",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="admin-slideover-backdrop"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="admin-slideover"
        style={{
          width: widths[width],
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slideover-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#30363d]">
          <div>
            <h2 id="slideover-title" className="admin-heading-sm">
              {title}
            </h2>
            {subtitle && <p className="admin-body-sm text-[#7d8590] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d] rounded transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#30363d] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
