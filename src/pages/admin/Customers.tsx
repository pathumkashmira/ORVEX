import { useState, useMemo } from "react";
import { Plus, Edit2, Eye, Users, DollarSign, TrendingUp, Activity } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import SlideOver from "@/components/admin/SlideOver";
import DataTable, { type Column } from "@/components/admin/DataTable";
import type { Customer } from "@/data/seed";

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return s;
  }
}

const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

const leadBadge: Record<LeadStatus, string> = {
  new: "admin-badge-blue",
  contacted: "admin-badge-yellow",
  qualified: "admin-badge-orange",
  proposal_sent: "admin-badge-blue",
  won: "admin-badge-green",
  lost: "admin-badge-gray",
};

function fmtLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-[#ff5a00]/20 text-[#ff5a00]",
  "bg-[#238636]/20 text-[#3fb950]",
  "bg-[#1f6feb]/20 text-[#58a6ff]",
  "bg-[#9e6a03]/20 text-[#d29922]",
  "bg-[#8957e5]/20 text-[#bc8cff]",
];

function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

interface CustomerFormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  leadStatus: LeadStatus;
}

function emptyForm(): CustomerFormState {
  return { name: "", company: "", email: "", phone: "", country: "", leadStatus: "new" };
}

function fromCustomer(c: Customer): CustomerFormState {
  return {
    name: c.name,
    company: c.company ?? "",
    email: c.email,
    phone: c.phone ?? "",
    country: c.country ?? "",
    leadStatus: (c.leadStatus as LeadStatus) ?? "new",
  };
}

interface CustomerSlideOverProps {
  customer: Customer | null;
  mode: "view" | "edit" | "add";
  onClose: () => void;
}

