import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MessageSquare, RotateCcw, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import { useApp } from "@/contexts/AppContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";

const STAGES = ["DISCOVERY", "CONCEPT", "BUILD", "MOTION", "RENDER", "DELIVERY"] as const;

function stageIndex(status: string): number {
  const s = status.toLowerCase();
  if (s.includes("discovery") || s.includes("onboard")) return 0;
  if (s.includes("concept") || s.includes("design")) return 1;
  if (s.includes("build") || s.includes("develop") || s.includes("production")) return 2;
  if (s.includes("motion") || s.includes("animat")) return 3;
  if (s.includes("render") || s.includes("post")) return 4;
  if (s.includes("deliver") || s.includes("complet")) return 5;
  return 0;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 3, marginBottom: 20 }}>
      {STAGES.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        const upcoming = i > current;
        return (
          <div key={stage} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              height: 2,
              background: active ? "#ff5a00" : done ? "rgba(255,90,0,0.4)" : "rgba(255,255,255,0.06)",
              position: "relative",
              overflow: "hidden",
            }}>
              {active && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, #ff5a00 60%, rgba(255,90,0,0.2))",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }} />
              )}
            </div>
            <p style={{
              fontSize: 7, fontWeight: active ? 700 : 500, letterSpacing: "0.16em", textTransform: "uppercase",
              fontFamily: "'Space Grotesk', sans-serif",
              color: active ? "#ff5a00" : done ? "rgba(255,90,0,0.5)" : upcoming ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.12)",
            }}>
              {stage}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function ClientProjects() {
  const { user } = useApp();
  const { orders, messages_, orders_ } = useAdmin();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revisionText, setRevisionText] = useState("");
  const [revisionOrder, setRevisionOrder] = useState<string | null>(null);

  // Filter orders that have a project
  const myOrders = orders.filter((o) => o.email === user?.email);
  const projectOrders = myOrders.length > 0
    ? myOrders.filter((o) => !["cancelled", "refunded"].includes(o.paymentStatus))
    : orders.filter((o) => !["cancelled", "refunded"].includes(o.paymentStatus)).slice(0, 3);

  const handleRevisionSubmit = (orderId: string, orderRef: string) => {
    if (!revisionText.trim()) return;
    // Add a message from client to messages thread
    messages_?.add({
      id: `msg-rev-${Date.now()}`,
      orderId,
      from: user?.name ?? "Client",
      email: user?.email ?? "",
      subject: `Revision Request — ${orderRef}`,
      preview: revisionText.trim().slice(0, 80),
      body: revisionText.trim(),
      date: new Date().toISOString().split("T")[0],
      read: false,
      type: "inquiry",
    } as any);
    toast.success("Revision requested", "Your feedback has been sent to the ORVEX studio team.");
    setRevisionText("");
    setRevisionOrder(null);
  };

  return (
    <ClientLayout>
      <div style={{ padding: "40px 48px", maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10 }}>Client Portal</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: "#f5f7f8", lineHeight: 1.1 }}>My Projects</h1>
        </div>

        {projectOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>No active projects yet.</p>
            <Link to="/services" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff5a00", textDecoration: "none" }}>
              Browse services →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {projectOrders.map((order) => {
              const stage = stageIndex(order.projectStatus);
              const isExpanded = expanded === order.id;
              const isComplete = stage === 5;
              const isRevising = revisionOrder === order.id;

              return (
                <div key={order.id} style={{ background: "#080a0c", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Card header */}
                  <div style={{ padding: "28px 32px" }}>
                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                      <div>
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f7f8", marginBottom: 6 }}>
                          {order.service}
                        </p>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}>{order.orderId}</span>
                          {order.package && (
                            <>
                              <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.08)" }} />
                              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{order.package}</span>
                            </>
                          )}
                          <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.08)" }} />
                          <span style={{
                            fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                            color: isComplete ? "#10b981" : "#ff5a00",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}>
                            {isComplete ? "DELIVERED" : STAGES[stage]}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 20 }}>
                        {order.preferredStartDate && (
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.18)", fontFamily: "'Space Grotesk', sans-serif" }}>STARTED</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{order.preferredStartDate}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stage bar */}
                    <ProgressBar current={stage} total={STAGES.length} />

                    {/* Action row */}
                    <div style={{ display: "flex", gap: 16, alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <ActionLink icon={MessageSquare} label="Message studio" to="/client/messages" />
                      <ActionLink icon={ExternalLink} label="View files" to="/client/files" />
                      {!isComplete && (
                        <button
                          onClick={() => { setRevisionOrder(isRevising ? null : order.id); setRevisionText(""); }}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isRevising ? "#ff5a00" : "rgba(255,255,255,0.3)", padding: 0, fontFamily: "'Space Grotesk', sans-serif", transition: "color 0.15s" }}
                          onMouseEnter={(e) => !isRevising && ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
                          onMouseLeave={(e) => !isRevising && ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
                        >
                          <RotateCcw size={10} /> Request revision
                        </button>
                      )}
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "rgba(255,255,255,0.25)", padding: 0, transition: "color 0.15s" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}
                      >
                        {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
                      </button>
                    </div>
                  </div>

                  {/* Revision request panel */}
                  {isRevising && (
                    <div style={{ padding: "0 32px 24px", borderTop: "1px solid rgba(255,90,0,0.1)", paddingTop: 20, background: "rgba(255,90,0,0.02)" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#ff5a00", marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>REQUEST REVISION</p>
                      <textarea
                        value={revisionText}
                        onChange={(e) => setRevisionText(e.target.value)}
                        placeholder="Describe the changes you'd like — include specific details about what to adjust and why."
                        rows={4}
                        style={{ width: "100%", background: "#0d0f12", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", fontSize: 13, padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <button
                          onClick={() => handleRevisionSubmit(order.id, order.orderId)}
                          disabled={!revisionText.trim()}
                          style={{ padding: "8px 20px", background: "#ff5a00", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'Space Grotesk', sans-serif", opacity: revisionText.trim() ? 1 : 0.4, transition: "opacity 0.15s" }}
                        >
                          SUBMIT
                        </button>
                        <button
                          onClick={() => { setRevisionOrder(null); setRevisionText(""); }}
                          style={{ padding: "8px 20px", background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 10, fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
                      {[
                        { label: "ORDER TOTAL", value: `$${order.amount.toLocaleString()}` },
                        { label: "PAYMENT STATUS", value: order.paymentStatus.replace("_", " ").toUpperCase() },
                        { label: "TIMELINE", value: order.timelineUrgency ?? "Standard" },
                      ].map((d) => (
                        <div key={d.label}>
                          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>{d.label}</p>
                          <p style={{ fontSize: 13, color: "#f5f7f8", fontWeight: 600 }}>{d.value}</p>
                        </div>
                      ))}
                      {order.notes && (
                        <div style={{ gridColumn: "1/-1" }}>
                          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>PROJECT NOTES</p>
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 40, padding: "32px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Ready to start another project?</p>
          <Link to="/services" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#ff5a00", textDecoration: "none", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>
            Browse services <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
    </ClientLayout>
  );
}

function ActionLink({ icon: Icon, label, to }: { icon: any; label: string; to: string }) {
  return (
    <Link to={to} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif", transition: "color 0.15s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5a00")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
    >
      <Icon size={10} /> {label}
    </Link>
  );
}
