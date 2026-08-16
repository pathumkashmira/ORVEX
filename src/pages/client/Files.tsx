import { useState, useRef } from "react";
import { Upload, Download, FileText, Image, Film, Archive, Trash2, FolderOpen } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import { useApp } from "@/contexts/AppContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";

interface ClientFile {
  id: string;
  name: string;
  size: string;
  type: "image" | "video" | "document" | "archive" | "other";
  uploadedBy: "client" | "studio";
  date: string;
  orderId?: string;
  projectLabel?: string;
}

const SEED_FILES: ClientFile[] = [
  { id: "f1", name: "axiom-hero-4k.tif", size: "248 MB", type: "image", uploadedBy: "studio", date: "2026-08-10", orderId: "ORVEX-ORD-2026-0041", projectLabel: "AXIOM CGI Campaign" },
  { id: "f2", name: "axiom-hero-4k-web.jpg", size: "4.2 MB", type: "image", uploadedBy: "studio", date: "2026-08-10", orderId: "ORVEX-ORD-2026-0041", projectLabel: "AXIOM CGI Campaign" },
  { id: "f3", name: "brand-guidelines-v3.pdf", size: "18 MB", type: "document", uploadedBy: "client", date: "2026-07-22", orderId: "ORVEX-ORD-2026-0041", projectLabel: "AXIOM CGI Campaign" },
  { id: "f4", name: "product-references.zip", size: "92 MB", type: "archive", uploadedBy: "client", date: "2026-07-01", orderId: "ORVEX-ORD-2026-0041", projectLabel: "AXIOM CGI Campaign" },
  { id: "f5", name: "brand-logo-animation-final.mp4", size: "340 MB", type: "video", uploadedBy: "studio", date: "2026-06-20", orderId: "ORVEX-ORD-2026-0029", projectLabel: "Brand Motion Package" },
  { id: "f6", name: "brand-motion-source-files.zip", size: "1.2 GB", type: "archive", uploadedBy: "studio", date: "2026-06-21", orderId: "ORVEX-ORD-2026-0029", projectLabel: "Brand Motion Package" },
];

const FILE_ICONS: Record<ClientFile["type"], typeof FileText> = {
  image: Image,
  video: Film,
  document: FileText,
  archive: Archive,
  other: FileText,
};

const FILE_COLORS: Record<ClientFile["type"], string> = {
  image: "#3b82f6",
  video: "#8b5cf6",
  document: "#10b981",
  archive: "#f59e0b",
  other: "rgba(255,255,255,0.3)",
};

function detectType(name: string): ClientFile["type"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "tif", "tiff", "webp", "svg", "psd"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) return "video";
  if (["pdf", "doc", "docx", "txt", "xlsx"].includes(ext)) return "document";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  return "other";
}

type FilterBy = "all" | "studio" | "client";

