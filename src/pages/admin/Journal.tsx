import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Check, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";
import type { JournalPost } from "@/data/seed";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type StatusFilter = "all" | "published" | "draft";

type PostForm = Omit<JournalPost, "id">;

const emptyForm: PostForm = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  author: "",
  category: "Behind the Scenes",
  tags: [],
  coverImage: "",
  publishDate: new Date().toISOString().slice(0, 10),
  readTime: 5,
  status: "draft",
  seoTitle: "",
  seoDescription: "",
};

const CATEGORIES = [
  "Behind the Scenes",
  "Blender Workflows",
  "Design Thinking",
  "Industry",
  "Tutorial",
];

export default function AdminJournal() {
  const { journalPosts, journalPosts_ } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [tagsInput, setTagsInput] = useState("");

  const filtered = useMemo(() => {
    return journalPosts
      .filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  }, [journalPosts, search, statusFilter]);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setTagsInput("");
    setSlideOpen(true);
  }

  function openEdit(post: JournalPost) {
    setEditingId(post.id);
    const { id, ...rest } = post;
    setForm(rest);
    setTagsInput(post.tags.join(", "));
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setTagsInput("");
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: editingId ? f.slug : slugify(title),
    }));
  }

  function handleSave() {
    if (!form.title || !form.author || !form.content) {
      toast.error("Title, author, and content are required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const data = { ...form, tags };

    if (editingId) {
      journalPosts_.edit(editingId, data);
      toast.success("Post updated");
    } else {
      journalPosts_.add({ id: genId(), ...data });
      toast.success("Post created");
    }
    closeSlide();
  }

  function handleDelete(id: string) {
    journalPosts_.del(id);
    setDeleteId(null);
    toast.success("Post deleted");
  }

  function toggleStatus(post: JournalPost) {
    const next = post.status === "published" ? "draft" : "published";
    journalPosts_.edit(post.id, { status: next });
    toast.success(`Post ${next === "published" ? "published" : "moved to draft"}`);
  }

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Journal</h1>
            <p style={{ color: "#7d8590", fontSize: 13, marginTop: 4 }}>
              {journalPosts.length} posts &middot;{" "}
              {journalPosts.filter((p) => p.status === "published").length} published
            </p>
          </div>
          <button className="admin-btn primary" onClick={openNew}>
            <Plus size={15} /> New Post
          </button>
        </div>

        {/* Filters */}
        <div className="admin-filter-bar">
          <div style={{ display: "flex", gap: 4 }}>
            {statusTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`admin-btn ${statusFilter === t.key ? "primary" : "ghost"} sm`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="admin-search">
            <Search className="admin-search-icon" size={14} />
            <input
              className="admin-input"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Publish Date</th>
                <th>Read Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon">
                        <Edit2 size={24} />
                      </div>
                      <p>No posts found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: "#e6edf3", maxWidth: 260 }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#484f58", marginTop: 2 }}>
                        /{post.slug}
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge purple">{post.category}</span>
                    </td>
                    <td style={{ color: "#7d8590", fontSize: 13 }}>{post.author}</td>
                    <td style={{ color: "#7d8590", fontSize: 13 }}>{post.publishDate}</td>
                    <td style={{ color: "#7d8590", fontSize: 13 }}>{post.readTime} min</td>
                    <td>
                      <button
                        onClick={() => toggleStatus(post)}
                        className="admin-btn ghost sm"
                        style={{ padding: "2px 8px" }}
                      >
                        {post.status === "published" ? (
                          <span className="admin-badge green">Published</span>
                        ) : (
                          <span className="admin-badge orange">Draft</span>
                        )}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="admin-btn ghost sm"
                          onClick={() => openEdit(post)}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="admin-btn danger sm"
                          onClick={() => setDeleteId(post.id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={closeSlide}
        title={editingId ? "Edit Post" : "New Post"}
        subtitle={editingId ? "Update journal post details" : "Create a new journal entry"}
        width="lg"
        footer={
          <>
            <button className="admin-btn secondary" onClick={closeSlide}>
              Cancel
            </button>
            <button className="admin-btn primary" onClick={handleSave}>
              <Check size={14} /> {editingId ? "Save Changes" : "Create Post"}
            </button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Title *</label>
            <input
              className="admin-input"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title"
            />
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Slug</label>
            <input
              className="admin-input"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="auto-generated-from-title"
            />
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Excerpt</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short description for listings..."
            />
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Content *</label>
            <textarea
              className="admin-textarea"
              rows={8}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Full post content..."
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Author *</label>
            <input
              className="admin-input"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              placeholder="Author name"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Category</label>
            <select
              className="admin-select"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Tags (comma-separated)</label>
            <input
              className="admin-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="blender, cgi, tutorial"
            />
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Cover Image URL</label>
            <input
              className="admin-input"
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Publish Date</label>
            <input
              className="admin-input"
              type="date"
              value={form.publishDate}
              onChange={(e) => setForm((f) => ({ ...f, publishDate: e.target.value }))}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Read Time (min)</label>
            <input
              className="admin-input"
              type="number"
              min={1}
              value={form.readTime}
              onChange={(e) => setForm((f) => ({ ...f, readTime: Number(e.target.value) }))}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Status</label>
            <select
              className="admin-select"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as "published" | "draft" }))
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">SEO Title</label>
            <input
              className="admin-input"
              value={form.seoTitle}
              onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
              placeholder="Override title for search engines"
            />
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">SEO Description</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={form.seoDescription}
              onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
              placeholder="Meta description for search engines..."
            />
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Post"
        description="This journal post will be permanently deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}