function CustomerSlideOver({ customer, mode, onClose }: CustomerSlideOverProps) {
  const { orders, customers_ } = useAdmin();
  const { toast } = useToast();
  const [form, setForm] = useState<CustomerFormState>(
    customer && mode !== "add" ? fromCustomer(customer) : emptyForm()
  );
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");

  const customerOrders = useMemo(
    () => (customer ? orders.filter((o) => o.email === customer.email) : []),
    [orders, customer]
  );

  const set = (k: keyof CustomerFormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    if (mode === "add") {
      customers_.create({
        id: Date.now().toString(),
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        country: form.country,
        leadStatus: form.leadStatus,
        totalSpent: 0,
        projects: 0,
        orders: 0,
        bookings: 0,
        lastActivity: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString().slice(0, 10),
      } as Customer);
      toast.success("Customer created");
    } else if (customer) {
      customers_.update({
        ...customer,
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        country: form.country,
        leadStatus: form.leadStatus,
      } as Customer);
      toast.success("Customer updated");
    }
    onClose();
  };

  const title = mode === "add" ? "Add Customer" : mode === "edit" ? `Edit — ${customer?.name}` : customer?.name ?? "";

  return (
    <SlideOver
      open
      onClose={onClose}
      title={title}
      subtitle={mode === "view" ? customer?.company : undefined}
      width="lg"
      footer={
        mode !== "view" ? (
          <>
            <button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {mode === "add" ? "Create Customer" : "Save Changes"}
            </button>
          </>
        ) : undefined
      }
    >
      {mode === "view" && customer ? (
        <div className="space-y-6">
          {/* Avatar + stats */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${avatarColor(customer.name)}`}>
              {initials(customer.name)}
            </div>
            <div>
              <p className="text-[#e6edf3] font-semibold">{customer.name}</p>
              <p className="text-[#7d8590] text-sm">{customer.company}</p>
              <p className="text-[#7d8590] text-xs">{customer.email}</p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 border-b border-[#30363d] pb-0">
            {(["info", "orders"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === t
                    ? "border-[#ff5a00] text-[#ff5a00]"
                    : "border-transparent text-[#7d8590] hover:text-[#e6edf3]"
                }`}
              >
                {t === "info" ? "Contact Info" : `Orders (${customerOrders.length})`}
              </button>
            ))}
          </div>

          {activeTab === "info" && (
            <div className="admin-card grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ["Phone", customer.phone],
                ["Country", customer.country],
                ["Total Spent", fmt(customer.totalSpent ?? 0)],
                ["Orders", String(customer.orders ?? 0)],
                ["Projects", String(customer.projects ?? 0)],
                ["Lead Status", <span className={`admin-badge ${leadBadge[(customer.leadStatus as LeadStatus) ?? "new"]}`}>{fmtLabel(customer.leadStatus ?? "new")}</span>],
                ["Last Activity", fmtDate(customer.lastActivity ?? "")],
                ["Member Since", fmtDate(customer.createdAt)],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <p className="text-[#7d8590] text-xs mb-0.5">{label}</p>
                  <p className="text-[#e6edf3] text-sm">{val}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-2">
              {customerOrders.length === 0 ? (
                <p className="text-[#7d8590] text-sm text-center py-8">No orders found for this customer.</p>
              ) : (
                customerOrders.map((o) => (
                  <div key={o.id} className="admin-card flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-[#ff5a00]">{o.orderId}</p>
                      <p className="text-[#7d8590] text-xs">{o.service} — {o.package}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#e6edf3] font-semibold text-sm">${o.amount.toLocaleString()}</p>
                      <p className="text-[#7d8590] text-xs">{fmtDate(o.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* Edit / Add form */
        <div className="space-y-4">
          {[
            { label: "Full Name", key: "name" as const, placeholder: "Jane Smith" },
            { label: "Company", key: "company" as const, placeholder: "Acme Studio" },
            { label: "Email", key: "email" as const, placeholder: "jane@acme.com" },
            { label: "Phone", key: "phone" as const, placeholder: "+1 555 0100" },
            { label: "Country", key: "country" as const, placeholder: "United States" },
          ].map(({ label, key, placeholder }) => (
            <div className="admin-field" key={key}>
              <label className="admin-field-label">{label}</label>
              <input
                className="admin-input w-full"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
          <div className="admin-field">
            <label className="admin-field-label">Lead Status</label>
            <select className="admin-select w-full" value={form.leadStatus} onChange={(e) => set("leadStatus", e.target.value)}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{fmtLabel(s)}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </SlideOver>
  );
}

export default function Customers() {
  const { customers } = useAdmin();
  const [search, setSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [slideOver, setSlideOver] = useState<{ customer: Customer | null; mode: "view" | "edit" | "add" } | null>(null);

  const countries = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => { if (c.country) set.add(c.country); });
    return Array.from(set).sort();
  }, [customers]);

  const totalRevenue = useMemo(() => customers.reduce((s, c) => s + (c.totalSpent ?? 0), 0), [customers]);
  const wonCount = useMemo(() => customers.filter((c) => c.leadStatus === "won").length, [customers]);
  const activeLeads = useMemo(
    () => customers.filter((c) => c.leadStatus !== "won" && c.leadStatus !== "lost").length,
    [customers]
  );

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.company ?? "").toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchLead = leadFilter === "ALL" || c.leadStatus === leadFilter;
      const matchCountry = countryFilter === "ALL" || c.country === countryFilter;
      return matchSearch && matchLead && matchCountry;
    });
  }, [customers, search, leadFilter, countryFilter]);

  const columns: Column<Customer>[] = [
    {
      key: "name",
      label: "Customer",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${avatarColor(row.name)}`}>
            {initials(row.name)}
          </div>
          <div>
            <p className="text-[#e6edf3] text-sm font-medium leading-tight">{row.name}</p>
            <p className="text-[#7d8590] text-xs">{row.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => <span className="text-[#7d8590] text-sm">{row.email}</span>,
    },
    {
      key: "country",
      label: "Country",
      sortable: true,
      width: "120px",
      render: (row) => <span className="text-[#e6edf3] text-sm">{row.country ?? "—"}</span>,
    },
    {
      key: "totalSpent",
      label: "Spent",
      sortable: true,
      width: "100px",
      render: (row) => <span className="text-[#e6edf3] font-semibold text-sm">{fmt(row.totalSpent ?? 0)}</span>,
    },
    {
      key: "orders",
      label: "Orders",
      sortable: true,
      width: "80px",
      render: (row) => <span className="text-[#e6edf3] text-sm">{row.orders ?? 0}</span>,
    },
    {
      key: "projects",
      label: "Projects",
      sortable: true,
      width: "85px",
      render: (row) => <span className="text-[#e6edf3] text-sm">{row.projects ?? 0}</span>,
    },
    {
      key: "leadStatus",
      label: "Lead Status",
      sortable: true,
      width: "130px",
      render: (row) => (
        <span className={`admin-badge ${leadBadge[(row.leadStatus as LeadStatus) ?? "new"]}`}>
          {fmtLabel(row.leadStatus ?? "new")}
        </span>
      ),
    },
    {
      key: "lastActivity",
      label: "Last Activity",
      sortable: true,
      width: "120px",
      render: (row) => <span className="text-[#7d8590] text-xs">{fmtDate(row.lastActivity ?? "")}</span>,
    },
    {
      key: "_actions",
      label: "Actions",
      width: "100px",
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="admin-btn admin-btn-sm admin-btn-ghost"
            title="Edit"
            onClick={() => setSlideOver({ customer: row, mode: "edit" })}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="admin-btn admin-btn-sm admin-btn-ghost"
            title="View"
            onClick={() => setSlideOver({ customer: row, mode: "view" })}
          >
            <Eye size={13} />
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
          <div className="flex items-center gap-3">
            <h1 className="admin-heading">Customers</h1>
            <span className="admin-badge admin-badge-gray">{customers.length}</span>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={() => setSlideOver({ customer: null, mode: "add" })}>
            <Plus size={15} />
            Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Users size={16} className="text-[#58a6ff]" />, bg: "bg-[#1f6feb]/15", label: "Total Customers", value: String(customers.length) },
            { icon: <DollarSign size={16} className="text-[#3fb950]" />, bg: "bg-[#238636]/15", label: "Total Revenue", value: fmt(totalRevenue) },
            { icon: <TrendingUp size={16} className="text-[#ff5a00]" />, bg: "bg-[#ff5a00]/10", label: "Won Customers", value: String(wonCount) },
            { icon: <Activity size={16} className="text-[#d29922]" />, bg: "bg-[#d29922]/10", label: "Active Leads", value: String(activeLeads) },
          ].map((stat) => (
            <div key={stat.label} className="admin-stat-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[#7d8590] text-xs">{stat.label}</p>
                <p className="text-[#e6edf3] font-semibold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="admin-filter-bar flex-wrap gap-3">
          <div className="admin-search">
            <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="admin-input pl-9 w-60"
              placeholder="Search name, company or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-select" value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{fmtLabel(s)}</option>
            ))}
          </select>
          <select className="admin-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            <option value="ALL">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="No customers match your filters."
          emptyIcon={<Users size={32} />}
          onRowClick={(row) => setSlideOver({ customer: row, mode: "view" })}
        />
      </div>

      {slideOver && (
        <CustomerSlideOver
          customer={slideOver.customer}
          mode={slideOver.mode}
          onClose={() => setSlideOver(null)}
        />
      )}
    </AdminLayout>
  );
}
