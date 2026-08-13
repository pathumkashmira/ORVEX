import { useState, useMemo, useEffect } from "react";
import { Plus, Edit2, Trash2, ExternalLink, FileText, Image } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataTable, { type Column } from "@/components/admin/DataTable";
import type { JournalPost } from "@/data/seed";

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return s;
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface PostFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  coverImage: string;
  publishDate: string;
  readTime: string;
  status: "published" | "draft";
  seoTitle: string;
  seoDescription: string;
}

function emptyForm(): PostFormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "ORVEX Studio",
    category: "",
    tags: "",
    coverImage: "",
    publishDate: new Date().toISOString().slice(0, 10),
    readTime: "5",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
  };
}

function fromPost(p: JournalPost): PostFormState {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content ?? "",
    author: p.author,
    category: p.category,
    tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
    coverImage: p.coverImage ?? "",
    publishDate: p.publishDate ?? new Date().toISOString().slice(0, 10),
    readTime: String(p.readTime ?? 5),
    status: (p.status as "published" | "draft") ?? "draft",
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
  };
}

function toPost(id: string, form: PostFormState): JournalPost {
  return {
    id,
    title: form.title,
    slug: form.slug || slugify(form.title),
    excerpt: form.excerpt,
    content: form.content,
    author: form.author,
    category: form.category,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    coverImage: form.coverImage,
    publishDate: form.publishDate,
    readTime: Number(form.readTime) || 5,
    status: form.status,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
  } as JournalPost;
}

