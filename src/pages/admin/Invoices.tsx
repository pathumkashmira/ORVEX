import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type { Invoice } from "@/data/seed";

// ── helpers ──────────────────────────────────────────────────────────

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(inv: Invoice): boolean {
  return (
    inv.paymentStatus !== "paid" &&
    inv.dueDate < today()
  );
}

function statusBadgeClass(status: Invoice["paymentStatus"]): string {
  switch (status) {
    case "paid":
      return "admin-badge admin-badge-green";
    case "partially_paid":
      return "admin-badge admin-badge-blue";
    case "pending":
      return "admin-badge admin-badge-yellow";
    case "overdue":
      return "admin-badge admin-badge-red";
    default:
      return "admin-badge admin-badge-gray";
  }
}

function statusLabel(status: Invoice["paymentStatus"]): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "partially_paid":
      return "Partial";
    case "pending":
      return "Pending";
    case "overdue":
      return "Overdue";
    default:
      return status;
  }
}

type StatusFilter = "ALL" | Invoice["paymentStatus"];

interface InvoiceForm {
  customer: string;
  email: string;
  project: string;
  subtotal: number;
  taxPct: number;
  discount: number;
  deposit: number;
  dueDate: string;
  paymentStatus: Invoice["paymentStatus"];
}

function blankForm(): InvoiceForm {
  return {
    customer: "",
    email: "",
    project: "",
    subtotal: 0,
    taxPct: 0,
    discount: 0,
    deposit: 0,
    dueDate: "",
    paymentStatus: "pending",
  };
}

function calcTotals(form: InvoiceForm) {
  const tax = form.subtotal * (form.taxPct / 100);
  const total = form.subtotal + tax - form.discount;
  const balance = Math.max(0, total - form.deposit);
  return { tax, total, balance };
}

// ── main component ────────────────────────────────────────────────────

