import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Invoice } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

const PAYMENT_STATUSES: Invoice["paymentStatus"][] = ["pending", "paid", "partially_paid", "overdue"];

const EMPTY_FORM = {
  customer: "",
  email: "",
  project: "",
  subtotal: 0,
  tax: 0,
  discount: 0,
  deposit: 0,
  dueDate: "",
  paymentStatus: "pending" as Invoice["paymentStatus"],
};

type FormState = typeof EMPTY_FORM;

function statusBadge(s: Invoice["paymentStatus"]) {
  const map: Record<Invoice["paymentStatus"], string> = {
    pending: "admin-badge-yellow",
    paid: "admin-badge-green",
    partially_paid: "admin-badge-orange",
    overdue: "admin-badge-red",
  };
  const label = s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <span className={`admin-badge ${map[s]}`}>{label}</span>;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminInvoices() {
  const { invoices, invoices_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Invoice["paymentStatus"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; num: string }>({ open: false, id: "", num: "" });

  const filtered = useMemo(() => {
    let list = [...invoices];
    if (statusFilter !== "all") list = list.filter((i) => i.paymentStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customer.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.project.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(inv: Invoice) {
    setEditing(inv);
    setForm({
      customer: inv.customer,
      email: inv.email,
      project: inv.project,
      subtotal: inv.subtotal,
      tax: inv.tax,
      discount: inv.discount,
      deposit: inv.deposit,
      dueDate: inv.dueDate,
      paymentStatus: inv.paymentStatus,
    });
    setShowForm(true);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function computedTotal(f: FormState) {
    return Math.max(0, f.subtotal + f.tax - f.discount);
  }

  function computedBalance(f: FormState) {
    return Math.max(0, computedTotal(f) - f.deposit);
  }

  function handleSave() {
    if (!form.customer.trim()) { toast.error("Customer is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (!form.project.trim()) { toast.error("Project is required"); return; }
    const total = computedTotal(form);
    const balance = computedBalance(form);
    if (editing) {
      invoices_.edit(editing.id, { ...form, total, balance });
      toast.success("Invoice updated");
    } else {
      const invoiceNumber = "INV-" + new Date().getFullYear() + "-" + Date.now().toString().slice(-4);
      const item: Invoice = {
        id: genId(),
        invoiceNumber,
        ...form,
        total,
        balance,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      invoices_.add(item);
      toast.success("Invoice created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    invoices_.del(confirmDelete.id);
    toast.success(`Invoice "${confirmDelete.num}" deleted`);
    setConfirmDelete({ open: false, id: "", num: "" });
  }

  function markPaid(inv: Invoice) {
    invoices_.edit(inv.id, { paymentStatus: "paid", balance: 0 });
    toast.success(`Invoice ${inv.invoiceNumber} marked as paid`);
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Invoices</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {filtered.length} of {invoices.length} invoices
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={14} style={{ marginRight: 6 }} />
            New Invoice
          </button>
        </div>

        <div className="admin-filter-bar">
          <div style={{ position: "relative" }}>
            <span className="admin-search-icon">
              <Search size={14} />
            </span>
            <input
              className="admin-search"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            style={{ maxWidth: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All Statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>

        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Project</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Deposit</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <div className="admin-empty">No invoices found</div>
                  </td>
                </tr>
              )}
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "#58a6ff", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {inv.invoiceNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e6edf3" }}>{inv.customer}</div>
                    <div style={{ fontSize: 12, color: "#7d8590" }}>{inv.email}</div>
                  </td>
                  <td style={{ color: "#c9d1d9", fontSize: 13 }}>{inv.project}</td>
                  <td style={{ color: "#c9d1d9", fontSize: 13 }}>{formatCurrency(inv.subtotal)}</td>
                  <td style={{ color: "#7d8590", fontSize: 13 }}>{inv.tax ? formatCurrency(inv.tax) : "—"}</td>
                  <td style={{ fontWeight: 700, color: "#e6edf3" }}>{formatCurrency(inv.total)}</td>
                  <td style={{ color: "#7d8590", fontSize: 13 }}>{inv.deposit ? formatCurrency(inv.deposit) : "—"}</td>
                  <td style={{ fontWeight: 600, color: inv.balance > 0 ? "#f0883e" : "#3fb950" }}>
                    {formatCurrency(inv.balance)}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {statusBadge(inv.paymentStatus)}
                      {inv.paymentStatus !== "paid" && (
                        <button
                          style={{ fontSize: 11, padding: "2px 7px", background: "rgba(35,134,54,0.12)", color: "#3fb950", border: "1px solid rgba(35,134,54,0.25)", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}
                          onClick={() => markPaid(inv)}
                        >
                          <CheckCircle size={10} /> Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "#7d8590", whiteSpace: "nowrap" }}>{formatDate(inv.dueDate)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(inv)} title="Edit">
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setConfirmDelete({ open: true, id: inv.id, num: inv.invoiceNumber })}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Invoice" : "New Invoice"}
        subtitle={editing ? editing.invoiceNumber : "Create a new invoice"}
        width="lg"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Invoice"}
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
          <div className="admin-field">
            <label className="admin-field-label">Project *</label>
            <input className="admin-input" value={form.project} onChange={(e) => setField("project", e.target.value)} placeholder="Project name or description" />
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Subtotal (USD)</label>
              <input className="admin-input" type="number" min={0} value={form.subtotal} onChange={(e) => setField("subtotal", Number(e.target.value))} placeholder="0" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Tax (USD)</label>
              <input className="admin-input" type="number" min={0} value={form.tax} onChange={(e) => setField("tax", Number(e.target.value))} placeholder="0" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Discount (USD)</label>
              <input className="admin-input" type="number" min={0} value={form.discount} onChange={(e) => setField("discount", Number(e.target.value))} placeholder="0" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Deposit (USD)</label>
              <input className="admin-input" type="number" min={0} value={form.deposit} onChange={(e) => setField("deposit", Number(e.target.value))} placeholder="0" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Due Date</label>
              <input className="admin-input" type="date" value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Payment Status</label>
              <select className="admin-select" value={form.paymentStatus} onChange={(e) => setField("paymentStatus", e.target.value as Invoice["paymentStatus"])}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>

          {(form.subtotal > 0 || form.tax > 0 || form.discount > 0 || form.deposit > 0) && (
            <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "14px 16px" }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#7d8590", margin: "0 0 10px" }}>Invoice Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#c9d1d9" }}>
                  <span>Subtotal</span><span>{formatCurrency(form.subtotal)}</span>
                </div>
                {form.tax > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7d8590" }}>
                    <span>Tax</span><span>+{formatCurrency(form.tax)}</span>
                  </div>
                )}
                {form.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7d8590" }}>
                    <span>Discount</span><span>−{formatCurrency(form.discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#e6edf3", borderTop: "1px solid #21262d", paddingTop: 8, marginTop: 4 }}>
                  <span>Total</span><span>{formatCurrency(computedTotal(form))}</span>
                </div>
                {form.deposit > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7d8590" }}>
                      <span>Deposit</span><span>−{formatCurrency(form.deposit)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#58a6ff" }}>
                      <span>Balance Due</span><span>{formatCurrency(computedBalance(form))}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice "${confirmDelete.num}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", num: "" })}
      />
    </AdminLayout>
  );
}
