import { useState, useMemo } from "react";
import { Bell, Mail, ShoppingBag, CreditCard, Calendar, Check, CheckCheck, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type NotifType = "booking" | "message" | "order" | "system" | "payment";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  {
    id: "n1",
    type: "booking",
    title: "New Booking Request",
    description: "Emma Reynolds — Discovery Call scheduled for Aug 20 at 11:00 AM.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    type: "message",
    title: "New Message",
    description: "Rania Khalil inquired about product visualization for a luxury perfume line.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "n3",
    type: "order",
    title: "New Order Received",
    description: "ORVEX-ORD-2026-0045 — Emma Reynolds ordered 3D Advertising PREMIUM ($22,000).",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "n4",
    type: "payment",
    title: "Payment Received",
    description: "Marcus Webb paid $3,800 for INV-2026-0041 via Stripe.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n5",
    type: "booking",
    title: "Booking Confirmed",
    description: "Yuki Tanaka — Creative Consultation confirmed for Aug 18 at 09:00 AM.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n6",
    type: "system",
    title: "System Notice",
    description: "Admin store was initialized with seed data. All systems are operational.",
    time: "7 days ago",
    read: true,
  },
];

const ICON: Record<NotifType, React.ReactNode> = {
  booking: <Calendar size={16} />,
  message: <Mail size={16} />,
  order: <ShoppingBag size={16} />,
  system: <Bell size={16} />,
  payment: <CreditCard size={16} />,
};

const ICON_COLOR: Record<NotifType, string> = {
  booking:  "#a371f7",
  message:  "#58a6ff",
  order:    "#ff5a00",
  system:   "#d29922",
  payment:  "#3fb950",
};

export default function AdminNotifications() {
  const [items, setItems] = useState<Notification[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [clearOpen, setClearOpen] = useState(false);

  const filtered = useMemo(
    () => (filter === "unread" ? items.filter((n) => !n.read) : items),
    [items, filter]
  );

  const unreadCount = items.filter((n) => !n.read).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setItems([]);
    setClearOpen(false);
  }

  return (
    <AdminLayout>
      <div className="admin-page" style={{ maxWidth: 720 }}>
        <div className="admin-page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#484f58", textTransform: "uppercase", marginBottom: 4 }}>SYSTEM</p>
              <h1 className="admin-heading">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <span className="admin-badge admin-badge-orange">{unreadCount} unread</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {unreadCount > 0 && (
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={markAllRead}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            {items.length > 0 && (
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setClearOpen(true)}>
                <Trash2 size={13} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid #21262d" }}>
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "capitalize",
                border: "none",
                borderBottom: filter === f ? "2px solid #ff5a00" : "2px solid transparent",
                background: "transparent",
                color: filter === f ? "#ff5a00" : "#7d8590",
                cursor: "pointer",
                transition: "color 0.15s",
                marginBottom: -1,
              }}
            >
              {f === "all" ? `All (${items.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><Bell size={20} color="#484f58" /></div>
            <p style={{ fontSize: 13, color: "#484f58" }}>
              {filter === "unread" ? "No unread notifications." : "No notifications."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: 16,
                  borderRadius: 8,
                  border: n.read ? "1px solid #21262d" : "1px solid rgba(255,90,0,0.2)",
                  background: n.read ? "transparent" : "rgba(255,90,0,0.03)",
                  opacity: n.read ? 0.7 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: `${ICON_COLOR[n.type]}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ICON_COLOR[n.type],
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {ICON[n.type]}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: n.read ? "#8b949e" : "#e6edf3" }}>{n.title}</p>
                    <span style={{ fontSize: 11, color: "#484f58", whiteSpace: "nowrap", flexShrink: 0 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#7d8590", lineHeight: 1.5 }}>{n.description}</p>
                </div>

                {/* Mark read action */}
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-icon"
                    title="Mark as read"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  >
                    <Check size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Clear All Notifications"
        description="This will permanently remove all notifications. Are you sure?"
        confirmLabel="Clear All"
        destructive
        onConfirm={clearAll}
        onCancel={() => setClearOpen(false)}
      />
    </AdminLayout>
  );
}