export default function AdminInvoices() {
  const { invoices, invoices_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [slideOpen, setSlideOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<InvoiceForm>(blankForm());

  // ── derived ───────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = invoices
      .filter((i) => i.paymentStatus === "paid")
      .reduce((s, i) => s + i.total, 0);
    const outstanding = invoices.reduce((s, i) => s + i.balance, 0);
    const overdueCount = invoices.filter(isOverdue).length;
    return { totalInvoiced, totalPaid, outstanding, overdueCount };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter((inv) => {
      const matchSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.project.toLowerCase().includes(q) ||
        inv.email.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "ALL" || inv.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // ── actions ────────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(blankForm());
    setSlideOpen(true);
  }, []);

  const openEdit = useCallback((inv: Invoice) => {
    setEditing(inv);
    setForm({
      customer: inv.customer,
      email: inv.email,
      project: inv.project,
      subtotal: inv.subtotal,
      taxPct: inv.subtotal > 0 ? Math.round((inv.tax / inv.subtotal) * 100) : 0,
      discount: inv.discount,
      deposit: inv.deposit,
      dueDate: inv.dueDate,
      paymentStatus: inv.paymentStatus,
    });
    setSlideOpen(true);
  }, []);

  const openDetail = useCallback((inv: Invoice) => {
    setViewing(inv);
    setDetailOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const { tax, total, balance } = calcTotals(form);
    const now = today();
    if (editing) {
      invoices_.update({
        ...editing,
        customer: form.customer,
        email: form.email,
        project: form.project,
        subtotal: form.subtotal,
        tax,
        discount: form.discount,
        total,
        deposit: form.deposit,
        balance,
        dueDate: form.dueDate,
        paymentStatus: form.paymentStatus,
      });
      toast.success("Invoice updated");
    } else {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
        invoices.length + 1
      ).padStart(4, "0")}`;
      invoices_.create({
        id: newId(),
        invoiceNumber,
        customer: form.customer,
        email: form.email,
        project: form.project,
        subtotal: form.subtotal,
        tax,
        discount: form.discount,
        total,
        deposit: form.deposit,
        balance,
        dueDate: form.dueDate,
        paymentStatus: form.paymentStatus,
        createdAt: now,
      });
      toast.success("Invoice created");
    }
    setSlideOpen(false);
  }, [editing, form, invoices, invoices_, toast]);

  const handleMarkPaid = useCallback(
    (inv: Invoice) => {
      invoices_.update({ ...inv, paymentStatus: "paid", balance: 0 });
      toast.success(`Invoice ${inv.invoiceNumber} marked as paid`);
    },
    [invoices_, toast]
  );

  const handleDelete = useCallback(() => {
    if (!confirmId) return;
    setDeleting(true);
    invoices_.remove(confirmId);
    toast.success("Invoice deleted");
    setDeleting(false);
    setConfirmId(null);
  }, [confirmId, invoices_, toast]);

  // ── preview totals from form ────────────────────────────────────────────

  const previewTotals = useMemo(() => calcTotals(form), [form]);

  // ── table columns ──────────────────────────────────────────────────────

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      sortable: true,
      width: "130px",
      render: (inv) => (
        <span className="font-mono text-xs text-[#ff5a00] font-medium">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (inv) => (
        <div>
          <p className="text-[#e6edf3] text-sm font-medium">{inv.customer}</p>
          <p className="text-[#7d8590] text-xs mt-0.5">{inv.email}</p>
        </div>
      ),
    },
    {
      key: "project",
      label: "Project",
      sortable: true,
      render: (inv) => (
        <span className="text-[#7d8590] text-sm">{inv.project}</span>
      ),
    },
    {
      key: "subtotal",
      label: "Subtotal",
      sortable: true,
      render: (inv) => (
        <span className="text-[#7d8590] font-mono text-sm">
          ${inv.subtotal.toLocaleString()}
        </span>
      ),
    },
    {
      key: "tax",
      label: "Tax",
      render: (inv) => (
        <span className="text-[#7d8590] font-mono text-sm">
          ${inv.tax.toLocaleString()}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (inv) => (
        <span className="text-[#e6edf3] font-mono text-sm font-bold">
          ${inv.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: "deposit",
      label: "Deposit",
      render: (inv) => (
        <span className="text-[#7d8590] font-mono text-sm">
          ${inv.deposit.toLocaleString()}
        </span>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (inv) => (
        <span
          className={`font-mono text-sm font-medium ${
            inv.balance > 0 ? "text-red-400" : "text-emerald-400"
          }`}
        >
          ${inv.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Status",
      sortable: true,
      render: (inv) => (
        <span className={statusBadgeClass(inv.paymentStatus)}>
          {statusLabel(inv.paymentStatus)}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (inv) => (
        <span
          className={`text-xs font-mono ${
            isOverdue(inv) ? "text-red-400 font-medium" : "text-[#7d8590]"
          }`}
        >
          {isOverdue(inv) && (
            <AlertCircle size={10} className="inline mr-1" />
          )}
          {inv.dueDate}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (inv) => (
        <div className="flex items-center gap-1">
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            title="View invoice"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(inv);
            }}
          >
            <FileText size={12} />
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            title="Edit invoice"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(inv);
            }}
          >
            <Edit2 size={12} />
          </button>
          {inv.paymentStatus !== "paid" && (
            <button
              className="admin-btn admin-btn-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              title="Mark paid"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkPaid(inv);
              }}
            >
              <CheckCircle size={11} /> Paid
            </button>
          )}
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmId(inv.id);
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  const STATUS_PILLS: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Paid", value: "paid" },
    { label: "Partial", value: "partially_paid" },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
  ];

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Invoices</h1>
            <p className="text-[#7d8590] text-sm mt-1">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={14} /> New Invoice
          </button>
        </div>

        <div className="admin-body">
          {/* Finance stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Total Invoiced",
                value: `$${stats.totalInvoiced.toLocaleString()}`,
                color: "text-[#e6edf3]",
              },
              {
                label: "Total Paid",
                value: `$${stats.totalPaid.toLocaleString()}`,
                color: "text-emerald-400",
              },
              {
                label: "Outstanding",
                value: `$${stats.outstanding.toLocaleString()}`,
                color: stats.outstanding > 0 ? "text-[#ff5a00]" : "text-emerald-400",
              },
              {
                label: "Overdue",
                value: String(stats.overdueCount),
                color: stats.overdueCount > 0 ? "text-red-400" : "text-[#7d8590]",
              },
            ].map((s) => (
              <div key={s.label} className="admin-stat-card">
                <p className="text-[#7d8590] text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-bold font-mono ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]"
              />
              <input
                className="admin-input pl-9"
                placeholder="Search invoice #, customer, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Status pills */}
            <div className="flex items-center gap-1">
              {STATUS_PILLS.map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    statusFilter === pill.value
                      ? "bg-[#ff5a00] text-white"
                      : "bg-[#161b22] border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3]"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            {search && (
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => setSearch("")}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            emptyMessage="No invoices match your filters."
            emptyIcon={<FileText size={32} />}
            onRowClick={openDetail}
          />
        </div>
      </div>

      {/* Create / Edit SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? "Edit Invoice" : "New Invoice"}
        subtitle={
          editing ? editing.invoiceNumber : "Create a new invoice"
        }
        width="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setSlideOpen(false)}
            >
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Invoice"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Customer Name</label>
              <input
                className="admin-input"
                value={form.customer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer: e.target.value }))
                }
                placeholder="Jane Smith"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Email</label>
              <input
                type="email"
                className="admin-input"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="jane@acme.com"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Project Name</label>
            <input
              className="admin-input"
              value={form.project}
              onChange={(e) =>
                setForm((f) => ({ ...f, project: e.target.value }))
              }
              placeholder="Brand Identity Redesign"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Subtotal ($)</label>
              <input
                type="number"
                className="admin-input"
                value={form.subtotal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtotal: Number(e.target.value) }))
                }
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Tax (%)</label>
              <input
                type="number"
                className="admin-input"
                value={form.taxPct}
                onChange={(e) =>
                  setForm((f) => ({ ...f, taxPct: Number(e.target.value) }))
                }
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Discount ($)</label>
              <input
                type="number"
                className="admin-input"
                value={form.discount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discount: Number(e.target.value) }))
                }
                min="0"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Deposit Paid ($)</label>
              <input
                type="number"
                className="admin-input"
                value={form.deposit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deposit: Number(e.target.value) }))
                }
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Due Date</label>
              <input
                type="date"
                className="admin-input"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Status</label>
              <select
                className="admin-select"
                value={form.paymentStatus}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    paymentStatus: e.target.value as Invoice["paymentStatus"],
                  }))
                }
              >
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Live totals preview */}
          <div className="border border-[#30363d] rounded-lg p-4 bg-[#0d1117]">
            <h4 className="text-[#7d8590] text-xs uppercase tracking-wider mb-3">
              Summary
            </h4>
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-[#7d8590]">
                <span>Subtotal</span>
                <span className="font-mono">${form.subtotal.toLocaleString()}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span className="font-mono">-${form.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7d8590]">
                <span>Tax ({form.taxPct}%)</span>
                <span className="font-mono">
                  ${previewTotals.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#e6edf3] font-semibold border-t border-[#30363d] pt-1.5 mt-1">
                <span>Total</span>
                <span className="font-mono">
                  ${previewTotals.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#7d8590]">
                <span>Deposit Paid</span>
                <span className="font-mono">-${form.deposit.toLocaleString()}</span>
              </div>
              <div
                className={`flex justify-between font-bold ${
                  previewTotals.balance > 0
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                <span>Balance Due</span>
                <span className="font-mono">
                  ${previewTotals.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SlideOver>

      {/* Invoice Detail SlideOver */}
      {viewing && (
        <SlideOver
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          title="Invoice"
          subtitle={viewing.invoiceNumber}
          width="lg"
          footer={
            <div className="flex gap-3 justify-end">
              {viewing.paymentStatus !== "paid" && (
                <button
                  className="admin-btn admin-btn-primary bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => {
                    handleMarkPaid(viewing);
                    setDetailOpen(false);
                  }}
                >
                  <CheckCircle size={14} /> Mark as Paid
                </button>
              )}
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setDetailOpen(false);
                  openEdit(viewing);
                }}
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                className="admin-btn admin-btn-ghost"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-5">
            {/* Invoice header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#7d8590] text-xs">ORVEX STUDIO</p>
                <h2 className="text-[#e6edf3] text-xl font-bold mt-1">
                  {viewing.invoiceNumber}
                </h2>
              </div>
              <span className={statusBadgeClass(viewing.paymentStatus)}>
                {statusLabel(viewing.paymentStatus)}
              </span>
            </div>

            {/* Bill to */}
            <div className="admin-card">
              <p className="text-[#7d8590] text-xs mb-2">BILL TO</p>
              <p className="text-[#e6edf3] font-medium">{viewing.customer}</p>
              <p className="text-[#7d8590] text-sm">{viewing.email}</p>
            </div>

            {/* Project & dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="admin-card">
                <p className="text-[#7d8590] text-xs mb-1">PROJECT</p>
                <p className="text-[#e6edf3] text-sm">{viewing.project}</p>
              </div>
              <div className="admin-card">
                <p className="text-[#7d8590] text-xs mb-1">DUE DATE</p>
                <p
                  className={`text-sm ${
                    isOverdue(viewing) ? "text-red-400 font-medium" : "text-[#e6edf3]"
                  }`}
                >
                  {viewing.dueDate}
                </p>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-[#30363d] rounded-lg overflow-hidden">
              <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d]">
                <p className="text-[#7d8590] text-xs uppercase tracking-wider">
                  Line Items
                </p>
              </div>
              <div className="p-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-[#7d8590]">
                  <span>{viewing.project}</span>
                  <span className="font-mono">
                    ${viewing.subtotal.toLocaleString()}
                  </span>
                </div>
                {viewing.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">
                      -${viewing.discount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#7d8590]">
                  <span>Tax</span>
                  <span className="font-mono">
                    ${viewing.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#e6edf3] font-bold border-t border-[#30363d] pt-2 mt-1">
                  <span>Total</span>
                  <span className="font-mono">
                    ${viewing.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#7d8590]">
                  <span>Deposit Paid</span>
                  <span className="font-mono">
                    -${viewing.deposit.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`flex justify-between font-bold text-base border-t border-[#30363d] pt-2 mt-1 ${
                    viewing.balance > 0 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  <span>Balance Due</span>
                  <span className="font-mono">
                    ${viewing.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[#7d8590] text-xs">
              Created {viewing.createdAt}
            </p>
          </div>
        </SlideOver>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete Invoice"
        description="This will permanently delete the invoice. This action cannot be undone."
        confirmLabel="Delete Invoice"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </AdminLayout>
  );
}
