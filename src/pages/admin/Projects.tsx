import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Project } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const CATEGORIES = ["3D Motion", "Product CGI", "Architecture CGI", "Brand Motion", "3D Environment", "CGI Study"];
const STATUSES = ["published", "draft", "archived"] as const;

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  category: CATEGORIES[0],
  year: new Date().getFullYear(),
  client: "",
  description: "",
  status: "draft" as Project["status"],
  featured: false,
  coverImage: "",
};

type FormState = typeof EMPTY_FORM;

export default function AdminProjects() {
  const { projects, projects_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Project["status"]>("all");
  const [sortCol, setSortCol] = useState<"title" | "year">("year");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  const items = projects;

  const filtered = useMemo(() => {
    let list = [...items];
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.client ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const va = sortCol === "year" ? a.year : a.title.toLowerCase();
      const vb = sortCol === "year" ? b.year : b.title.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [items, search, statusFilter, sortCol, sortDir]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title,
      subtitle: p.subtitle ?? "",
      category: p.category ?? CATEGORIES[0],
      year: p.year,
      client: p.client ?? "",
      description: p.description ?? "",
      status: p.status,
      featured: p.featured ?? false,
      coverImage: p.coverImage ?? "",
    });
    setShowForm(true);
  }

  function handleSort(col: "title" | "year") {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const slug = form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (editing) {
      projects_.edit(editing.id, {
        title: form.title,
        subtitle: form.subtitle,
        slug,
        category: form.category,
        year: form.year,
        client: form.client,
        description: form.description,
        status: form.status,
        featured: form.featured,
        coverImage: form.coverImage,
      });
      toast.success("Project updated");
    } else {
      const newItem: Project = {
        id: genId(),
        slug,
        number: String(items.length + 1).padStart(3, "0"),
        title: form.title,
        subtitle: form.subtitle,
        category: form.category,
        year: form.year,
        client: form.client,
        services: [],
        software: [],
        description: form.description,
        challenge: "",
        concept: "",
        process: "",
        featured: form.featured,
        status: form.status,
        coverImage: form.coverImage,
        gallery: [],
        tags: [],
        seoTitle: form.title,
        seoDescription: "",
      };
      projects_.add(newItem);
      toast.success("Project created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    projects_.del(confirmDelete.id);
    toast.success(`"${confirmDelete.name}" deleted`);
    setConfirmDelete({ open: false, id: "", name: "" });
  }

  function toggleStatus(p: Project) {
    const next: Project["status"] = p.status === "published" ? "draft" : "published";
    projects_.edit(p.id, { status: next });
    toast.success(`Marked as ${next}`);
  }

  function sortIcon(col: "title" | "year") {
    return sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  }

  function statusBadge(s: Project["status"]) {
    if (s === "published") return <span className="admin-badge admin-badge-green">Published</span>;
    if (s === "draft") return <span className="admin-badge admin-badge-yellow">Draft</span>;
    return <span className="admin-badge admin-badge-gray">Archived</span>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Projects</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {filtered.length} of {items.length} projects
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            + New Project
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
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            style={{ maxWidth: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                  Title{sortIcon("title")}
                </th>
                <th>Category</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("year")}>
                  Year{sortIcon("year")}
                </th>
                <th>Client</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="admin-empty">No projects found</div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "#7d8590", fontFamily: "monospace", fontSize: 12 }}>{p.number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e6edf3" }}>{p.title}</div>
                    {p.subtitle && <div style={{ fontSize: 12, color: "#7d8590" }}>{p.subtitle}</div>}
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-blue">{p.category}</span>
                  </td>
                  <td>{p.year}</td>
                  <td style={{ color: "#7d8590" }}>{p.client || "—"}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>
                    {p.featured ? (
                      <span className="admin-badge admin-badge-purple">Featured</span>
                    ) : (
                      <span style={{ color: "#7d8590" }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <a
                        href={`/projects/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ textDecoration: "none" }}
                      >
                        View
                      </a>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => toggleStatus(p)}>
                        {p.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setConfirmDelete({ open: true, id: p.id, name: p.title })}
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
        title={editing ? "Edit Project" : "New Project"}
        subtitle={editing ? editing.title : "Create a new project"}
        width="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Project"}
            </button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px" }}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Title *</label>
              <input
                className="admin-input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Subtitle</label>
              <input
                className="admin-input"
                value={form.subtitle}
                onChange={(e) => setField("subtitle", e.target.value)}
                placeholder="Short subtitle"
              />
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Category</label>
              <select
                className="admin-select"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Year</label>
              <input
                className="admin-input"
                type="number"
                value={form.year}
                onChange={(e) => setField("year", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Client</label>
            <input
              className="admin-input"
              value={form.client}
              onChange={(e) => setField("client", e.target.value)}
              placeholder="Client name"
            />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Project description…"
            />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Cover Image URL</label>
            <input
              className="admin-input"
              value={form.coverImage}
              onChange={(e) => setField("coverImage", e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Status</label>
              <select
                className="admin-select"
                value={form.status}
                onChange={(e) => setField("status", e.target.value as Project["status"])}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label" style={{ marginBottom: 10 }}>Options</label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField("featured", e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#58a6ff" }}
                />
                <span style={{ fontSize: 13, color: "#c9d1d9" }}>Featured project</span>
              </label>
            </div>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Project"
        description={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", name: "" })}
      />
    </AdminLayout>
  );
}
