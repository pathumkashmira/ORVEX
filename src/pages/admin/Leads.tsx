import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  ChevronLeft,
  Users,
  X,
  DollarSign,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin, type Lead } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";

// ── constants ──────────────────────────────────────────────────────────

const STAGES: Lead["stage"][] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
];

const STAGE_LABELS: Record<Lead["stage"], string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

function stageBadgeClass(stage: Lead["stage"]): string {
  switch (stage) {
    case "new":
      return "admin-badge admin-badge-blue";
    case "contacted":
      return "admin-badge admin-badge-yellow";
    case "qualified":
      return "admin-badge admin-badge-orange";
    case "proposal":
      return "admin-badge admin-badge-blue";
    case "won":
      return "admin-badge admin-badge-green";
    case "lost":
      return "admin-badge admin-badge-gray";
    default:
      return "admin-badge admin-badge-gray";
  }
}

function stageColumnColor(stage: Lead["stage"]): string {
  switch (stage) {
    case "new":
      return "border-blue-500/30";
    case "contacted":
      return "border-yellow-500/30";
    case "qualified":
      return "border-orange-500/30";
    case "proposal":
      return "border-purple-500/30";
    case "won":
      return "border-emerald-500/30";
    case "lost":
      return "border-[#30363d]";
    default:
      return "border-[#30363d]";
  }
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function blankLead(): Omit<Lead, "id" | "createdAt" | "updatedAt"> {
  return {
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
    stage: "new",
    source: "",
    value: 0,
  };
}

// ── main component ────────────────────────────────────────────────────

export default function AdminLeads() {
  const { leads, leads_ } = useAdmin();
  const { toast } = useToast();

  const [view, setView] = useState<"table" | "pipeline">("table");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Lead["stage"] | "ALL">("ALL");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] =
    useState<Omit<Lead, "id" | "createdAt" | "updatedAt">>(blankLead());

  // ── derived ───────────────────────────────────────────────────────────

  const totalValue = useMemo(
    () => leads.reduce((s, l) => s + (l.value || 0), 0),
    [leads]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q);
      const matchStage = stageFilter === "ALL" || l.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [leads, search, stageFilter]);

  const leadsPerStage = useMemo(
    () =>
      STAGES.reduce(
        (acc, stage) => {
          acc[stage] = leads.filter((l) => l.stage === stage);
          return acc;
        },
        {} as Record<Lead["stage"], Lead[]>
      ),
    [leads]
  );

  // ── actions ────────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(blankLead());
    setSlideOpen(true);
  }, []);

  const openEdit = useCallback((l: Lead) => {
    setEditing(l);
    setForm({
      name: l.name,
      email: l.email,
      company: l.company,
      phone: l.phone,
      projectType: l.projectType,
      budget: l.budget,
      timeline: l.timeline,
      description: l.description,
      stage: l.stage,
      source: l.source,
      value: l.value,
    });
    setSlideOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString().slice(0, 10);
    if (editing) {
      leads_.update({ ...editing, ...form, updatedAt: now });
      toast.success("Lead updated");
    } else {
      leads_.create({
        id: newId(),
        ...form,
        createdAt: now,
        updatedAt: now,
      });
      toast.success("Lead created");
    }
    setSlideOpen(false);
  }, [editing, form, leads_, toast]);

  const handleDelete = useCallback(() => {
    if (!confirmId) return;
    setDeleting(true);
    leads_.remove(confirmId);
    toast.success("Lead deleted");
    setDeleting(false);
    setConfirmId(null);
  }, [confirmId, leads_, toast]);

  const moveStage = useCallback(
    (lead: Lead, direction: "prev" | "next") => {
      const idx = STAGES.indexOf(lead.stage);
      const newIdx = direction === "next" ? idx + 1 : idx - 1;
      if (newIdx < 0 || newIdx >= STAGES.length) return;
      const newStage = STAGES[newIdx];
      leads_.update({
        ...lead,
        stage: newStage,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      toast.info(`Lead moved to ${STAGE_LABELS[newStage]}`);
    },
    [leads_, toast]
  );

  // ── table columns ──────────────────────────────────────────────────────

  const columns: Column<Lead>[] = [
    {
      key: "name",
      label: "Name / Company",
      sortable: true,
      render: (l) => (
        <div>
          <p className="text-[#e6edf3] font-medium text-sm">{l.name}</p>
          <p className="text-[#7d8590] text-xs mt-0.5">{l.company}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (l) => (
        <div>
          <p className="text-[#7d8590] text-xs">{l.email}</p>
          {l.phone && (
            <p className="text-[#7d8590] text-xs mt-0.5">{l.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "projectType",
      label: "Project Type",
      sortable: true,
      render: (l) => (
        <span className="text-[#e6edf3] text-sm">{l.projectType || "—"}</span>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (l) => (
        <span className="text-[#7d8590] text-sm">{l.budget || "—"}</span>
      ),
    },
    {
      key: "timeline",
      label: "Timeline",
      render: (l) => (
        <span className="text-[#7d8590] text-sm">{l.timeline || "—"}</span>
      ),
    },
    {
      key: "stage",
      label: "Stage",
      sortable: true,
      render: (l) => (
        <span className={stageBadgeClass(l.stage)}>
          {STAGE_LABELS[l.stage]}
        </span>
      ),
    },
    {
      key: "value",
      label: "Value",
      sortable: true,
      render: (l) => (
        <span className="text-[#e6edf3] font-mono text-sm">
          {l.value ? `$${l.value.toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (l) => (
        <span className="text-[#7d8590] text-xs">{l.createdAt}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (l) => (
        <div className="flex items-center gap-1">
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm text-[#7d8590] hover:text-[#e6edf3]"
            title="Move back"
            onClick={(e) => {
              e.stopPropagation();
              moveStage(l, "prev");
            }}
            disabled={l.stage === STAGES[0]}
          >
            <ChevronLeft size={13} />
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm text-[#7d8590] hover:text-[#e6edf3]"
            title="Move forward"
            onClick={(e) => {
              e.stopPropagation();
              moveStage(l, "next");
            }}
            disabled={l.stage === STAGES[STAGES.length - 1]}
          >
            <ChevronRight size={13} />
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(l);
            }}
          >
            <Edit2 size={12} />
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmId(l.id);
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Leads</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[#7d8590] text-sm">
                {leads.length} lead{leads.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[#30363d]">·</span>
              <span className="text-[#ff5a00] text-sm font-mono font-medium flex items-center gap-1">
                <DollarSign size={13} />
                {totalValue.toLocaleString()} pipeline
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center border border-[#30363d] rounded overflow-hidden">
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  view === "table"
                    ? "bg-[#ff5a00] text-white"
                    : "text-[#7d8590] hover:text-[#e6edf3]"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setView("pipeline")}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  view === "pipeline"
                    ? "bg-[#ff5a00] text-white"
                    : "text-[#7d8590] hover:text-[#e6edf3]"
                }`}
              >
                Pipeline
              </button>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>
              <Plus size={14} /> New Lead
            </button>
          </div>
        </div>

        <div className="admin-body">
          {view === "table" ? (
            <>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]"
                  />
                  <input
                    className="admin-input pl-9"
                    placeholder="Search name, company, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="admin-select w-auto"
                  value={stageFilter}
                  onChange={(e) =>
                    setStageFilter(e.target.value as Lead["stage"] | "ALL")
                  }
                >
                  <option value="ALL">All Stages</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
                {(search || stageFilter !== "ALL") && (
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => {
                      setSearch("");
                      setStageFilter("ALL");
                    }}
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <DataTable
                data={filtered}
                columns={columns}
                emptyMessage="No leads match your filters."
                emptyIcon={<Users size={32} />}
                onRowClick={openEdit}
              />
            </>
          ) : (
            /* Pipeline / Kanban view */
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max">
                {STAGES.map((stage) => {
                  const stageLeads = leadsPerStage[stage];
                  const stageValue = stageLeads.reduce(
                    (s, l) => s + (l.value || 0),
                    0
                  );
                  return (
                    <div
                      key={stage}
                      className={`w-64 flex flex-col border-t-2 ${stageColumnColor(stage)} bg-[#161b22] rounded-lg overflow-hidden`}
                    >
                      {/* Column header */}
                      <div className="px-3 py-2.5 border-b border-[#30363d] flex items-center justify-between">
                        <div>
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider ${stageBadgeClass(stage).replace("admin-badge ", "")}`}
                          >
                            {STAGE_LABELS[stage]}
                          </span>
                          <p className="text-[#7d8590] text-xs mt-0.5">
                            {stageLeads.length} lead
                            {stageLeads.length !== 1 ? "s" : ""}
                            {stageValue > 0 &&
                              ` · $${stageValue.toLocaleString()}`}
                          </p>
                        </div>
                      </div>

                      {/* Cards */}
                      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 max-h-[560px]">
                        {stageLeads.length === 0 && (
                          <p className="text-[#7d8590] text-xs text-center py-6">
                            No leads
                          </p>
                        )}
                        {stageLeads.map((l) => {
                          const stageIdx = STAGES.indexOf(l.stage);
                          return (
                            <div
                              key={l.id}
                              className="admin-card p-3 cursor-pointer hover:border-[#7d8590] transition-colors"
                              onClick={() => openEdit(l)}
                            >
                              <p className="text-[#e6edf3] text-sm font-medium truncate">
                                {l.name}
                              </p>
                              <p className="text-[#7d8590] text-xs truncate">
                                {l.company}
                              </p>
                              {l.projectType && (
                                <p className="text-[#7d8590] text-xs mt-1.5 line-clamp-1">
                                  {l.projectType}
                                </p>
                              )}
                              {l.value > 0 && (
                                <p className="text-[#ff5a00] text-xs font-mono mt-1">
                                  ${l.value.toLocaleString()}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#30363d]">
                                <button
                                  className="admin-btn admin-btn-ghost admin-btn-sm text-[#7d8590] flex-1 justify-center"
                                  disabled={stageIdx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(l, "prev");
                                  }}
                                  title="Move back"
                                >
                                  <ChevronLeft size={12} />
                                </button>
                                <button
                                  className="admin-btn admin-btn-ghost admin-btn-sm text-[#7d8590] flex-1 justify-center"
                                  disabled={stageIdx === STAGES.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(l, "next");
                                  }}
                                  title="Move forward"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? "Edit Lead" : "New Lead"}
        subtitle={editing ? editing.name : "Add a new lead to your pipeline"}
        width="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setSlideOpen(false)}
            >
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Lead"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Full Name</label>
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Jane Smith"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Company</label>
              <input
                className="admin-input"
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company: e.target.value }))
                }
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Email</label>
              <input
                type="email"
                className="admin-input"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="jane@acme.com"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Phone</label>
              <input
                type="tel"
                className="admin-input"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Project Type</label>
              <input
                className="admin-input"
                value={form.projectType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectType: e.target.value }))
                }
                placeholder="Brand Identity"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Budget</label>
              <input
                className="admin-input"
                value={form.budget}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget: e.target.value }))
                }
                placeholder="$5,000 – $10,000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Timeline</label>
              <input
                className="admin-input"
                value={form.timeline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeline: e.target.value }))
                }
                placeholder="Q3 2026"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Estimated Value ($)</label>
              <input
                type="number"
                className="admin-input"
                value={form.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Stage</label>
              <select
                className="admin-select"
                value={form.stage}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    stage: e.target.value as Lead["stage"],
                  }))
                }
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Source</label>
              <input
                className="admin-input"
                value={form.source}
                onChange={(e) =>
                  setForm((f) => ({ ...f, source: e.target.value }))
                }
                placeholder="Website, Referral, etc."
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Project details and notes..."
            />
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete Lead"
        description="This will permanently delete the lead and all associated data. This cannot be undone."
        confirmLabel="Delete Lead"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </AdminLayout>
  );
}
