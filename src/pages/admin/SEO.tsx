import { useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type { SEOSettings } from "@/contexts/AdminContext";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: value ? "#3fb950" : "#30363d",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: value ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function CharCount({ value, limit, label }: { value: string; limit: number; label: string }) {
  const len = value.length;
  const ok = len <= limit;
  return (
    <span style={{ fontSize: 11, color: ok ? "#484f58" : "#f85149", marginLeft: 8 }}>
      {len}/{limit} {label}
    </span>
  );
}

export default function AdminSEO() {
  const ctx = useAdmin();
  const { toast } = useToast(); const success = toast.success;
  const [form, setForm] = useState<SEOSettings>({ ...ctx.seo });
  const [imgError, setImgError] = useState(false);

  const set = <K extends keyof SEOSettings>(k: K, v: SEOSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    ctx.updateSEO(form);
    success("SEO settings saved.");
  };

  const previewUrl = form.ogImage.trim();

  return (
    <AdminLayout>
      <div className="admin-page" style={{ maxWidth: 860 }}>
        <div className="admin-page-header">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#484f58", textTransform: "uppercase", marginBottom: 4 }}>SYSTEM</p>
            <h1 className="admin-heading">SEO Settings</h1>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleSave}>
            <Save size={14} /> Save Changes
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Site Title */}
          <div className="admin-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Basic Meta
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="admin-field">
                <label className="admin-field-label" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Site Title
                  <CharCount value={form.siteTitle} limit={60} label="chars (rec. ≤60)" />
                </label>
                <input
                  className="admin-input"
                  value={form.siteTitle}
                  onChange={(e) => set("siteTitle", e.target.value)}
                  placeholder="ORVEX — Premium 3D & CGI Studio"
                />
                {form.siteTitle.length > 60 && (
                  <p style={{ fontSize: 11, color: "#f85149", marginTop: 4 }}>Title exceeds recommended 60 characters. Search engines may truncate it.</p>
                )}
              </div>

              <div className="admin-field">
                <label className="admin-field-label" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Site Description
                  <CharCount value={form.siteDescription} limit={160} label="chars (rec. ≤160)" />
                </label>
                <textarea
                  className="admin-input admin-textarea"
                  rows={3}
                  value={form.siteDescription}
                  onChange={(e) => set("siteDescription", e.target.value)}
                  placeholder="Describe your site in 1–2 sentences for search engines."
                />
                {form.siteDescription.length > 160 && (
                  <p style={{ fontSize: 11, color: "#f85149", marginTop: 4 }}>Description exceeds recommended 160 characters. Search engines may truncate it.</p>
                )}
              </div>

              <div className="admin-field">
                <label className="admin-field-label">Keywords</label>
                <textarea
                  className="admin-input admin-textarea"
                  rows={2}
                  value={form.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="comma, separated, keywords"
                />
              </div>
            </div>
          </div>

          {/* Social / OG */}
          <div className="admin-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Open Graph &amp; Social
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="admin-field">
                <label className="admin-field-label">OG Image URL</label>
                <input
                  className="admin-input"
                  value={form.ogImage}
                  onChange={(e) => { set("ogImage", e.target.value); setImgError(false); }}
                  placeholder="https://example.com/og-image.jpg (1200×630)"
                />
              </div>

              {previewUrl && !imgError && (
                <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid #30363d", maxWidth: 480 }}>
                  <img
                    src={previewUrl}
                    alt="OG image preview"
                    style={{ width: "100%", height: 252, objectFit: "cover", display: "block" }}
                    onError={() => setImgError(true)}
                  />
                  <div style={{ background: "#0d1117", padding: "8px 12px", borderTop: "1px solid #21262d" }}>
                    <p style={{ fontSize: 10, color: "#484f58" }}>OG image preview — 1200×630 recommended</p>
                  </div>
                </div>
              )}

              {previewUrl && imgError && (
                <p style={{ fontSize: 12, color: "#f85149" }}>Could not load image from that URL.</p>
              )}

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label className="admin-field-label">Twitter Handle</label>
                  <input
                    className="admin-input"
                    value={form.twitterHandle}
                    onChange={(e) => set("twitterHandle", e.target.value)}
                    placeholder="@orvex_studio"
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label">Google Analytics ID</label>
                  <input
                    className="admin-input"
                    value={form.googleAnalyticsId}
                    onChange={(e) => set("googleAnalyticsId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Indexing toggle */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  {form.indexing ? <Eye size={14} /> : <EyeOff size={14} color="#f85149" />}
                  Search Engine Indexing
                </p>
                <p style={{ fontSize: 12, color: "#7d8590" }}>
                  {form.indexing
                    ? "Search engines are allowed to index this site. robots.txt is permissive."
                    : "Indexing is OFF. A noindex header is sent to search engines."}
                </p>
              </div>
              <Toggle value={form.indexing} onChange={(v) => set("indexing", v)} />
            </div>
            {!form.indexing && (
              <div style={{ marginTop: 12, background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.2)", borderRadius: 6, padding: "8px 12px" }}>
                <p style={{ fontSize: 12, color: "#f85149" }}>Warning: search engines will not index this site while indexing is disabled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
