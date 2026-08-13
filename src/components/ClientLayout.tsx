import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderOpen, FileText, MessageSquare, LogOut, Calendar, CreditCard, ShoppingBag } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import Cursor from "./Cursor";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/client" },
  { icon: FolderOpen, label: "My Projects", to: "/client/projects" },
  { icon: ShoppingBag, label: "Orders", to: "/client/orders" },
  { icon: FileText, label: "Invoices", to: "/client/invoices" },
  { icon: CreditCard, label: "Payments", to: "/client/payments" },
  { icon: Calendar, label: "Appointments", to: "/client/appointments" },
  { icon: MessageSquare, label: "Messages", to: "/client/messages" },
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="noise flex h-screen bg-[#050608] overflow-hidden">
      <Cursor />
      <aside className="hidden md:flex flex-col w-[200px] bg-[#0a0c0f] border-r border-white/5 flex-shrink-0">
        <div className="h-[64px] flex items-center px-5 border-b border-white/5">
          <Link to="/" className="no-underline">
            <span className="font-700 text-[14px] tracking-[0.12em] text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>ORVEX</span>
          </Link>
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          <p className="px-3 py-3 text-[9px] font-700 tracking-[0.18em] uppercase text-[#bfc5cc]/40" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Client Portal</p>
          {sidebarItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-sidebar-link mb-1 ${location.pathname === item.to ? "active" : ""}`}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-7 h-7 bg-[#1d2126] rounded-full flex items-center justify-center text-[11px] font-700 text-[#bfc5cc]" style={{ fontWeight: 700 }}>
              {user?.name?.charAt(0) ?? "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-600 text-[#f5f7f8] truncate" style={{ fontWeight: 600 }}>{user?.name}</p>
              <p className="text-[10px] text-[#bfc5cc]/50 truncate">{user?.company}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-sidebar-link w-full text-left hover:text-red-400">
            <LogOut size={15} /> <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-[64px] border-b border-white/5 flex items-center px-6 gap-4 flex-shrink-0">
          <span className="label-sm text-[#bfc5cc]/60">CLIENT PORTAL</span>
          <div className="ml-auto">
            <Link to="/" className="label-sm text-[#bfc5cc] hover:text-[#ff5a00] transition-colors no-underline">BACK TO SITE</Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
