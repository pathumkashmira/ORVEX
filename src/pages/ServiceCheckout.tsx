import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, Check, Shield, Wallet, Copy, ExternalLink, AlertTriangle, Loader } from "lucide-react";
import Layout from "@/components/Layout";
import { services } from "@/data/seed";

/* ── Types ─────────────────────────────────────────── */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

/* ── Constants ─────────────────────────────────────── */
const STEPS = ["SERVICE", "PROJECT DETAILS", "CUSTOMER", "ADD-ONS", "PAYMENT", "CONFIRMATION"];

const ADD_ONS = [
  { id: "rush", label: "Rush Delivery", desc: "50% timeline reduction", price: 0.5, unit: "%" },
  { id: "source", label: "Source Files", desc: "Full project source files", price: 500, unit: "flat" },
  { id: "extra-rev", label: "Extra Revision Rounds", desc: "2 additional revision rounds", price: 350, unit: "flat" },
  { id: "usage", label: "Extended License", desc: "Broadcast + global unlimited use", price: 800, unit: "flat" },
];

const CRYPTO_TOKENS = [
  { symbol: "ETH", name: "Ethereum", rate: 3420, decimals: 6, logo: "Ξ" },
  { symbol: "USDC", name: "USD Coin", rate: 1, decimals: 2, logo: "⬡" },
  { symbol: "USDT", name: "Tether", rate: 1, decimals: 2, logo: "₮" },
  { symbol: "DAI", name: "Dai", rate: 1, decimals: 2, logo: "◈" },
];

