import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type { SEOSettings } from "@/contexts/AdminContext";

const DEFAULTS: SEOSettings = {
  siteName: "ORVEX",
  siteDescription: "Premium 3D design, CGI, and motion studio. Form. Motion. Beyond.",
  siteUrl: "https://orvex.studio",
  ogImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=630&fit=crop&auto=format",
  twitterHandle: "@orvexstudio",
  googleAnalyticsId: "G-XXXXXXXXXX",
  robots: "index,follow",
};

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const warn = len > max;
  return (
    <span className={`text-xs ${warn ? "text-[#f85149]" : "text-[#7d8590]"}`}>
      {len}/{max}
    </span>
  );
}

export default function AdminSEO() {
  const { seo, updateSEO } = useAdmin();
  const { toast } = useToast();
  const [form, setForm] = useState<SEOSettings>({ ...seo });

  const set = <K extends keyof SEOSettings>(k: K, v: SEOSettings[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    updateSEO(form);
    toast.success("SEO settings saved");
  };

  const handleReset = () => {
    setForm({ ...DEFAULTS });
    toast.info("Form reset to defaults");
  };

  // Google SERP preview values
  const previewTitle = form.siteName ? `${form.siteName} — ${form.siteDescription.slice(0, 30)}` : "Page Title";
  const previewUrl = form.siteUrl || "https://example.com";
  const previewDesc = form.siteDescription.slice(0, 160) || "Page description will appear here.";

  return (
    <AdminLayout>
      <div className="admin-page" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">SEO Settings</h1>
            <p className="text-sm text-[#7d8590] mt-1">Control how ORVEX appears in search results</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="admin-btn admin-btn-ghost" onClick={handleReset}>
              Reset to Defaults
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Site Identity */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Site Identity</h2>
            <div className="space-y-4">
              <div className="admin-field">
                <label className="admin-field-label">Site Name</label>
                <input
                  className="admin-input"
                  value={form.siteName}
                  onChange={(e) => set("siteName", e.target.value)}
                  placeholder="ORVEX"
                />
              </div>

              <div className="admin-field">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="admin-field-label">Site Description</label>
                  <CharCount value={form.siteDescription} max={160} />
                </div>
                <textarea
                  className="admin-input admin-textarea"
                  value={form.siteDescription}
                  onChange={(e) => set("siteDescription", e.target.value)}
                  placeholder="Short description shown in search results (max 160 chars)"
                  rows={3}
                />
              </div>

              <div className="admin-field">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="admin-field-label">Site URL</label>
                  <CharCount value={form.siteUrl} max={100} />
                </div>
                <input
                  className="admin-input"
                  value={form.siteUrl}
                  onChange={(e) => set("siteUrl", e.target.value)}
                  placeholder="https://orvex.studio"
                />
              </div>

              <div className="admin-field">
                <label className="admin-field-label">OG Image URL</label>
                <input
                  className="admin-input"
                  value={form.ogImage}
                  onChange={(e) => set("ogImage", e.target.value)}
                  placeholder="https://..."
                />
                {form.ogImage && (
                  <div className="mt-3 rounded overflow-hidden border border-[#30363d]" style={{ maxWidth: 320, aspectRatio: "1200/630" }}>
                    <img
                      src={form.ogImage}
                      alt="OG Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social & Analytics */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Social &amp; Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="admin-field">
                <label className="admin-field-label">Twitter Handle</label>
                <input
                  className="admin-input"
                  value={form.twitterHandle}
                  onChange={(e) => set("twitterHandle", e.target.value)}
                  placeholder="@handle"
                />
              </div>
              <div className="admin-field">
                <label className="admin-field-label">Google Analytics ID</label>
                <input
                  className="admin-input"
                  value={form.googleAnalyticsId}
                  onChange={(e) => set("googleAnalyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Indexing */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Indexing</h2>
            <div className="admin-field" style={{ maxWidth: 300 }}>
              <label className="admin-field-label">Robots Meta Tag</label>
              <select
                className="admin-input admin-select"
                value={form.robots}
                onChange={(e) => set("robots", e.target.value as SEOSettings["robots"])}
              >
                <option value="index,follow">index, follow (recommended)</option>
                <option value="noindex,nofollow">noindex, nofollow</option>
                <option value="index,nofollow">index, nofollow</option>
              </select>
            </div>
            {form.robots !== "index,follow" && (
              <div className="mt-3 flex items-center gap-2 text-[#d29922] text-sm">
                <span>⚠</span>
                <span>Non-standard robots setting may prevent indexing.</span>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Search Result Preview</h2>
            <p className="text-xs text-[#7d8590] mb-4">Approximate Google SERP appearance</p>
            <div
              style={{
                background: "#1c2028",
                border: "1px solid #30363d",
                borderRadius: 8,
                padding: "16px 20px",
                maxWidth: 600,
                fontFamily: "Arial, sans-serif",
              }}
            >
              {/* Favicon row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 16, height: 16, borderRadius: 2, background: "#ff5a00", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#bdc1c6" }}>{previewUrl}</span>
              </div>
              {/* Title */}
              <p style={{ fontSize: 18, color: "#8ab4f8", margin: "4px 0", lineHeight: 1.3, cursor: "pointer", textDecoration: "underline" }}>
                {previewTitle.slice(0, 60)}
              </p>
              {/* Description */}
              <p style={{ fontSize: 13, color: "#bdc1c6", margin: 0, lineHeight: 1.5 }}>
                {previewDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
