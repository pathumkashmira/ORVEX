import { useState, useMemo } from "react";
import { Eye, DollarSign, Clock, ShoppingCart } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import SlideOver from "@/components/admin/SlideOver";
import DataTable, { type Column } from "@/components/admin/DataTable";
import type { Order } from "@/data/seed";

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return s;
  }
}

const PAYMENT_STATUSES = [
  "pending", "processing", "paid", "partially_paid", "failed", "refunded", "cancelled",
] as const;
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const PROJECT_STATUSES = [
  "inquiry", "scoping", "proposal_sent", "in_progress", "review", "revision",
  "final_delivery", "completed", "on_hold", "cancelled",
];

const paymentBadge: Record<string, string> = {
  paid: "admin-badge-green",
  pending: "admin-badge-yellow",
  processing: "admin-badge-blue",
  partially_paid: "admin-badge-orange",
  failed: "admin-badge-red",
  refunded: "admin-badge-gray",
  cancelled: "admin-badge-gray",
};

const projectBadge: Record<string, string> = {
  inquiry: "admin-badge-gray",
  scoping: "admin-badge-blue",
  proposal_sent: "admin-badge-blue",
  in_progress: "admin-badge-orange",
  review: "admin-badge-yellow",
  revision: "admin-badge-yellow",
  final_delivery: "admin-badge-blue",
  completed: "admin-badge-green",
  on_hold: "admin-badge-gray",
  cancelled: "admin-badge-red",
};

function fmtLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const { orders_ } = useAdmin();
  const { toast } = useToast();
  const [payStatus, setPayStatus] = useState(order.paymentStatus);
  const [projStatus, setProjStatus] = useState((order as unknown as Record<string, string>).projectStatus ?? "");

  const savePayment = () => {
    orders_.update({ ...order, paymentStatus: payStatus as Order["paymentStatus"] });
    toast.success("Order updated");
  };

  const saveProject = () => {
    orders_.update({ ...order, projectStatus: projStatus } as Order);
    toast.success("Order updated");
  };

  return (
    <SlideOver open onClose={onClose} title={`Order ${order.orderId}`} subtitle={order.customer} width="lg">
      <div className="space-y-6">
        <div className="admin-card">
          <p className="admin-label text-[#7d8590] mb-3">Order Details</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              ["Order ID", <span className="font-mono text-xs text-[#ff5a00]">{order.orderId}</span>],
              ["Date", fmtDate(order.createdAt)],
              ["Customer", order.customer],
              ["Email", order.email],
              ["Service", order.service],
              ["Package", order.package],
              ["Amount", <span className="font-semibold">{fmt(order.amount)}</span>],
              ["Deposit", fmt(order.deposit)],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <p className="text-[#7d8590] text-xs mb-0.5">{label}</p>
                <p className="text-[#e6edf3] text-sm">{val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card space-y-3">
          <p className="admin-label text-[#7d8590]">Update Payment Status</p>
          <select className="admin-select w-full" value={payStatus} onChange={(e) => setPayStatus(e.target.value as PaymentStatus)}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{fmtLabel(s)}</option>
            ))}
          </select>
          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={savePayment}>
            Save Payment Status
          </button>
        </div>

        <div className="admin-card space-y-3">
          <p className="admin-label text-[#7d8590]">Update Project Status</p>
          <select className="admin-select w-full" value={projStatus} onChange={(e) => setProjStatus(e.target.value)}>
            <option value="">— None —</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{fmtLabel(s)}</option>
            ))}
          </select>
          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={saveProject}>
            Save Project Status
          </button>
        </div>
      </div>
    </SlideOver>
  );
}

