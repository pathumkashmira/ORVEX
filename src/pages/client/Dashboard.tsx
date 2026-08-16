import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, FileText, MessageSquare, Calendar, AlertCircle } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import { useApp } from "@/contexts/AppContext";
import { useAdmin } from "@/contexts/AdminContext";
import { formatDisplayTime } from "@/services/bookingEngine";

const STAGES = ["DISCOVERY", "CONCEPT", "BUILD", "MOTION", "RENDER", "DELIVERY"];

const STAGE_COLORS: Record<string, string> = {
  pending: "rgba(255,255,255,0.2)",
  confirmed: "#10b981",
  rescheduled: "#3b82f6",
  completed: "rgba(255,255,255,0.4)",
  cancelled: "#ef4444",
  no_show: "#7c3aed",
};

function StageBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      {STAGES.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {/* Connector line (before) */}
            {i > 0 && (
              <div style={{
                position: "absolute", left: 0, right: "50%", top: 10, height: 1,
                background: done || active ? "#ff5a00" : "rgba(255,255,255,0.06)",
                zIndex: 0,
              }} />
            )}
            {/* Connector line (after) */}
            {i < STAGES.length - 1 && (
              <div style={{
                position: "absolute", left: "50%", right: 0, top: 10, height: 1,
                background: done ? "#ff5a00" : "rgba(255,255,255,0.06)",
                zIndex: 0,
              }} />
            )}
            {/* Node */}
            <div style={{
              width: 20, height: 20, position: "relative", zIndex: 1,
              background: active ? "#ff5a00" : done ? "rgba(255,90,0,0.2)" : "#0d0f12",
              border: `1px solid ${active ? "#ff5a00" : done ? "rgba(255,90,0,0.5)" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {done && <div style={{ width: 6, height: 6, background: "#ff5a00" }} />}
              {active && <div style={{ width: 6, height: 6, background: "#fff" }} />}
            </div>
            <p style={{
              fontSize: 8, fontWeight: active ? 700 : 500, letterSpacing: "0.1em", textTransform: "uppercase",
              color: active ? "#ff5a00" : done ? "rgba(255,90,0,0.6)" : "rgba(255,255,255,0.2)",
              marginTop: 8, fontFamily: "'Space Grotesk', sans-serif", textAlign: "center",
              whiteSpace: "nowrap",
            }}>
              {stage}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Map projectStatus strings to stage indices
function projectStageIndex(status: string): number {
  const s = status.toLowerCase();
  if (s.includes("discovery")) return 0;
  if (s.includes("concept")) return 1;
  if (s.includes("build")) return 2;
  if (s.includes("motion")) return 3;
  if (s.includes("render")) return 4;
  if (s.includes("deliver") || s.includes("complete")) return 5;
  if (s.includes("onboard")) return 0;
  return 0;
}

export default function ClientDashboard() {
  const { user } = useApp();
  const { orders, bookings, invoices, payments, messages } = useAdmin();

  // Filter to this client where possible, else show first few for demo
  const myOrders = orders.filter((o) => o.email === user?.email);
  const displayOrders = myOrders.length > 0 ? myOrders : orders.slice(0, 2);

  const myBookings = bookings.filter((b) => b.email === user?.email);
  const displayBookings = myBookings.length > 0 ? myBookings : bookings.slice(0, 2);

  const myInvoices = invoices.filter((i) => i.email === user?.email);
  const displayInvoices = myInvoices.length > 0 ? myInvoices : invoices.slice(0, 2);

  const myPayments = payments.filter((p) => p.email === user?.email);

  const activeOrders = displayOrders.filter((o) => !["cancelled", "refunded"].includes(o.paymentStatus));
  const activeOrder = activeOrders[0];
  const upcomingBookings = displayBookings.filter((b) => ["pending", "confirmed", "rescheduled"].includes(b.status));
  const overdueInvoices = displayInvoices.filter((i) => i.paymentStatus === "overdue");
  const unreadMessages = messages.filter((m) => !m.read).length;

  const totalSpend = myPayments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  const firstName = user?.name?.split(" ")[0] ?? "Client";

  return (
    <ClientLayout>
      <div style={{ padding: "40px 48px", maxWidth: 1100 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>
            Client Portal
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#f5f7f8", lineHeight: 1.1 }}>
            Welcome back,<br />{firstName}.
          </h1>
        </div>

        {/* Alerts */}
        {(overdueInvoices.length > 0 || unreadMessages > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {overdueInvoices.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={13} color="#ef4444" />
                <p style={{ fontSize: 12, color: "#f5f7f8" }}>
                  {overdueInvoices.length} invoice{overdueInvoices.length > 1 ? "s" : ""} overdue.
                  <Link to="/client/invoices" style={{ color: "#ef4444", marginLeft: 6, textDecoration: "none", fontWeight: 600 }}>View →</Link>
                </p>
              </div>
            )}
            {unreadMessages > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,90,0,0.05)", border: "1px solid rgba(255,90,0,0.2)" }}>
                <MessageSquare size={13} color="#ff5a00" />
                <p style={{ fontSize: 12, color: "#f5f7f8" }}>
                  {unreadMessages} new message{unreadMessages > 1 ? "s" : ""} from ORVEX.
                  <Link to="/client/messages" style={{ color: "#ff5a00", marginLeft: 6, textDecoration: "none", fontWeight: 600 }}>Read →</Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, marginBottom: 48, background: "rgba(255,255,255,0.04)" }}>
          {[
            { label: "Active orders", value: activeOrders.length.toString() },
            { label: "Total spend", value: totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : `$${displayOrders.reduce((s, o) => s + o.deposit, 0).toLocaleString()}` },
            { label: "Invoices", value: displayInvoices.length.toString() },
            { label: "Appointments", value: upcomingBookings.length.toString() },
          ].map((s) => (
            <div key={s.label} style={{ background: "#080a0c", padding: "24px 28px" }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5f7f8" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active project */}
        {activeOrder && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}>
                Active project
              </p>
              <Link to="/client/projects" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5a00")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}>
                ALL PROJECTS <ArrowUpRight size={10} />
              </Link>
            </div>
            <div style={{ background: "#080a0c", border: "1px solid rgba(255,255,255,0.06)", padding: "28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f7f8", marginBottom: 6 }}>
                    {activeOrder.service}
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>{activeOrder.orderId}</span>
                    <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{activeOrder.package}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>Status</p>
                  <p style={{ fontSize: 12, color: "#ff5a00", fontWeight: 600 }}>{activeOrder.projectStatus}</p>
                </div>
              </div>
              <StageBar current={projectStageIndex(activeOrder.projectStatus)} />
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12 }}>
                <Link to="/client/messages" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5a00")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
                >
                  <MessageSquare size={11} /> Message studio
                </Link>
                <Link to="/client/files" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5a00")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
                >
                  View files <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Two-col: Invoices + Appointments */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>

          {/* Recent invoices */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={sectionLabel}>Invoices</p>
              <Link to="/client/invoices" style={moreLink} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5a00")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}>VIEW ALL</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.03)" }}>
              {displayInvoices.slice(0, 3).map((inv) => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#080a0c" }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#f5f7f8", marginBottom: 2, fontFamily: "'Space Grotesk', sans-serif" }}>{inv.invoiceNumber}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{inv.project?.slice(0, 28)}{(inv.project?.length ?? 0) > 28 ? "…" : ""}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: inv.balance > 0 ? "#ff5a00" : "#f5f7f8", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 2 }}>
                      ${inv.total.toLocaleString()}
                    </p>
                    <InvBadge status={inv.paymentStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming appointments */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={sectionLabel}>Appointments</p>
              <Link to="/client/appointments" style={moreLink} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5a00")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}>VIEW ALL</Link>
            </div>
            {upcomingBookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.03)" }}>
                {upcomingBookings.slice(0, 3).map((b) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#080a0c" }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#f5f7f8", marginBottom: 2 }}>{b.type}</p>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Clock size={9} color="rgba(255,255,255,0.3)" />
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{b.date} · {formatDisplayTime(b.time)}</p>
                      </div>
                    </div>
                    <StatusDot status={b.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#080a0c", border: "1px solid rgba(255,255,255,0.04)", padding: "32px 20px", textAlign: "center" }}>
                <Calendar size={18} color="rgba(255,255,255,0.1)" style={{ margin: "0 auto 10px" }} />
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>No upcoming sessions</p>
                <Link to="/book" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff5a00", textDecoration: "none" }}>BOOK A SESSION →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.03)" }}>
          {[
            { icon: MessageSquare, label: "Message studio", to: "/client/messages" },
            { icon: FileText, label: "View invoices", to: "/client/invoices" },
            { icon: Calendar, label: "Book a session", to: "/book" },
            { icon: ArrowUpRight, label: "New project", to: "/services" },
          ].map((action) => (
            <Link key={action.to} to={action.to} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 16px", background: "#080a0c", textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0d0f12"; (e.currentTarget as HTMLElement).querySelector("p")!.style.color = "#ff5a00"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#080a0c"; (e.currentTarget as HTMLElement).querySelector("p")!.style.color = "rgba(255,255,255,0.3)"; }}>
              <action.icon size={16} color="rgba(255,255,255,0.2)" />
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif", textAlign: "center", transition: "color 0.15s" }}>
                {action.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}

// ── Mini components ────────────────────────────────────────────────────────

function InvBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    paid: { color: "#10b981", label: "PAID" },
    partially_paid: { color: "#3b82f6", label: "PARTIAL" },
    pending: { color: "rgba(255,255,255,0.3)", label: "PENDING" },
    overdue: { color: "#ef4444", label: "OVERDUE" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</span>
  );
}

function StatusDot({ status }: { status: string }) {
  const c = STAGE_COLORS[status] ?? "rgba(255,255,255,0.2)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c, fontFamily: "'Space Grotesk', sans-serif" }}>
        {status.replace("_", " ")}
      </span>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif",
};

const moreLink: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)",
  textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif", transition: "color 0.15s",
};
