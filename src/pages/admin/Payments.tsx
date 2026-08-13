import { useState, useMemo } from "react";
import {
  CreditCard,
  Building2,
  Bitcoin,
  HandCoins,
  CheckCircle2,
  RefreshCcw,
  Trash2,
  Plus,
  DollarSign,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin, type Payment } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type React from "react";

const METHOD_ICONS: Record<Payment["method"], React.ReactElement> = {
  card: <CreditCard size={13} />,
  bank: <Building2 size={13} />,
  crypto: <Bitcoin size={13} />,
  manual: <HandCoins size={13} />,
};

const METHOD_LABELS: Record<Payment["method"], string> = {
  card: "Card",
  bank: "Bank",
  crypto: "Crypto",
  manual: "Manual",
};

function fmtAmount(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type DialogMode = "reconcile" | "refund" | "delete" | null;

interface FormState {
  customer: string;
  invoiceId: string;
  amount: string;
  method: Payment["method"];
  status: Payment["status"];
  note: string;
  createdAt: string;
}

const BLANK: FormState = {
  customer: "",
  invoiceId: "",
  amount: "",
  method: "card",
  status: "pending",
  note: "",
  createdAt: new Date().toISOString().slice(0, 10),
};

export default function AdminPayments() {
  const { payments, payments_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | Payment["method"]>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Payment["status"]>("ALL");

  const [slideOpen, setSlideOpen] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [target, setTarget] = useState<Payment | null>(null);

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const completed = payments.filter((p) => p.status === "completed");
    const pending = payments.filter((p) => p.status === "pending");
    const failed = payments.filter((p) => p.status === "failed");
    const refunded = payments.filter((p) => p.status === "refunded");
    return {
      totalReceived: completed.reduce((s, p) => s + p.amount, 0),
      pendingCount: pending.length,
      pendingSum: pending.reduce((s, p) => s + p.amount, 0),
      failedCount: failed.length,
      refundedCount: refunded.length,
    };
  }, [payments]);

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter((p) => {
      if (q && !p.reference.toLowerCase().includes(q) && !p.customer.toLowerCase().includes(q)) return false;
      if (methodFilter !== "ALL" && p.method !== methodFilter) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      return true;
    });
  }, [payments, search, methodFilter, statusFilter]);

  // ── Columns ────────────────────────────────────────────────────────
  const columns: Column<Payment>[] = [
    {
      key: "reference",
      label: "Reference",
      sortable: true,
      render: (p) => (
        <span className="font-mono text-[11px] text-[#ff5a00]">{p.reference}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (p) => <span className="text-[#e6edf3]">{p.customer}</span>,
    },
    {
      key: "invoiceId",
      label: "Invoice",
      render: (p) => (
        <span className="font-mono text-xs text-[#58a6ff] underline underline-offset-2 cursor-pointer">
          INV-{p.invoiceId.padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (p) => (
        <span className="font-semibold text-[#e6edf3]">{fmtAmount(p.amount)}</span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (p) => (
        <span className="admin-badge admin-badge-blue flex items-center gap-1 w-fit">
          {METHOD_ICONS[p.method]}
          {METHOD_LABELS[p.method]}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p) => {
        const cls =
          p.status === "completed"
            ? "admin-badge-green"
            : p.status === "pending"
            ? "admin-badge-yellow"
            : p.status === "failed"
            ? "admin-badge-red"
            : "admin-badge-gray";
        return <span className={`admin-badge ${cls}`}>{p.status.toUpperCase()}</span>;
      },
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (p) => <span className="text-[#7d8590] text-xs">{fmtDate(p.createdAt)}</span>,
    },
    {
      key: "note",
      label: "Note",
      render: (p) => (
        <span className="text-[#7d8590] text-xs truncate max-w-[140px] block">{p.note || "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "160px",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          {p.status === "pending" && (
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm flex items-center gap-1"
              onClick={(e) => { e.stopPropagation(); setTarget(p); setDialogMode("reconcile"); }}
              title="Reconcile"
            >
              <CheckCircle2 size={12} />
              Reconcile
            </button>
          )}
          {p.status === "completed" && (
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm flex items-center gap-1"
              onClick={(e) => { e.stopPropagation(); setTarget(p); setDialogMode("refund"); }}
              title="Refund"
            >
              <RefreshCcw size={12} />
              Refund
            </button>
          )}
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm text-[#f85149] hover:text-[#f85149]"
            onClick={(e) => { e.stopPropagation(); setTarget(p); setDialogMode("delete"); }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  // ── Handlers ───────────────────────────────────────────────────────
  function handleReconcile() {
    if (!target) return;
    payments_.update({ ...target, status: "completed" });
    toast.success("Payment reconciled", `${target.reference} marked as completed.`);
    setDialogMode(null);
    setTarget(null);
  }

  function handleRefund() {
    if (!target) return;
    payments_.update({ ...target, status: "refunded" });
    toast.info("Payment refunded", `${target.reference} marked as refunded.`);
    setDialogMode(null);
    setTarget(null);
  }

  function handleDelete() {
    if (!target) return;
    payments_.remove(target.id);
    toast.success("Payment deleted");
    setDialogMode(null);
    setTarget(null);
  }

  function handleSave() {
    if (!form.customer || !form.amount || !form.invoiceId) return;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      reference: `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, "0")}`,
      invoiceId: form.invoiceId,
      customer: form.customer,
      amount: parseFloat(form.amount) || 0,
      method: form.method,
      status: form.status,
      createdAt: form.createdAt,
      note: form.note || undefined,
    };
    payments_.create(newPayment);
    toast.success("Payment recorded", newPayment.reference);
    setSlideOpen(false);
    setForm(BLANK);
  }

  function field(label: string, node: React.ReactNode) {
    return (
      <div className="admin-field">
        <label className="admin-field-label">{label}</label>
        {node}
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <p className="admin-label text-[#7d8590] mb-0.5">FINANCE</p>
            <h1 className="admin-heading">Payments</h1>
          </div>
          <button
            className="admin-btn admin-btn-primary flex items-center gap-2"
            onClick={() => { setForm(BLANK); setSlideOpen(true); }}
          >
            <Plus size={15} />
            Record Payment
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-[#3fb950]" />
              <span className="admin-label text-[#7d8590]">TOTAL RECEIVED</span>
            </div>
            <p className="text-2xl font-bold text-[#3fb950]">{fmtAmount(stats.totalReceived)}</p>
            <p className="admin-label text-[#7d8590] mt-1">Completed payments</p>
          </div>
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[#d29922]" />
              <span className="admin-label text-[#7d8590]">PENDING</span>
            </div>
            <p className="text-2xl font-bold text-[#d29922]">{fmtAmount(stats.pendingSum)}</p>
            <p className="admin-label text-[#7d8590] mt-1">{stats.pendingCount} payment{stats.pendingCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={14} className="text-[#f85149]" />
              <span className="admin-label text-[#7d8590]">FAILED</span>
            </div>
            <p className="text-2xl font-bold text-[#f85149]">{stats.failedCount}</p>
            <p className="admin-label text-[#7d8590] mt-1">Failed transactions</p>
          </div>
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw size={14} className="text-[#7d8590]" />
              <span className="admin-label text-[#7d8590]">REFUNDED</span>
            </div>
            <p className="text-2xl font-bold text-[#e6edf3]">{stats.refundedCount}</p>
            <p className="admin-label text-[#7d8590] mt-1">Refunded payments</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-search">
            <svg className="admin-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8.5" cy="8.5" r="5.75" /><path d="M13 13l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              className="admin-input pl-9"
              placeholder="Search by reference or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-select" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}>
            <option value="ALL">All Methods</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
            <option value="crypto">Crypto</option>
            <option value="manual">Manual</option>
          </select>
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Table */}
        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="No payments match your filters."
          emptyIcon={<DollarSign size={32} />}
        />

        {/* Record Payment SlideOver */}
        <SlideOver
          open={slideOpen}
          onClose={() => setSlideOpen(false)}
          title="Record Payment"
          subtitle="Log a manual payment entry in the ledger."
          footer={
            <>
              <button className="admin-btn admin-btn-secondary" onClick={() => setSlideOpen(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>Save Payment</button>
            </>
          }
        >
          <div className="space-y-4">
            {field("Customer Name *", (
              <input className="admin-input" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="e.g. Marcus Webb" />
            ))}
            {field("Invoice ID *", (
              <input className="admin-input" value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })} placeholder="e.g. 1" />
            ))}
            {field("Amount (USD) *", (
              <input className="admin-input" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            ))}
            {field("Payment Method", (
              <select className="admin-select w-full" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as Payment["method"] })}>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Crypto</option>
                <option value="manual">Manual</option>
              </select>
            ))}
            {field("Status", (
              <select className="admin-select w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Payment["status"] })}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            ))}
            {field("Date", (
              <input className="admin-input" type="date" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
            ))}
            {field("Note (optional)", (
              <textarea className="admin-textarea" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Internal note…" />
            ))}
          </div>
        </SlideOver>

        {/* Reconcile ConfirmDialog */}
        <ConfirmDialog
          open={dialogMode === "reconcile"}
          title="Reconcile Payment"
          description={`Mark ${target?.reference} as completed? This will update the payment status in the ledger.`}
          confirmLabel="Reconcile"
          onConfirm={handleReconcile}
          onCancel={() => { setDialogMode(null); setTarget(null); }}
        />

        {/* Refund ConfirmDialog */}
        <ConfirmDialog
          open={dialogMode === "refund"}
          title="Refund Payment"
          description={`Mark ${target?.reference} (${target ? fmtAmount(target.amount) : ""}) as refunded? This action cannot be undone.`}
          confirmLabel="Mark as Refunded"
          onConfirm={handleRefund}
          onCancel={() => { setDialogMode(null); setTarget(null); }}
        />

        {/* Delete ConfirmDialog */}
        <ConfirmDialog
          open={dialogMode === "delete"}
          title="Delete Payment"
          description={`Permanently delete ${target?.reference}? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => { setDialogMode(null); setTarget(null); }}
        />
      </div>
    </AdminLayout>
  );
}
