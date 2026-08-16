import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Check, ChevronLeft, Shield, AlertTriangle, Loader,
  Upload, X, Copy, Wallet, ExternalLink, ArrowRight,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { processPayment, type PaymentMethodType, type PaymentType } from "@/services/paymentService";
import {
  buildOrderRecords, getRequirementFields, getAddonsForService, computeAddonPrice,
  type RequirementField,
} from "@/services/orderService";
import type { Service, ServicePackage } from "@/data/seed";

// ── Step definitions ────────────────────────────────────────────────────────

type Step = "service" | "package" | "requirements" | "addons" | "timeline" | "details" | "summary" | "payment" | "processing";

const STEPS: Step[] = ["service", "package", "requirements", "addons", "timeline", "details", "summary", "payment", "processing"];
const STEP_LABELS = ["Service", "Package", "Requirements", "Add-ons", "Timeline", "Details", "Summary", "Payment"];

// ── Progress bar ────────────────────────────────────────────────────────────

function Progress({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  const visible = STEPS.slice(0, 8);
  return (
    <div style={{
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      padding: "0 clamp(24px,5vw,64px)",
      background: "#080a0c",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 0", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", minWidth: "max-content", gap: 0 }}>
          {visible.map((s, i) => {
            const done = i < idx;
            const active = i === idx;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 22, height: 22, border: `1px solid ${done || active ? "#ff5a00" : "rgba(255,255,255,0.12)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "#ff5a00" : "transparent",
                    flexShrink: 0,
                  }}>
                    {done
                      ? <Check size={10} color="#000" strokeWidth={3} />
                      : <span style={{ fontSize: 9, color: active ? "#ff5a00" : "rgba(255,255,255,0.25)", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{
                    fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: done ? "#ff5a00" : active ? "#f5f7f8" : "rgba(255,255,255,0.2)",
                  }}>
                    {STEP_LABELS[i]}
                  </span>
                </div>
                {i < visible.length - 1 && (
                  <div style={{ width: 32, height: 1, margin: "0 12px", background: done ? "rgba(255,90,0,0.4)" : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Order summary sidebar ───────────────────────────────────────────────────

interface SummaryProps {
  service?: Service;
  pkg?: ServicePackage;
  selectedAddons: Array<{ id: string; label: string; price: number }>;
  paymentType: PaymentType;
  depositPct: number;
}

function OrderSummary({ service, pkg, selectedAddons, paymentType, depositPct }: SummaryProps) {
  const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const subtotal = (pkg?.price ?? 0) + addonTotal;
  const depositAmount = paymentType === "full" ? subtotal : Math.round(subtotal * depositPct) / 100;

  return (
    <div style={{ position: "sticky", top: 100, background: "#0d0f12", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ padding: "20px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <p style={labelStyle}>Order summary</p>
      </div>
      <div style={{ padding: 20 }}>
        {service ? (
          <p style={{ fontSize: 14, fontWeight: 600, color: "#f5f7f8", marginBottom: 2 }}>{service.title}</p>
        ) : (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>Select a service</p>
        )}
        {pkg && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
            {pkg.name} · {pkg.duration}
          </p>
        )}

        {pkg && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 16, marginBottom: 16 }}>
            <Row label="Package" value={`$${pkg.price.toLocaleString()}`} />
            {selectedAddons.map((a) => (
              <Row key={a.id} label={a.label} value={`+$${a.price.toLocaleString()}`} />
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 12, paddingTop: 12 }}>
              <Row label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
              {paymentType === "deposit" && (
                <>
                  <Row label={`Deposit (${depositPct}%)`} value={`$${depositAmount.toLocaleString()}`} accent />
                  <Row label="Balance on delivery" value={`$${(subtotal - depositAmount).toLocaleString()}`} muted />
                </>
              )}
              {paymentType === "full" && (
                <Row label="Total due today" value={`$${subtotal.toLocaleString()}`} accent />
              )}
              {paymentType === "quote" && (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8, lineHeight: 1.5 }}>
                  No payment required — we will send a custom quote within 48 hours.
                </p>
              )}
            </div>
          </div>
        )}

        {pkg && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 16 }}>
            <p style={{ ...labelStyle, marginBottom: 8 }}>Package features</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {pkg.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                  <Check size={9} color="#ff5a00" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 7 }}>
          <Shield size={10} color="rgba(255,255,255,0.2)" />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.5 }}>
            {paymentType === "full" ? "100% payment. Fully refundable within 48h." : "50% deposit protects your slot."}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: muted ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: accent ? 700 : 400, color: accent ? "#ff5a00" : muted ? "rgba(255,255,255,0.25)" : "#f5f7f8" }}>{value}</span>
    </div>
  );
}

// ── File upload zone ────────────────────────────────────────────────────────

function FileUpload({ files, onAdd, onRemove }: { files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onAdd(Array.from(e.dataTransfer.files));
  }, [onAdd]);

  const fmt = (bytes: number) => bytes < 1e6 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1e6).toFixed(1)} MB`;

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1px dashed ${dragging ? "#ff5a00" : "rgba(255,255,255,0.12)"}`,
          padding: "32px 24px", textAlign: "center", cursor: "pointer",
          background: dragging ? "rgba(255,90,0,0.04)" : "transparent",
          transition: "all 0.15s",
        }}
      >
        <Upload size={18} color={dragging ? "#ff5a00" : "rgba(255,255,255,0.25)"} style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
          Drag files here or <span style={{ color: "#ff5a00" }}>browse</span>
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Brand guidelines, references, existing 3D files, CAD — up to 100 MB each
        </p>
        <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => e.target.files && onAdd(Array.from(e.target.files))} />
      </div>
      {files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#0d0f12", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 12, color: "#f5f7f8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{fmt(f.size)}</span>
              <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 2, display: "flex" }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Crypto payment panel (reused from existing) ─────────────────────────────

const CRYPTO_TOKENS = [
  { symbol: "ETH", name: "Ethereum", rate: 3420, decimals: 6, logo: "Ξ" },
  { symbol: "USDC", name: "USD Coin", rate: 1, decimals: 2, logo: "⬡" },
  { symbol: "USDT", name: "Tether", rate: 1, decimals: 2, logo: "₮" },
  { symbol: "DAI", name: "Dai", rate: 1, decimals: 2, logo: "◈" },
];

type WalletState = "idle" | "connecting" | "connected" | "sending" | "sent" | "error";

function CryptoPanel({ amountUsd, onSuccess }: { amountUsd: number; onSuccess: () => void }) {
  const [token, setToken] = useState(CRYPTO_TOKENS[0]);
  const [ws, setWs] = useState<WalletState>("idle");
  const [addr, setAddr] = useState("");
  const [txHash, setTxHash] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const ORVEX_WALLET = "0xA1B2C3D4E5F6789012345678901234567890ABCD";
  const cryptoAmt = (amountUsd / token.rate).toFixed(token.decimals);
  const hasWallet = typeof window !== "undefined" && Boolean((window as any).ethereum);
  const short = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

  async function connect() {
    const eth = (window as any).ethereum;
    if (!eth) return;
    setWs("connecting"); setErr("");
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
      setAddr(accounts[0]); setWs("connected");
    } catch (e: any) {
      setErr(e.message?.includes("rejected") ? "Connection rejected." : (e.message ?? "Error"));
      setWs("error");
    }
  }

  async function send() {
    setWs("sending");
    await new Promise((r) => setTimeout(r, 2200));
    setTxHash("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    setWs("sent");
    onSuccess();
  }

  function copy(t: string) {
    navigator.clipboard.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Token selector */}
      <p style={{ ...labelStyle, marginBottom: 10 }}>Select token</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
        {CRYPTO_TOKENS.map((t) => (
          <button key={t.symbol} onClick={() => setToken(t)} style={{
            padding: "12px 8px", border: `1px solid ${token.symbol === t.symbol ? "#ff5a00" : "rgba(255,255,255,0.08)"}`,
            background: token.symbol === t.symbol ? "rgba(255,90,0,0.06)" : "transparent",
            cursor: "pointer", textAlign: "center",
          }}>
            <p style={{ fontSize: 16, marginBottom: 2 }}>{t.logo}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#f5f7f8", letterSpacing: "0.08em" }}>{t.symbol}</p>
          </button>
        ))}
      </div>

      {/* Amount */}
      <div style={{ background: "#0d0f12", border: "1px solid rgba(255,255,255,0.06)", padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <p style={{ ...labelStyle }}>Due now</p>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#f5f7f8", fontFamily: "'Space Grotesk', sans-serif" }}>
              {cryptoAmt} <span style={{ color: "#ff5a00" }}>{token.symbol}</span>
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>≈ ${amountUsd.toLocaleString()} USD</p>
          </div>
        </div>
      </div>

      {/* ORVEX address */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ ...labelStyle, marginBottom: 8 }}>Send to ORVEX wallet</p>
        <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.06)", background: "#0d0f12" }}>
          <p style={{ flex: 1, padding: "12px 14px", fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ORVEX_WALLET}
          </p>
          <button onClick={() => copy(ORVEX_WALLET)} style={{ padding: "12px 14px", background: "none", border: "none", borderLeft: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: copied ? "#ff5a00" : "rgba(255,255,255,0.3)" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>ERC-20 / Ethereum mainnet only</p>
      </div>

      {!hasWallet && (
        <div style={{ border: "1px solid rgba(255,90,0,0.2)", background: "rgba(255,90,0,0.04)", padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <AlertTriangle size={14} color="#ff5a00" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f7f8", marginBottom: 4 }}>No wallet detected</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                Install MetaMask or a compatible EIP-1193 wallet to continue.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="https://metamask.io/download" target="_blank" rel="noopener noreferrer" style={{ ...btnPrimary, textDecoration: "none", fontSize: 11, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
              METAMASK <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

      {err && (
        <div style={{ border: "1px solid rgba(248,81,73,0.2)", background: "rgba(248,81,73,0.05)", padding: 12, display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <AlertTriangle size={12} color="#f85149" />
          <span style={{ fontSize: 12, color: "#f85149" }}>{err}</span>
        </div>
      )}

      {ws === "sent" ? (
        <div style={{ border: "1px solid rgba(255,90,0,0.2)", background: "rgba(255,90,0,0.04)", padding: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <Check size={14} color="#ff5a00" />
            <p style={{ fontSize: 13, fontWeight: 700, color: "#f5f7f8" }}>Transaction broadcast</p>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{txHash.slice(0, 34)}…</p>
        </div>
      ) : ws === "connected" ? (
        <div>
          <div style={{ padding: 12, border: "1px solid rgba(255,90,0,0.15)", background: "rgba(255,90,0,0.04)", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5a00" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{short(addr)}</span>
            <button onClick={() => { setAddr(""); setWs("idle"); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>DISCONNECT</button>
          </div>
          <button onClick={send} style={{ ...btnPrimary, width: "100%", justifyContent: "center" }}>
            <Wallet size={13} /> PAY {cryptoAmt} {token.symbol}
          </button>
        </div>
      ) : ws === "connecting" || ws === "sending" ? (
        <div style={{ ...btnPrimary, width: "100%", justifyContent: "center", opacity: 0.7, cursor: "wait" }}>
          <Loader size={13} style={{ animation: "spin 1s linear infinite" }} />
          {ws === "connecting" ? "CONNECTING…" : "SENDING…"}
        </div>
      ) : hasWallet ? (
        <button onClick={connect} style={{ ...btnPrimary, width: "100%", justifyContent: "center" }}>
          <Wallet size={13} /> CONNECT WALLET
        </button>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 16, color: "rgba(255,255,255,0.2)", fontSize: 10, lineHeight: 1.6 }}>
        <Shield size={10} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>Demo mode — no real transaction. ORVEX never accesses private keys. Verification is on-chain in production.</span>
      </div>
    </div>
  );
}

// ── Requirement field renderer ─────────────────────────────────────────────

function RequirementInput({
  field, value, onChange,
}: { field: RequirementField; value: string; onChange: (v: string) => void }) {
  const inputBase: React.CSSProperties = {
    width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
    color: "#f5f7f8", fontSize: 13, padding: "12px 14px", outline: "none",
    fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  };

  return (
    <div>
      <label style={{ ...labelStyle, marginBottom: 8, display: "block" }}>
        {field.label}{field.required && <span style={{ color: "#ff5a00" }}> *</span>}
      </label>
      {field.hint && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{field.hint}</p>}

      {field.type === "textarea" && (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} rows={4}
          style={{ ...inputBase, resize: "vertical" }}
        />
      )}
      {field.type === "text" && (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} style={inputBase} />
      )}
      {field.type === "select" && field.options && (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputBase, cursor: "pointer" }}>
          <option value="">Select…</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {field.type === "radio" && field.options && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {field.options.map((o) => (
            <button
              key={o}
              onClick={() => onChange(o)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", textAlign: "left",
                border: `1px solid ${value === o ? "#ff5a00" : "rgba(255,255,255,0.08)"}`,
                background: value === o ? "rgba(255,90,0,0.05)" : "transparent",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: "50%", border: `1px solid ${value === o ? "#ff5a00" : "rgba(255,255,255,0.2)"}`,
                background: value === o ? "#ff5a00" : "transparent", flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: value === o ? "#f5f7f8" : "rgba(255,255,255,0.5)" }}>{o}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Checkout ───────────────────────────────────────────────────────────

export default function ServiceCheckout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { services, settings, orders_, invoices_, payments_, projects_ } = useAdmin();
  const { toast } = useToast();

  const preService = params.get("service") ?? "";
  const prePkg = params.get("package") ?? "";

  // Step state
  const [step, setStep] = useState<Step>(preService ? "package" : "service");

  // Selections
  const [serviceId, setServiceId] = useState(preService);
  const [pkgId, setPkgId] = useState(prePkg);
  const [requirements, setRequirements] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [timelineUrgency, setTimelineUrgency] = useState<"standard" | "expedited" | "rush">("standard");
  const [notes, setNotes] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("deposit");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("card");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", company: "", country: "" });
  const [cryptoPaid, setCryptoPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId && s.visible);
  const pkg = service?.packages.find((p) => p.id === pkgId);
  const reqFields = service ? getRequirementFields(service.id) : [];
  const availableAddons = service ? getAddonsForService(service.id) : [];

  const selectedAddons = selectedAddonIds.map((id) => {
    const addon = availableAddons.find((a) => a.id === id)!;
    return { id, label: addon.label, price: computeAddonPrice(addon, pkg?.price ?? 0) };
  });

  const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const subtotal = (pkg?.price ?? 0) + addonTotal;
  const depositPct = settings.depositPercent ?? 50;
  const depositAmount = paymentType === "full" ? subtotal : Math.round(subtotal * depositPct) / 100;

  function toggleAddon(id: string) {
    setSelectedAddonIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  const goTo = (s: Step) => setStep(s);
  const back = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1] as Step);
  };

  // Validate current step before proceeding
  function canAdvance(): boolean {
    if (step === "service") return !!serviceId;
    if (step === "package") return !!pkgId;
    if (step === "requirements") {
      return reqFields.filter((f) => f.required).every((f) => !!requirements[f.key]?.trim());
    }
    if (step === "details") return !!(details.name && details.email);
    if (step === "payment") {
      if (paymentType === "quote") return true;
      if (paymentMethod === "crypto") return cryptoPaid;
      return true;
    }
    return true;
  }

  async function handlePlaceOrder() {
    if (!service || !pkg) return;
    setProcessing(true);
    setStep("processing");

    const payIntent = {
      orderId: "temp",
      amount: paymentType === "quote" ? 0 : depositAmount * 100,
      currency: "USD",
      method: paymentMethod,
      paymentType,
      customerEmail: details.email,
      customerName: details.name,
      metadata: { serviceId: service.id, packageId: pkg.id },
    };

    const payResult = await processPayment(payIntent);

    if (!payResult.success && paymentType !== "quote") {
      toast.error("Payment failed", payResult.error ?? "Please try again");
      setStep("payment");
      setProcessing(false);
      return;
    }

    const { order, invoice, payment, project } = buildOrderRecords({
      customerName: details.name,
      customerEmail: details.email,
      customerPhone: details.phone,
      customerCompany: details.company,
      service,
      packageId: pkg.id,
      packageName: pkg.name,
      packagePrice: pkg.price,
      addons: selectedAddons,
      customRequirements: requirements,
      attachments: files.map((f) => f.name),
      preferredStartDate,
      timelineUrgency,
      notes,
      paymentType,
      paymentMethod,
      paymentResult: payResult,
      taxRate: settings.taxRate,
      depositPercent: depositPct,
      autoCreateProject: paymentType !== "quote",
    });

    orders_.add(order);
    invoices_.add(invoice);
    payments_.add(payment);
    if (project) projects_.add(project);

    setConfirmedOrderId(order.orderId);
    setProcessing(false);
    navigate(`/order/${encodeURIComponent(order.orderId)}`);
  }

  // ── Processing screen
  if (step === "processing") {
    return (
      <Layout>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050608" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "2px solid #ff5a00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 28px" }} />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f7f8", marginBottom: 8 }}>
              {paymentType === "quote" ? "Submitting your brief…" : "Processing payment…"}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              {paymentType === "quote" ? "Creating your quote request…" : paymentMethod === "card" ? "Authorising with Stripe…" : "Broadcasting transaction…"}
            </p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </Layout>
    );
  }

  const GUTTER: React.CSSProperties = { padding: "0 clamp(20px,5vw,64px)" };
  const INNER: React.CSSProperties = { maxWidth: 1200, margin: "0 auto" };

  return (
    <Layout>
      {/* Header */}
      <div style={{ paddingTop: 100, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.04)", ...GUTTER, background: "#050608" }}>
        <div style={INNER}>
          <p style={{ ...labelStyle, color: "#ff5a00", marginBottom: 10 }}>Service checkout</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, color: "#f5f7f8", lineHeight: 1.1 }}>
            {service?.title ?? "Select a service"}
          </h1>
        </div>
      </div>

      <Progress current={step} />

      <div style={{ background: "#050608", minHeight: "100vh", ...GUTTER, paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ ...INNER, display: "grid", gridTemplateColumns: "1fr min(320px, 30%)", gap: 48, alignItems: "start" }}>

          {/* ── Left: step content ── */}
          <div>

            {/* ── SERVICE ── */}
            {step === "service" && (
              <StepShell title="Choose a service" subtitle="What are you looking to create?">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {services.filter((s) => s.visible).map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      selected={serviceId === s.id}
                      onClick={() => { setServiceId(s.id); setPkgId(""); setSelectedAddonIds([]); }}
                    />
                  ))}
                </div>
                <NavRow>
                  <span />
                  <button style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.35 }} onClick={() => canAdvance() && goTo("package")} disabled={!canAdvance()}>
                    Select package <ArrowRight size={13} />
                  </button>
                </NavRow>
              </StepShell>
            )}

            {/* ── PACKAGE ── */}
            {step === "package" && service && (
              <StepShell title={`${service.title} packages`} subtitle="Choose the scope that fits your project.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                  {service.packages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPkgId(p.id)}
                      style={{
                        textAlign: "left", padding: 20,
                        border: `1px solid ${pkgId === p.id ? "#ff5a00" : "rgba(255,255,255,0.07)"}`,
                        background: pkgId === p.id ? "rgba(255,90,0,0.04)" : "transparent",
                        cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      {p.popular && (
                        <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "#ff5a00", border: "1px solid rgba(255,90,0,0.4)", padding: "3px 8px", marginBottom: 10 }}>
                          POPULAR
                        </span>
                      )}
                      <p style={{ ...labelStyle, marginBottom: 6 }}>{p.name}</p>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: "#f5f7f8", marginBottom: 4 }}>
                        ${p.price.toLocaleString()}
                      </p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>{p.description}</p>
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                        {p.features.map((f) => (
                          <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <Check size={9} color="#ff5a00" style={{ marginTop: 3, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 14 }}>Timeline: {p.duration}</p>
                    </button>
                  ))}
                </div>
                <NavRow>
                  <button style={btnGhost} onClick={back}><ChevronLeft size={13} /> Back</button>
                  <button style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.35 }} onClick={() => canAdvance() && goTo("requirements")} disabled={!canAdvance()}>
                    Requirements <ArrowRight size={13} />
                  </button>
                </NavRow>
              </StepShell>
            )}

            {/* ── REQUIREMENTS ── */}
            {step === "requirements" && (
              <StepShell title="Project requirements" subtitle={`Tell us what you need. The more detail, the better the outcome.`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {reqFields.map((field) => (
                    <RequirementInput
                      key={field.key}
                      field={field}
                      value={requirements[field.key] ?? ""}
                      onChange={(v) => setRequirements((r) => ({ ...r, [field.key]: v }))}
                    />
                  ))}
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 8, display: "block" }}>Attach files</label>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
                      Brand guidelines, existing assets, reference images, CAD files, or anything relevant.
                    </p>
                    <FileUpload files={files} onAdd={addFiles} onRemove={removeFile} />
                  </div>
                </div>
                <NavRow>
                  <button style={btnGhost} onClick={back}><ChevronLeft size={13} /> Back</button>
                  <button style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.35 }} onClick={() => canAdvance() && goTo("addons")} disabled={!canAdvance()}>
                    Add-ons <ArrowRight size={13} />
                  </button>
                </NavRow>
              </StepShell>
            )}

            {/* ── ADDONS ── */}
            {step === "addons" && service && (
              <StepShell title="Optional add-ons" subtitle="Expand your engagement. All add-ons are applied to this project only.">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {availableAddons.map((addon) => {
                    const price = computeAddonPrice(addon, pkg?.price ?? 0);
                    const active = selectedAddonIds.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                          border: `1px solid ${active ? "#ff5a00" : "rgba(255,255,255,0.07)"}`,
                          background: active ? "rgba(255,90,0,0.04)" : "transparent",
                          cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, border: `1px solid ${active ? "#ff5a00" : "rgba(255,255,255,0.2)"}`,
                          background: active ? "#ff5a00" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {active && <Check size={10} color="#000" strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f7f8", marginBottom: 2 }}>{addon.label}</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{addon.description}</p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#ff5a00", flexShrink: 0 }}>
                          {price === 0 ? "Free" : `+$${price.toLocaleString()}`}
                          {addon.priceType === "percent" ? ` (${addon.price}%)` : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <NavRow>
                  <button style={btnGhost} onClick={back}><ChevronLeft size={13} /> Back</button>
                  <button style={btnPrimary} onClick={() => goTo("timeline")}>
                    Timeline <ArrowRight size={13} />
                  </button>
                </NavRow>
              </StepShell>
            )}

            {/* ── TIMELINE ── */}
            {step === "timeline" && (
              <StepShell title="Timeline preferences" subtitle="When do you need this project completed?">
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 8, display: "block" }}>Preferred start date</label>
                    <input
                      type="date"
                      value={preferredStartDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setPreferredStartDate(e.target.value)}
                      style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", padding: "12px 14px", fontSize: 13, outline: "none", width: 220 }}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 10, display: "block" }}>Urgency</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { value: "standard", label: "Standard", desc: `Package timeline (${pkg?.duration ?? "as quoted"})`, extra: "" },
                        { value: "expedited", label: "Expedited", desc: "15% faster — requires resource allocation review", extra: "+15%" },
                        { value: "rush", label: "Rush", desc: "50% faster — full team priority, limited availability", extra: "+50%" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setTimelineUrgency(opt.value as any)}
                          style={{
                            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                            border: `1px solid ${timelineUrgency === opt.value ? "#ff5a00" : "rgba(255,255,255,0.07)"}`,
                            background: timelineUrgency === opt.value ? "rgba(255,90,0,0.04)" : "transparent",
                            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                          }}
                        >
                          <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1px solid ${timelineUrgency === opt.value ? "#ff5a00" : "rgba(255,255,255,0.2)"}`, background: timelineUrgency === opt.value ? "#ff5a00" : "transparent", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f7f8" }}>{opt.label}</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{opt.desc}</p>
                          </div>
                          {opt.extra && (
                            <span style={{ fontSize: 12, color: "#ff5a00", fontWeight: 700 }}>{opt.extra}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 8, display: "block" }}>Additional notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything else we should know — hard deadline, budget sensitivity, technical constraints..."
                      rows={4}
                      style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", fontSize: 13, padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <NavRow>
                  <button style={btnGhost} onClick={back}><ChevronLeft size={13} /> Back</button>
                  <button style={btnPrimary} onClick={() => goTo("details")}>
                    Your details <ArrowRight size={13} />
                  </button>
                </NavRow>
              </StepShell>
            )}

            {/* ── DETAILS ── */}
            {step === "details" && (
              <StepShell title="Your details" subtitle="Who should we address this engagement to?">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[
                    { key: "name", label: "Full name *", type: "text", placeholder: "Jane Smith" },
                    { key: "company", label: "Company", type: "text", placeholder: "Your studio" },
                    { key: "email", label: "Email address *", type: "email", placeholder: "jane@company.com" },
                    { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 000 0000" },
                    { key: "country", label: "Country", type: "text", placeholder: "United States" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key} style={{ gridColumn: key === "company" || key === "country" ? "span 1" : "span 1" }}>
                      <label style={{ ...labelStyle, marginBottom: 8, display: "block" }}>{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={details[key as keyof typeof details]}
                        onChange={(e) => setDetails((d) => ({ ...d, [key]: e.target.value }))}
                        style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", fontSize: 13, padding: "12px 14px", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                </div>
                <NavRow>
                  <button style={btnGhost} onClick={back}><ChevronLeft size={13} /> Back</button>
                  <button style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.35 }} onClick={() => canAdvance() && goTo("summary")} disabled={!canAdvance()}>
                    Review order <ArrowRight size={13} />
                  </button>
                </NavRow>
              </StepShell>
            )}

            {/* ── SUMMARY ── */}
            {step === "summary" && service && pkg && (
              <StepShell title="Order review" subtitle="Verify every detail before payment.">
                <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Service block */}
                  <SummaryBlock label="Engagement">
                    <SummaryRow label="Service" value={service.title} />
                    <SummaryRow label="Package" value={`${pkg.name} — $${pkg.price.toLocaleString()}`} />
                    <SummaryRow label="Timeline" value={pkg.duration} />
                    {selectedAddons.length > 0 && <SummaryRow label="Add-ons" value={selectedAddons.map((a) => a.label).join(", ")} />}
                  </SummaryBlock>
                  {/* Requirements */}
                  <SummaryBlock label="Project requirements">
                    {reqFields.map((f) => requirements[f.key] ? (
                      <SummaryRow key={f.key} label={f.label} value={requirements[f.key]} multiline />
                    ) : null)}
                    {files.length > 0 && <SummaryRow label="Attachments" value={files.map((f) => f.name).join(", ")} />}
                  </SummaryBlock>
                  {/* Timeline */}
                  <SummaryBlock label="Timeline">
                    {preferredStartDate && <SummaryRow label="Preferred start" value={preferredStartDate} />}
                    <SummaryRow label="Urgency" value={{ standard: "Standard", expedited: "Expedited (+15%)", rush: "Rush (+50%)" }[timelineUrgency]} />
                    {notes && <SummaryRow label="Notes" value={notes} multiline />}
                  </SummaryBlock>
                  {/* Customer */}
                  <SummaryBlock label="Your details">
                    <SummaryRow label="Name" value={details.name} />
                    {details.company && <SummaryRow label="Company" value={details.company} />}
                    <SummaryRow label="Email" value={details.email} />
                    {details.phone && <SummaryRow label="Phone" value={details.phone} />}
                    {details.country && <SummaryRow label="Country" value={details.country} />}
                  </SummaryBlock>
                  {/* Financials */}
                  <SummaryBlock label="Financials" last>
                    <SummaryRow label="Package" value={`$${pkg.price.toLocaleString()}`} />
                    {selectedAddons.map((a) => (
                      <SummaryRow key={a.id} label={a.label} value={`+$${a.price.toLocaleString()}`} />
                    ))}
                    <SummaryRow label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                  </SummaryBlock>
                </div>
                <NavRow>
                  <button style={btnGhost} onClick={back}><ChevronLeft size={13} /> Back</button>
                  <button style={btnPrimary} onClick={() => goTo("payment")}>
                    Payment <ArrowRight size={13} />
                  </button>
                </NavRow>
              </StepShell>
            )}

            {/* ── PAYMENT ── */}
            {step === "payment" && service && pkg && (
              <StepShell title="Payment" subtitle="Choose how you want to proceed.">
                {/* Payment type */}
                <div style={{ marginBottom: 32 }}>
                  <p style={{ ...labelStyle, marginBottom: 14 }}>Payment option</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {([
                      { value: "deposit", label: "Deposit", desc: `${depositPct}% now — balance on delivery`, amount: `$${depositAmount.toLocaleString()}` },
                      { value: "full", label: "Full payment", desc: "Pay in full — 5% discount applied", amount: `$${Math.round(subtotal * 0.95).toLocaleString()}` },
                      { value: "quote", label: "Custom quote", desc: "Submit brief — we send a tailored price", amount: "Free" },
                    ] as { value: PaymentType; label: string; desc: string; amount: string }[]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPaymentType(opt.value)}
                        style={{
                          padding: "18px 16px", textAlign: "left",
                          border: `1px solid ${paymentType === opt.value ? "#ff5a00" : "rgba(255,255,255,0.07)"}`,
                          background: paymentType === opt.value ? "rgba(255,90,0,0.04)" : "transparent",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        <p style={{ fontSize: 18, fontWeight: 700, color: "#f5f7f8", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>{opt.amount}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: paymentType === opt.value ? "#ff5a00" : "#f5f7f8", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{opt.label}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment method — only for non-quote */}
                {paymentType !== "quote" && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ ...labelStyle, marginBottom: 14 }}>Payment method</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
                      {([
                        { id: "card", label: "Card" },
                        { id: "bank_transfer", label: "Bank transfer" },
                        { id: "crypto", label: "Crypto" },
                      ] as { id: PaymentMethodType; label: string }[]).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setPaymentMethod(m.id); setCryptoPaid(false); }}
                          style={{
                            padding: "12px 16px", border: `1px solid ${paymentMethod === m.id ? "#ff5a00" : "rgba(255,255,255,0.07)"}`,
                            background: paymentMethod === m.id ? "rgba(255,90,0,0.04)" : "transparent",
                            cursor: "pointer", fontSize: 12, fontWeight: 700, color: paymentMethod === m.id ? "#ff5a00" : "rgba(255,255,255,0.45)",
                            letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.15s",
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Card form */}
                    {paymentMethod === "card" && (
                      <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16, lineHeight: 1.6 }}>
                          Card details are processed directly by Stripe. ORVEX never stores card data.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <CardInput label="Card number" placeholder="•••• •••• •••• ••••" />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            <CardInput label="Expiry" placeholder="MM / YY" />
                            <CardInput label="CVC" placeholder="•••" />
                          </div>
                          <CardInput label="Cardholder name" placeholder="Jane Smith" />
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 16, color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                          <Shield size={10} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span>256-bit SSL encrypted. PCI DSS compliant via Stripe.</span>
                        </div>
                      </div>
                    )}

                    {/* Bank transfer */}
                    {paymentMethod === "bank_transfer" && (
                      <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.6 }}>
                          Transfer your deposit to the account below. Use your name and "<strong style={{ color: "#f5f7f8" }}>{service.title}</strong>" as the reference. We confirm receipt within 1 business day.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {[
                            ["Account name", "ORVEX Studio Ltd."],
                            ["Bank", "Chase Bank NA"],
                            ["Account number", "•••••• 4821"],
                            ["Routing (ABA)", "021000021"],
                            ["SWIFT / BIC", "CHASUS33"],
                            ["Reference", `${details.name || "Your Name"} — ${service.title}`],
                          ].map(([label, value]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                              <span style={{ fontSize: 12, color: "#f5f7f8" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crypto */}
                    {paymentMethod === "crypto" && (
                      <CryptoPanel amountUsd={depositAmount} onSuccess={() => setCryptoPaid(true)} />
                    )}
                  </div>
                )}

                {/* Quote info */}
                {paymentType === "quote" && (
                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: 24, marginBottom: 24 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#f5f7f8", marginBottom: 8 }}>What happens next</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        "We review your brief within 24 hours",
                        "You receive a detailed, itemised quote by email",
                        "You approve or negotiate — no pressure",
                        "We begin once you confirm and pay the deposit",
                      ].map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 20, height: 20, border: "1px solid rgba(255,90,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#ff5a00", fontWeight: 700 }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <NavRow>
                  <button style={btnGhost} onClick={back}><ChevronLeft size={13} /> Back</button>
                  {(paymentMethod !== "crypto" || cryptoPaid || paymentType === "quote") && (
                    <button
                      style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.4 }}
                      disabled={!canAdvance()}
                      onClick={handlePlaceOrder}
                    >
                      {paymentType === "quote" ? "Submit brief →" : paymentMethod === "bank_transfer" ? "Confirm order →" : `Pay $${depositAmount.toLocaleString()} →`}
                    </button>
                  )}
                </NavRow>
              </StepShell>
            )}
          </div>

          {/* ── Right: order summary sidebar ── */}
          <OrderSummary
            service={service}
            pkg={pkg}
            selectedAddons={selectedAddons}
            paymentType={paymentType}
            depositPct={depositPct}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); }}
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
      `}</style>
    </Layout>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f7f8", marginBottom: 6 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>{subtitle}</p>
      {children}
    </div>
  );
}

function NavRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      {children}
    </div>
  );
}

function SummaryBlock({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)", padding: "20px 20px" }}>
      <p style={{ ...labelStyle, marginBottom: 12, color: "#ff5a00" }}>{label}</p>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: "#f5f7f8", textAlign: "right", maxWidth: "60%", lineHeight: multiline ? 1.6 : 1.4 }}>{value}</span>
    </div>
  );
}

function ServiceCard({ service, selected, onClick }: { service: Service; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 18px", textAlign: "left",
        border: `1px solid ${selected ? "#ff5a00" : "rgba(255,255,255,0.07)"}`,
        background: selected ? "rgba(255,90,0,0.04)" : "transparent",
        cursor: "pointer", transition: "all 0.15s", width: "100%",
      }}
    >
      <div style={{ width: 32, height: 32, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: selected ? "#ff5a00" : "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>{service.number}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#f5f7f8", marginBottom: 2, fontFamily: "'Space Grotesk', sans-serif" }}>{service.title}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{service.description}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>from</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: selected ? "#ff5a00" : "#f5f7f8" }}>${service.startingPrice.toLocaleString()}</p>
      </div>
    </button>
  );
}

function CardInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label style={{ ...labelStyle, marginBottom: 6, display: "block" }}>{label}</label>
      <input
        placeholder={placeholder}
        style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f7f8", fontSize: 13, padding: "11px 14px", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }}
      />
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', sans-serif",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "12px 24px", background: "#ff5a00", color: "#fff", border: "none",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
  cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "opacity 0.15s",
};

const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "12px 20px", background: "none", border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer",
  letterSpacing: "0.06em", fontFamily: "'Inter', sans-serif",
};
