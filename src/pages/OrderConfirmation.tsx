import { useParams, Link } from "react-router-dom";
import { Check, ArrowRight, FileText, Calendar, Mail, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import { useAdmin } from "@/contexts/AdminContext";

const STATUS_META = {
  paid:           { label: "Paid in full", color: "#10b981", desc: "Payment confirmed. Your slot is secured." },
  partially_paid: { label: "Deposit received", color: "#3b82f6", desc: "50% deposit received. Balance due on delivery." },
  processing:     { label: "Processing", color: "#f59e0b", desc: "Payment processing — we will confirm within 1 business day." },
  pending:        { label: "Quote requested", color: "#ff5a00", desc: "Brief received. Expect your custom quote within 48 hours." },
  failed:         { label: "Payment failed", color: "#ef4444", desc: "There was an issue processing your payment." },
  refunded:       { label: "Refunded", color: "#6b7280", desc: "Payment refunded." },
  cancelled:      { label: "Cancelled", color: "#6b7280", desc: "Order cancelled." },
};

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, invoices, payments } = useAdmin();

  const order = orders.find((o) => o.orderId === orderId);
  const invoice = invoices.find((i) => i.customer === order?.customer && i.project?.startsWith(order?.service ?? ""));
  const payment = payments.find((p) => p.customer === order?.customer && p.invoiceNumber === invoice?.invoiceNumber);

  if (!order) {
    return (
      <Layout>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050608" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Order not found.</p>
            <Link to="/" style={{ display: "inline-block", marginTop: 20, color: "#ff5a00", fontSize: 12, letterSpacing: "0.1em" }}>RETURN HOME →</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isQuote = order.paymentType === "quote";
  const status = STATUS_META[order.paymentStatus] ?? STATUS_META.pending;

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: "#050608", paddingTop: 120, paddingBottom: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(20px,5vw,48px)" }}>

          {/* Check mark */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{
              width: 72, height: 72, border: `1px solid ${isQuote ? "#ff5a00" : "#10b981"}`,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px",
            }}>
              <Check size={28} color={isQuote ? "#ff5a00" : "#10b981"} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#ff5a00", textTransform: "uppercase", marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
              {isQuote ? "Brief received" : "Order confirmed"}
            </p>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, color: "#f5f7f8", marginBottom: 12, lineHeight: 1.1 }}>
              {isQuote ? "We'll be in touch." : "Let's build it."}
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              {isQuote
                ? "Your brief has been received. Expect a detailed, itemised quote from the ORVEX team within 48 hours."
                : "Your order is confirmed and your slot is reserved. We begin onboarding within 24 hours."
              }
            </p>
          </div>

          {/* Order card */}
          <div style={{ border: "1px solid rgba(255,255,255,0.07)", marginBottom: 20 }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={label}>Order reference</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#f5f7f8", marginTop: 4 }}>{order.orderId}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={label}>Status</p>
                <span style={{ display: "inline-block", marginTop: 6, padding: "4px 10px", border: `1px solid ${status.color}30`, background: `${status.color}10`, fontSize: 11, fontWeight: 700, color: status.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
              <Detail label="Service" value={order.service} />
              <Detail label="Package" value={order.package} />
              <Detail label="Customer" value={order.customer} />
              {order.company && <Detail label="Company" value={order.company} />}
              <Detail label="Email" value={order.email} />
              {order.phone && <Detail label="Phone" value={order.phone} />}
              {order.preferredStartDate && <Detail label="Preferred start" value={order.preferredStartDate} />}
              {order.timelineUrgency && <Detail label="Urgency" value={{ standard: "Standard", expedited: "Expedited", rush: "Rush" }[order.timelineUrgency]} />}
            </div>

            {/* Financials */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ ...label, marginBottom: 14 }}>Financials</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <FinRow label="Package" value={`$${(order.amount - (order.addonTotal ?? 0)).toLocaleString()}`} />
                {(order.addonTotal ?? 0) > 0 && (
                  <FinRow label={`Add-ons (${(order.addons ?? []).join(", ")})`} value={`+$${order.addonTotal!.toLocaleString()}`} />
                )}
                <FinRow label="Total engagement" value={`$${order.amount.toLocaleString()}`} />
                {!isQuote && (
                  <>
                    <FinRow label={order.paymentType === "full" ? "Paid today" : `Deposit paid (${settings_depositPct(order.amount, order.deposit)}%)`} value={`$${order.deposit.toLocaleString()}`} accent />
                    {order.paymentType === "deposit" && (
                      <FinRow label="Balance due on delivery" value={`$${(order.amount - order.deposit).toLocaleString()}`} muted />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Payment info */}
            {!isQuote && payment && (
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ ...label, marginBottom: 14 }}>Payment record</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <FinRow label="Reference" value={payment.paymentRef} />
                  <FinRow label="Method" value={{ stripe: "Stripe (Card)", bank_transfer: "Bank Transfer", crypto: "Crypto Wallet", paypal: "PayPal" }[payment.method] ?? payment.method} />
                  <FinRow label="Status" value={payment.status} />
                  {invoice && <FinRow label="Invoice" value={invoice.invoiceNumber} />}
                  {order.transactionId && (
                    <FinRow label="Transaction ID" value={order.transactionId.slice(0, 24) + (order.transactionId.length > 24 ? "…" : "")} mono />
                  )}
                </div>
              </div>
            )}

            {/* Next steps */}
            <div style={{ padding: "20px 24px" }}>
              <p style={{ ...label, marginBottom: 16 }}>What happens next</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {(isQuote ? [
                  { icon: Mail, text: "Quote delivered to your email within 48 hours" },
                  { icon: FileText, text: "Review and negotiate — no obligation" },
                  { icon: Check, text: "Approve and pay deposit to begin" },
                ] : [
                  { icon: Mail, text: "Confirmation email sent to " + order.email },
                  { icon: Calendar, text: "Onboarding call scheduled within 24 hours" },
                  { icon: FileText, text: "Invoice sent for your records" },
                  { icon: Check, text: "Work begins per your preferred start date" },
                ]).map(({ icon: Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, border: "1px solid rgba(255,90,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={12} color="#ff5a00" />
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, paddingTop: 4 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status note */}
          <div style={{ border: "1px solid rgba(255,255,255,0.04)", padding: "16px 20px", marginBottom: 32, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Shield size={13} color="rgba(255,255,255,0.2)" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{status.desc}</p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/client/appointments"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", background: "#ff5a00", color: "#fff", textDecoration: "none", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              CLIENT PORTAL <ArrowRight size={12} />
            </Link>
            <Link
              to="/services"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Explore more services
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function settings_depositPct(total: number, deposit: number): number {
  if (!total) return 50;
  return Math.round((deposit / total) * 100);
}

function Detail({ label: l, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={label}>{l}</p>
      <p style={{ fontSize: 13, color: "#f5f7f8", marginTop: 3 }}>{value}</p>
    </div>
  );
}

function FinRow({ label: l, value, accent, muted, mono }: { label: string; value: string; accent?: boolean; muted?: boolean; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</span>
      <span style={{
        fontSize: 12, fontWeight: accent ? 700 : 400,
        color: accent ? "#ff5a00" : muted ? "rgba(255,255,255,0.25)" : "#f5f7f8",
        fontFamily: mono ? "monospace" : "inherit",
      }}>{value}</span>
    </div>
  );
}

const label: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif",
};
