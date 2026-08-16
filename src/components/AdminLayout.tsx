import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, Briefcase, ShoppingBag, Calendar,
  Users, FileText, MessageSquare, BookOpen, Image, Settings,
  Globe, BarChart2, UserCog, ScrollText, LogOut,
  ChevronLeft, Menu, Star, CreditCard, TrendingUp, ExternalLink,
  Bell, CalendarDays, SlidersHorizontal,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { ToastContainer } from "@/contexts/ToastContext";

const NAV = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
      { icon: BarChart2, label: "Analytics", to: "/admin/analytics" },
    ],
  },
  {
    label: "Content",
    items: [
      { icon: FolderOpen, label: "Projects", to: "/admin/projects" },
      { icon: BookOpen, label: "Journal", to: "/admin/journal" },
      { icon: Image, label: "Media", to: "/admin/media" },
      { icon: Star, label: "Testimonials", to: "/admin/testimonials" },
    ],
  },
  {
    label: "Business",
    items: [
      { icon: Briefcase, label: "Services", to: "/admin/services" },
      { icon: ShoppingBag, label: "Orders", to: "/admin/orders" },
      { icon: Calendar, label: "Bookings", to: "/admin/bookings" },
      { icon: Users, label: "Customers", to: "/admin/customers" },
      { icon: TrendingUp, label: "Leads", to: "/admin/leads" },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { icon: CalendarDays, label: "Calendar", to: "/admin/calendar" },
      { icon: SlidersHorizontal, label: "Booking Settings", to: "/admin/booking-settings" },
    ],
  },
  {
    label: "Finance",
    items: [
      { icon: FileText, label: "Invoices", to: "/admin/invoices" },
      { icon: CreditCard, label: "Payments", to: "/admin/payments" },
    ],
  },
  {
    label: "Communication",
    items: [
      { icon: MessageSquare, label: "Messages", to: "/admin/messages" },
      { icon: Bell, label: "Notifications", to: "/admin/notifications" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: Settings, label: "Settings", to: "/admin/settings" },
      { icon: Globe, label: "SEO", to: "/admin/seo" },
      { icon: UserCog, label: "Users & Roles", to: "/admin/users" },
      { icon: ScrollText, label: "Audit Log", to: "/admin/audit" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = () => { logout(); navigate("/"); };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const isActive = (to: string) =>
    to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  const Sidebar = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid #21262d", flexShrink: 0 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flex: 1, minWidth: 0 }}>
          <div style={{ width: 24, height: 24, background: "#ff5a00", borderRadius: "50%", flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.14em", color: "#e6edf3" }}>
              ORVEX
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{ background: "none", border: "none", color: "#7d8590", cursor: "pointer", padding: 4, display: "flex", marginLeft: 4, flexShrink: 0 }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {NAV.map((group) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            {!collapsed && (
              <p style={{ padding: "0 8px", marginBottom: 4, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#484f58", fontFamily: "'Inter', sans-serif" }}>
                {group.label}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 8px",
                      borderRadius: 6,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                      color: active ? "#ff5a00" : "#7d8590",
                      background: active ? "rgba(255,90,0,0.08)" : "transparent",
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "#21262d";
                        (e.currentTarget as HTMLElement).style.color = "#e6edf3";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#7d8590";
                      }
                    }}
                  >
                    <item.icon size={14} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User */}
      <div style={{ borderTop: "1px solid #21262d", padding: 12, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", borderRadius: 6, background: "#21262d" }}>
            <div style={{ width: 26, height: 26, background: "#ff5a00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
              <p style={{ fontSize: 10, color: "#484f58", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", color: "#7d8590", fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif", transition: "color 0.15s, background 0.15s", textAlign: "left" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f85149"; (e.currentTarget as HTMLElement).style.background = "rgba(248,81,73,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#7d8590"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <LogOut size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d1117", overflow: "hidden", fontFamily: "'Inter', sans-serif", cursor: "default" }}>
      <ToastContainer />

      {/* Desktop sidebar */}
      <aside style={{ display: "none", flexDirection: "column", background: "#161b22", borderRight: "1px solid #21262d", flexShrink: 0, transition: "width 0.25s", width: collapsed ? 52 : 216 }} className="md-flex">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 216, background: "#161b22", borderRight: "1px solid #21262d", display: "flex", flexDirection: "column" }}>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{ height: 60, borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0, background: "#161b22" }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: "none", border: "none", color: "#7d8590", cursor: "pointer", display: "flex", padding: 4 }}
            className="mobile-only"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "#7d8590", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e6edf3")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#7d8590")}
            >
              <ExternalLink size={12} />
              View Site
            </Link>
            <div style={{ width: 1, height: 16, background: "#21262d" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: "#ff5a00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                {initials}
              </div>
              <span style={{ fontSize: 13, color: "#8b949e" }}>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#0d1117" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
