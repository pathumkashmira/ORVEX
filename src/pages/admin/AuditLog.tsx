import { useState, useMemo } from "react";
import { Search, ScrollText } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import type { AuditEntry } from "@/contexts/AdminContext";

const ACTION_BADGE: Record<AuditEntry["action"], string> = {
  CREATE:  "admin-badge admin-badge-green",
  UPDATE:  "admin-badge admin-badge-blue",
  DELETE:  "admin-badge admin-badge-red",
  PUBLISH: "admin-badge admin-badge-orange",
  DRAFT:   "admin-badge admin-badge-gray",
  LOGIN:   "admin-badge admin-badge-cyan",
  VIEW:    "admin-badge admin-badge-purple",
};

const ACTION_LABELS: AuditEntry["action"][] = ["CREATE", "UPDATE", "DELETE", "PUBLISH", "DRAFT", "LOGIN", "VIEW"];

function formatTimestamp(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return ts;
  }
}

export default function AdminAuditLog() {
  const ctx = useAdmin();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"all" | AuditEntry["action"]>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ctx.auditLog.filter((entry) => {
      const matchSearch = !q || entry.entityName.toLowerCase().includes(q) || entry.user.toLowerCase().includes(q) || entry.entity.toLowerCase().includes(q) || entry.detail.toLowerCase().includes(q);
      const matchAction = actionFilter === "all" || entry.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [ctx.auditLog, search, actionFilter]);

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#484f58", textTransform: "uppercase", marginBottom: 4 }}>SYSTEM</p>
            <h1 className="admin-heading">Audit Log</h1>
          </div>
          <span className="admin-badge admin-badge-gray" style={{ fontSize: 12 }}>
            {ctx.auditLog.length} total entries
          </span>
        </div>

        <div className="admin-filter-bar">
          <div className="admin-search">
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-input"
              placeholder="Search entity, user, detail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-input admin-select"
            style={{ width: "auto" }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as typeof actionFilter)}
          >
            <option value="all">All Actions</option>
            {ACTION_LABELS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: "#484f58", marginLeft: "auto" }}>
            Showing {filtered.length} of {ctx.auditLog.length}
          </span>
        </div>

        <div className="admin-card admin-table-wrap">
          {filtered.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"><ScrollText size={20} color="#484f58" /></div>
              <p style={{ fontSize: 13, color: "#484f58" }}>No audit entries match your filters.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity Name</th>
                  <th>User</th>
                  <th>Timestamp</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className={ACTION_BADGE[entry.action] ?? "admin-badge admin-badge-gray"}>
                        {entry.action}
                      </span>
                    </td>
                    <td style={{ color: "#8b949e", textTransform: "capitalize" }}>{entry.entity.replace(/_/g, " ")}</td>
                    <td style={{ fontWeight: 500, color: "#e6edf3" }}>{entry.entityName}</td>
                    <td style={{ color: "#7d8590" }}>{entry.user}</td>
                    <td style={{ color: "#484f58", whiteSpace: "nowrap", fontSize: 12 }}>{formatTimestamp(entry.timestamp)}</td>
                    <td style={{ color: "#7d8590", maxWidth: 300, fontSize: 12 }}>
                      <span title={entry.detail}>{entry.detail.length > 80 ? entry.detail.slice(0, 80) + "…" : entry.detail}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
