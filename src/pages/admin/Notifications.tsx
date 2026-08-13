import AdminLayout from "@/components/AdminLayout";
import { Bell, Check } from "lucide-react";
import { useState } from "react";

const notifs = [
  { id: "1", type: "booking", msg: "New booking: Emma Reynolds — Discovery Call on Aug 20", time: "2 hours ago", read: false },
  { id: "2", type: "message", msg: "New message from Rania Khalil — Product visualization inquiry", time: "3 hours ago", read: false },
  { id: "3", type: "order", msg: "New order: ORVEX-ORD-2026-0045 — 3D Advertising PREMIUM", time: "5 hours ago", read: false },
  { id: "4", type: "payment", msg: "Payment received: Marcus Webb — $3,800 (INV-2026-0041)", time: "2 days ago", read: true },
  { id: "5", type: "booking", msg: "Booking confirmed: Yuki Tanaka — Creative Consultation Aug 18", time: "2 days ago", read: true },
];

export default function AdminNotifications() {
  const [items, setItems] = useState(notifs);
  const markAll = () => setItems(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-[700px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="label-sm text-[#bfc5cc]/40 mb-1">SYSTEM</p>
            <h1 className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Notifications</h1>
          </div>
          <button onClick={markAll} className="btn-ghost text-[10px]"><Check size={12} /> MARK ALL READ</button>
        </div>
        <div className="space-y-2">
          {items.map(n => (
            <div key={n.id} className={`border p-4 flex items-start gap-4 ${n.read ? "border-white/5 opacity-60" : "border-[#ff5a00]/20 bg-[#ff5a00]/03"}`}>
              <div className={`flex-shrink-0 mt-0.5 ${n.read ? "text-[#bfc5cc]/30" : "text-[#ff5a00]"}`}><Bell size={14} /></div>
              <div className="flex-1">
                <p className={`text-sm ${n.read ? "text-[#bfc5cc]" : "text-[#f5f7f8]"}`}>{n.msg}</p>
                <p className="label-sm text-[#bfc5cc]/30 mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <button onClick={() => setItems(prev => prev.map(i => i.id === n.id ? { ...i, read: true } : i))} className="text-[#bfc5cc]/40 hover:text-[#ff5a00] transition-colors flex-shrink-0">
                  <Check size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