export default function ClientFiles() {
  const { user } = useApp();
  const { orders } = useAdmin();
  const { toast } = useToast();
  const [files, setFiles] = useState<ClientFile[]>(SEED_FILES);
  const [filter, setFilter] = useState<FilterBy>("all");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myOrders = orders.filter((o) => o.email === user?.email);
  const projects = myOrders.length > 0
    ? Array.from(new Set(myOrders.map((o) => o.orderId)))
    : Array.from(new Set(SEED_FILES.map((f) => f.orderId).filter(Boolean)));

  const displayed = files.filter((f) => filter === "all" ? true : f.uploadedBy === filter);

  const handleFiles = (incoming: FileList) => {
    const newFiles: ClientFile[] = Array.from(incoming).map((f) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      size: f.size > 1024 * 1024 * 1024
        ? `${(f.size / 1024 / 1024 / 1024).toFixed(1)} GB`
        : f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.round(f.size / 1024)} KB`,
      type: detectType(f.name),
      uploadedBy: "client",
      date: new Date().toISOString().split("T")[0],
    }));
    setFiles((prev) => [...newFiles, ...prev]);
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} uploaded`, "Your files are now visible to the ORVEX team.");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.info("File removed", "The file has been removed from your portal.");
  };

  const handleDownload = (file: ClientFile) => {
    toast.info(`Downloading ${file.name}`, "Your download will begin shortly.");
  };

  const grouped = projects.reduce<Record<string, ClientFile[]>>((acc, oid) => {
    const label = files.find((f) => f.orderId === oid)?.projectLabel ?? oid ?? "Unlinked";
    acc[label] = displayed.filter((f) => f.orderId === oid);
    return acc;
  }, {});

  const ungrouped = displayed.filter((f) => !f.orderId);
  if (ungrouped.length > 0) grouped["Other Files"] = ungrouped;

  const FILTER_OPTS: { key: FilterBy; label: string }[] = [
    { key: "all", label: "All files" },
    { key: "studio", label: "From ORVEX" },
    { key: "client", label: "Uploaded by me" },
  ];

  return (
    <ClientLayout>
      <div style={{ padding: "40px 48px", maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>Client Portal</p>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: "#f5f7f8", lineHeight: 1.1 }}>Files</h1>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#ff5a00", border: "none", cursor: "pointer", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}
          >
            <Upload size={12} /> Upload files
          </button>
          <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `1px dashed ${isDragging ? "#ff5a00" : "rgba(255,255,255,0.1)"}`,
            background: isDragging ? "rgba(255,90,0,0.04)" : "transparent",
            padding: "32px", textAlign: "center", cursor: "pointer", marginBottom: 32,
            transition: "all 0.15s",
          }}
        >
          <Upload size={18} color={isDragging ? "#ff5a00" : "rgba(255,255,255,0.15)"} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 12, color: isDragging ? "#ff5a00" : "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: 4 }}>
            Drop files here or click to upload
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>Any format accepted — files are shared with the ORVEX team</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 1, marginBottom: 32, background: "rgba(255,255,255,0.03)" }}>
          {FILTER_OPTS.map((opt) => (
            <button key={opt.key} onClick={() => setFilter(opt.key)} style={{
              flex: 1, padding: "10px 0", background: filter === opt.key ? "#080a0c" : "transparent",
              border: filter === opt.key ? "1px solid rgba(255,255,255,0.06)" : "none",
              color: filter === opt.key ? "#f5f7f8" : "rgba(255,255,255,0.3)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
            }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* File groups */}
        {Object.entries(grouped).map(([label, groupFiles]) => {
          if (groupFiles.length === 0) return null;
          return (
            <div key={label} style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <FolderOpen size={11} color="rgba(255,255,255,0.2)" />
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {label}
                </p>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>{groupFiles.length} file{groupFiles.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {groupFiles.map((file) => {
                  const Icon = FILE_ICONS[file.type];
                  const color = FILE_COLORS[file.type];
                  return (
                    <div key={file.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#080a0c", border: "1px solid rgba(255,255,255,0.04)", transition: "background 0.12s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0d0f12")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#080a0c")}
                    >
                      <div style={{ width: 32, height: 32, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} color={color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#f5f7f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{file.name}</p>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{file.size}</span>
                          <span style={{ width: 1, height: 8, background: "rgba(255,255,255,0.08)" }} />
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{file.date}</span>
                          <span style={{ width: 1, height: 8, background: "rgba(255,255,255,0.08)" }} />
                          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: file.uploadedBy === "studio" ? "#ff5a00" : "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}>
                            {file.uploadedBy === "studio" ? "ORVEX" : "You"}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => handleDownload(file)} style={{ width: 30, height: 30, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
                          title="Download"
                        >
                          <Download size={11} color="rgba(255,255,255,0.4)" />
                        </button>
                        {file.uploadedBy === "client" && (
                          <button onClick={() => handleDelete(file.id)} style={{ width: 30, height: 30, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
                            title="Remove"
                          >
                            <Trash2 size={11} color="rgba(239,68,68,0.5)" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>No files found for this filter.</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
