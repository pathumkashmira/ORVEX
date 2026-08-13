import { useState, useMemo } from "react";
import {
  Plus,
  Star,
  Pencil,
  Trash2,
  Bookmark,
  BookmarkCheck,
  MessageSquareQuote,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type { Testimonial } from "@/data/seed";

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "text-[#d29922] fill-[#d29922]" : "text-[#30363d]"}
        />
      ))}
    </div>
  );
}

function Avatar({ photo, name }: { photo?: string; name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-8 h-8 rounded-full object-cover border border-[#30363d]"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#ff5a00]/20 border border-[#ff5a00]/30 flex items-center justify-center text-[10px] font-semibold text-[#ff5a00]">
      {initials}
    </div>
  );
}

interface FormState {
  name: string;
  role: string;
  company: string;
  photo: string;
  testimonial: string;
  project: string;
  rating: number;
  featured: boolean;
}

const BLANK: FormState = {
  name: "",
  role: "",
  company: "",
  photo: "",
  testimonial: "",
  project: "",
  rating: 5,
  featured: false,
};

function toForm(t: Testimonial): FormState {
  return {
    name: t.name,
    role: t.role,
    company: t.company,
    photo: t.photo ?? "",
    testimonial: t.testimonial,
    project: t.project,
    rating: t.rating,
    featured: t.featured,
  };
}

export default function AdminTestimonials() {
  const { testimonials, testimonials_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<"ALL" | "featured" | "standard">("ALL");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);

  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return testimonials.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q) && !t.company.toLowerCase().includes(q)) return false;
      if (featuredFilter === "featured" && !t.featured) return false;
      if (featuredFilter === "standard" && t.featured) return false;
      return true;
    });
  }, [testimonials, search, featuredFilter]);

  function openCreate() {
    setEditing(null);
    setForm(BLANK);
    setSlideOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm(toForm(t));
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditing(null);
    setForm(BLANK);
  }

  function handleSave() {
    if (!form.name || !form.testimonial) return;
    if (editing) {
      testimonials_.update({ ...editing, ...form, photo: form.photo });
      toast.success("Testimonial updated");
    } else {
      testimonials_.create({
        id: `t-${Date.now()}`,
        name: form.name,
        role: form.role,
        company: form.company,
        photo: form.photo,
        testimonial: form.testimonial,
        project: form.project,
        rating: form.rating,
        featured: form.featured,
      } as Testimonial);
      toast.success("Testimonial added");
    }
    closeSlide();
  }

  function handleToggleFeatured(t: Testimonial) {
    testimonials_.update({ ...t, featured: !t.featured });
    toast.info(t.featured ? "Removed from featured" : "Marked as featured");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    testimonials_.remove(deleteTarget.id);
    toast.success("Testimonial deleted");
    setDeleteTarget(null);
  }

  const columns: Column<Testimonial>[] = [
    {
      key: "name",
      label: "Person",
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <Avatar photo={t.photo} name={t.name} />
          <div>
            <p className="text-[#e6edf3] text-sm font-medium leading-tight">{t.name}</p>
            <p className="text-[#7d8590] text-xs">{t.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (t) => <span className="text-[#e6edf3] text-sm">{t.company}</span>,
    },
    {
      key: "project",
      label: "Project",
      render: (t) => <span className="text-[#7d8590] text-sm">{t.project}</span>,
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (t) => <StarRating rating={t.rating} />,
    },
    {
      key: "featured",
      label: "Status",
      render: (t) => (
        <span className={`admin-badge ${t.featured ? "admin-badge-orange" : "admin-badge-gray"}`}>
          {t.featured ? "FEATURED" : "STANDARD"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "120px",
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={(e) => { e.stopPropagation(); openEdit(t); }}
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            className={`admin-btn admin-btn-ghost admin-btn-sm ${t.featured ? "text-[#ff5a00]" : ""}`}
            onClick={(e) => { e.stopPropagation(); handleToggleFeatured(t); }}
            title={t.featured ? "Unfeature" : "Feature"}
          >
            {t.featured ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm text-[#f85149]"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(t); }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  function field(label: string, node: React.ReactNode) {
    return (
      <div className="admin-field">
        <label className="admin-field-label">{label}</label>
        {node}
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div className="flex items-center gap-3">
            <h1 className="admin-heading">Testimonials</h1>
            <span className="admin-badge admin-badge-blue">{testimonials.length}</span>
          </div>
          <button className="admin-btn admin-btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={15} />
            Add Testimonial
          </button>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-search">
            <svg className="admin-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8.5" cy="8.5" r="5.75" />
              <path d="M13 13l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              className="admin-input pl-9"
              placeholder="Search by name or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as typeof featuredFilter)}
          >
            <option value="ALL">All</option>
            <option value="featured">Featured</option>
            <option value="standard">Standard</option>
          </select>
        </div>

        {/* Table */}
        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="No testimonials match your filters."
          emptyIcon={<MessageSquareQuote size={32} />}
          rowClassName={(t) => (t.featured ? "border-l-2 border-l-[#ff5a00]" : "")}
        />

        {/* Create / Edit SlideOver */}
        <SlideOver
          open={slideOpen}
          onClose={closeSlide}
          title={editing ? "Edit Testimonial" : "Add Testimonial"}
          subtitle={editing ? `Editing ${editing.name}` : "Add a new client testimonial."}
          footer={
            <>
              <button className="admin-btn admin-btn-secondary" onClick={closeSlide}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editing ? "Save Changes" : "Add Testimonial"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {field(
              "Full Name *",
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Marcus Webb"
              />,
            )}
            {field(
              "Role / Title",
              <input
                className="admin-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. CEO"
              />,
            )}
            {field(
              "Company",
              <input
                className="admin-input"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. AXIOM Technologies"
              />,
            )}
            {field(
              "Photo URL",
              <div>
                <input
                  className="admin-input"
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                  placeholder="https://…"
                />
                {form.photo && (
                  <img
                    src={form.photo}
                    alt="preview"
                    className="mt-2 w-12 h-12 rounded-full object-cover border border-[#30363d]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>,
            )}
            {field(
              "Testimonial *",
              <textarea
                className="admin-textarea"
                rows={4}
                value={form.testimonial}
                onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                placeholder="What the client said…"
              />,
            )}
            {field(
              "Project Name",
              <input
                className="admin-input"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                placeholder="e.g. ORBITAL"
              />,
            )}
            {field(
              "Rating (1–5)",
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={
                          n <= form.rating
                            ? "text-[#d29922] fill-[#d29922]"
                            : "text-[#30363d]"
                        }
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#7d8590]">{form.rating} / 5</p>
              </div>,
            )}
            <div className="flex items-center gap-3 pt-1">
              <input
                id="featured-check"
                type="checkbox"
                className="w-4 h-4 rounded border border-[#30363d] accent-[#ff5a00]"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <label htmlFor="featured-check" className="admin-field-label mb-0 cursor-pointer">
                Featured testimonial
              </label>
            </div>
          </div>
        </SlideOver>

        {/* Delete ConfirmDialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Testimonial"
          description={`Permanently delete ${deleteTarget?.name}"s testimonial? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
}
