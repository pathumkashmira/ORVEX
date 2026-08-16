import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Check, X, Star } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";
import type { Testimonial } from "@/data/seed";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

type FeaturedFilter = "all" | "featured" | "not-featured";

type TestimonialForm = Omit<Testimonial, "id">;

const emptyForm: TestimonialForm = {
  name: "",
  company: "",
  role: "",
  photo: "",
  testimonial: "",
  project: "",
  rating: 5,
  featured: false,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= rating ? "#d29922" : "none"}
          stroke={s <= rating ? "#d29922" : "#484f58"}
        />
      ))}
    </div>
  );
}

export default function AdminTestimonials() {
  const { testimonials, testimonials_ } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      if (featuredFilter === "featured" && !t.featured) return false;
      if (featuredFilter === "not-featured" && t.featured) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [testimonials, search, featuredFilter]);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id);
    const { id, ...rest } = t;
    setForm(rest);
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSave() {
    if (!form.name || !form.testimonial) {
      toast.error("Name and testimonial text are required");
      return;
    }
    if (editingId) {
      testimonials_.edit(editingId, form);
      toast.success("Testimonial updated");
    } else {
      testimonials_.add({ id: genId(), ...form });
      toast.success("Testimonial added");
    }
    closeSlide();
  }

  function handleDelete(id: string) {
    testimonials_.del(id);
    setDeleteId(null);
    toast.success("Testimonial deleted");
  }

  function toggleFeatured(t: Testimonial) {
    testimonials_.edit(t.id, { featured: !t.featured });
    toast.success(t.featured ? "Removed from featured" : "Marked as featured");
  }

  const filterTabs: { key: FeaturedFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "featured", label: "Featured" },
    { key: "not-featured", label: "Not Featured" },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Testimonials</h1>
            <p style={{ color: "#7d8590", fontSize: 13, marginTop: 4 }}>
              {testimonials.length} total &middot;{" "}
              {testimonials.filter((t) => t.featured).length} featured
            </p>
          </div>
          <button className="admin-btn primary" onClick={openNew}>
            <Plus size={15} /> Add Testimonial
          </button>
        </div>

        {/* Filters */}
        <div className="admin-filter-bar">
          <div style={{ display: "flex", gap: 4 }}>
            {filterTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFeaturedFilter(t.key)}
                className={`admin-btn ${featuredFilter === t.key ? "primary" : "ghost"} sm`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="admin-search">
            <Search className="admin-search-icon" size={14} />
            <input
              className="admin-input"
              placeholder="Search by name, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Card Grid */}
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <Star size={28} />
            </div>
            <p>No testimonials found</p>
            <button className="admin-btn primary" onClick={openNew}>
              <Plus size={14} /> Add first testimonial
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((t) => (
              <div
                key={t.id}
                className="admin-card"
                style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Hover actions */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    display: "flex",
                    gap: 6,
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                  className="testimonial-actions"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "0";
                  }}
                >
                  <button className="admin-btn ghost sm" onClick={() => openEdit(t)}>
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="admin-btn danger sm"
                    onClick={() => setDeleteId(t.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {t.photo ? (
                    <img
                      src={t.photo}
                      alt={t.name}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #21262d",
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "#21262d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        color: "#7d8590",
                        flexShrink: 0,
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#e6edf3", fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#7d8590" }}>
                      {t.role}{t.role && t.company ? " · " : ""}{t.company}
                    </div>
                  </div>
                  {t.featured && <span className="admin-badge yellow">Featured</span>}
                </div>

                {/* Stars */}
                <StarRating rating={t.rating} />

                {/* Testimonial text */}
                <p
                  style={{
                    fontSize: 13,
                    color: "#7d8590",
                    lineHeight: 1.6,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  &ldquo;{t.testimonial}&rdquo;
                </p>

                {/* Project + actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid #21262d",
                    marginTop: "auto",
                  }}
                >
                  {t.project && (
                    <span className="admin-badge blue" style={{ fontSize: 11 }}>
                      {t.project}
                    </span>
                  )}
                  <button
                    className="admin-btn ghost sm"
                    onClick={() => toggleFeatured(t)}
                    style={{ marginLeft: "auto" }}
                  >
                    <Star size={12} fill={t.featured ? "#d29922" : "none"} stroke={t.featured ? "#d29922" : "currentColor"} />
                    {t.featured ? "Unfeature" : "Feature"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hover reveal for card actions — CSS trick via inline events on the card */}
        <style>{`
          .admin-card:hover .testimonial-actions {
            opacity: 1 !important;
          }
        `}</style>
      </div>

      {/* SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={closeSlide}
        title={editingId ? "Edit Testimonial" : "Add Testimonial"}
        subtitle={editingId ? "Update testimonial details" : "Add a new client testimonial"}
        width="lg"
        footer={
          <>
            <button className="admin-btn secondary" onClick={closeSlide}>
              Cancel
            </button>
            <button className="admin-btn primary" onClick={handleSave}>
              <Check size={14} /> {editingId ? "Save Changes" : "Add Testimonial"}
            </button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-field-label">Name *</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Client name"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Company</label>
            <input
              className="admin-input"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="Company name"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Role</label>
            <input
              className="admin-input"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Creative Director"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Project</label>
            <input
              className="admin-input"
              value={form.project}
              onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
              placeholder="Project name"
            />
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Photo URL</label>
            <input
              className="admin-input"
              value={form.photo}
              onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
              placeholder="https://..."
            />
            {/* Photo preview */}
            {form.photo && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={form.photo}
                  alt="Preview"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #21262d",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Testimonial *</label>
            <textarea
              className="admin-textarea"
              rows={5}
              value={form.testimonial}
              onChange={(e) => setForm((f) => ({ ...f, testimonial: e.target.value }))}
              placeholder="Client testimonial text..."
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Rating (1–5)</label>
            <select
              className="admin-select"
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} {r === 5 ? "— Excellent" : r === 4 ? "— Very Good" : r === 3 ? "— Good" : r === 2 ? "— Fair" : "— Poor"}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
            <input
              type="checkbox"
              id="featured-check"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: "#58a6ff", cursor: "pointer" }}
            />
            <label
              htmlFor="featured-check"
              className="admin-field-label"
              style={{ marginBottom: 0, cursor: "pointer" }}
            >
              Featured on homepage
            </label>
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Testimonial"
        description="This testimonial will be permanently deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}
