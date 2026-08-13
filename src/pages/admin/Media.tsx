import { useState, useMemo } from "react";
import {
  Plus,
  Grid3x3,
  List,
  Copy,
  Pencil,
  Trash2,
  FileImage,
  FileVideo,
  FileText,
  HardDrive,
  Files,
  Check,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin, type MediaItem } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type React from "react";

// ── Helpers ────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + " MB";
  if (bytes >= 1_000) return Math.round(bytes / 1_000) + " KB";
  return bytes + " B";
}

function totalSize(items: MediaItem[]): string {
  return formatSize(items.reduce((s, m) => s + m.size, 0));
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const TYPE_ICONS: Record<MediaItem["type"], React.ReactElement> = {
  image: <FileImage size={13} />,
  video: <FileVideo size={13} />,
  document: <FileText size={13} />,
};

const TYPE_BADGE: Record<MediaItem["type"], string> = {
  image: "admin-badge-blue",
  video: "admin-badge-orange",
  document: "admin-badge-gray",
};

const FOLDERS = ["projects", "studio", "experiments"] as const;
type Folder = (typeof FOLDERS)[number];

// ── Form ────────────────────────────────────────────────────────────

interface FormState {
  filename: string;
  url: string;
  type: MediaItem["type"];
  alt: string;
  folder: string;
  sizeKB: string;
}

const BLANK: FormState = {
  filename: "",
  url: "",
  type: "image",
  alt: "",
  folder: "projects",
  sizeKB: "",
};

function toForm(m: MediaItem): FormState {
  return {
    filename: m.filename,
    url: m.url,
    type: m.type,
    alt: m.alt,
    folder: m.folder,
    sizeKB: String(Math.round(m.size / 1000)),
  };
}

// ── Component ───────────────────────────────────────────────────────

export default function AdminMedia() {
  const { media, media_ } = useAdmin();
  const { toast } = useToast();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState<"ALL" | Folder>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | MediaItem["type"]>("ALL");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);

  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return media.filter((m) => {
      if (q && !m.filename.toLowerCase().includes(q)) return false;
      if (folderFilter !== "ALL" && m.folder !== folderFilter) return false;
      if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
      return true;
    });
  }, [media, search, folderFilter, typeFilter]);

  // ── Actions ───────────────────────────────────────────────────────
  function copyURL(m: MediaItem) {
    navigator.clipboard.writeText(m.url).then(() => {
      setCopiedId(m.id);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function openCreate() {
    setEditing(null);
    setForm(BLANK);
    setSlideOpen(true);
  }

  function openEdit(m: MediaItem) {
    setEditing(m);
    setForm(toForm(m));
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditing(null);
    setForm(BLANK);
  }

  function handleSave() {
    if (!form.filename || !form.url) return;
    const sizeBytes = (parseFloat(form.sizeKB) || 0) * 1000;
    if (editing) {
      media_.update({ ...editing, ...form, size: sizeBytes });
      toast.success("File updated");
    } else {
      media_.create({
        id: `m-${Date.now()}`,
        filename: form.filename,
        url: form.url,
        type: form.type,
        alt: form.alt,
        folder: form.folder,
        size: sizeBytes,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      toast.success("File uploaded");
    }
    closeSlide();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    media_.remove(deleteTarget.id);
    toast.success("File deleted");
    setDeleteTarget(null);
  }

  // ── Table columns ─────────────────────────────────────────────────
  const columns: Column<MediaItem>[] = [
    {
      key: "filename",
      label: "File",
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-2.5">
          {m.type === "image" ? (
            <img
              src={m.url}
              alt={m.alt}
              className="w-10 h-10 object-cover rounded border border-[#30363d] flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-10 h-10 rounded border border-[#30363d] flex items-center justify-center bg-[#161b22] text-[#7d8590]">
              {TYPE_ICONS[m.type]}
            </div>
          )}
          <span className="text-[#e6edf3] text-sm font-medium">{m.filename}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (m) => (
        <span className={`admin-badge ${TYPE_BADGE[m.type]} flex items-center gap-1 w-fit`}>
          {TYPE_ICONS[m.type]}
          {m.type}
        </span>
      ),
    },
    {
      key: "folder",
      label: "Folder",
      sortable: true,
      render: (m) => <span className="admin-badge admin-badge-gray">{m.folder}</span>,
    },
    {
      key: "size",
      label: "Size",
      sortable: true,
      render: (m) => <span className="text-[#7d8590] text-xs">{formatSize(m.size)}</span>,
    },
    {
      key: "alt",
      label: "Alt text",
      render: (m) => (
        <span className="text-[#7d8590] text-xs truncate max-w-[160px] block">{m.alt || "—"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Uploaded",
      sortable: true,
      render: (m) => <span className="text-[#7d8590] text-xs">{fmtDate(m.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "",
      width: "120px",
      render: (m) => (
        <div className="flex items-center gap-1.5">
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={(e) => { e.stopPropagation(); copyURL(m); }}
            title="Copy URL"
          >
            {copiedId === m.id ? <Check size={13} className="text-[#3fb950]" /> : <Copy size={13} />}
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={(e) => { e.stopPropagation(); openEdit(m); }}
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm text-[#f85149]"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(m); }}
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
          <div>
            <h1 className="admin-heading">Media Library</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="admin-label text-[#7d8590]">
                <Files size={12} className="inline mr-1" />
                {media.length} files
              </span>
              <span className="text-[#30363d]">·</span>
              <span className="admin-label text-[#7d8590]">
                <HardDrive size={12} className="inline mr-1" />
                {totalSize(media)} used
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-[#30363d] rounded overflow-hidden">
              <button
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                  view === "grid"
                    ? "bg-[#ff5a00] text-white"
                    : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d]"
                }`}
                onClick={() => setView("grid")}
              >
                <Grid3x3 size={13} />
                Grid
              </button>
              <button
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                  view === "list"
                    ? "bg-[#ff5a00] text-white"
                    : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d]"
                }`}
                onClick={() => setView("list")}
              >
                <List size={13} />
                List
              </button>
            </div>
            <button
              className="admin-btn admin-btn-primary flex items-center gap-2"
              onClick={openCreate}
            >
              <Plus size={15} />
              Upload File
            </button>
          </div>
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
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value as typeof folderFilter)}
          >
            <option value="ALL">All Folders</option>
            {FOLDERS.map((f) => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
          <select
            className="admin-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          >
            <option value="ALL">All Types</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.length === 0 && (
              <div className="col-span-4 flex flex-col items-center justify-center py-16 gap-3 text-[#7d8590]">
                <FileImage size={32} />
                <p className="admin-body">No files match your filters.</p>
              </div>
            )}
            {filtered.map((m) => (
              <div
                key={m.id}
                className="admin-card group relative overflow-hidden p-0 rounded border border-[#30363d] hover:border-[#ff5a00]/40 transition-colors"
              >
                {/* Thumbnail */}
                <div className="aspect-[4/3] bg-[#0d1117] overflow-hidden">
                  {m.type === "image" ? (
                    <img
                      src={m.url}
                      alt={m.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#30363d]">
                      {m.type === "video" ? <FileVideo size={32} /> : <FileText size={32} />}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#0d1117]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      onClick={() => copyURL(m)}
                      title="Copy URL"
                    >
                      {copiedId === m.id ? (
                        <Check size={13} className="text-[#3fb950]" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      onClick={() => openEdit(m)}
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-sm text-[#f85149]"
                      onClick={() => setDeleteTarget(m)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card info */}
                <div className="p-2.5">
                  <p className="text-[#e6edf3] text-xs font-medium truncate" title={m.filename}>
                    {m.filename}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="admin-badge admin-badge-gray text-[9px]">{m.folder}</span>
                    <span className="text-[#7d8590] text-[10px]">{formatSize(m.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <DataTable
            data={filtered}
            columns={columns}
            emptyMessage="No files match your filters."
            emptyIcon={<FileImage size={32} />}
          />
        )}

        {/* Upload / Edit SlideOver */}
        <SlideOver
          open={slideOpen}
          onClose={closeSlide}
          title={editing ? "Edit File" : "Upload File"}
          subtitle={editing ? `Editing ${editing.filename}` : "Add a new media file to the library."}
          footer={
            <>
              <button className="admin-btn admin-btn-secondary" onClick={closeSlide}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editing ? "Save Changes" : "Upload File"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {field(
              "Filename *",
              <input
                className="admin-input"
                value={form.filename}
                onChange={(e) => setForm({ ...form, filename: e.target.value })}
                placeholder="e.g. hero_image.jpg"
              />,
            )}
            {field(
              "URL *",
              <div>
                <input
                  className="admin-input"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://…"
                />
                {form.url && form.type === "image" && (
                  <img
                    src={form.url}
                    alt="preview"
                    className="mt-2 w-full h-32 object-cover rounded border border-[#30363d]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </div>,
            )}
            {field(
              "Type",
              <select
                className="admin-select w-full"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MediaItem["type"] })}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>,
            )}
            {field(
              "Alt Text",
              <input
                className="admin-input"
                value={form.alt}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
                placeholder="Describe the file for accessibility…"
              />,
            )}
            {field(
              "Folder",
              <select
                className="admin-select w-full"
                value={form.folder}
                onChange={(e) => setForm({ ...form, folder: e.target.value })}
              >
                {FOLDERS.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>,
            )}
            {field(
              "Size (KB)",
              <input
                className="admin-input"
                type="number"
                min="0"
                value={form.sizeKB}
                onChange={(e) => setForm({ ...form, sizeKB: e.target.value })}
                placeholder="e.g. 2840"
              />,
            )}
          </div>
        </SlideOver>

        {/* Delete ConfirmDialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete File"
          description={`Permanently delete "${deleteTarget?.filename}"? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
}