function PostFormFields({
  form,
  onChange,
}: {
  form: PostFormState;
  onChange: (k: keyof PostFormState, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Title + auto-slug */}
      <div className="admin-field">
        <label className="admin-field-label">Title</label>
        <input
          className="admin-input w-full"
          placeholder="Post title"
          value={form.title}
          onChange={(e) => {
            onChange("title", e.target.value);
            if (!form.slug || form.slug === slugify(form.title)) {
              onChange("slug", slugify(e.target.value));
            }
          }}
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">Slug</label>
        <input
          className="admin-input w-full font-mono text-sm"
          placeholder="url-friendly-slug"
          value={form.slug}
          onChange={(e) => onChange("slug", e.target.value)}
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">Excerpt</label>
        <textarea
          className="admin-textarea w-full"
          rows={2}
          placeholder="Short description shown in listings"
          value={form.excerpt}
          onChange={(e) => onChange("excerpt", e.target.value)}
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">Content</label>
        <textarea
          className="admin-textarea w-full font-mono text-xs"
          rows={10}
          placeholder="Full post content (Markdown or HTML)"
          value={form.content}
          onChange={(e) => onChange("content", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="admin-field">
          <label className="admin-field-label">Author</label>
          <input
            className="admin-input w-full"
            placeholder="Author name"
            value={form.author}
            onChange={(e) => onChange("author", e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-field-label">Category</label>
          <input
            className="admin-input w-full"
            placeholder="e.g. Tutorial, CGI, Motion"
            value={form.category}
            onChange={(e) => onChange("category", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-field-label">Tags (comma-separated)</label>
        <input
          className="admin-input w-full"
          placeholder="3D, CGI, Blender"
          value={form.tags}
          onChange={(e) => onChange("tags", e.target.value)}
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">Cover Image URL</label>
        <input
          className="admin-input w-full"
          placeholder="https://…"
          value={form.coverImage}
          onChange={(e) => onChange("coverImage", e.target.value)}
        />
        {form.coverImage && (
          <div className="mt-2 rounded-lg overflow-hidden border border-[#30363d] h-32">
            <img
              src={form.coverImage}
              alt="Cover preview"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="admin-field">
          <label className="admin-field-label">Publish Date</label>
          <input
            type="date"
            className="admin-input w-full"
            value={form.publishDate}
            onChange={(e) => onChange("publishDate", e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-field-label">Read Time (min)</label>
          <input
            type="number"
            min="1"
            className="admin-input w-full"
            value={form.readTime}
            onChange={(e) => onChange("readTime", e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-field-label">Status</label>
          <select
            className="admin-select w-full"
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="border-t border-[#30363d] pt-4 space-y-4">
        <p className="admin-label text-[#7d8590]">SEO</p>
        <div className="admin-field">
          <label className="admin-field-label">SEO Title</label>
          <input
            className="admin-input w-full"
            placeholder="Overrides title for search engines"
            value={form.seoTitle}
            onChange={(e) => onChange("seoTitle", e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-field-label">SEO Description</label>
          <textarea
            className="admin-textarea w-full"
            rows={2}
            placeholder="Meta description (150–160 chars)"
            value={form.seoDescription}
            onChange={(e) => onChange("seoDescription", e.target.value)}
          />
          <p className="text-[#7d8590] text-xs mt-1">{form.seoDescription.length} / 160 chars</p>
        </div>
      </div>
    </div>
  );
}

export default function Journal() {
  const { journal, journal_ } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [slideOver, setSlideOver] = useState<{ post: JournalPost | null; mode: "add" | "edit" } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalPost | null>(null);
  const [form, setForm] = useState<PostFormState>(emptyForm());

  const categories = useMemo(() => {
    const set = new Set<string>();
    journal.forEach((p) => { if (p.category) set.add(p.category); });
    return Array.from(set).sort();
  }, [journal]);

  // Sync form when slide-over opens
  useEffect(() => {
    if (slideOver) {
      setForm(slideOver.post ? fromPost(slideOver.post) : emptyForm());
    }
  }, [slideOver]);

  const filtered = useMemo(() => {
    return journal.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter.toLowerCase();
      const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [journal, search, statusFilter, categoryFilter]);

  const setField = (k: keyof PostFormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title) { toast.error("Title is required"); return; }
    if (slideOver?.mode === "add") {
      journal_.create(toPost(Date.now().toString(), form));
      toast.success("Post created");
    } else if (slideOver?.post) {
      journal_.update(toPost(slideOver.post.id, form));
      toast.success("Post updated");
    }
    setSlideOver(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    journal_.remove(deleteTarget.id);
    toast.success("Post deleted");
    setDeleteTarget(null);
  };

  const handleStatusToggle = (post: JournalPost) => {
    const next = post.status === "published" ? "draft" : "published";
    journal_.update({ ...post, status: next } as JournalPost);
    toast.success(`Post ${next === "published" ? "published" : "set to draft"}`);
  };

  const columns: Column<JournalPost>[] = [
    {
      key: "coverImage",
      label: "Cover",
      width: "80px",
      render: (row) => (
        <div className="w-14 h-10 rounded-md overflow-hidden bg-[#30363d]/40 flex-shrink-0 flex items-center justify-center">
          {row.coverImage ? (
            <img src={row.coverImage} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <Image size={14} className="text-[#7d8590]" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Post",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-[#e6edf3] text-sm font-medium leading-tight line-clamp-1">{row.title}</p>
          <p className="text-[#7d8590] text-xs line-clamp-1 mt-0.5">{row.excerpt}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      width: "120px",
      render: (row) => (
        <span className="admin-badge admin-badge-blue">{row.category || "—"}</span>
      ),
    },
    {
      key: "author",
      label: "Author",
      sortable: true,
      width: "130px",
      render: (row) => <span className="text-[#7d8590] text-sm">{row.author}</span>,
    },
    {
      key: "readTime",
      label: "Read Time",
      width: "90px",
      render: (row) => <span className="text-[#7d8590] text-sm">{row.readTime ?? "—"} min</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      width: "110px",
      render: (row) => (
        <button
          className={`admin-badge cursor-pointer transition-opacity hover:opacity-80 ${
            row.status === "published" ? "admin-badge-green" : "admin-badge-gray"
          }`}
          title="Click to toggle status"
          onClick={(e) => { e.stopPropagation(); handleStatusToggle(row); }}
        >
          {row.status === "published" ? "Published" : "Draft"}
        </button>
      ),
    },
    {
      key: "publishDate",
      label: "Date",
      sortable: true,
      width: "110px",
      render: (row) => <span className="text-[#7d8590] text-xs">{fmtDate(row.publishDate ?? "")}</span>,
    },
    {
      key: "_actions",
      label: "Actions",
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="admin-btn admin-btn-sm admin-btn-ghost"
            title="Edit"
            onClick={() => setSlideOver({ post: row, mode: "edit" })}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="admin-btn admin-btn-sm admin-btn-ghost"
            title="View in new tab"
            onClick={() => window.open(`/journal/${row.slug}`, "_blank")}
          >
            <ExternalLink size={13} />
          </button>
          <button
            className="admin-btn admin-btn-sm admin-btn-ghost text-[#f85149] hover:bg-[#f85149]/10"
            title="Delete"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div className="flex items-center gap-3">
            <h1 className="admin-heading">Journal</h1>
            <span className="admin-badge admin-badge-gray">{journal.length}</span>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setSlideOver({ post: null, mode: "add" })}
          >
            <Plus size={15} />New Post
          </button>
        </div>

        {/* Filter bar */}
        <div className="admin-filter-bar flex-wrap gap-3">
          <div className="admin-search">
            <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="admin-input pl-9 w-60"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1">
            {["ALL", "PUBLISHED", "DRAFT"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`admin-btn admin-btn-sm ${statusFilter === s ? "admin-btn-primary" : "admin-btn-ghost"}`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="No posts match your filters."
          emptyIcon={<FileText size={32} />}
          onRowClick={(row) => setSlideOver({ post: row, mode: "edit" })}
        />
      </div>

      {/* Create / Edit SlideOver */}
      {slideOver && (
        <SlideOver
          open
          onClose={() => setSlideOver(null)}
          title={slideOver.mode === "add" ? "New Post" : "Edit Post"}
          subtitle={slideOver.mode === "edit" ? slideOver.post?.title : undefined}
          width="xl"
          footer={
            <>
              <button className="admin-btn admin-btn-ghost" onClick={() => setSlideOver(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {slideOver.mode === "add" ? "Create Post" : "Save Changes"}
              </button>
            </>
          }
        >
          <PostFormFields form={form} onChange={setField} />
        </SlideOver>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Post"
        description={`Permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
