import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Check, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

type FilterTab = "all" | "unread" | "read";

interface NewMessageForm {
  to: string;
  email: string;
  company: string;
  subject: string;
  fullMessage: string;
  projectType: string;
  budget: string;
  timeline: string;
}

const emptyForm: NewMessageForm = {
  to: "",
  email: "",
  company: "",
  subject: "",
  fullMessage: "",
  projectType: "",
  budget: "",
  timeline: "",
};

export default function AdminMessages() {
  const { messages, messages_ } = useAdmin();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<NewMessageForm>(emptyForm);

  const filtered = useMemo(() => {
    const sorted = [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter === "unread") return sorted.filter((m) => !m.read);
    if (filter === "read") return sorted.filter((m) => m.read);
    return sorted;
  }, [messages, filter]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  function handleSelect(id: string) {
    setSelectedId(id);
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.read) {
      messages_.edit(id, { read: true });
    }
  }

  function handleMarkUnread(id: string) {
    messages_.edit(id, { read: false });
    toast.info("Marked as unread");
  }

  function handleDelete(id: string) {
    messages_.del(id);
    if (selectedId === id) setSelectedId(null);
    setDeleteId(null);
    toast.success("Message deleted");
  }

  function handleSend() {
    if (!form.to || !form.email || !form.subject || !form.fullMessage) {
      toast.error("Please fill in required fields");
      return;
    }
    messages_.add({
      id: genId(),
      from: form.to,
      email: form.email,
      company: form.company,
      subject: form.subject,
      preview: form.fullMessage.slice(0, 120),
      fullMessage: form.fullMessage,
      projectType: form.projectType,
      budget: form.budget,
      timeline: form.timeline,
      read: true,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    toast.success("Message logged");
    setForm(emptyForm);
    setShowNew(false);
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  const tabLabels: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "read", label: "Read" },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Messages</h1>
            <p style={{ color: "#7d8590", fontSize: 13, marginTop: 4 }}>
              {messages.length} total &middot; {unreadCount} unread
            </p>
          </div>
          <button className="admin-btn primary" onClick={() => setShowNew(true)}>
            <Plus size={15} /> New Message
          </button>
        </div>

        {/* Tab filters */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {tabLabels.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`admin-btn ${filter === t.key ? "primary" : "ghost"} sm`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Inbox split layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 16,
            height: "calc(100vh - 240px)",
            minHeight: 400,
          }}
        >
          {/* Message list */}
          <div
            className="admin-card"
            style={{ padding: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}
          >
            {filtered.length === 0 ? (
              <div className="admin-empty" style={{ flex: 1 }}>
                <div className="admin-empty-icon">
                  <Eye size={28} />
                </div>
                <p>No messages</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "14px 16px",
                    borderBottom: "1px solid #21262d",
                    background: selectedId === msg.id ? "#1c2128" : "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {!msg.read && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#58a6ff",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: msg.read ? 400 : 600,
                        color: "#e6edf3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {msg.from}
                    </span>
                    <span style={{ fontSize: 11, color: "#484f58", flexShrink: 0 }}>
                      {msg.createdAt}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: msg.read ? "#7d8590" : "#c9d1d9",
                      fontWeight: msg.read ? 400 : 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {msg.subject}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#484f58",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {msg.preview}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Message detail */}
          <div className="admin-card" style={{ overflowY: "auto" }}>
            {!selected ? (
              <div className="admin-empty" style={{ height: "100%" }}>
                <div className="admin-empty-icon">
                  <Eye size={28} />
                </div>
                <p>Select a message to read</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <h2
                      style={{ fontSize: 17, fontWeight: 600, color: "#e6edf3", marginBottom: 6 }}
                    >
                      {selected.subject}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 13, color: "#c9d1d9" }}>
                        <strong>From:</strong> {selected.from}
                      </span>
                      <span style={{ fontSize: 13, color: "#7d8590" }}>
                        {selected.email} &middot; {selected.company}
                      </span>
                      <span style={{ fontSize: 12, color: "#484f58" }}>{selected.createdAt}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      className="admin-btn ghost sm"
                      onClick={() => handleMarkUnread(selected.id)}
                    >
                      <EyeOff size={13} /> Mark Unread
                    </button>
                    <button
                      className="admin-btn danger sm"
                      onClick={() => setDeleteId(selected.id)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>

                {/* Meta pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selected.projectType && (
                    <span className="admin-badge blue">{selected.projectType}</span>
                  )}
                  {selected.budget && (
                    <span className="admin-badge green">Budget: {selected.budget}</span>
                  )}
                  {selected.timeline && (
                    <span className="admin-badge orange">Timeline: {selected.timeline}</span>
                  )}
                </div>

                {/* Body */}
                <div
                  style={{
                    background: "#0d1117",
                    borderRadius: 8,
                    padding: 20,
                    fontSize: 14,
                    color: "#c9d1d9",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    border: "1px solid #21262d",
                  }}
                >
                  {selected.fullMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Message SlideOver */}
      <SlideOver
        open={showNew}
        onClose={() => {
          setShowNew(false);
          setForm(emptyForm);
        }}
        title="Log Outbound Message"
        subtitle="Record a message sent to a contact"
        width="lg"
        footer={
          <>
            <button
              className="admin-btn secondary"
              onClick={() => {
                setShowNew(false);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
            <button className="admin-btn primary" onClick={handleSend}>
              <Check size={14} /> Log Message
            </button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-field-label">To (Name) *</label>
            <input
              className="admin-input"
              value={form.to}
              onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              placeholder="Recipient name"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Email *</label>
            <input
              className="admin-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="recipient@company.com"
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
            <label className="admin-field-label">Subject *</label>
            <input
              className="admin-input"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Email subject"
            />
          </div>
          <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
            <label className="admin-field-label">Message *</label>
            <textarea
              className="admin-textarea"
              rows={6}
              value={form.fullMessage}
              onChange={(e) => setForm((f) => ({ ...f, fullMessage: e.target.value }))}
              placeholder="Full message content..."
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Project Type</label>
            <input
              className="admin-input"
              value={form.projectType}
              onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
              placeholder="e.g. Product Visualization"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Budget</label>
            <input
              className="admin-input"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              placeholder="e.g. $5,000 – $10,000"
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Timeline</label>
            <input
              className="admin-input"
              value={form.timeline}
              onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value }))}
              placeholder="e.g. 6 weeks"
            />
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Message"
        description="This message will be permanently deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}