export default function Orders() {
  const { orders, orders_ } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.amount, 0),
    [orders]
  );
  const activeOrders = useMemo(
    () => orders.filter((o) => {
      const ps = (o as unknown as Record<string, string>).projectStatus;
      return ps !== "completed" && ps !== "cancelled";
    }).length,
    [orders]
  );
  const pendingOrders = useMemo(() => orders.filter((o) => o.paymentStatus === "pending").length, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch = !q || o.orderId.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || o.paymentStatus === statusFilter;
      const matchFrom = !dateFrom || o.createdAt >= dateFrom;
      const matchTo = !dateTo || o.createdAt <= dateTo;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  const columns: Column<Order>[] = [
    {
      key: "orderId",
      label: "Order ID",
      sortable: true,
      width: "130px",
      render: (row) => <span className="font-mono text-xs text-[#ff5a00]">{row.orderId}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-[#e6edf3] text-sm font-medium leading-tight">{row.customer}</p>
          <p className="text-[#7d8590] text-xs">{row.email}</p>
        </div>
      ),
    },
    {
      key: "service",
      label: "Service",
      render: (row) => (
        <div>
          <p className="text-[#e6edf3] text-sm leading-tight">{row.service}</p>
          <p className="text-[#7d8590] text-xs">{row.package}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      width: "100px",
      render: (row) => <span className="text-[#e6edf3] font-semibold text-sm">{fmt(row.amount)}</span>,
    },
    {
      key: "deposit",
      label: "Deposit",
      width: "100px",
      render: (row) => <span className="text-[#7d8590] text-sm">{fmt(row.deposit)}</span>,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      sortable: true,
      width: "130px",
      render: (row) => (
        <span className={`admin-badge ${paymentBadge[row.paymentStatus] ?? "admin-badge-gray"}`}>
          {fmtLabel(row.paymentStatus)}
        </span>
      ),
    },
    {
      key: "projectStatus",
      label: "Project",
      width: "130px",
      render: (row) => {
        const ps = (row as unknown as Record<string, string>).projectStatus;
        return ps ? (
          <span className={`admin-badge ${projectBadge[ps] ?? "admin-badge-gray"}`}>{fmtLabel(ps)}</span>
        ) : (
          <span className="text-[#7d8590] text-xs">—</span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      width: "110px",
      render: (row) => <span className="text-[#7d8590] text-xs">{fmtDate(row.createdAt)}</span>,
    },
    {
      key: "_actions",
      label: "Actions",
      width: "150px",
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {row.paymentStatus !== "paid" && (
            <button
              className="admin-btn admin-btn-sm admin-btn-primary"
              onClick={() => {
                orders_.update({ ...row, paymentStatus: "paid" });
                toast.success("Order marked as paid");
              }}
            >
              Mark Paid
            </button>
          )}
          <button className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => setSelected(row)}>
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Orders</h1>
            <p className="admin-body text-[#7d8590] mt-1">{orders.length} total orders</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { icon: <DollarSign size={14} className="text-[#3fb950]" />, bg: "bg-[#238636]/15", label: "Total Revenue", value: fmt(totalRevenue) },
              { icon: <ShoppingCart size={14} className="text-[#ff5a00]" />, bg: "bg-[#ff5a00]/10", label: "Active Orders", value: String(activeOrders) },
              { icon: <Clock size={14} className="text-[#d29922]" />, bg: "bg-[#d29922]/10", label: "Pending", value: String(pendingOrders) },
            ].map((stat) => (
              <div key={stat.label} className="admin-stat-card flex items-center gap-3 px-4 py-2.5">
                <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[#7d8590] text-xs">{stat.label}</p>
                  <p className="text-[#e6edf3] font-semibold text-sm">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="admin-filter-bar flex-wrap gap-3">
          <div className="admin-search">
            <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="admin-input pl-9 w-60"
              placeholder="Search order ID or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {(["ALL", ...PAYMENT_STATUSES] as string[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`admin-btn admin-btn-sm ${statusFilter === s ? "admin-btn-primary" : "admin-btn-ghost"}`}
              >
                {s === "ALL" ? "All" : fmtLabel(s)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[#7d8590] text-xs">From</span>
            <input type="date" className="admin-input text-xs px-2 py-1.5" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="text-[#7d8590] text-xs">To</span>
            <input type="date" className="admin-input text-xs px-2 py-1.5" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="No orders match your filters."
          emptyIcon={<ShoppingCart size={32} />}
          onRowClick={(row) => setSelected(row)}
        />
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </AdminLayout>
  );
}
