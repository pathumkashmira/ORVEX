import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Customer } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

const LEAD_STATUSES: Customer["leadStatus"][] = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"];

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  phone: "",
  country: "",
  leadStatus: "new" as Customer["leadStatus"],
};

type FormState = typeof EMPTY_FORM;

function leadBadge(s: Customer["leadStatus"]) {
  const map: Record<Customer["leadStatus"], string> = {
    new: "admin-badge-blue",
    contacted: "admin-badge-yellow",
    qualified: "admin-badge-orange",
    proposal_sent: "admin-badge-purple",
    won: "admin-badge-green",
    lost: "admin-badge-red",
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

export default function AdminCustomers() {
  const { customers, customers_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState<"all" | Customer["leadStatus"]>("all");
  const [sortCol, setSortCol] = useState<"totalSpent" | "name">("totalSpent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

  const filtered = useMemo(() => {
    let list = [...customers];
    if (leadFilter !== "all") list = list.filter((c) => c.leadStatus === leadFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortCol === "totalSpent") return sortDir === "asc" ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent;
      return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    return list;
  }, [customers, search, leadFilter, sortCol, sortDir]);

  function handleSort(col: "totalSpent" | "name") {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  }

  function sortIcon(col: "totalSpent" | "name") {
    return sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ name: c.name, email: c.email, company: c.company, phone: c.phone, country: c.country, leadStatus: c.leadStatus });
    setShowForm(true);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (editing) {
      customers_.edit(editing.id, { ...form });
      toast.success("Customer updated");
    } else {
      const item: Customer = {
        id: genId(),
        ...form,
        totalSpent: 0,
        projects: 0,
        orders: 0,
        bookings: 0,
        lastActivity: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      customers_.add(item);
      toast.success("Customer created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    customers_.del(confirmDelete.id);
    toast.success(`Customer "${confirmDelete.name}" deleted`);
    setConfirmDelete({ open: false, id: "", name: "" });
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Customers</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {filtered.length} of {customers.length} customers
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={14} style={{ marginRight: 6 }} />
            New Customer
          </button>
        </div>

        <div className="admin-filter-bar">
          <div style={{ position: "relative" }}>
            <span className="admin-search-icon">
              <Search size={14} />
            </span>
            <input
              className="admin-search"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            style={{ maxWidth: 180 }}
            value={leadFilter}
            onChange={(e) => setLeadFilter(e.target.value as typeof leadFilter)}
          >
            <option value="all">All Lead Statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>

        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>Name{sortIcon("name")}</th>
                <th>Company</th>
                <th>Email</th>
                <th>Country</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("totalSpent")}>Total Spent{sortIcon("totalSpent")}</th>
                <th>Orders</th>
                <th>Lead Status</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-empty">No customers found</div>
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e6edf3" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#7d8590" }}>{c.phone}</div>
                  </td>
                  <td style={{ color: "#c9d1d9", fontSize: 13 }}>{c.company || "—"}</td>
                  <td style={{ fontSize: 12, color: "#7d8590" }}>{c.email}</td>
                  <td style={{ fontSize: 13, color: "#c9d1d9" }}>{c.country || "—"}</td>
                  <td style={{ fontWeight: 700, color: "#e6edf3" }}>{formatCurrency(c.totalSpent)}</td>
                  <td style={{ color: "#7d8590", textAlign: "center" }}>{c.orders}</td>
                  <td>{leadBadge(c.leadStatus)}</td>
                  <td style={{ fontSize: 12, color: "#7d8590", whiteSpace: "nowrap" }}>{formatDate(c.lastActivity)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(c)} title="Edit">
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setConfirmDelete({ open: true, id: c.id, name: c.name })}
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
        title={editing ? "Edit Customer" : "New Customer"}
        subtitle={editing ? editing.email : "Add a new customer"}
        width="lg"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Customer"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Name *</label>
              <input className="admin-input" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full name" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Email *</label>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Company</label>
              <input className="admin-input" value={form.company} onChange={(e) => setField("company", e.target.value)} placeholder="Company name" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Phone</label>
              <input className="admin-input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Country</label>
              <input className="admin-input" value={form.country} onChange={(e) => setField("country", e.target.value)} placeholder="e.g. United States" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Lead Status</label>
              <select className="admin-select" value={form.leadStatus} onChange={(e) => setField("leadStatus", e.target.value as Customer["leadStatus"])}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Customer"
        description={`Are you sure you want to delete customer "${confirmDelete.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", name: "" })}
      />
    </AdminLayout>
  );
}