const PAYMENT_METHODS = ["Credit / Debit Card", "Bank Transfer", "Crypto Wallet"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

type WalletState = "idle" | "connecting" | "connected" | "sending" | "sent" | "error";

/* ── Crypto panel ───────────────────────────────────── */
function CryptoPaymentPanel({
  depositUsd,
  onSuccess,
}: {
  depositUsd: number;
  onSuccess: (txHash: string, walletAddress: string, token: string) => void;
}) {
  const [token, setToken] = useState(CRYPTO_TOKENS[0]);
  const [walletState, setWalletState] = useState<WalletState>("idle");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const cryptoAmount = (depositUsd / token.rate).toFixed(token.decimals);
  const hasWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  /* Truncate address for display */
  const shortAddr = (addr: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  /* Mock tx hash generator */
  const mockTxHash = () =>
    "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  /* Connect wallet */
  const connectWallet = async () => {
    if (!window.ethereum) return;
    setWalletState("connecting");
    setError("");
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts[0]) {
        setWalletAddress(accounts[0]);
        setWalletState("connected");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection rejected.";
      setError(msg.includes("rejected") ? "Connection rejected by user." : msg);
      setWalletState("error");
    }
  };

  /* Send payment (simulated — no real on-chain tx in demo) */
  const sendPayment = async () => {
    setWalletState("sending");
    setError("");
    await new Promise((r) => setTimeout(r, 2200));
    const hash = mockTxHash();
    setTxHash(hash);
    setWalletState("sent");
    onSuccess(hash, walletAddress, token.symbol);
  };

  const copyAddress = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  /* No wallet installed */
  if (!hasWallet) {
    return (
      <div className="border border-[#ff5a00]/20 bg-[#ff5a00]/04 p-6 mt-4">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle size={16} className="text-[#ff5a00] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-700 text-[#f5f7f8] text-sm mb-1" style={{ fontWeight: 700 }}>No wallet detected</p>
            <p className="text-[#bfc5cc] text-xs leading-relaxed">
              Install a Web3 wallet to pay with crypto. We support MetaMask, Coinbase Wallet, Rabby, and any EIP-1193 compatible wallet.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://metamask.io/download"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
          >
            INSTALL METAMASK <ExternalLink size={11} />
          </a>
          <a
            href="https://www.coinbase.com/wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-2.5 px-5 flex items-center gap-2"
          >
            COINBASE WALLET <ExternalLink size={11} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      {/* Token selector */}
      <div>
        <p className="orvex-label mb-3">Select token</p>
        <div className="grid grid-cols-4 gap-2">
          {CRYPTO_TOKENS.map((t) => (
            <button
              key={t.symbol}
              onClick={() => setToken(t)}
              className={`p-3 border text-center transition-all ${
                token.symbol === t.symbol
                  ? "border-[#ff5a00] bg-[#ff5a00]/08"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <p className="text-lg mb-0.5">{t.logo}</p>
              <p className="label-sm text-[#f5f7f8]">{t.symbol}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Amount due */}
      <div className="bg-[#14171b] border border-white/8 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="label-sm text-[#bfc5cc]/50">DEPOSIT DUE</p>
          <div className="text-right">
            <p className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              {cryptoAmount} <span className="text-[#ff5a00]">{token.symbol}</span>
            </p>
            <p className="label-sm text-[#bfc5cc]/40 mt-1">≈ ${depositUsd.toLocaleString()} USD</p>
          </div>
        </div>
        {token.symbol === "ETH" && (
          <p className="text-[#bfc5cc]/40 text-xs">
            Rate: 1 ETH ≈ ${token.rate.toLocaleString()} USD · Rates are indicative and may differ at settlement.
          </p>
        )}
      </div>

      {/* ORVEX wallet address to send to */}
      <div>
        <p className="orvex-label mb-2">Send to ORVEX wallet</p>
        <div className="flex items-center gap-0 border border-white/8 bg-[#14171b]">
          <p className="flex-1 px-4 py-3 text-[#bfc5cc] text-xs font-mono truncate">
            0xA1B2C3D4E5F6789012345678901234567890ABCD
          </p>
          <button
            onClick={() => copyAddress("0xA1B2C3D4E5F6789012345678901234567890ABCD")}
            className="px-4 py-3 border-l border-white/8 text-[#bfc5cc]/50 hover:text-[#ff5a00] transition-colors"
            title="Copy address"
          >
            {copied ? <Check size={13} className="text-[#ff5a00]" /> : <Copy size={13} />}
          </button>
        </div>
        <p className="text-[#bfc5cc]/35 text-xs mt-1.5">ERC-20 / Ethereum mainnet only</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 border border-red-500/20 bg-red-500/05 p-4">
          <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Wallet connection & pay button */}
      {walletState === "idle" || walletState === "error" ? (
        <button onClick={connectWallet} className="btn-primary w-full justify-center">
          <Wallet size={14} /> CONNECT WALLET
        </button>
      ) : walletState === "connecting" ? (
        <div className="btn-primary w-full justify-center opacity-70 cursor-wait">
          <Loader size={14} className="animate-spin" /> CONNECTING…
        </div>
      ) : walletState === "connected" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 border border-[#ff5a00]/20 bg-[#ff5a00]/04 p-4">
            <div className="w-2 h-2 rounded-full bg-[#ff5a00] animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="label-sm text-[#bfc5cc]/50">CONNECTED</p>
              <p className="text-[#f5f7f8] text-xs mt-0.5 font-mono truncate">{shortAddr(walletAddress)}</p>
            </div>
            <button
              onClick={() => { setWalletAddress(""); setWalletState("idle"); }}
              className="label-sm text-[#bfc5cc]/40 hover:text-red-400 transition-colors flex-shrink-0"
            >
              DISCONNECT
            </button>
          </div>
          <button onClick={sendPayment} className="btn-primary w-full justify-center">
            <Wallet size={14} /> PAY {cryptoAmount} {token.symbol}
          </button>
        </div>
      ) : walletState === "sending" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 border border-[#ff5a00]/20 p-4">
            <div className="w-2 h-2 rounded-full bg-[#ff5a00] animate-pulse flex-shrink-0" />
            <p className="label-sm text-[#bfc5cc]/50">CONNECTED · {shortAddr(walletAddress)}</p>
          </div>
          <div className="btn-primary w-full justify-center opacity-70 cursor-wait">
            <Loader size={14} className="animate-spin" /> SENDING TRANSACTION…
          </div>
        </div>
      ) : (
        <div className="border border-[#ff5a00]/20 bg-[#ff5a00]/05 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Check size={16} className="text-[#ff5a00]" />
            <p className="font-700 text-[#f5f7f8] text-sm" style={{ fontWeight: 700 }}>Transaction broadcast</p>
          </div>
          <p className="text-[#bfc5cc] text-xs mb-2">
            {cryptoAmount} {token.symbol} sent from {shortAddr(walletAddress)}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[#bfc5cc]/40 text-xs font-mono truncate">{txHash.slice(0, 30)}…</p>
            <button onClick={() => copyAddress(txHash)} className="text-[#bfc5cc]/40 hover:text-[#ff5a00] transition-colors flex-shrink-0">
              <Copy size={10} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-[#bfc5cc]/40 text-xs">
        <Shield size={11} className="mt-0.5 flex-shrink-0" />
        <span>
          Demo mode — no real transaction occurs. In production, payment is verified on-chain before order is confirmed.
          All wallet interactions happen client-side; ORVEX never has access to your private keys.
        </span>
      </div>
    </div>
  );
}

/* ── Main Checkout ──────────────────────────────────── */
export default function ServiceCheckout() {
  const [params] = useSearchParams();
  const serviceId = params.get("service") ?? "1";
  const packageId = params.get("package");
  const service = services.find((s) => s.id === serviceId) ?? services[0];
  const [selectedPkg, setSelectedPkg] = useState(packageId ?? service.packages[1]?.id ?? service.packages[0]?.id ?? "");
  const [step, setStep] = useState(1);
  const [addons, setAddons] = useState<string[]>([]);
  const [projectForm, setProjectForm] = useState({ description: "", objectives: "", references: "", dimensions: "", deadline: "", budget: "", style: "", platform: "" });
  const [custForm, setCustForm] = useState({ name: "", company: "", email: "", phone: "", country: "" });
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Credit / Debit Card");
  const [cryptoTx, setCryptoTx] = useState<{ hash: string; address: string; token: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const pkg = service.packages.find((p) => p.id === selectedPkg);
  const pkgPrice = pkg?.price ?? 0;
  const addonTotal = addons.reduce((sum, id) => {
    const a = ADD_ONS.find((ao) => ao.id === id);
    if (!a) return sum;
    return sum + (a.unit === "%" ? pkgPrice * a.price : a.price);
  }, 0);
  const subtotal = pkgPrice + addonTotal;
  const deposit = subtotal * 0.5;

  const toggleAddon = (id: string) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  const setProject =
    (k: keyof typeof projectForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProjectForm((f) => ({ ...f, [k]: e.target.value }));
  const setCust =
    (k: keyof typeof custForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setCustForm((f) => ({ ...f, [k]: e.target.value }));

  const orderId = `ORVEX-ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  const handleCryptoSuccess = (hash: string, address: string, token: string) => {
    setCryptoTx({ hash, address, token });
    setConfirmed(true);
  };

  const canProceedFromPayment = payMethod === "Crypto Wallet" ? Boolean(cryptoTx) : true;

  /* ── Confirmation screen ──────────────────────────── */
  if (confirmed) {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center px-8 py-32">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 border border-[#ff5a00] flex items-center justify-center mx-auto mb-10">
              <Check size={24} className="text-[#ff5a00]" />
            </div>
            <p className="label-orange mb-4">ORDER CONFIRMED</p>
            <h1
              className="text-4xl font-700 text-[#f5f7f8] mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
            >
              LET&rsquo;S BUILD IT.
            </h1>
            <p className="text-[#bfc5cc] mb-10">
              Your order has been received. We&rsquo;ll be in touch within 24 hours to begin the discovery phase.
            </p>

            <div className="border border-white/10 p-6 text-left mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="label-sm text-[#bfc5cc]/40 mb-1">ORDER ID</p>
                  <p className="text-[#ff5a00] font-600" style={{ fontWeight: 600 }}>{orderId}</p>
                </div>
                <div>
                  <p className="label-sm text-[#bfc5cc]/40 mb-1">SERVICE</p>
                  <p className="text-[#f5f7f8]">{service.title}</p>
                </div>
                <div>
                  <p className="label-sm text-[#bfc5cc]/40 mb-1">PACKAGE</p>
                  <p className="text-[#f5f7f8]">{pkg?.name}</p>
                </div>
                <div>
                  <p className="label-sm text-[#bfc5cc]/40 mb-1">DEPOSIT</p>
                  <p className="text-[#f5f7f8]">${deposit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="label-sm text-[#bfc5cc]/40 mb-1">PAYMENT</p>
                  <p className="text-[#f5f7f8]">{payMethod}</p>
                </div>
                {cryptoTx && (
                  <div className="col-span-2">
                    <p className="label-sm text-[#bfc5cc]/40 mb-1">TX HASH</p>
                    <p className="text-[#bfc5cc] text-xs font-mono truncate">{cryptoTx.hash.slice(0, 42)}…</p>
                  </div>
                )}
              </div>
            </div>

            {cryptoTx && (
              <div className="border border-[#ff5a00]/15 bg-[#ff5a00]/04 p-4 text-left mb-6">
                <p className="label-sm text-[#bfc5cc]/50 mb-1.5">CRYPTO PAYMENT</p>
                <p className="text-[#bfc5cc] text-xs">
                  Sent from <span className="text-[#f5f7f8] font-mono">{cryptoTx.address.slice(0, 10)}…</span> ·{" "}
                  <span className="text-[#ff5a00]">{cryptoTx.token}</span>
                </p>
              </div>
            )}

            <Link to="/" className="btn-secondary">RETURN TO ORVEX</Link>
          </div>
        </section>
      </Layout>
    );
  }

  /* ── Checkout flow ────────────────────────────────── */
  return (
    <Layout>
      <section className="pt-36 pb-10 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-4">SERVICE CHECKOUT</p>
          <h1
            className="text-4xl font-700 text-[#f5f7f8]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
          >
            {service.title}
          </h1>
        </div>
      </section>

      {/* Step progress */}
      <div className="px-8 md:px-12 py-4 border-b border-white/5 overflow-x-auto">
        <div className="max-w-[1400px] mx-auto flex items-center gap-0 min-w-max">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`flex items-center gap-2 text-[10px] font-700 tracking-[0.12em] uppercase ${
                  step > i + 1 ? "text-[#ff5a00]" : step === i + 1 ? "text-[#f5f7f8]" : "text-[#bfc5cc]/30"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] flex-shrink-0 ${
                    step > i + 1
                      ? "border-[#ff5a00] bg-[#ff5a00]/10"
                      : step === i + 1
                      ? "border-[#f5f7f8]"
                      : "border-white/10"
                  }`}
                >
                  {step > i + 1 ? <Check size={8} /> : i + 1}
                </div>
                <span className="hidden md:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-[1px] mx-2 ${step > i + 1 ? "bg-[#ff5a00]/40" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <section className="py-12 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
          <div>
            {/* ── Step 1 — Package ── */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-700 text-[#f5f7f8] mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  Select a package
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {service.packages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPkg(p.id)}
                      className={`text-left p-6 border transition-all ${
                        selectedPkg === p.id ? "border-[#ff5a00] bg-[#ff5a00]/05" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      {p.popular && <span className="badge badge-orange mb-3">POPULAR</span>}
                      <p className="label-sm mb-2">{p.name}</p>
                      <p className="text-2xl font-700 text-[#f5f7f8] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                        ${p.price.toLocaleString()}
                      </p>
                      <p className="text-[#bfc5cc] text-xs mb-4">{p.description}</p>
                      <ul className="list-none p-0 m-0 space-y-1.5">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-[#bfc5cc] text-xs">
                            <Check size={9} className="text-[#ff5a00]" /> {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
                {service.packages.length === 0 && (
                  <div className="border border-white/10 p-8 text-center">
                    <p className="text-[#bfc5cc] mb-4">This service requires a custom quote.</p>
                    <Link to="/contact" className="btn-primary">REQUEST QUOTE <ArrowRight size={14} /></Link>
                  </div>
                )}
                {service.packages.length > 0 && (
                  <button onClick={() => setStep(2)} disabled={!selectedPkg} className="btn-primary disabled:opacity-40">
                    PROJECT DETAILS <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}

            {/* ── Step 2 — Project details ── */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-700 text-[#f5f7f8] mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  Project details
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6">
                  <div>
                    <label className="orvex-label">Project Description *</label>
                    <textarea required value={projectForm.description} onChange={setProject("description")} className="orvex-input resize-none" rows={4} placeholder="Describe your project and what you want to achieve..." />
                  </div>
                  <div>
                    <label className="orvex-label">Objectives</label>
                    <textarea value={projectForm.objectives} onChange={setProject("objectives")} className="orvex-input resize-none" rows={3} placeholder="What are the key goals?" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="orvex-label">Output Dimensions</label><input value={projectForm.dimensions} onChange={setProject("dimensions")} className="orvex-input" placeholder="e.g. 4K, 1920×1080…" /></div>
                    <div><label className="orvex-label">Deadline</label><input type="date" value={projectForm.deadline} onChange={setProject("deadline")} className="orvex-input" /></div>
                  </div>
                  <div><label className="orvex-label">Style References</label><input value={projectForm.style} onChange={setProject("style")} className="orvex-input" placeholder="Describe your preferred style or link references…" /></div>
                  <div><label className="orvex-label">Target Platform</label><input value={projectForm.platform} onChange={setProject("platform")} className="orvex-input" placeholder="e.g. Instagram, website, print, broadcast…" /></div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="btn-ghost"><ChevronLeft size={14} /> BACK</button>
                    <button type="submit" className="btn-primary">CUSTOMER DETAILS <ArrowRight size={14} /></button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 3 — Customer ── */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-700 text-[#f5f7f8] mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  Your information
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="orvex-label">Full Name *</label><input required value={custForm.name} onChange={setCust("name")} className="orvex-input" placeholder="Your name" /></div>
                    <div><label className="orvex-label">Company</label><input value={custForm.company} onChange={setCust("company")} className="orvex-input" placeholder="Company name" /></div>
                    <div><label className="orvex-label">Email *</label><input required type="email" value={custForm.email} onChange={setCust("email")} className="orvex-input" placeholder="your@email.com" /></div>
                    <div><label className="orvex-label">Phone</label><input type="tel" value={custForm.phone} onChange={setCust("phone")} className="orvex-input" placeholder="+1 555 000 0000" /></div>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="btn-ghost"><ChevronLeft size={14} /> BACK</button>
                    <button type="submit" className="btn-primary">ADD-ONS <ArrowRight size={14} /></button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 4 — Add-ons ── */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-700 text-[#f5f7f8] mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  Optional add-ons
                </h2>
                <div className="space-y-3 mb-8">
                  {ADD_ONS.map((ao) => {
                    const price = ao.unit === "%" ? pkgPrice * ao.price : ao.price;
                    const active = addons.includes(ao.id);
                    return (
                      <button
                        key={ao.id}
                        onClick={() => toggleAddon(ao.id)}
                        className={`w-full text-left p-5 border flex items-center gap-4 transition-all ${
                          active ? "border-[#ff5a00] bg-[#ff5a00]/05" : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 ${active ? "border-[#ff5a00] bg-[#ff5a00]" : "border-white/20"}`}>
                          {active && <Check size={10} className="text-[#050608]" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-600 text-[#f5f7f8] text-sm" style={{ fontWeight: 600 }}>{ao.label}</p>
                          <p className="text-[#bfc5cc] text-xs">{ao.desc}</p>
                        </div>
                        <p className="text-[#ff5a00] text-sm font-700" style={{ fontWeight: 700 }}>
                          +${price.toLocaleString()}{ao.unit === "%" ? ` (${ao.price * 100}%)` : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(3)} className="btn-ghost"><ChevronLeft size={14} /> BACK</button>
                  <button onClick={() => setStep(5)} className="btn-primary">PAYMENT <ArrowRight size={14} /></button>
                </div>
              </div>
            )}

            {/* ── Step 5 — Payment ── */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-700 text-[#f5f7f8] mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  Payment
                </h2>

                {/* Method tabs */}
                <div className="border border-white/8 p-6 mb-6">
                  <p className="label-sm mb-4">PAYMENT METHOD</p>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setPayMethod(m)}
                        className={`p-3.5 border text-center transition-all ${
                          payMethod === m
                            ? "border-[#ff5a00] bg-[#ff5a00]/06 text-[#ff5a00]"
                            : "border-white/10 text-[#bfc5cc] hover:border-white/25"
                        }`}
                      >
                        <p className="text-xs font-700" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                          {m === "Crypto Wallet" ? (
                            <span className="flex flex-col items-center gap-1">
                              <Wallet size={14} />
                              <span className="text-[9px] tracking-wider">CRYPTO</span>
                            </span>
                          ) : (
                            m
                          )}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Card form */}
                  {payMethod === "Credit / Debit Card" && (
                    <div className="space-y-4">
                      <div><label className="orvex-label">Card Number</label><input className="orvex-input" placeholder="•••• •••• •••• ••••" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="orvex-label">Expiry</label><input className="orvex-input" placeholder="MM / YY" /></div>
                        <div><label className="orvex-label">CVC</label><input className="orvex-input" placeholder="•••" /></div>
                      </div>
                      <div><label className="orvex-label">Name on Card</label><input className="orvex-input" placeholder="Full name" /></div>
                    </div>
                  )}

                  {/* Bank transfer */}
                  {payMethod === "Bank Transfer" && (
                    <div className="space-y-3 text-sm">
                      <p className="text-[#bfc5cc] text-xs leading-relaxed mb-4">
                        Send your deposit to the account below. Include your name and project description as the reference. We confirm receipt within 1 business day.
                      </p>
                      {[
                        { label: "Account Name", value: "ORVEX Studio Ltd." },
                        { label: "Bank", value: "Chase Bank NA" },
                        { label: "Account Number", value: "••••••• 4821" },
                        { label: "Routing", value: "021000021" },
                        { label: "SWIFT/BIC", value: "CHASUS33" },
                        { label: "Reference", value: custForm.name ? `${custForm.name} — ${service.title}` : "Your Name — Service Name" },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between border-b border-white/5 pb-3">
                          <p className="label-sm text-[#bfc5cc]/40">{r.label}</p>
                          <p className="text-[#f5f7f8] text-xs text-right">{r.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Crypto wallet */}
                  {payMethod === "Crypto Wallet" && (
                    <CryptoPaymentPanel
                      depositUsd={deposit}
                      onSuccess={handleCryptoSuccess}
                    />
                  )}
                </div>

                {payMethod !== "Crypto Wallet" && (
                  <div className="flex items-center gap-3 text-[#bfc5cc]/50 text-xs mb-8">
                    <Shield size={12} className="text-[#bfc5cc]/40" />
                    Payment processed securely. We never store card details.
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(4)} className="btn-ghost"><ChevronLeft size={14} /> BACK</button>
                  {payMethod !== "Crypto Wallet" && (
                    <button onClick={() => setConfirmed(true)} className="btn-primary">
                      {payMethod === "Bank Transfer" ? "CONFIRM ORDER" : `PAY DEPOSIT $${deposit.toLocaleString()}`}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div>
            <div className="border border-white/8 p-6 sticky top-24">
              <p className="label-sm mb-6">ORDER SUMMARY</p>
              <div className="mb-4">
                <p className="text-[#f5f7f8] font-600 text-sm mb-1" style={{ fontWeight: 600 }}>{service.title}</p>
                {pkg && <p className="text-[#bfc5cc] text-xs">{pkg.name} Package</p>}
              </div>
              <div className="border-t border-white/5 pt-4 space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#bfc5cc]">Package</span>
                  <span className="text-[#f5f7f8]">${pkgPrice.toLocaleString()}</span>
                </div>
                {addons.map((id) => {
                  const ao = ADD_ONS.find((a) => a.id === id);
                  if (!ao) return null;
                  const price = ao.unit === "%" ? pkgPrice * ao.price : ao.price;
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-[#bfc5cc]">{ao.label}</span>
                      <span className="text-[#f5f7f8]">+${price.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#bfc5cc]">Subtotal</span>
                  <span className="text-[#f5f7f8]">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#bfc5cc]">Deposit (50%)</span>
                  <span className="text-[#ff5a00] font-700" style={{ fontWeight: 700 }}>${deposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#bfc5cc]">Balance on delivery</span>
                  <span className="text-[#f5f7f8]">${deposit.toLocaleString()}</span>
                </div>
              </div>

              {/* Crypto equivalent preview */}
              {payMethod === "Crypto Wallet" && deposit > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="label-sm text-[#bfc5cc]/40 mb-2">CRYPTO EQUIVALENT</p>
                  <div className="space-y-1">
                    {CRYPTO_TOKENS.map((t) => (
                      <div key={t.symbol} className="flex justify-between text-xs">
                        <span className="text-[#bfc5cc]/50">{t.symbol}</span>
                        <span className="text-[#bfc5cc]">{(deposit / t.rate).toFixed(t.decimals)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[#bfc5cc]/30 text-[10px] mt-2">Rates are approximate</p>
                </div>
              )}

              {pkg && (
                <div className="mt-6 border-t border-white/5 pt-6">
                  <p className="label-sm text-[#bfc5cc]/40 mb-2">TIMELINE</p>
                  <p className="text-[#f5f7f8] text-sm">{pkg.duration}</p>
                </div>
              )}
              <div className="mt-6 flex items-center gap-2 text-[#bfc5cc]/50 text-xs">
                <Shield size={10} />
                50% deposit. Balance due on delivery.
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
