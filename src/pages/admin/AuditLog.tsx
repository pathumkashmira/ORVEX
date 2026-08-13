import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { AuditEntry } from "@/contexts/AdminContext";

type ActionFilter =
  | "ALL"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "DRAFT"
  | "LOGIN"
  | "VIEW";

type EntityFilter =
  | "ALL"
  | "PROJECT"
  | "ORDER"
  | "BOOKING"
  | "CUSTOMER"
  | "INVOICE"
  | "JOURNAL"
  | "MEDIA"
  | "USER"
  | "SETTINGS"
  | "SEO";

const ACTION_FILTERS: ActionFilter[] = [
  "ALL", "CREATE", "UPDATE", "DELETE", "PUBLISH", "DRAFT", "LOGIN", "VIEW",
];

const ENTITY_FILTERS: EntityFilter[] = [
  "ALL", "PROJECT", "ORDER", "BOOKING", "CUSTOMER", "INVOICE",
  "JOURNAL", "MEDIA", "USER", "SETTINGS", "SEO",
];

const ACTION_COLORS: Record<string, string> = {
  CREATE:  "#3fb950",
  UPDATE:  "#58a6ff",
  DELETE:  "#f85149",
  PUBLISH: "#ff5a00",
  DRAFT:   "#7d8590",
  LOGIN:   "#a371f7",
  VIEW:    "#7d8590",
};

const ACTION_BADGE_CLASSES: Record<string, string> = {
  CREATE:  "admin-badge admin-badge-green",
  UPDATE:  "admin-badge admin-badge-blue",
  DELETE:  "admin-badge admin-badge-red",
  PUBLISH: "admin-badge admin-badge-orange",
  DRAFT:   "admin-badge admin-badge-gray",
  LOGIN:   "admin-badge admin-badge-purple",
  VIEW:    "admin-badge admin-badge-gray",
};

const PAGE_SIZE = 50;

function formatTimestamp(ts: string) {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function TimelineItem({ entry, isLast }: { entry: AuditEntry; isLast: boolean }) {
  const dotColor = ACTION_COLORS[entry.action] ?? "#7d8590";
  const badgeClass = ACTION_BADGE_CLASSES[entry.action] ?? "admin-badge admin-badge-gray";
  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      {/* Dot + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
            marginTop: 4,
            boxShadow: `0 0 6px ${dotColor}66`,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 20,
              background: "#21262d",
              marginTop: 4,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
          <span className={badgeClass}>{entry.action}</span>
          <span style={{ fontSize: 12, color: "#7d8590" }}>{formatTimestamp(entry.timestamp)}</span>
        </div>
        <p style={{ fontSize: 13, color: "#e6edf3", margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: "#e6edf3" }}>{entry.userName}</strong>
          {" "}
          <span style={{ color: "#7d8590" }}>{entry.action.toLowerCase()}</span>
          {" "}
          <span style={{ color: "#7d8590" }}>{entry.entity}</span>
          {" "}
          <span
            style={{
              color: "#ff8c42",
              background: "rgba(255,90,0,0.08)",
              borderRadius: 4,
              padding: "1px 5px",
              fontSize: 12,
            }}
          >
            {entry.entityName}
          </span>
        </p>
        {entry.details && (
          <p style={{ fontSize: 12, color: "#7d8590", margin: "4px 0 0", fontStyle: "italic" }}>
            {entry.details}
          </p>
        )}
      </div>
    </div>
  );
}

function downloadCSV(entries: AuditEntry[]) {
  const header = ["id", "timestamp", "userName", "action", "entity", "entityId", "entityName", "details"];
  const rows = entries.map((e) =>
    [e.id, e.timestamp, e.userName, e.action, e.entity, e.entityId, e.entityName, e.details ?? ""]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAuditLog() {
  const { auditLog } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("ALL");
  const [page, setPage] = useState(0);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const filtered = useMemo(() => {
    let list = [...auditLog];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.entityName.toLowerCase().includes(q) ||
          e.userName.toLowerCase().includes(q) ||
          (e.details ?? "").toLowerCase().includes(q)
      );
    }
    if (actionFilter !== "ALL") {
      list = list.filter((e) => e.action === actionFilter);
    }
    if (entityFilter !== "ALL") {
      list = list.filter((e) => e.entity.toUpperCase() === entityFilter);
    }
    return list;
  }, [auditLog, search, actionFilter, entityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleExport = () => {
    downloadCSV(filtered);
    toast.success("Export ready — feature coming soon");
  };

  const handleClearConfirm = () => {
    setShowClearDialog(false);
    toast.info("Clear log feature restricted to super admins");
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="admin-heading">Audit Log</h1>
            <span className="admin-badge admin-badge-gray">{auditLog.length} entries</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="admin-btn admin-btn-danger admin-btn-sm"
              onClick={() => setShowClearDialog(true)}
            >
              Clear Log
            </button>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={handleExport}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 24,
            alignItems: "center",
          }}
        >
          <input
            className="admin-input"
            style={{ maxWidth: 260 }}
            placeholder="Search user or entity…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <select
            className="admin-input admin-select"
            style={{ maxWidth: 160 }}
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value as ActionFilter); setPage(0); }}
          >
            {ACTION_FILTERS.map((a) => (
              <option key={a} value={a}>{a === "ALL" ? "All Actions" : a}</option>
            ))}
          </select>
          <select
            className="admin-input admin-select"
            style={{ maxWidth: 160 }}
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value as EntityFilter); setPage(0); }}
          >
            {ENTITY_FILTERS.map((e) => (
              <option key={e} value={e}>{e === "ALL" ? "All Entities" : e}</option>
            ))}
          </select>
          <span style={{ fontSize: 13, color: "#7d8590", marginLeft: "auto" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Timeline */}
        <div className="admin-card">
          {pageItems.length === 0 ? (
            <p className="text-sm text-[#7d8590] py-4 text-center">No entries match your filters.</p>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {pageItems.map((entry, idx) => (
                <TimelineItem
                  key={entry.id}
                  entry={entry}
                  isLast={idx === pageItems.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: "#7d8590" }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}

        <ConfirmDialog
          open={showClearDialog}
          title="Clear Audit Log"
          description="This will permanently delete all audit entries. This action cannot be undone."
          confirmLabel="Clear Log"
          destructive
          onConfirm={handleClearConfirm}
          onCancel={() => setShowClearDialog(false)}
        />
      </div>
    </AdminLayout>
  );
}
