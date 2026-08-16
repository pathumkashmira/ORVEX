import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Check, X } from "lucide-react";
import { Grid, List, FileText, Film, Image as ImageIcon, Upload } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type MediaItem } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

type TypeFilter = "all" | "image" | "video" | "document";
type ViewMode = "grid" | "list";

type MediaForm = Omit<MediaItem, "id" | "uploadedAt" | "tags"> & { tagsInput: string };

const emptyForm: MediaForm = {
  filename: "",
  type: "image",
  url: "",
  alt: "",
  size: 0,
  tagsInput: "",
};

function formatSize(size: number) {
  if (size < 1000000) return (size / 1024).toFixed(0) + "KB";
  return (size / 1024 / 1024).toFixed(1) + "MB";
}

function TypeIcon({ type }: { type: MediaItem["type"] }) {
  if (type === "image") return <ImageIcon size={20} />;
  if (type === "video") return <Film size={20} />;
  return <FileText size={20} />;
}

function typeBadgeClass(type: MediaItem["type"]) {
  if (type === "image") return "blue";
  if (type === "video") return "purple";
  return "gray";
}

export default function AdminMedia() {
  const { media, media_ } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MediaForm>(emptyForm);

  const filtered = useMemo(() => {
    return media.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.filename.toLowerCase().includes(q) ||
          m.alt.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [media, search, typeFilter]);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(item: MediaItem) {
    setEditingId(item.id);
    setForm({
      filename: item.filename,
      type: item.type,
      url: item.url,
      alt: item.alt,
      size: item.size,
      tagsInput: item.tags.join(", "),
    });
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSave() {
    if (!form.filename || !form.url) {
      toast.error("Filename and URL are required");
      return;
    }
    const tags = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const data: Omit<MediaItem, "id"> = {
      filename: form.filename,
      type: form.type,
      url: form.url,
      alt: form.alt,
      size: Number(form.size),
      tags,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };

    if (editingId) {
      media_.edit(editingId, data);
      toast.success("Media item updated");
    } else {
      media_.add({ id: genId(), ...data });
      toast.success("Media item added");
    }
    closeSlide();
  }

  function handleDelete(id: string) {
    media_.del(id);
    setDeleteId(null);
    toast.success("Media item deleted");
  }

  const typeFilters: { key: TypeFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "video", label: "Videos" },
    { key: "document", label: "Documents" },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Media</h1>
            <p style={{ color: "#7d8590", fontSize: 13, marginTop: 4 }}>
              {media.length} items &middot; {media.filter((m) => m.type === "image").length} images
            </p>
          </div>
          <button className="admin-btn primary" onClick={openNew}>
            <Upload size={15} /> Upload
          </button>
        </div>

        {/* Filters */}
        <div className="admin-filter-bar">
          <div style={{ display: "flex", gap: 4 }}>
            {typeFilters.map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`admin-btn ${typeFilter === t.key ? "primary" : "ghost"} sm`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="admin-search">
              <Search className="admin-search-icon" size={14} />
              <input
                className="admin-input"
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* View toggle */}
            <div style={{ display: "flex", gap: 2 }}>
              <button
                className={`admin-btn ${viewMode === "grid" ? "primary" : "ghost"} sm`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <Grid size={13} />
              </button>
              <button
                className={`admin-btn ${viewMode === "list" ? "primary" : "ghost"} sm`}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List size={13} />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <ImageIcon size={28} />
            </div>
            <p>No media found</p>
            <button className="admin-btn primary" onClick={openNew}>
              <Upload size={14} /> Upload first item
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((item) => (
              <div
                key={item.id}
                className="admin-card"
                style={{ padding: 0, overflow: "hidden", position: "relative" }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    height: 140,
                    background: "#0d1117",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {item.type === "image" && item.url ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div style={{ color: "#484f58" }}>
                      <TypeIcon type={item.type} />
                    </div>
                  )}
                  {/* Hover actions overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                    className="media-hover-overlay"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "0";
                    }}
                  >
                    <button
                      className="admin-btn ghost sm"
                      onClick={() => openEdit(item)}
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="admin-btn danger sm"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#e6edf3",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 4,
                    }}
                  >
                    {item.filename}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span className={`admin-badge ${typeBadgeClass(item.type)}`}>{item.type}</span>
                    <span style={{ fontSize: 11, color: "#484f58" }}>{formatSize(item.size)}</span>
                  </div>
                  {item.tags.length > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#7d8590",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.tags.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Tags</th>
                  <th>Alt Text</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.type === "image" && item.url ? (
                          <img
                            src={item.url}
                            alt=""
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 4,
                              border: "1px solid #21262d",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 4,
                              border: "1px solid #21262d",
                              background: "#0d1117",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#484f58",
                              flexShrink: 0,
                            }}
                          >
                            <TypeIcon type={item.type} />
                          </div>
                        )}
                        <span style={{ fontSize: 13, color: "#e6edf3", fontWeight: 500 }}>
                          {item.filename}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${typeBadgeClass(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ color: "#7d8590", fontSize: 13 }}>{formatSize(item.size)}</td>
                    <td style={{ fontSize: 12, color: "#7d8590" }}>{item.tags.join(", ")}</td>
                    <td
                      style={{
                        fontSize: 12,
                        color: "#7d8590",
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.alt}
                    </td>
                    <td style={{ fontSize: 12, color: "#484f58" }}>{item.uploadedAt}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="admin-btn ghost sm"
                          onClick={() => openEdit(item)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="admin-btn danger sm"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={closeSlide}
        title={editingId ? "Edit Media Item" : "Upload Media"}
        subtitle={editingId ? "Update media details" : "Add a new media item"}
        width="lg"
        footer={
          <>
            <button className="admin-btn secondary" onClick={closeSlide}>
              Cancel
            </button>
            <button className="admin-btn primary" onClick={handleSave}>
              <Check size={14} /> {editingId ? "Save Changes" : "Add Item"}
            </button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-field-label">Filename *</label>
            <input
              className="admin-input"
              value={form.filename}
              onChange={(e) => setForm((f) => ({ ...f, filename: e.target.value }))}
              placeholder="hero-image.jpg"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Type</label>
            <select
              className="admin-select"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as MediaItem["type"] }))
              }
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">URL *</label>
            <input
              className="admin-input"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* Image preview */}
          {form.type === "image" && form.url && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #21262d",
                  height: 160,
                  background: "#0d1117",
                }}
              >
                <img
                  src={form.url}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Alt Text</label>
            <input
              className="admin-input"
              value={form.alt}
              onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
              placeholder="Descriptive alt text for accessibility"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Size (bytes)</label>
            <input
              className="admin-input"
              type="number"
              min={0}
              value={form.size}
              onChange={(e) => setForm((f) => ({ ...f, size: Number(e.target.value) }))}
              placeholder="2450000"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Tags (comma-separated)</label>
            <input
              className="admin-input"
              value={form.tagsInput}
              onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.target.value }))}
              placeholder="hero, product, cgi"
            />
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Media Item"
        description="This media item will be permanently deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}
