import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, ShoppingBag, FileText, CreditCard,
  Calendar, MessageSquare, HardDrive, User, LogOut, ExternalLink,
  Menu, X,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAdmin } from "@/contexts/AdminContext";
import { ToastContainer } from "@/contexts/ToastContext";

const NAV = [
  { icon: LayoutDashboard, label: "Overview", to: "/client" },
  { icon: FolderOpen, label: "Projects", to: "/client/projects" },
  { icon: ShoppingBag, label: "Orders", to: "/client/orders" },
  { icon: Calendar, label: "Appointments", to: "/client/appointments" },
  { icon: FileText, label: "Invoices", to: "/client/invoices" },
  { icon: CreditCard, label: "Payments", to: "/client/payments" },
  { icon: HardDrive, label: "Files", to: "/client/files" },
  { icon: MessageSquare, label: "Messages", to: "/client/messages" },
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const { messages } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "C";

  const unreadMessages = messages.filter((m) => !m.read).length;

  const isActive = (to: string) =>
    to === "/client" ? location.pathname === "/client" : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Wordmark */}
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 20, height: 20, background: "#ff5a00", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", color: "#f5f7f8" }}>ORVEX</span>
        </Link>
      </div>

      {/* Portal label */}
      <div style={{ padding: "20px 24px 12px", flexShrink: 0 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}>
          Client Portal
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        {NAV.map((item) => {
          const active = isActive(item.to);
          const badge = item.to === "/client/messages" && unreadMessages > 0 ? unreadMessages : 0;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", marginBottom: 2,
                textDecoration: "none", borderRadius: 0,
                border: `1px solid ${active ? "rgba(255,90,0,0.2)" : "transparent"}`,
                background: active ? "rgba(255,90,0,0.06)" : "transparent",
                color: active ? "#ff5a00" : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: active ? 700 : 500,
                letterSpacing: "0.04em",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                }
              }}
            >
              <item.icon size={13} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {badge > 0 && (
                <span style={{ minWidth: 16, height: 16, background: "#ff5a00", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", margin: "0 12px" }} />

      {/* Profile link */}
      <div style={{ padding: "8px 12px", flexShrink: 0 }}>
        <Link
          to="/client/profile"
          onClick={() => setMobileOpen(false)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", textDecoration: "none",
            color: isActive("/client/profile") ? "#ff5a00" : "rgba(255,255,255,0.4)",
            background: isActive("/client/profile") ? "rgba(255,90,0,0.06)" : "transparent",
            border: `1px solid ${isActive("/client/profile") ? "rgba(255,90,0,0.2)" : "transparent"}`,
            fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { if (!isActive("/client/profile")) { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; } }}
          onMouseLeave={(e) => { if (!isActive("/client/profile")) { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
        >
          <User size={13} />
          <span>Profile</span>
        </Link>
      </div>

      {/* User card */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, background: "#ff5a00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#f5f7f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0, fontFamily: "'Inter', sans-serif" }}>{user?.name ?? "Client"}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Inter', sans-serif", textAlign: "left", transition: "color 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f85149")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#050608", overflow: "hidden", cursor: "default" }}>
      <ToastContainer />

      {/* Desktop sidebar */}
      <aside style={{ width: 220, background: "#080a0c", borderRight: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, display: "none" }} className="md-flex" id="client-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 220, background: "#080a0c", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0, background: "#080a0c" }}>
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4, display: "flex" }} className="mobile-only">
            <Menu size={16} />
          </button>
          <div style={{ flex: 1 }} />
          <Link to="/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", textDecoration: "none", textTransform: "uppercase", transition: "color 0.15s", fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}
          >
            <ExternalLink size={11} /> Studio Site
          </Link>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.06)" }} />
          <Link to="/client/profile" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, background: "#ff5a00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
              {initials}
            </div>
          </Link>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#050608" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          #client-sidebar { display: flex !important; flex-direction: column; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
