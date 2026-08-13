import { Link } from "react-router-dom";
import { ArrowUpRight, MessageSquare, FileText, Calendar } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import { useApp } from "@/contexts/AppContext";
import { orders, bookings, invoices } from "@/data/seed";

const PROJECT_STAGES = ["DISCOVERY", "CONCEPT", "BUILD", "MOTION", "FINAL"];

export default function ClientDashboard() {
  const { user } = useApp();
  const clientOrders = orders.slice(0, 2);
  const clientBookings = bookings.slice(0, 2);

  return (
    <ClientLayout>
      <div className="p-8 max-w-[1200px]">
        <div className="mb-10">
          <p className="label-sm text-[#bfc5cc]/40 mb-2">WELCOME BACK</p>
          <h1 className="text-3xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{user?.name}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "ACTIVE PROJECTS", value: "1" },
            { label: "TOTAL ORDERS", value: "2" },
            { label: "INVOICES", value: "2" },
            { label: "BOOKINGS", value: "2" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="label-sm text-[#bfc5cc]/40 mb-2">{s.label}</p>
              <p className="text-3xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active project */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <p className="label-sm">ACTIVE PROJECT</p>
          </div>
          <div className="border border-white/8 bg-[#14171b]/40 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="font-700 text-[#f5f7f8] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>AXIOM CGI Campaign</p>
                <div className="flex gap-2">
                  <span className="badge badge-orange">CGI VISUALIZATION</span>
                  <span className="badge badge-cyan">RENDERING</span>
                </div>
              </div>
              <p className="label-sm text-[#bfc5cc]/40">ORVEX-ORD-2026-0041</p>
            </div>
            {/* Progress */}
            <p className="label-sm text-[#bfc5cc]/40 mb-4">PROJECT PHASE</p>
            <div className="flex items-center gap-0">
              {PROJECT_STAGES.map((stage, i) => {
                const active = i < 4;
                const current = i === 3;
                return (
                  <div key={stage} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-700 ${current ? "border-[#ff5a00] bg-[#ff5a00] text-[#050608]" : active ? "border-[#ff5a00] bg-[#ff5a00]/10 text-[#ff5a00]" : "border-white/15 text-[#bfc5cc]/30"}`} style={{ fontWeight: 700 }}>
                        {i + 1}
                      </div>
                      <p className={`text-[8px] font-600 tracking-[0.1em] ${current ? "text-[#ff5a00]" : active ? "text-[#bfc5cc]/60" : "text-[#bfc5cc]/20"}`} style={{ fontWeight: 600 }}>{stage}</p>
                    </div>
                    {i < PROJECT_STAGES.length - 1 && <div className={`h-[1px] flex-none w-8 ${i < 3 ? "bg-[#ff5a00]/40" : "bg-white/10"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div>
            <p className="label-sm mb-4">ORDERS</p>
            <div className="space-y-3">
              {clientOrders.map(order => (
                <div key={order.id} className="border border-white/5 p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-600 text-[#f5f7f8] text-sm" style={{ fontWeight: 600 }}>{order.service}</p>
                    <p className="label-sm text-[#bfc5cc]/40 mt-1">{order.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#f5f7f8] text-sm">${order.amount.toLocaleString()}</p>
                    <span className={`badge mt-1 ${order.paymentStatus === "paid" ? "badge-green" : "badge-orange"}`}>{order.paymentStatus.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings */}
          <div>
            <p className="label-sm mb-4">UPCOMING CALLS</p>
            <div className="space-y-3">
              {clientBookings.map(booking => (
                <div key={booking.id} className="border border-white/5 p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-600 text-[#f5f7f8] text-sm" style={{ fontWeight: 600 }}>{booking.type}</p>
                    <p className="label-sm text-[#bfc5cc]/40 mt-1">{booking.date} · {booking.time}</p>
                  </div>
                  <span className={`badge ${booking.status === "confirmed" ? "badge-green" : "badge-orange"}`}>{booking.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <Link to="/book" className="btn-ghost mt-4 text-xs">BOOK NEW CALL <ArrowUpRight size={12} /></Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { icon: <MessageSquare size={16} />, label: "SEND MESSAGE", to: "/client/messages" },
            { icon: <FileText size={16} />, label: "VIEW INVOICES", to: "/client/invoices" },
            { icon: <Calendar size={16} />, label: "BOOK A CALL", to: "/book" },
          ].map(a => (
            <Link key={a.label} to={a.to} className="border border-white/5 p-5 flex flex-col items-center gap-3 hover:border-[#ff5a00]/30 hover:bg-[#ff5a00]/03 transition-all no-underline group">
              <div className="text-[#bfc5cc]/60 group-hover:text-[#ff5a00] transition-colors">{a.icon}</div>
              <p className="label-sm text-[#bfc5cc]/60 group-hover:text-[#ff5a00] transition-colors text-center">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
