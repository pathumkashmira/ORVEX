import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { type Project } from "@/data/seed";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  Image as ImageIcon,
} from "lucide-react";

type StatusFilter = "ALL" | "published" | "draft" | "archived";
type SortKey = "newest" | "oldest" | "az" | "za";

const STATUS_COLORS: Record<string, string> = {
  published: "admin-badge-green",
  draft: "admin-badge-yellow",
  archived: "admin-badge-gray",
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateNumber(index: number) {
  return String(index + 1).padStart(3, "0");
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const EMPTY_FORM: Omit<Project, "id" | "slug" | "number"> = {
  title: "",
  subtitle: "",
  category: "",
  year: new Date().getFullYear(),
  client: "",
  services: [],
  software: [],
  description: "",
  challenge: "",
  concept: "",
  process: "",
  featured: false,
  status: "draft",
  coverImage: "",
  gallery: [],
  tags: [],
  seoTitle: "",
  seoDescription: "",
};

interface FormState extends Omit<Project, "id" | "slug" | "number"> {
  servicesRaw: string;
  softwareRaw: string;
  galleryRaw: string;
  tagsRaw: string;
}

function projectToForm(p: Project): FormState {
  return {
    ...p,
    servicesRaw: p.services.join(", "),
    softwareRaw: p.software.join(", "),
    galleryRaw: p.gallery.join(", "),
    tagsRaw: p.tags.join(", "),
  };
}

function emptyForm(): FormState {
  return {
    ...EMPTY_FORM,
    servicesRaw: "",
    softwareRaw: "",
    galleryRaw: "",
    tagsRaw: "",
  };
}

function splitRaw(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Projects() {
  const { projects, projects_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q)
      );
    }
    switch (sortKey) {
      case "newest":
        list.sort((a, b) => b.year - a.year || b.number.localeCompare(a.number));
        break;
      case "oldest":
        list.sort((a, b) => a.year - b.year || a.number.localeCompare(b.number));
        break;
      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return list;
  }, [projects, search, statusFilter, sortKey]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setSlideOpen(true);
  }

  function openEdit(project: Project) {
    setEditingId(project.id);
    setForm(projectToForm(project));
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditingId(null);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const services = splitRaw(form.servicesRaw);
      const software = splitRaw(form.softwareRaw);
      const gallery = splitRaw(form.galleryRaw);
      const tags = splitRaw(form.tagsRaw);

      if (editingId) {
        const existing = projects.find((p) => p.id === editingId)!;
        projects_.update({
          ...existing,
          title: form.title,
          subtitle: form.subtitle,
          category: form.category,
          year: form.year,
          client: form.client,
          services,
          software,
          description: form.description,
          challenge: form.challenge,
          concept: form.concept,
          process: form.process,
          featured: form.featured,
          status: form.status,
          coverImage: form.coverImage,
          gallery,
          tags,
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
        });
        toast.success("Project updated.");
      } else {
        const newProject: Project = {
          id: generateId(),
          slug: generateSlug(form.title),
          number: generateNumber(projects.length),
          title: form.title,
          subtitle: form.subtitle,
          category: form.category,
          year: form.year,
          client: form.client,
          services,
          software,
          description: form.description,
          challenge: form.challenge,
          concept: form.concept,
          process: form.process,
          featured: form.featured,
          status: form.status,
          coverImage: form.coverImage,
          gallery,
          tags,
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
        };
        projects_.create(newProject);
        toast.success("Project created.");
      }
      closeSlide();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      projects_.remove(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function toggleStatus(project: Project) {
    const next = project.status === "published" ? "draft" : "published";
    projects_.update({ ...project, status: next });
    toast.info(`${project.title} set to ${next}.`);
  }

  function toggleFeatured(project: Project) {
    projects_.update({ ...project, featured: !project.featured });
  }

  const columns: Column<Project>[] = [
    {
      key: "coverImage",
      label: "",
      width: "56px",
      render: (row) =>
        row.coverImage ? (
          <img
            src={row.coverImage}
            alt={row.title}
            className="w-10 h-10 rounded object-cover bg-[#30363d]"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-[#30363d] flex items-center justify-center">
            <ImageIcon size={14} className="text-[#7d8590]" />
          </div>
        ),
    },
    {
      key: "title",
      label: "Project",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-[#e6edf3] text-sm">{row.title}</p>
          {row.subtitle && (
            <p className="text-[#7d8590] text-xs truncate max-w-[220px]">{row.subtitle}</p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (row) => <span className="text-[#7d8590] text-sm">{row.category}</span>,
    },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (row) => <span className="text-sm text-[#e6edf3]">{row.client}</span>,
    },
    {
      key: "year",
      label: "Year",
      sortable: true,
      width: "72px",
      render: (row) => <span className="text-sm text-[#7d8590]">{row.year}</span>,
    },
    {
      key: "status",
      label: "Status",
      width: "110px",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus(row);
          }}
          className={`admin-badge ${STATUS_COLORS[row.status] ?? "admin-badge-gray"} cursor-pointer hover:opacity-80 transition-opacity`}
          title="Click to toggle published/draft"
        >
          {row.status}
        </button>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      width: "80px",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFeatured(row);
          }}
          className="admin-btn-icon"
          title={row.featured ? "Remove from featured" : "Add to featured"}
        >
          <Star
            size={15}
            className={row.featured ? "text-[#d29922] fill-[#d29922]" : "text-[#30363d]"}
          />
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <a
            href={`/work/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-icon"
            title="View live"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => openEdit(row)}
            className="admin-btn-icon"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="admin-btn-icon text-[#f85149] hover:bg-[#f851491a]"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const slideTitle = editingId ? "Edit Project" : "New Project";
  const slideSubtitle = editingId
    ? projects.find((p) => p.id === editingId)?.title ?? ""
    : "Fill in the details below to create a new project entry.";

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="admin-heading">Projects</h1>
            <span className="admin-badge admin-badge-blue">{projects.length}</span>
          </div>
          <button onClick={openCreate} className="admin-btn admin-btn-primary flex items-center gap-2">
            <Plus size={15} />
            New Project
          </button>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar mb-6">
          <div className="admin-search">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              className="admin-input pl-8"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="ALL">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select
            className="admin-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
          </select>
        </div>

        {/* Table */}
        <DataTable<Project>
          data={filtered}
          columns={columns}
          emptyMessage="No projects found. Create your first project."
          pageSize={20}
          onRowClick={(row) => openEdit(row)}
        />

        {/* Create / Edit SlideOver */}
        <SlideOver
          open={slideOpen}
          onClose={closeSlide}
          title={slideTitle}
          subtitle={slideSubtitle}
          width="lg"
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button onClick={closeSlide} className="admin-btn admin-btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="admin-btn admin-btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <span className="admin-spinner w-4 h-4" />}
                {editingId ? "Save Changes" : "Create Project"}
              </button>
            </div>
          }
        >
          <div className="space-y-5 pb-6">
            {/* Core Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 admin-field">
                <label className="admin-field-label">Title *</label>
                <input
                  type="text"
                  className="admin-input w-full"
                  placeholder="ORBITAL"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </div>
              <div className="col-span-2 admin-field">
                <label className="admin-field-label">Subtitle</label>
                <input
                  type="text"
                  className="admin-input w-full"
                  placeholder="A universe of motion"
                  value={form.subtitle}
                  onChange={(e) => setField("subtitle", e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Category</label>
                <input
                  type="text"
                  className="admin-input w-full"
                  placeholder="3D / CGI / Motion"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Client</label>
                <input
                  type="text"
                  className="admin-input w-full"
                  placeholder="Client name"
                  value={form.client}
                  onChange={(e) => setField("client", e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Year</label>
                <input
                  type="number"
                  className="admin-input w-full"
                  placeholder="2026"
                  value={form.year}
                  onChange={(e) => setField("year", parseInt(e.target.value) || new Date().getFullYear())}
                />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Status</label>
                <select
                  className="admin-select w-full"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value as Project["status"])}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                className="w-4 h-4 rounded accent-[#ff5a00]"
              />
              <label htmlFor="featured" className="admin-field-label cursor-pointer">
                Featured project (shown on homepage)
              </label>
            </div>

            <hr className="border-[#30363d]" />

            {/* Description */}
            <div className="admin-field">
              <label className="admin-field-label">Description</label>
              <textarea
                className="admin-textarea w-full"
                rows={3}
                placeholder="A brief description of the project..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Challenge</label>
              <textarea
                className="admin-textarea w-full"
                rows={3}
                placeholder="What was the core challenge?"
                value={form.challenge}
                onChange={(e) => setField("challenge", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Concept</label>
              <textarea
                className="admin-textarea w-full"
                rows={3}
                placeholder="The creative concept..."
                value={form.concept}
                onChange={(e) => setField("concept", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Process</label>
              <textarea
                className="admin-textarea w-full"
                rows={3}
                placeholder="How was it made?"
                value={form.process}
                onChange={(e) => setField("process", e.target.value)}
              />
            </div>

            <hr className="border-[#30363d]" />

            {/* Media */}
            <div className="admin-field">
              <label className="admin-field-label">Cover Image URL</label>
              <input
                type="url"
                className="admin-input w-full"
                placeholder="https://images.unsplash.com/photo-..."
                value={form.coverImage}
                onChange={(e) => setField("coverImage", e.target.value)}
              />
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="mt-2 w-full h-28 object-cover rounded border border-[#30363d]"
                />
              )}
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Gallery URLs</label>
              <textarea
                className="admin-textarea w-full"
                rows={2}
                placeholder="Comma-separated URLs"
                value={form.galleryRaw}
                onChange={(e) => setField("galleryRaw", e.target.value)}
              />
              <p className="admin-label text-[#7d8590] mt-1">Separate multiple URLs with commas.</p>
            </div>

            <hr className="border-[#30363d]" />

            {/* Tags & Services */}
            <div className="admin-field">
              <label className="admin-field-label">Services</label>
              <input
                type="text"
                className="admin-input w-full"
                placeholder="3D Modeling, CGI Renders, Animation"
                value={form.servicesRaw}
                onChange={(e) => setField("servicesRaw", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Software</label>
              <input
                type="text"
                className="admin-input w-full"
                placeholder="Blender, Unreal Engine, After Effects"
                value={form.softwareRaw}
                onChange={(e) => setField("softwareRaw", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Tags</label>
              <input
                type="text"
                className="admin-input w-full"
                placeholder="motion, abstract, architecture"
                value={form.tagsRaw}
                onChange={(e) => setField("tagsRaw", e.target.value)}
              />
            </div>

            <hr className="border-[#30363d]" />

            {/* SEO */}
            <div className="admin-field">
              <label className="admin-field-label">SEO Title</label>
              <input
                type="text"
                className="admin-input w-full"
                placeholder="ORBITAL — CGI Project by ORVEX"
                value={form.seoTitle}
                onChange={(e) => setField("seoTitle", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">SEO Description</label>
              <textarea
                className="admin-textarea w-full"
                rows={2}
                placeholder="Meta description for search engines..."
                value={form.seoDescription}
                onChange={(e) => setField("seoDescription", e.target.value)}
              />
              <p className="admin-label text-[#7d8590] mt-1">
                {form.seoDescription.length}/160 characters
              </p>
            </div>
          </div>
        </SlideOver>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={deleteTarget !== null}
          title="Delete Project"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          destructive
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
}
