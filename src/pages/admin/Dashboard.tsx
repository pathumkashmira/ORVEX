import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CalendarCheck,
  UserPlus,
  MessageSquare,
  FileText,
  DollarSign,
  Users,
  FolderOpen,
  Inbox,
  Plus,
  Receipt,
  ArrowRight,
} from "lucide-react";

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(str: string) {
  try {
    return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return str;
  }
}

function timeAgo(str: string) {
  try {
    const diff = Date.now() - new Date(str).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  } catch {
    return str;
  }
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "admin-badge-green",
  UPDATE: "admin-badge-blue",
  DELETE: "admin-badge-red",
  PUBLISH: "admin-badge-orange",
  DRAFT: "admin-badge-gray",
  LOGIN: "admin-badge-blue",
  VIEW: "admin-badge-gray",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  paid: "admin-badge-green",
  partially_paid: "admin-badge-yellow",
  pending: "admin-badge-yellow",
  processing: "admin-badge-blue",
  failed: "admin-badge-red",
  refunded: "admin-badge-gray",
  cancelled: "admin-badge-gray",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, bookings, leads, messages, invoices, auditLog, customers, projects } = useAdmin();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const revenueAug = orders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.paymentStatus === "paid";
    })
    .reduce((s, o) => s + o.amount, 0);

  const revenuePrev = orders
    .filter((o) => {
      const d = new Date(o.createdAt);
      const pm = currentMonth === 0 ? 11 : currentMonth - 1;
      const py = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === pm && d.getFullYear() === py && o.paymentStatus === "paid";
    })
    .reduce((s, o) => s + o.amount, 0);

  const revenueChange = revenuePrev > 0 ? Math.round(((revenueAug - revenuePrev) / revenuePrev) * 100) : 0;

  const activeOrders = orders.filter((o) =>
    ["pending", "processing", "partially_paid"].includes(o.paymentStatus)
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const newLeads = leads.filter((l) => l.stage === "new").length;
  const unreadMessages = messages.filter((m) => !m.read).length;
  const invoicesDue = invoices.filter((i) => ["pending", "overdue"].includes(i.paymentStatus)).length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.amount, 0);

  const recentActivity = [...auditLog].slice(0, 8);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const quickActions = [
    { label: "New Project", icon: FolderOpen, route: "/admin/projects", color: "#ff5a00" },
    { label: "New Invoice", icon: Receipt, route: "/admin/invoices", color: "#58a6ff" },
    { label: "New Booking", icon: CalendarCheck, route: "/admin/bookings", color: "#3fb950" },
    { label: "View Messages", icon: MessageSquare, route: "/admin/messages", color: "#d29922" },
  ];

  const statCards = [
    {
      label: "Revenue (Aug)",
      value: formatCurrency(revenueAug),
      change: revenueChange,
      icon: DollarSign,
      iconColor: "#3fb950",
    },
    {
      label: "Active Orders",
      value: String(activeOrders),
      change: null,
      icon: ShoppingCart,
      iconColor: "#58a6ff",
    },
    {
      label: "Pending Bookings",
      value: String(pendingBookings),
      change: null,
      icon: CalendarCheck,
      iconColor: "#d29922",
    },
    {
      label: "New Leads",
      value: String(newLeads),
      change: null,
      icon: UserPlus,
      iconColor: "#ff5a00",
    },
    {
      label: "Unread Messages",
      value: String(unreadMessages),
      change: null,
      icon: Inbox,
      iconColor: "#a371f7",
    },
    {
      label: "Invoices Due",
      value: String(invoicesDue),
      change: null,
      icon: FileText,
      iconColor: "#f85149",
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="admin-heading">Dashboard</h1>
              <span className="admin-badge admin-badge-gray text-xs">{today}</span>
              <span className="admin-badge admin-badge-green text-xs flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="admin-body text-[#7d8590] mt-1">
              Welcome back. Here is what is happening at ORVEX.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="admin-stat-card flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="admin-label text-[#7d8590] mb-2">{card.label}</p>
                  <p className="text-2xl font-bold text-[#e6edf3] tracking-tight">{card.value}</p>
                  {card.change !== null && (
                    <p
                      className={`admin-label mt-1 flex items-center gap-1 ${
                        card.change >= 0 ? "text-[#3fb950]" : "text-[#f85149]"
                      }`}
                    >
                      {card.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(card.change)}% vs last month
                    </p>
                  )}
                </div>
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: card.iconColor + "1a" }}
                >
                  <Icon size={18} style={{ color: card.iconColor }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Summary Row */}
        <div className="admin-card p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="admin-label text-[#7d8590] mb-1 flex items-center justify-center gap-1">
                <DollarSign size={11} /> Total Revenue
              </p>
              <p className="text-xl font-bold text-[#3fb950]">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="text-center border-l border-[#30363d]">
              <p className="admin-label text-[#7d8590] mb-1 flex items-center justify-center gap-1">
                <Users size={11} /> Customers
              </p>
              <p className="text-xl font-bold text-[#e6edf3]">{customers.length}</p>
            </div>
            <div className="text-center border-l border-[#30363d]">
              <p className="admin-label text-[#7d8590] mb-1 flex items-center justify-center gap-1">
                <FolderOpen size={11} /> Projects
              </p>
              <p className="text-xl font-bold text-[#e6edf3]">{projects.length}</p>
            </div>
            <div className="text-center border-l border-[#30363d]">
              <p className="admin-label text-[#7d8590] mb-1 flex items-center justify-center gap-1">
                <MessageSquare size={11} /> Messages
              </p>
              <p className="text-xl font-bold text-[#e6edf3]">{messages.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 admin-card p-5">
            <h2 className="admin-heading-sm mb-5">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="admin-body text-[#7d8590] py-8 text-center">No activity yet.</p>
            ) : (
              <div className="space-y-0">
                {recentActivity.map((entry, i) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center flex-shrink-0 pt-1">
                      <div className="w-2 h-2 rounded-full bg-[#30363d] border border-[#58a6ff]" />
                      {i < recentActivity.length - 1 && (
                        <div className="w-px bg-[#30363d] flex-1 mt-1" style={{ minHeight: "28px" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`admin-badge text-[10px] ${ACTION_COLORS[entry.action] ?? "admin-badge-gray"}`}
                        >
                          {entry.action}
                        </span>
                        <span className="admin-body text-[#e6edf3] text-xs font-medium">
                          {entry.entityName}
                        </span>
                        <span className="admin-label text-[#7d8590] text-[11px]">{entry.entity}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="admin-label text-[#7d8590] text-[11px]">{entry.userName}</span>
                        <span className="text-[#30363d] text-xs">·</span>
                        <span className="admin-label text-[#7d8590] text-[11px]">{timeAgo(entry.timestamp)}</span>
                        {entry.details && (
                          <>
                            <span className="text-[#30363d] text-xs">·</span>
                            <span className="admin-label text-[#7d8590] text-[11px] truncate max-w-[200px]">
                              {entry.details}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="admin-card p-5">
            <h2 className="admin-heading-sm mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.route)}
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-lg border border-[#30363d] hover:border-[#ff5a00] hover:bg-[#ff5a001a] transition-all text-center group cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: action.color + "1a" }}
                    >
                      <Icon size={16} style={{ color: action.color }} />
                    </div>
                    <span className="admin-label text-[#e6edf3] group-hover:text-[#ff5a00] transition-colors text-[11px] leading-tight">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => navigate("/admin/projects")}
              className="mt-4 w-full admin-btn admin-btn-primary flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              New Project
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="admin-heading-sm">Recent Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="admin-btn admin-btn-ghost admin-btn-sm flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="admin-body text-[#7d8590] py-8 text-center">No orders yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => navigate("/admin/orders")}
                    >
                      <td className="font-mono text-xs text-[#ff5a00]">{order.orderId}</td>
                      <td className="font-medium text-[#e6edf3]">{order.customer}</td>
                      <td className="text-[#7d8590] text-sm">{order.service}</td>
                      <td className="font-semibold text-[#e6edf3]">{formatCurrency(order.amount)}</td>
                      <td>
                        <span
                          className={`admin-badge ${ORDER_STATUS_COLORS[order.paymentStatus] ?? "admin-badge-gray"}`}
                        >
                          {order.paymentStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="text-[#7d8590] text-xs">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
