import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, CreditCard, Building2, Bitcoin, Wallet } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Payment } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

const STATUSES: Payment["status"][] = ["pending", "completed", "failed", "refunded"];
const METHODS: Payment["method"][] = ["stripe", "bank_transfer", "crypto", "paypal"];

const METHOD_CONFIG: Record<Payment["method"], { label: string; badge: string; icon: React.ReactNode }> = {
  stripe: { label: "Stripe", badge: "admin-badge-blue", icon: <CreditCard size={11} /> },
  bank_transfer: { label: "Bank Transfer", badge: "admin-badge-gray", icon: <Building2 size={11} /> },
  crypto: { label: "Crypto", badge: "admin-badge-purple", icon: <Bitcoin size={11} /> },
  paypal: { label: "PayPal", badge: "admin-badge-cyan", icon: <Wallet size={11} /> },
};

const STATUS_BADGE: Record<Payment["status"], string> = {
  pending: "admin-badge-yellow",
  completed: "admin-badge-green",
  failed: "admin-badge-red",
  refunded: "admin-badge-gray",
};

const EMPTY_FORM = {
  customer: "",
  email: "",
  invoiceNumber: "",
  amount: 0,
  method: "stripe" as Payment["method"],
  status: "pending" as Payment["status"],
  processedAt: "",
};

type FormState = typeof EMPTY_FORM;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminPayments() {
  const { payments, payments_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Payment["status"]>("all");
  const [methodFilter, setMethodFilter] = useState<"all" | Payment["method"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; ref: string }>({ open: false, id: "", ref: "" });

  const filtered = useMemo(() => {
    let list = [...payments];
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (methodFilter !== "all") list = list.filter((p) => p.method === methodFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.paymentRef.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.invoiceNumber.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, search, statusFilter, methodFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Payment) {
    setEditing(p);
    setForm({ customer: p.customer, email: p.email, invoiceNumber: p.invoiceNumber, amount: p.amount, method: p.method, status: p.status, processedAt: p.processedAt });
    setShowForm(true);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.customer.trim()) { toast.error("Customer is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (form.amount <= 0) { toast.error("Amount must be greater than 0"); return; }
    if (editing) {
      payments_.edit(editing.id, { ...form });
      toast.success("Payment updated");
    } else {
      const paymentRef = "PAY-" + new Date().getFullYear() + "-" + Date.now().toString().slice(-4);
      const item: Payment = {
        id: genId(),
        paymentRef,
        ...form,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      payments_.add(item);
      toast.success("Payment created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    payments_.del(confirmDelete.id);
    toast.success(`Payment "${confirmDelete.ref}" deleted`);
    setConfirmDelete({ open: false, id: "", ref: "" });
  }

  const totalCompleted = useMemo(() =>
    payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Payments</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {filtered.length} of {payments.length} payments · {formatCurrency(totalCompleted)} completed
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={14} style={{ marginRight: 6 }} />
            New Payment
          </button>
        </div>

        <div className="admin-filter-bar">
          <div style={{ position: "relative" }}>
            <span className="admin-search-icon">
              <Search size={14} />
            </span>
            <input
              className="admin-search"
              placeholder="Search payments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            style={{ maxWidth: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            className="admin-select"
            style={{ maxWidth: 160 }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
          >
            <option value="all">All Methods</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>{METHOD_CONFIG[m].label}</option>
            ))}
          </select>
        </div>

        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Processed At</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-empty">No payments found</div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const mc = METHOD_CONFIG[p.method];
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "#58a6ff", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {p.paymentRef}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#e6edf3" }}>{p.customer}</div>
                      <div style={{ fontSize: 12, color: "#7d8590" }}>{p.email}</div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "#7d8590" }}>{p.invoiceNumber || "—"}</td>
                    <td style={{ fontWeight: 700, color: "#e6edf3" }}>{formatCurrency(p.amount)}</td>
                    <td>
                      <span className={`admin-badge ${mc.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {mc.icon} {mc.label}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_BADGE[p.status]}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#7d8590", whiteSpace: "nowrap" }}>{formatDate(p.processedAt)}</td>
                    <td style={{ fontSize: 12, color: "#7d8590", whiteSpace: "nowrap" }}>{formatDate(p.createdAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(p)} title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setConfirmDelete({ open: true, id: p.id, ref: p.paymentRef })}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Payment" : "New Payment"}
        subtitle={editing ? editing.paymentRef : "Record a new payment"}
        width="lg"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Payment"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Customer *</label>
              <input className="admin-input" value={form.customer} onChange={(e) => setField("customer", e.target.value)} placeholder="Customer name" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Email *</label>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Invoice Number</label>
              <input className="admin-input" value={form.invoiceNumber} onChange={(e) => setField("invoiceNumber", e.target.value)} placeholder="INV-2026-0000" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Amount (USD) *</label>
              <input className="admin-input" type="number" min={0} value={form.amount} onChange={(e) => setField("amount", Number(e.target.value))} placeholder="0" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Method</label>
              <select className="admin-select" value={form.method} onChange={(e) => setField("method", e.target.value as Payment["method"])}>
                {METHODS.map((m) => <option key={m} value={m}>{METHOD_CONFIG[m].label}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Status</label>
              <select className="admin-select" value={form.status} onChange={(e) => setField("status", e.target.value as Payment["status"])}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Processed At</label>
            <input className="admin-input" type="date" value={form.processedAt} onChange={(e) => setField("processedAt", e.target.value)} />
          </div>
          {form.amount > 0 && (
            <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Payment Amount</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#e6edf3", margin: 0 }}>{formatCurrency(form.amount)}</p>
              </div>
              <div>
                <span className={`admin-badge ${METHOD_CONFIG[form.method].badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13 }}>
                  {METHOD_CONFIG[form.method].icon} {METHOD_CONFIG[form.method].label}
                </span>
              </div>
            </div>
          )}
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Payment"
        description={`Are you sure you want to delete payment "${confirmDelete.ref}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", ref: "" })}
      />
    </AdminLayout>
  );
}
