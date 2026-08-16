import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Service } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

const EMPTY_FORM = {
  title: "",
  description: "",
  overview: "",
  timeline: "",
  startingPrice: 0,
  featured: false,
  visible: true,
};

type FormState = typeof EMPTY_FORM;

export default function AdminServices() {
  const { services, services_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  const items = services;

  const filtered = useMemo(() => {
    let list = [...items];
    if (visibilityFilter === "visible") list = list.filter((s) => s.visible);
    if (visibilityFilter === "hidden") list = list.filter((s) => !s.visible);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q));
    }
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  }, [items, search, visibilityFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description ?? "",
      overview: s.overview ?? "",
      timeline: s.timeline ?? "",
      startingPrice: s.startingPrice ?? 0,
      featured: s.featured ?? false,
      visible: s.visible ?? true,
    });
    setShowForm(true);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editing) {
      services_.edit(editing.id, {
        title: form.title,
        description: form.description,
        overview: form.overview,
        timeline: form.timeline,
        startingPrice: form.startingPrice,
        featured: form.featured,
        visible: form.visible,
      });
      toast.success("Service updated");
    } else {
      const newItem: Service = {
        id: genId(),
        number: String(items.length + 1).padStart(2, "0"),
        title: form.title,
        description: form.description,
        overview: form.overview,
        deliverables: [],
        process: [],
        timeline: form.timeline,
        startingPrice: form.startingPrice,
        currency: "USD",
        packages: [],
        gallery: [],
        featured: form.featured,
        visible: form.visible,
        order: items.length + 1,
      };
      services_.add(newItem);
      toast.success("Service created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    services_.del(confirmDelete.id);
    toast.success(`"${confirmDelete.name}" deleted`);
    setConfirmDelete({ open: false, id: "", name: "" });
  }

  function toggleVisible(s: Service) {
    services_.edit(s.id, { visible: !s.visible });
    toast.success(s.visible ? "Service hidden" : "Service visible");
  }

  function toggleFeatured(s: Service) {
    services_.edit(s.id, { featured: !s.featured });
    toast.success(s.featured ? "Removed from featured" : "Marked as featured");
  }

  function formatPrice(price: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Services</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {filtered.length} of {items.length} services
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            + New Service
          </button>
        </div>

        <div className="admin-filter-bar">
          <div style={{ position: "relative" }}>
            <span className="admin-search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className="admin-search"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            style={{ maxWidth: 160 }}
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Starting Price</th>
                <th>Timeline</th>
                <th>Featured</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">No services found</div>
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ color: "#7d8590", fontFamily: "monospace", fontSize: 12 }}>{s.number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e6edf3" }}>{s.title}</div>
                    {s.description && (
                      <div style={{ fontSize: 12, color: "#7d8590", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.description}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: "#58a6ff" }}>
                    {s.startingPrice ? formatPrice(s.startingPrice, s.currency) : "—"}
                  </td>
                  <td style={{ color: "#c9d1d9" }}>{s.timeline || "—"}</td>
                  <td>
                    <button
                      className={`admin-btn admin-btn-sm ${s.featured ? "admin-btn-primary" : "admin-btn-ghost"}`}
                      onClick={() => toggleFeatured(s)}
                      title="Toggle featured"
                    >
                      {s.featured ? "Featured" : "Set Featured"}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`admin-btn admin-btn-sm ${s.visible ? "admin-btn-secondary" : "admin-btn-ghost"}`}
                      onClick={() => toggleVisible(s)}
                      title="Toggle visibility"
                      style={{ minWidth: 72 }}
                    >
                      {s.visible ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setConfirmDelete({ open: true, id: s.id, name: s.title })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Service" : "New Service"}
        subtitle={editing ? editing.title : "Create a new service"}
        width="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Service"}
            </button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px" }}>
          <div className="admin-field">
            <label className="admin-field-label">Title *</label>
            <input
              className="admin-input"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Service title"
            />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Short service description…"
            />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Overview</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={form.overview}
              onChange={(e) => setField("overview", e.target.value)}
              placeholder="Full overview of the service…"
            />
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Timeline</label>
              <input
                className="admin-input"
                value={form.timeline}
                onChange={(e) => setField("timeline", e.target.value)}
                placeholder="e.g. 2–4 weeks"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Starting Price (USD)</label>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={form.startingPrice}
                onChange={(e) => setField("startingPrice", Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#58a6ff" }}
              />
              <span style={{ fontSize: 13, color: "#c9d1d9" }}>Featured service</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setField("visible", e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#58a6ff" }}
              />
              <span style={{ fontSize: 13, color: "#c9d1d9" }}>Visible on site</span>
            </label>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Service"
        description={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", name: "" })}
      />
    </AdminLayout>
  );
}
