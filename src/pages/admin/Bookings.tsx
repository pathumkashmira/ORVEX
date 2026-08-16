import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin, type Booking } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

const STATUSES: Booking["status"][] = ["pending", "confirmed", "rescheduled", "completed", "cancelled", "no_show"];
const TYPES = ["Discovery Call", "Project Consultation", "Creative Consultation", "Follow-up"];

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  phone: "",
  type: "Discovery Call",
  date: "",
  time: "",
  status: "pending" as Booking["status"],
  notes: "",
};

type FormState = typeof EMPTY_FORM;

function statusBadge(s: Booking["status"]) {
  const map: Record<Booking["status"], string> = {
    confirmed: "admin-badge-green",
    pending: "admin-badge-yellow",
    completed: "admin-badge-blue",
    cancelled: "admin-badge-red",
    rescheduled: "admin-badge-purple",
    no_show: "admin-badge-gray",
  };
  const label = s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <span className={`admin-badge ${map[s]}`}>{label}</span>;
}

export default function AdminBookings() {
  const { bookings, bookings_ } = useAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Booking["status"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; ref: string }>({ open: false, id: "", ref: "" });

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingRef.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.company.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(b: Booking) {
    setEditing(b);
    setForm({ name: b.name, email: b.email, company: b.company, phone: b.phone, type: b.type, date: b.date, time: b.time, status: b.status, notes: b.notes });
    setShowForm(true);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (!form.date.trim()) { toast.error("Date is required"); return; }
    if (editing) {
      bookings_.edit(editing.id, { ...form });
      toast.success("Booking updated");
    } else {
      const bookingRef = "BK-" + Date.now().toString().slice(-6);
      const item: Booking = { id: genId(), bookingRef, ...form, createdAt: new Date().toISOString().slice(0, 10) };
      bookings_.add(item);
      toast.success("Booking created");
    }
    setShowForm(false);
  }

  function handleDelete() {
    bookings_.del(confirmDelete.id);
    toast.success(`Booking "${confirmDelete.ref}" deleted`);
    setConfirmDelete({ open: false, id: "", ref: "" });
  }

  function quickStatus(b: Booking, status: Booking["status"]) {
    bookings_.edit(b.id, { status });
    toast.success(`Booking marked as ${status.replace("_", " ")}`);
  }

  function formatDate(d: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Bookings</h1>
            <p style={{ color: "#7d8590", fontSize: 13, margin: 0 }}>
              {filtered.length} of {bookings.length} bookings
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={14} style={{ marginRight: 6 }} />
            New Booking
          </button>
        </div>

        <div className="admin-filter-bar">
          <div style={{ position: "relative" }}>
            <span className="admin-search-icon">
              <Search size={14} />
            </span>
            <input
              className="admin-search"
              placeholder="Search bookings…"
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
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>

        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Client</th>
                <th>Company</th>
                <th>Type</th>
                <th>Date / Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="admin-empty">No bookings found</div>
                  </td>
                </tr>
              )}
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "#58a6ff", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {b.bookingRef}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#e6edf3" }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: "#7d8590" }}>{b.email}</div>
                  </td>
                  <td style={{ color: "#c9d1d9", fontSize: 13 }}>{b.company || "—"}</td>
                  <td style={{ color: "#7d8590", fontSize: 12 }}>{b.type}</td>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    <div style={{ color: "#c9d1d9" }}>{formatDate(b.date)}</div>
                    <div style={{ color: "#7d8590" }}>{b.time || "—"}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {statusBadge(b.status)}
                      {b.status === "pending" && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            style={{ background: "rgba(35,134,54,0.15)", color: "#3fb950", border: "1px solid rgba(35,134,54,0.3)", borderRadius: 4, fontSize: 11, padding: "2px 7px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                            onClick={() => quickStatus(b, "confirmed")}
                          >
                            <CheckCircle size={10} /> Confirm
                          </button>
                          <button
                            style={{ background: "rgba(248,81,73,0.1)", color: "#f85149", border: "1px solid rgba(248,81,73,0.2)", borderRadius: 4, fontSize: 11, padding: "2px 7px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                            onClick={() => quickStatus(b, "cancelled")}
                          >
                            <XCircle size={10} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: "#7d8590" }}>
                    {b.notes || "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(b)} title="Edit">
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setConfirmDelete({ open: true, id: b.id, ref: b.bookingRef })}
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
        title={editing ? "Edit Booking" : "New Booking"}
        subtitle={editing ? editing.bookingRef : "Create a new booking"}
        width="lg"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Booking"}
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
          <div className="admin-field">
            <label className="admin-field-label">Type</label>
            <select className="admin-select" value={form.type} onChange={(e) => setField("type", e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-field-label">Date *</label>
              <input className="admin-input" type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Time</label>
              <input className="admin-input" type="time" value={form.time} onChange={(e) => setField("time", e.target.value)} />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Status</label>
            <select className="admin-select" value={form.status} onChange={(e) => setField("status", e.target.value as Booking["status"])}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Notes</label>
            <textarea className="admin-textarea" rows={4} value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Additional notes…" />
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Booking"
        description={`Are you sure you want to delete booking "${confirmDelete.ref}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: "", ref: "" })}
      />
    </AdminLayout>
  );
}
