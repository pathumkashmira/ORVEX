import { useState, useMemo } from "react";
import { Mail, Send, Archive, UserPlus, Clock, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Message } from "@/data/seed";

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return s;
  }
}

function timeAgo(s: string) {
  try {
    const diff = Date.now() - new Date(s).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch {
    return s;
  }
}

export default function Messages() {
  const { messages, messages_ } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [archiveTarget, setArchiveTarget] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        m.from.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        (m.company ?? "").toLowerCase().includes(q);
      const matchFilter = filter === "all" || !m.read;
      return matchSearch && matchFilter;
    });
  }, [messages, search, filter]);

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    setShowReply(false);
    setReplyText("");
    if (!msg.read) {
      messages_.update({ ...msg, read: true });
    }
  };

  const handleArchive = () => {
    if (!archiveTarget) return;
    messages_.update({ ...archiveTarget, read: true });
    toast.success("Message archived");
    if (selected?.id === archiveTarget.id) setSelected(null);
    setArchiveTarget(null);
  };

  const handleReply = () => {
    toast.success("Reply sent — feature coming soon");
    setReplyText("");
    setShowReply(false);
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div className="flex items-center gap-3">
            <h1 className="admin-heading">Messages</h1>
            {unreadCount > 0 && (
              <span className="admin-badge admin-badge-orange">{unreadCount} unread</span>
            )}
          </div>
        </div>

        {/* Split layout */}
        <div className="flex gap-4 min-h-[calc(100vh-220px)]">
          {/* Left: message list (40%) */}
          <div className="w-[40%] flex-shrink-0 flex flex-col gap-3">
            {/* Search + filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  className="admin-input pl-9 w-full"
                  placeholder="Search messages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1">
                {(["all", "unread"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`admin-btn admin-btn-sm ${filter === f ? "admin-btn-primary" : "admin-btn-ghost"}`}
                  >
                    {f === "all" ? "All" : "Unread"}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-1 overflow-y-auto flex-1">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <Mail size={28} className="text-[#30363d]" />
                  <p className="admin-body text-[#7d8590]">No messages found.</p>
                </div>
              )}
              {filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left rounded-lg px-4 py-3 transition-colors border ${
                    selected?.id === msg.id
                      ? "bg-[#1f2937] border-[#ff5a00]/40"
                      : "bg-[#161b22] border-[#30363d] hover:border-[#4a5568]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-[#ff5a00] flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm truncate ${!msg.read ? "text-[#e6edf3] font-semibold" : "text-[#e6edf3]"}`}>
                        {msg.from}
                      </p>
                    </div>
                    <p className="text-[#7d8590] text-xs flex-shrink-0">{timeAgo(msg.createdAt)}</p>
                  </div>
                  <p className="text-[#e6edf3] text-xs font-medium truncate mb-0.5">{msg.subject}</p>
                  <p className="text-[#7d8590] text-xs truncate">{msg.preview}</p>
                  {msg.company && (
                    <p className="text-[#7d8590] text-xs mt-1 flex items-center gap-1">
                      <Building2 size={10} />{msg.company}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: message detail (60%) */}
          <div className="flex-1 min-w-0">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#30363d]/40 flex items-center justify-center">
                  <Mail size={28} className="text-[#7d8590]" />
                </div>
                <div>
                  <p className="text-[#e6edf3] font-medium mb-1">Select a message</p>
                  <p className="text-[#7d8590] text-sm">Choose a message from the left to read it here.</p>
                </div>
              </div>
            ) : (
              <div className="admin-card h-full flex flex-col">
                {/* Message header */}
                <div className="pb-4 mb-4 border-b border-[#30363d]">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h2 className="admin-heading-sm">{selected.subject}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[#e6edf3] text-sm font-medium">{selected.from}</span>
                        {selected.company && (
                          <span className="admin-badge admin-badge-gray">{selected.company}</span>
                        )}
                      </div>
                      <p className="text-[#7d8590] text-xs mt-0.5">{selected.email}</p>
                    </div>
                    <p className="text-[#7d8590] text-xs flex-shrink-0 flex items-center gap-1">
                      <Clock size={11} />{fmtDate(selected.createdAt)}
                    </p>
                  </div>

                  {/* Metadata row */}
                  {(selected.projectType || selected.budget || selected.timeline) && (
                    <div className="flex gap-4 flex-wrap">
                      {selected.projectType && (
                        <div>
                          <p className="text-[#7d8590] text-xs">Project Type</p>
                          <p className="text-[#e6edf3] text-xs font-medium">{selected.projectType}</p>
                        </div>
                      )}
                      {selected.budget && (
                        <div>
                          <p className="text-[#7d8590] text-xs">Budget</p>
                          <p className="text-[#e6edf3] text-xs font-medium">{selected.budget}</p>
                        </div>
                      )}
                      {selected.timeline && (
                        <div>
                          <p className="text-[#7d8590] text-xs">Timeline</p>
                          <p className="text-[#e6edf3] text-xs font-medium">{selected.timeline}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message body */}
                <div className="flex-1 overflow-y-auto mb-4">
                  <p className="text-[#e6edf3] text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.fullMessage || selected.preview}
                  </p>
                </div>

                {/* Reply compose */}
                {showReply && (
                  <div className="mb-4 space-y-2">
                    <textarea
                      className="admin-textarea w-full"
                      rows={4}
                      placeholder={`Reply to ${selected.from}…`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={handleReply}>
                        <Send size={13} />Send Reply
                      </button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowReply(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#30363d] flex-wrap">
                  {!showReply && (
                    <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setShowReply(true)}>
                      <Send size={13} />Reply
                    </button>
                  )}
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => navigate("/admin/leads")}
                  >
                    <UserPlus size={13} />Convert to Lead
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => setArchiveTarget(selected)}
                  >
                    <Archive size={13} />Archive
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive Message"
        description={`Archive message from ${archiveTarget?.from ?? ""}? It will be marked as read and removed from your unread queue.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </AdminLayout>
  );
}
