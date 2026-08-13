import { useState, useCallback, useMemo } from "react";
import {
  Calendar,
  Check,
  X,
  Edit2,
  Clock,
  User,
  Mail,
  Building2,
  Phone,
  FileText,
  Search,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type { Booking } from "@/data/seed";

// ── helpers ──────────────────────────────────────────────────────────

const BOOKING_TYPES = [
  "ALL",
  "Discovery Call",
  "Project Consultation",
  "Creative Consultation",
];

const STATUS_OPTIONS = ["ALL", "confirmed", "pending", "cancelled", "completed"];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "confirmed":
      return "admin-badge admin-badge-green";
    case "pending":
      return "admin-badge admin-badge-yellow";
    case "cancelled":
      return "admin-badge admin-badge-red";
    case "completed":
      return "admin-badge admin-badge-gray";
    default:
      return "admin-badge admin-badge-gray";
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

// ── main component ────────────────────────────────────────────────────

export default function AdminBookings() {
  const { bookings, bookings_ } = useAdmin();
  const { toast } = useToast();

  // filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // detail slide-over
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<Booking["status"]>("pending");
  const [editNotes, setEditNotes] = useState("");

  // cancel confirm
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // ── derived stats ──────────────────────────────────────────────────

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter(
    (b) => b.date >= today && b.status !== "cancelled"
  ).length;
  const todayCount = bookings.filter((b) => isToday(b.date)).length;

  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      cancelled: bookings.filter(
        (b) => b.status === "cancelled" || b.status === "completed"
      ).length,
    }),
    [bookings]
  );

  // ── filtered list ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.company.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q);
      const matchType =
        typeFilter === "ALL" ||
        b.type.toLowerCase() === typeFilter.toLowerCase();
      const matchStatus =
        statusFilter === "ALL" || b.status === statusFilter;
      const matchDate = !dateFilter || b.date === dateFilter;
      return matchSearch && matchType && matchStatus && matchDate;
    });
  }, [bookings, search, typeFilter, statusFilter, dateFilter]);

  // ── actions ────────────────────────────────────────────────────────

  const openDetail = useCallback((b: Booking) => {
    setSelected(b);
    setEditStatus(b.status);
    setEditNotes(b.notes || "");
    setDetailOpen(true);
  }, []);

  const handleConfirm = useCallback(
    (b: Booking) => {
      bookings_.update({ ...b, status: "confirmed" });
      toast.success(`Booking ${b.bookingRef} confirmed`);
    },
    [bookings_, toast]
  );

  const handleCancel = useCallback(() => {
    if (!cancelId) return;
    const b = bookings.find((x) => x.id === cancelId);
    if (!b) return;
    setCancelling(true);
    bookings_.update({ ...b, status: "cancelled" });
    toast.success(`Booking ${b.bookingRef} cancelled`);
    setCancelling(false);
    setCancelId(null);
  }, [cancelId, bookings, bookings_, toast]);

  const handleSaveDetail = useCallback(() => {
    if (!selected) return;
    bookings_.update({ ...selected, status: editStatus, notes: editNotes });
    toast.success("Booking updated");
    setDetailOpen(false);
  }, [selected, editStatus, editNotes, bookings_, toast]);

  // ── table columns ──────────────────────────────────────────────────

  const columns: Column<Booking>[] = [
    {
      key: "bookingRef",
      label: "Ref",
      sortable: true,
      width: "100px",
      render: (b) => (
        <span className="font-mono text-xs text-[#ff5a00] font-medium">
          {b.bookingRef}
        </span>
      ),
    },
    {
      key: "name",
      label: "Name / Email",
      sortable: true,
      render: (b) => (
        <div>
          <p className="text-[#e6edf3] text-sm font-medium">{b.name}</p>
          <p className="text-[#7d8590] text-xs mt-0.5">{b.email}</p>
        </div>
      ),
    },
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (b) => (
        <span className="text-[#7d8590] text-sm">{b.company || "—"}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (b) => (
        <span className="text-[#e6edf3] text-xs">{b.type}</span>
      ),
    },
    {
      key: "date",
      label: "Date / Time",
      sortable: true,
      render: (b) => (
        <div>
          <p className="text-[#e6edf3] text-sm">{formatDate(b.date)}</p>
          <p className="text-[#7d8590] text-xs flex items-center gap-1 mt-0.5">
            <Clock size={10} /> {b.time}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (b) => (
        <span className={statusBadgeClass(b.status)}>
          {b.status}
        </span>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (b) =>
        b.notes ? (
          <span className="text-[#7d8590] text-xs line-clamp-1 max-w-[140px]">
            {b.notes}
          </span>
        ) : (
          <span className="text-[#30363d] text-xs">—</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (b) => (
        <div className="flex items-center gap-1">
          {b.status === "pending" && (
            <button
              className="admin-btn admin-btn-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm(b);
              }}
            >
              <Check size={11} /> Confirm
            </button>
          )}
          {(b.status === "pending" || b.status === "confirmed") && (
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                setCancelId(b.id);
              }}
            >
              <X size={12} />
            </button>
          )}
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(b);
            }}
          >
            <Edit2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  // ── render ─────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div className="flex items-start gap-4">
            <div>
              <h1 className="admin-heading">Bookings</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="admin-badge admin-badge-orange">
                  {upcoming} upcoming
                </span>
                {todayCount > 0 && (
                  <span className="admin-badge admin-badge-green">
                    {todayCount} today
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#7d8590] text-sm">
            <Calendar size={14} />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="admin-body">
          {/* Stat mini-cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total", value: stats.total, color: "text-[#e6edf3]" },
              {
                label: "Confirmed",
                value: stats.confirmed,
                color: "text-emerald-400",
              },
              {
                label: "Pending",
                value: stats.pending,
                color: "text-yellow-400",
              },
              {
                label: "Cancelled / Done",
                value: stats.cancelled,
                color: "text-[#7d8590]",
              },
            ].map((s) => (
              <div key={s.label} className="admin-stat-card">
                <p className="text-[#7d8590] text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]"
              />
              <input
                className="admin-input pl-9"
                placeholder="Search name, company, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="admin-select w-auto"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {BOOKING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Types" : t}
                </option>
              ))}
            </select>
            <select
              className="admin-select w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="admin-input w-auto"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {(search || typeFilter !== "ALL" || statusFilter !== "ALL" || dateFilter) && (
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("ALL");
                  setStatusFilter("ALL");
                  setDateFilter("");
                }}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            emptyMessage="No bookings match your filters."
            emptyIcon={<Calendar size={32} />}
            onRowClick={openDetail}
          />
        </div>
      </div>

      {/* Detail SlideOver */}
      {selected && (
        <SlideOver
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          title="Booking Detail"
          subtitle={selected.bookingRef}
          width="lg"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSaveDetail}
              >
                Save Changes
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-5">
            {/* Contact block */}
            <div className="admin-card flex flex-col gap-3">
              <h3 className="admin-heading-sm mb-1">Contact</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-[#7d8590]">
                  <User size={13} />
                  <span className="text-[#e6edf3]">{selected.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[#7d8590]">
                  <Building2 size={13} />
                  <span className="text-[#e6edf3]">
                    {selected.company || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#7d8590]">
                  <Mail size={13} />
                  <span className="text-[#e6edf3] text-xs">{selected.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#7d8590]">
                  <Phone size={13} />
                  <span className="text-[#e6edf3]">
                    {selected.phone || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking info */}
            <div className="admin-card flex flex-col gap-3">
              <h3 className="admin-heading-sm mb-1">Booking Info</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#7d8590] text-xs">Type</p>
                  <p className="text-[#e6edf3] mt-0.5">{selected.type}</p>
                </div>
                <div>
                  <p className="text-[#7d8590] text-xs">Date</p>
                  <p className="text-[#e6edf3] mt-0.5">
                    {formatDate(selected.date)}
                  </p>
                </div>
                <div>
                  <p className="text-[#7d8590] text-xs">Time</p>
                  <p className="text-[#e6edf3] mt-0.5">{selected.time}</p>
                </div>
                <div>
                  <p className="text-[#7d8590] text-xs">Created</p>
                  <p className="text-[#e6edf3] mt-0.5 text-xs">
                    {selected.createdAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="admin-field">
              <label className="admin-field-label">Status</label>
              <select
                className="admin-select"
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value as Booking["status"])
                }
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Notes */}
            <div className="admin-field">
              <label className="admin-field-label">
                <FileText size={12} className="inline mr-1" />
                Notes
              </label>
              <textarea
                className="admin-textarea"
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add internal notes about this booking..."
              />
            </div>
          </div>
        </SlideOver>
      )}

      {/* Cancel confirm */}
      <ConfirmDialog
        open={!!cancelId}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? The client will need to re-book."
        confirmLabel="Cancel Booking"
        destructive
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </AdminLayout>
  );
}
