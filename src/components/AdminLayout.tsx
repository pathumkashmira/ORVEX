import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, Briefcase, ShoppingBag, Calendar,
  Users, FileText, MessageSquare, BookOpen, Image, Settings,
  Globe, BarChart2, UserCog, ScrollText, LogOut,
  ChevronLeft, Menu, Star, CreditCard, TrendingUp, ExternalLink,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { ToastContainer } from "@/contexts/ToastContext";
import Cursor from "./Cursor";

const sidebarGroups = [
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-4 border-b border-[#21262d] flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-6 h-6 bg-[#ff5a00] rounded-full flex-shrink-0" />
          {!collapsed && (
            <span
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              className="text-[13px] tracking-[0.14em] text-[#e6edf3]"
            >
              ORVEX
            </span>
          )}
        </Link>
        <button
          className="ml-auto text-[#7d8590] bg-transparent border-none hover:text-[#e6edf3] transition-colors p-1"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sidebarGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                className="px-2 mb-1.5 text-[9px] font-semibold tracking-[0.18em] uppercase text-[#484f58]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.to === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium no-underline transition-all",
                      "cursor-pointer select-none",
                      active
                        ? "bg-[#ff5a00]/10 text-[#ff5a00]"
                        : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d]",
                    ].join(" ")}
                  >
                    <item.icon size={14} className="flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User section */}
      <div className="border-t border-[#21262d] p-3 flex-shrink-0 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md bg-[#21262d]/40">
            <div className="w-6 h-6 bg-[#ff5a00] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#e6edf3] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#484f58] truncate">
                {user?.role === "admin" ? "Administrator" : user?.role ?? "User"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium text-[#7d8590] hover:text-[#f85149] hover:bg-[#f85149]/5 transition-all w-full text-left bg-transparent border-none cursor-pointer"
        >
          <LogOut size={14} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Cursor />

      {/* Toast container (outside main scroll) */}
      <ToastContainer />

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#161b22] border-r border-[#21262d] flex-shrink-0 transition-all duration-250 ${
          collapsed ? "w-[52px]" : "w-[216px]"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[500] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[216px] bg-[#161b22] border-r border-[#21262d] flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-[60px] border-b border-[#21262d] flex items-center px-5 gap-4 flex-shrink-0 bg-[#161b22]">
          <button
            className="md:hidden text-[#7d8590] bg-transparent border-none hover:text-[#e6edf3] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb / page title comes from content */}
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#7d8590] hover:text-[#e6edf3] transition-colors no-underline"
            >
              <ExternalLink size={13} />
              View Site
            </Link>
            <div className="w-px h-4 bg-[#21262d]" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#ff5a00] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="text-[13px] font-medium text-[#8b949e] hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-[#0d1117]">
          {children}
        </main>
      </div>
    </div>
  );
}
