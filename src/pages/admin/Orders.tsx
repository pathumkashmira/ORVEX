import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Order } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

const PAYMENT_STATUSES: Order["paymentStatus"][] = [
  "pending", "processing", "paid", "partially_paid", "failed", "refunded", "cancelled",
];

const PROJECT_STATUSES = [
  "DISCOVERY", "PLANNING", "MODELING", "RENDERING", "REVIEW", "COMPLETED",
];

const EMPTY_FORM = {
  customer: "",
  email: "",
  service: "",
  package: "",
  amount: 0,
  deposit: 0,
  paymentStatus: "pending" as Order["paymentStatus"],
  projectStatus: "DISCOVERY",
};

type FormState = typeof EMPTY_FORM;

export default function AdminOrders() {
  const { orders, orders_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | Order["paymentStatus"]>("all");
  const [sortCol, setSortCol] = useState<"amount" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  const items = orders;

  const filtered = useMemo(() => {
    let list = [...items];
    if (paymentFilter !== "all") list = list.filter((o) => o.paymentStatus === paymentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.service.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortCol === "amount") {
        return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
    return list;
  }, [items, search, paymentFilter, sortCol, sortDir]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(o: Order) {
    setEditing(o);
    setForm({
      customer: o.customer,
      email: o.email,
      service: o.service,
      package: o.package ?? "",
      amount: o.amount,
      deposit: o.deposit ?? 0,
      paymentStatus: o.paymentStatus,
      projectStatus: o.projectStatus ?? "DISCOVERY",
    });
    setShowForm(true);
  }

  function handleSort(col: "amount" | "date") {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.customer.trim()) { toast.error("Customer name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (!form.service.trim()) { toast.error("Service is required"); return; }

    if (editing) {
      orders_.edit(editing.id, {
        customer: form.customer,
        email: form.email,
        service: form.service,
        package: form.package,
        amount: form.amount,
        deposit: form.deposit,
        paymentStatus: form.paymentStatus,
        projectStatus: form.projectStatus,
      });
      toast.success("Order updated");
    } else {
      const orderId = "ORD-" + Date.now().toString().slice(-6);
      const newItem: Order = {
        id: genId(),
        orderId,
        customer: form.customer,
        email: form.email,
        service: form.service,
        package: form.package,
        amount: form.amount,
        deposit: form.deposit,
        paymentStatus: form.paymentStatus,
        projectStatus: form.projectStatus,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      orders_.add(newItem);
      toast.success("Order created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    orders_.del(confirmDelete.id);
    toast.success(`Order "${confirmDelete.name}" deleted`);
    setConfirmDelete({ open: false, id: "", name: "" });
  }

  function handleQuickPaymentStatus(o: Order, status: Order["paymentStatus"]) {
    orders_.edit(o.id, { paymentStatus: status });
    toast.success(`Payment status updated to ${status}`);
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function sortIcon(col: "amount" | "date") {
    return sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  }

  function paymentBadge(s: Order["paymentStatus"]) {
    const map: Record<Order["paymentStatus"], string> = {
      pending: "admin-badge-yellow",
      processing: "admin-badge-blue",
      paid: "admin-badge-green",
      partially_paid: "admin-badge-orange",
      failed: "admin-badge-red",
      refunded: "admin-badge-gray",
      cancelled: "admin-badge-gray",
    };
    const label = s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return <span className={`admin-badge ${map[s]}`}>{label}</span>;
  }

  function projectStatusBadge(s?: string) {
    if (!s) return <span style={{ color: "#7d8590" }}>—</span>;
    const map: Record<string, string> = {
      DISCOVERY: "admin-badge-blue",
      PLANNING: "admin-badge-yellow",
      MODELING: "admin-badge-orange",
      RENDERING: "admin-badge-purple",
      REVIEW: "admin-badge-orange",
      COMPLETED: "admin-badge-green",
    };
    return <span className={`admin-badge ${map[s] ?? "admin-badge-gray"}`}>{s}</span>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Orders</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {filtered.length} of {items.length} orders
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            + New Order
          </button>
        </div>

        <div className="admin-filter-bar">
          <div style={{ position: "relative" }}>
            <span className="admin-search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className="admin-search"
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            style={{ maxWidth: 180 }}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
          >
            <option value="all">All Payment Statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Package</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("amount")}>
                  Amount{sortIcon("amount")}
                </th>
                <th>Deposit</th>
                <th>Payment</th>
                <th>Project</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("date")}>
                  Date{sortIcon("date")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className="admin-empty">No orders found</div>
                  </td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "#58a6ff", fontWeight: 600 }}>
                    {o.orderId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e6edf3" }}>{o.customer}</div>
                    <div style={{ fontSize: 12, color: "#7d8590" }}>{o.email}</div>
                  </td>
                  <td style={{ color: "#c9d1d9" }}>{o.service}</td>
                  <td style={{ color: "#7d8590", fontSize: 12 }}>{o.package || "—"}</td>
                  <td style={{ fontWeight: 700, color: "#e6edf3" }}>{formatCurrency(o.amount)}</td>
                  <td style={{ color: "#7d8590" }}>{o.deposit ? formatCurrency(o.deposit) : "—"}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {paymentBadge(o.paymentStatus)}
                      <select
                        style={{
                          fontSize: 11,
                          background: "#0d1117",
                          border: "1px solid #30363d",
                          borderRadius: 4,
                          color: "#7d8590",
                          padding: "2px 4px",
                          cursor: "pointer",
                        }}
                        value={o.paymentStatus}
                        onChange={(e) => handleQuickPaymentStatus(o, e.target.value as Order["paymentStatus"])}
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>{projectStatusBadge(o.projectStatus)}</td>
                  <td style={{ color: "#7d8590", fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatDate(o.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(o)}>
                        Edit
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setConfirmDelete({ open: true, id: o.id, name: o.orderId })}
                      >
                        Delete
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
        title={editing ? "Edit Order" : "New Order"}
        subtitle={editing ? editing.orderId : "Create a new order"}
        width="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Order"}
            </button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px" }}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Customer Name *</label>
              <input
                className="admin-input"
                value={form.customer}
                onChange={(e) => setField("customer", e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Email *</label>
              <input
                className="admin-input"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Service *</label>
              <input
                className="admin-input"
                value={form.service}
                onChange={(e) => setField("service", e.target.value)}
                placeholder="e.g. Product CGI"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Package</label>
              <input
                className="admin-input"
                value={form.package}
                onChange={(e) => setField("package", e.target.value)}
                placeholder="e.g. Studio, Pro"
              />
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Total Amount (USD)</label>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setField("amount", Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Deposit (USD)</label>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={form.deposit}
                onChange={(e) => setField("deposit", Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Payment Status</label>
              <select
                className="admin-select"
                value={form.paymentStatus}
                onChange={(e) => setField("paymentStatus", e.target.value as Order["paymentStatus"])}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Project Status</label>
              <select
                className="admin-select"
                value={form.projectStatus}
                onChange={(e) => setField("projectStatus", e.target.value)}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {form.amount > 0 && form.deposit > 0 && (
            <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "12px 16px" }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#7d8590", marginBottom: 6, margin: "0 0 6px" }}>Payment Summary</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#c9d1d9" }}>
                <span>Total</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(form.amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7d8590", marginTop: 4 }}>
                <span>Deposit</span>
                <span>{formatCurrency(form.deposit)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: "1px solid #21262d", marginTop: 8, paddingTop: 8, color: "#58a6ff", fontWeight: 600 }}>
                <span>Remaining</span>
                <span>{formatCurrency(form.amount - form.deposit)}</span>
              </div>
            </div>
          )}
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Order"
        description={`Are you sure you want to delete order "${confirmDelete.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", name: "" })}
      />
    </AdminLayout>
  );
}
