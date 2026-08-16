import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, ChevronRight, ChevronLeft, LayoutGrid, List } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Lead } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

const STAGES: Lead["stage"][] = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const SOURCES: Lead["source"][] = ["website", "referral", "social", "email", "other"];

const STAGE_LABELS: Record<Lead["stage"], string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

const STAGE_BADGE: Record<Lead["stage"], string> = {
  new: "admin-badge-blue",
  contacted: "admin-badge-yellow",
  qualified: "admin-badge-orange",
  proposal: "admin-badge-purple",
  won: "admin-badge-green",
  lost: "admin-badge-red",
};

const KANBAN_COLORS: Record<Lead["stage"], string> = {
  new: "#58a6ff",
  contacted: "#e3b341",
  qualified: "#f0883e",
  proposal: "#bc8cff",
  won: "#3fb950",
  lost: "#f85149",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  phone: "",
  source: "website" as Lead["source"],
  stage: "new" as Lead["stage"],
  value: 0,
  notes: "",
  assignedTo: "Admin",
};

type FormState = typeof EMPTY_FORM;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminLeads() {
  const { leads, leads_ } = useAdmin();
  const { toast } = useToast();

  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  const filtered = useMemo(() => {
    let list = [...leads];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [leads, search]);

  const kanbanGroups = useMemo(() => {
    return STAGES.map((stage) => ({
      stage,
      items: leads.filter((l) => l.stage === stage),
    }));
  }, [leads]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(l: Lead) {
    setEditing(l);
    setForm({ name: l.name, email: l.email, company: l.company, phone: l.phone, source: l.source, stage: l.stage, value: l.value, notes: l.notes, assignedTo: l.assignedTo });
    setShowForm(true);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    const now = new Date().toISOString().slice(0, 10);
    if (editing) {
      leads_.edit(editing.id, { ...form, updatedAt: now });
      toast.success("Lead updated");
    } else {
      const item: Lead = { id: genId(), ...form, createdAt: now, updatedAt: now };
      leads_.add(item);
      toast.success("Lead created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    leads_.del(confirmDelete.id);
    toast.success(`Lead "${confirmDelete.name}" deleted`);
    setConfirmDelete({ open: false, id: "", name: "" });
  }

  function moveStage(l: Lead, direction: "forward" | "back") {
    const idx = STAGES.indexOf(l.stage);
    const next = direction === "forward" ? STAGES[idx + 1] : STAGES[idx - 1];
    if (!next) return;
    leads_.edit(l.id, { stage: next, updatedAt: new Date().toISOString().slice(0, 10) });
    toast.success(`${l.name} moved to ${STAGE_LABELS[next]}`);
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Leads</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {leads.length} total leads
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", background: "#161b22", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
              <button
                style={{ padding: "7px 12px", background: view === "table" ? "#21262d" : "transparent", border: "none", color: view === "table" ? "#e6edf3" : "#7d8590", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                onClick={() => setView("table")}
              >
                <List size={14} /> Table
              </button>
              <button
                style={{ padding: "7px 12px", background: view === "kanban" ? "#21262d" : "transparent", border: "none", color: view === "kanban" ? "#e6edf3" : "#7d8590", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                onClick={() => setView("kanban")}
              >
                <LayoutGrid size={14} /> Kanban
              </button>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>
              <Plus size={14} style={{ marginRight: 6 }} />
              New Lead
            </button>
          </div>
        </div>

        <div className="admin-filter-bar">
          <div style={{ position: "relative" }}>
            <span className="admin-search-icon">
              <Search size={14} />
            </span>
            <input
              className="admin-search"
              placeholder="Search leads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {view === "table" && (
          <div className="admin-card admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Stage</th>
                  <th>Value</th>
                  <th>Source</th>
                  <th>Assigned To</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="admin-empty">No leads found</div>
                    </td>
                  </tr>
                )}
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#e6edf3" }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: "#7d8590" }}>{l.email}</div>
                    </td>
                    <td style={{ color: "#c9d1d9", fontSize: 13 }}>{l.company || "—"}</td>
                    <td><span className={`admin-badge ${STAGE_BADGE[l.stage]}`}>{STAGE_LABELS[l.stage]}</span></td>
                    <td style={{ fontWeight: 700, color: "#e6edf3" }}>{l.value ? formatCurrency(l.value) : "—"}</td>
                    <td style={{ fontSize: 12, color: "#7d8590", textTransform: "capitalize" }}>{l.source}</td>
                    <td style={{ fontSize: 13, color: "#c9d1d9" }}>{l.assignedTo}</td>
                    <td style={{ fontSize: 12, color: "#7d8590", whiteSpace: "nowrap" }}>{formatDate(l.updatedAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(l)} title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setConfirmDelete({ open: true, id: l.id, name: l.name })}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "kanban" && (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {kanbanGroups.map(({ stage, items }) => (
              <div key={stage} style={{ flex: "0 0 220px", minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: KANBAN_COLORS[stage] }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{STAGE_LABELS[stage]}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#7d8590", background: "#21262d", borderRadius: 10, padding: "1px 7px" }}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((l) => {
                    const stageIdx = STAGES.indexOf(l.stage);
                    return (
                      <div key={l.id} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#e6edf3", fontSize: 13, marginBottom: 2 }}>{l.name}</div>
                        <div style={{ fontSize: 12, color: "#7d8590", marginBottom: 8 }}>{l.company}</div>
                        {l.value > 0 && (
                          <div style={{ fontSize: 13, fontWeight: 700, color: KANBAN_COLORS[stage], marginBottom: 10 }}>{formatCurrency(l.value)}</div>
                        )}
                        <div style={{ display: "flex", gap: 4 }}>
                          {stageIdx > 0 && (
                            <button
                              style={{ flex: 1, fontSize: 11, padding: "3px 0", background: "#0d1117", border: "1px solid #30363d", borderRadius: 4, color: "#7d8590", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}
                              onClick={() => moveStage(l, "back")}
                            >
                              <ChevronLeft size={10} /> Back
                            </button>
                          )}
                          {stageIdx < STAGES.length - 1 && (
                            <button
                              style={{ flex: 1, fontSize: 11, padding: "3px 0", background: "#0d1117", border: "1px solid #30363d", borderRadius: 4, color: "#58a6ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}
                              onClick={() => moveStage(l, "forward")}
                            >
                              Forward <ChevronRight size={10} />
                            </button>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                          <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => openEdit(l)}>
                            <Edit2 size={10} />
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            style={{ flex: 1, justifyContent: "center" }}
                            onClick={() => setConfirmDelete({ open: true, id: l.id, name: l.name })}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <div style={{ border: "1px dashed #21262d", borderRadius: 8, padding: "16px 12px", textAlign: "center", color: "#484f58", fontSize: 12 }}>
                      No leads
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Lead" : "New Lead"}
        subtitle={editing ? editing.company : "Add a new lead"}
        width="lg"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Lead"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Name *</label>
              <input className="admin-input" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full name" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Email *</label>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Company</label>
              <input className="admin-input" value={form.company} onChange={(e) => setField("company", e.target.value)} placeholder="Company name" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Phone</label>
              <input className="admin-input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Source</label>
              <select className="admin-select" value={form.source} onChange={(e) => setField("source", e.target.value as Lead["source"])}>
                {SOURCES.map((s) => <option key={s} value={s} style={{ textTransform: "capitalize" }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Stage</label>
              <select className="admin-select" value={form.stage} onChange={(e) => setField("stage", e.target.value as Lead["stage"])}>
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Value (USD)</label>
              <input className="admin-input" type="number" min={0} value={form.value} onChange={(e) => setField("value", Number(e.target.value))} placeholder="0" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Assigned To</label>
              <input className="admin-input" value={form.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)} placeholder="Admin" />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Notes</label>
            <textarea className="admin-textarea" rows={4} value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Lead notes, context, requirements…" />
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Lead"
        description={`Are you sure you want to delete lead "${confirmDelete.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", name: "" })}
      />
    </AdminLayout>
  );
}
