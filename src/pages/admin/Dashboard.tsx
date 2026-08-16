import { Link } from "react-router-dom";
import { DollarSign, ShoppingBag, Calendar, Users, MessageSquare, FileText, TrendingUp, ArrowRight, Plus, Receipt, FolderOpen } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }); } catch { return s; }
}

const PAYMENT_COLORS: Record<string, string> = {
  paid: "admin-badge-green", partially_paid: "admin-badge-yellow",
  processing: "admin-badge-blue", pending: "admin-badge-gray",
  failed: "admin-badge-red", refunded: "admin-badge-purple", cancelled: "admin-badge-red",
};

const BOOKING_COLORS: Record<string, string> = {
  confirmed: "admin-badge-green", pending: "admin-badge-yellow",
  completed: "admin-badge-blue", cancelled: "admin-badge-red", rescheduled: "admin-badge-purple",
};

export default function AdminDashboard() {
  const { orders, bookings, customers, messages, invoices, leads, auditLog, projects } = useAdmin();

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const revenueMonth = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === month && d.getFullYear() === year && o.paymentStatus === "paid";
  }).reduce((s, o) => s + o.amount, 0);

  const revenuePrev = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear && o.paymentStatus === "paid";
  }).reduce((s, o) => s + o.amount, 0);

  const revenueChange = revenuePrev > 0 ? Math.round(((revenueMonth - revenuePrev) / revenuePrev) * 100) : 0;

  const activeOrders = orders.filter((o) => ["pending", "processing", "partially_paid"].includes(o.paymentStatus)).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const newLeads = leads.filter((l) => l.stage === "new").length;
  const unread = messages.filter((m) => !m.read).length;
  const invoicesDue = invoices.filter((i) => ["pending", "overdue"].includes(i.paymentStatus)).length;
  const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.amount, 0);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const upcomingBookings = [...bookings].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const recentMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recentActivity = [...auditLog].slice(0, 6);

  const statCards = [
    { label: "Revenue (This Month)", value: fmt(revenueMonth), sub: revenueChange !== 0 ? `${revenueChange > 0 ? "+" : ""}${revenueChange}% vs last month` : "No change", up: revenueChange >= 0, icon: DollarSign, color: "#3fb950" },
    { label: "Active Orders", value: String(activeOrders), sub: `${orders.length} total`, up: true, icon: ShoppingBag, color: "#58a6ff" },
    { label: "Pending Bookings", value: String(pendingBookings), sub: `${bookings.length} total`, up: false, icon: Calendar, color: "#d29922" },
    { label: "New Leads", value: String(newLeads), sub: `${leads.length} in pipeline`, up: true, icon: TrendingUp, color: "#ff5a00" },
    { label: "Unread Messages", value: String(unread), sub: `${messages.length} total`, up: false, icon: MessageSquare, color: "#a371f7" },
    { label: "Invoices Due", value: String(invoicesDue), sub: `${invoices.length} total`, up: false, icon: FileText, color: "#f85149" },
  ];

  const quickActions = [
    { label: "New Project", icon: FolderOpen, to: "/admin/projects" },
    { label: "New Invoice", icon: Receipt, to: "/admin/invoices" },
    { label: "New Booking", icon: Calendar, to: "/admin/bookings" },
    { label: "View Messages", icon: MessageSquare, to: "/admin/messages" },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <p className="admin-label" style={{ color: "#484f58", marginBottom: 6 }}>
              {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="admin-heading">Dashboard</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="admin-badge admin-badge-green" style={{ gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3fb950", display: "inline-block", animation: "pulse-glow 2s ease-in-out infinite" }} />
              LIVE
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
          {statCards.map((s) => (
            <div key={s.label} className="admin-stat-card" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p className="admin-label" style={{ color: "#7d8590", marginBottom: 10 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: "#e6edf3", margin: "0 0 4px", fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
                <p className="admin-label" style={{ color: s.up ? "#3fb950" : "#7d8590" }}>{s.sub}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: s.color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="admin-card" style={{ padding: "16px 24px", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 0 }}>
            {[
              { label: "Total Revenue", value: fmt(totalRevenue), color: "#3fb950" },
              { label: "Customers", value: String(customers.length), color: "#e6edf3" },
              { label: "Projects", value: String(projects.length), color: "#e6edf3" },
              { label: "Leads Pipeline", value: String(leads.length), color: "#e6edf3" },
            ].map((item, i) => (
              <div key={item.label} style={{ textAlign: "center", padding: "8px 16px", borderLeft: i > 0 ? "1px solid #21262d" : "none" }}>
                <p className="admin-label" style={{ color: "#484f58", marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: item.color, margin: 0, fontFamily: "'Inter', sans-serif" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#161b22", border: "1px solid #30363d", borderRadius: 8, textDecoration: "none", color: "#8b949e", fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif", transition: "border-color 0.15s, color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#ff5a00"; (e.currentTarget as HTMLElement).style.color = "#e6edf3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#30363d"; (e.currentTarget as HTMLElement).style.color = "#8b949e"; }}
            >
              <Plus size={14} style={{ color: "#ff5a00" }} />
              {a.label}
            </Link>
          ))}
        </div>

        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Recent orders */}
          <div className="admin-card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #21262d" }}>
              <p className="admin-heading-sm">Recent Orders</p>
              <Link to="/admin/orders" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7d8590", textDecoration: "none" }}>View all <ArrowRight size={12} /></Link>
            </div>
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontSize: 11, color: "#484f58" }}>{o.orderId.split("-").pop()}</td>
                    <td style={{ fontWeight: 500, color: "#e6edf3" }}>{o.customer}</td>
                    <td>{fmt(o.amount)}</td>
                    <td><span className={`admin-badge ${PAYMENT_COLORS[o.paymentStatus] ?? "admin-badge-gray"}`}>{o.paymentStatus.replace(/_/g, " ")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upcoming bookings */}
          <div className="admin-card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #21262d" }}>
              <p className="admin-heading-sm">Upcoming Bookings</p>
              <Link to="/admin/bookings" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7d8590", textDecoration: "none" }}>View all <ArrowRight size={12} /></Link>
            </div>
            <table className="admin-table">
              <thead><tr><th>Client</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {upcomingBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500, color: "#e6edf3" }}>{b.name}</td>
                    <td style={{ fontSize: 12, color: "#7d8590" }}>{b.type}</td>
                    <td style={{ fontSize: 12 }}>{fmtDate(b.date)}</td>
                    <td><span className={`admin-badge ${BOOKING_COLORS[b.status] ?? "admin-badge-gray"}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Messages */}
          <div className="admin-card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #21262d" }}>
              <p className="admin-heading-sm">Messages</p>
              <Link to="/admin/messages" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7d8590", textDecoration: "none" }}>View all <ArrowRight size={12} /></Link>
            </div>
            <div>
              {recentMessages.map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 20px", borderBottom: "1px solid #21262d" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.read ? "transparent" : "#ff5a00", marginTop: 6, flexShrink: 0, border: m.read ? "1px solid #30363d" : "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.from}</p>
                    <p style={{ fontSize: 12, color: "#7d8590", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject}</p>
                  </div>
                  <p className="admin-label" style={{ color: "#484f58", flexShrink: 0 }}>{fmtDate(m.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit log */}
          <div className="admin-card" style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d" }}>
              <p className="admin-heading-sm">Recent Activity</p>
            </div>
            <div>
              {recentActivity.map((log) => (
                <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px", borderBottom: "1px solid #21262d" }}>
                  <span className={`admin-badge admin-badge-${log.action === "CREATE" ? "green" : log.action === "DELETE" ? "red" : log.action === "PUBLISH" ? "orange" : "blue"}`} style={{ marginTop: 1, flexShrink: 0 }}>{log.action}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: "#c9d1d9", margin: "0 0 2px" }}>{log.entity}: <strong style={{ color: "#e6edf3" }}>{log.entityName}</strong></p>
                    <p className="admin-label" style={{ color: "#484f58", margin: 0 }}>{log.user} · {typeof log.timestamp === "string" ? log.timestamp.slice(0, 10) : log.timestamp}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 20px" }}>
                <Link to="/admin/audit" style={{ fontSize: 12, color: "#7d8590", textDecoration: "none" }}>View full audit log →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Leads pipeline summary */}
        <div className="admin-card" style={{ padding: 20, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p className="admin-heading-sm">Leads Pipeline</p>
            <Link to="/admin/leads" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7d8590", textDecoration: "none" }}>Manage <ArrowRight size={12} /></Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
            {(["new","contacted","qualified","proposal","won","lost"] as const).map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length;
              const value = leads.filter((l) => l.stage === stage).reduce((s, l) => s + l.value, 0);
              const stageColor: Record<string, string> = { new: "#58a6ff", contacted: "#d29922", qualified: "#a371f7", proposal: "#ff5a00", won: "#3fb950", lost: "#f85149" };
              return (
                <div key={stage} style={{ textAlign: "center", padding: "14px 8px", background: "#0d1117", borderRadius: 8, border: "1px solid #21262d" }}>
                  <p style={{ fontSize: 11, color: "#484f58", textTransform: "capitalize", marginBottom: 8 }}>{stage}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: stageColor[stage], margin: "0 0 4px" }}>{count}</p>
                  <p style={{ fontSize: 11, color: "#484f58" }}>{value > 0 ? fmt(value) : "—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
