import { useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function AdminAnalytics() {
  const ctx = useAdmin();

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalRevenue = useMemo(
    () => ctx.orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.amount, 0),
    [ctx.orders]
  );
  const totalOrders = ctx.orders.length;
  const totalCustomers = ctx.customers.length;
  const totalProjects = ctx.projects.length;

  // ── Revenue by month (last 6 months) ─────────────────────────────────────
  const revenueByMonth = useMemo(() => {
    const now = new Date("2026-08-16");
    const months: { label: string; key: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      months.push({ label, key, revenue: 0 });
    }
    ctx.orders.forEach((o) => {
      if (o.paymentStatus !== "paid") return;
      const key = o.createdAt.slice(0, 7);
      const m = months.find((m) => m.key === key);
      if (m) m.revenue += o.amount;
    });
    return months;
  }, [ctx.orders]);

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue), 1);

  // ── Order status breakdown ────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    ctx.orders.forEach((o) => {
      map[o.paymentStatus] = (map[o.paymentStatus] ?? 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count, pct: Math.round((count / ctx.orders.length) * 100) }));
  }, [ctx.orders]);

  const statusColor: Record<string, string> = {
    paid: "#3fb950",
    pending: "#d29922",
    partially_paid: "#58a6ff",
    processing: "#a371f7",
    refunded: "#f85149",
    failed: "#f85149",
  };

  // ── Top 5 customers by spend ──────────────────────────────────────────────
  const topCustomers = useMemo(
    () => [...ctx.customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5),
    [ctx.customers]
  );

  // ── Lead stage breakdown ──────────────────────────────────────────────────
  const leadStages = useMemo(() => {
    const map: Record<string, number> = {};
    ctx.leads.forEach((l) => { map[l.stage] = (map[l.stage] ?? 0) + 1; });
    return Object.entries(map).map(([stage, count]) => ({ stage, count }));
  }, [ctx.leads]);
  const maxLeadCount = Math.max(...leadStages.map((s) => s.count), 1);

  const stageColor: Record<string, string> = {
    new: "#58a6ff",
    contacted: "#a371f7",
    qualified: "#d29922",
    proposal: "#ff5a00",
    won: "#3fb950",
    lost: "#f85149",
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#484f58", textTransform: "uppercase", marginBottom: 4 }}>OVERVIEW</p>
            <h1 className="admin-heading">Analytics</h1>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Revenue", value: fmt(totalRevenue), sub: "from paid orders" },
            { label: "Total Orders", value: totalOrders.toString(), sub: "all time" },
            { label: "Total Customers", value: totalCustomers.toString(), sub: "registered" },
            { label: "Total Projects", value: totalProjects.toString(), sub: "portfolio" },
          ].map((s) => (
            <div className="admin-stat-card" key={s.label}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#484f58", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#e6edf3", lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#7d8590" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Revenue bar chart */}
          <div className="admin-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#484f58", marginBottom: 20 }}>Revenue — Last 6 Months</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {revenueByMonth.map((m) => (
                <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: "#7d8590", width: 28, flexShrink: 0 }}>{m.label}</span>
                  <div style={{ flex: 1, height: 20, background: "#21262d", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(m.revenue / maxRevenue) * 100}%`, height: "100%", background: "#ff5a00", borderRadius: 4, minWidth: m.revenue > 0 ? 4 : 0, transition: "width 0.4s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#8b949e", width: 68, textAlign: "right", flexShrink: 0 }}>{m.revenue > 0 ? fmt(m.revenue) : "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order status breakdown */}
          <div className="admin-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#484f58", marginBottom: 20 }}>Order Status Breakdown</p>
            {ctx.orders.length === 0 ? (
              <p style={{ fontSize: 13, color: "#484f58" }}>No orders yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {statusCounts.map(({ status, count, pct }) => (
                  <div key={status}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#c9d1d9", textTransform: "capitalize" }}>{status.replace("_", " ")}</span>
                      <span style={{ fontSize: 12, color: "#8b949e" }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: "#21262d", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: statusColor[status] ?? "#8b949e", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Top customers */}
          <div className="admin-card">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d" }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#484f58" }}>Top Customers by Spend</p>
            </div>
            {topCustomers.length === 0 ? (
              <div className="admin-empty"><p style={{ fontSize: 13, color: "#484f58" }}>No customers yet.</p></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Company</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((c, i) => (
                      <tr key={c.id}>
                        <td style={{ color: "#484f58", width: 32 }}>{i + 1}</td>
                        <td>
                          <p style={{ fontWeight: 600, color: "#e6edf3" }}>{c.name}</p>
                          <p style={{ fontSize: 11, color: "#484f58" }}>{c.email}</p>
                        </td>
                        <td style={{ color: "#7d8590" }}>{c.company}</td>
                        <td style={{ color: "#3fb950", fontWeight: 600 }}>{fmt(c.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Lead stage breakdown */}
          <div className="admin-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#484f58", marginBottom: 20 }}>Lead Stages</p>
            {leadStages.length === 0 ? (
              <p style={{ fontSize: 13, color: "#484f58" }}>No leads yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {leadStages.map(({ stage, count }) => (
                  <div key={stage} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "#7d8590", width: 70, flexShrink: 0, textTransform: "capitalize" }}>{stage}</span>
                    <div style={{ flex: 1, height: 18, background: "#21262d", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${(count / maxLeadCount) * 100}%`, height: "100%", background: stageColor[stage] ?? "#8b949e", borderRadius: 4, minWidth: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#8b949e", width: 20, textAlign: "right", flexShrink: 0 }}>{count}</span>
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
