import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";

type Range = 7 | 30 | 90;

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const MONTHLY_REVENUE = [
  { month: "Jan", value: 8400 },
  { month: "Feb", value: 12800 },
  { month: "Mar", value: 9600 },
  { month: "Apr", value: 15200 },
  { month: "May", value: 18500 },
  { month: "Jun", value: 14900 },
  { month: "Jul", value: 21300 },
  { month: "Aug", value: 27800 },
];

const TRAFFIC_SOURCES = [
  { label: "Direct",   pct: 45, color: "#ff5a00" },
  { label: "Referral", pct: 28, color: "#ff8c42" },
  { label: "Social",   pct: 18, color: "#58a6ff" },
  { label: "Other",    pct:  9, color: "#7d8590" },
];

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="admin-stat-card">
      <p className="admin-field-label mb-2">{label}</p>
      <p className="text-2xl font-bold text-[#e6edf3] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#7d8590] mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminAnalytics() {
  const { orders, customers, bookings, messages, services } = useAdmin();
  const [range, setRange] = useState<Range>(30);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "partially_paid")
    .reduce((s, o) => s + o.amount, 0);

  const msInRange = range * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const recentOrders = orders.filter((o) => {
    try { return now - new Date(o.createdAt).getTime() < msInRange; } catch { return false; }
  });
  const recentCustomers = customers.filter((c) => {
    try { return now - new Date(c.createdAt).getTime() < msInRange; } catch { return false; }
  });

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const bookingRate = bookings.length > 0 ? Math.round((confirmedBookings.length / bookings.length) * 100) : 0;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const maxRevenue = Math.max(...MONTHLY_REVENUE.map((m) => m.value));

  const serviceCounts: Record<string, { name: string; count: number }> = {};
  for (const o of orders) {
    const id = o.service ?? "unknown";
    if (!serviceCounts[id]) {
      const svc = services.find((s) => s.id === id || s.title === id);
      serviceCounts[id] = { name: svc?.title ?? id, count: 0 };
    }
    serviceCounts[id].count++;
  }
  const topServices = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxSvcCount = topServices[0]?.count ?? 1;

  const recentConversions = [...orders]
    .filter((o) => o.paymentStatus === "paid")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Analytics</h1>
            <p className="text-sm text-[#7d8590] mt-1">Studio performance overview</p>
          </div>
          <div className="flex items-center gap-2">
            {([7, 30, 90] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`admin-btn admin-btn-sm ${range === r ? "admin-btn-primary" : "admin-btn-ghost"}`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <KpiCard label="Total Revenue"    value={formatCurrency(totalRevenue)}  sub="All time" />
          <KpiCard label="Orders"           value={String(recentOrders.length)}   sub={`Last ${range} days`} />
          <KpiCard label="New Customers"    value={String(recentCustomers.length)} sub={`Last ${range} days`} />
          <KpiCard label="Booking Rate"     value={`${bookingRate}%`}             sub="Confirmed vs total" />
          <KpiCard label="Messages"         value={String(messages.length)}       sub="All inbox" />
          <KpiCard label="Avg Order Value"  value={formatCurrency(avgOrderValue)} sub="Per order" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Bar Chart */}
          <div className="admin-card lg:col-span-2">
            <h2 className="admin-heading-sm mb-6">Monthly Revenue — Jan to Aug 2026</h2>
            <div className="space-y-3">
              {MONTHLY_REVENUE.map((m) => {
                const pct = maxRevenue > 0 ? (m.value / maxRevenue) * 100 : 0;
                return (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs text-[#7d8590] w-8 shrink-0">{m.month}</span>
                    <div className="flex-1 h-7 bg-[#0d1117] rounded overflow-hidden">
                      <div
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg,#ff5a00,#ff8c42)",
                          height: "100%",
                          minWidth: pct > 0 ? "4px" : "0",
                          borderRadius: "3px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <span className="text-xs text-[#e6edf3] w-16 text-right shrink-0">
                      {formatCurrency(m.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-6">Traffic Sources</h2>
            <div className="flex h-8 rounded overflow-hidden mb-5">
              {TRAFFIC_SOURCES.map((src) => (
                <div
                  key={src.label}
                  style={{ width: `${src.pct}%`, background: src.color }}
                  title={`${src.label}: ${src.pct}%`}
                />
              ))}
            </div>
            <div className="space-y-3">
              {TRAFFIC_SOURCES.map((src) => (
                <div key={src.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: src.color }} />
                    <span className="text-sm text-[#e6edf3]">{src.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#e6edf3]">{src.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Top Services by Orders</h2>
            {topServices.length === 0 ? (
              <p className="text-sm text-[#7d8590]">No order data available.</p>
            ) : (
              <div className="space-y-4">
                {topServices.map((svc) => {
                  const pct = maxSvcCount > 0 ? Math.round((svc.count / maxSvcCount) * 100) : 0;
                  return (
                    <div key={svc.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-[#e6edf3] truncate pr-2">{svc.name}</span>
                        <span className="text-xs text-[#7d8590] shrink-0">{svc.count}</span>
                      </div>
                      <div className="h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg,#ff5a00,#ff8c42)",
                            height: "100%",
                            borderRadius: "99px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Conversions */}
          <div className="admin-card">
            <h2 className="admin-heading-sm mb-5">Recent Conversions</h2>
            {recentConversions.length === 0 ? (
              <p className="text-sm text-[#7d8590]">No paid orders yet.</p>
            ) : (
              <div>
                {recentConversions.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between py-3 border-b border-[#21262d] last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#e6edf3] font-medium truncate">{o.customer}</p>
                        <p className="text-xs text-[#7d8590] truncate mt-0.5">{o.service}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-semibold text-[#ff5a00]">{formatCurrency(o.amount)}</p>
                        <p className="text-xs text-[#7d8590] mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
