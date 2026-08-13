import { useState, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  ExternalLink,
  Package,
  X,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import type { Service, ServicePackage } from "@/data/seed";

// ── helpers ──────────────────────────────────────────────────────────

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function blankPackage(): ServicePackage {
  return {
    id: newId(),
    name: "",
    price: 0,
    description: "",
    features: [],
    duration: "",
    popular: false,
  };
}

function blankForm(): Omit<Service, "id" | "number"> {
  return {
    title: "",
    description: "",
    overview: "",
    deliverables: [],
    process: [],
    timeline: "",
    startingPrice: 0,
    currency: "USD",
    packages: [],
    gallery: [],
    featured: false,
    visible: true,
    order: 0,
  };
}

// ── toggle switch ─────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-[#ff5a00]" : "bg-[#30363d]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────

export default function AdminServices() {
  const { services, services_ } = useAdmin();
  const { toast } = useToast();

  const [view, setView] = useState<"table" | "grid">("table");
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // form state
  const [form, setForm] = useState<Omit<Service, "id" | "number">>(blankForm());
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(blankForm());
    setPackages([]);
    setSlideOpen(true);
  }, []);

  const openEdit = useCallback((s: Service) => {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description,
      overview: s.overview,
      deliverables: s.deliverables,
      process: s.process,
      timeline: s.timeline,
      startingPrice: s.startingPrice,
      currency: s.currency,
      packages: s.packages,
      gallery: s.gallery,
      featured: s.featured,
      visible: s.visible,
      order: s.order,
    });
    setPackages(s.packages.map((p) => ({ ...p })));
    setSlideOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const payload = { ...form, packages };
    if (editing) {
      services_.update({ ...editing, ...payload });
      toast.success("Service updated");
    } else {
      services_.create({
        id: newId(),
        number: String(services.length + 1).padStart(3, "0"),
        ...payload,
      });
      toast.success("Service created");
    }
    setSlideOpen(false);
  }, [editing, form, packages, services, services_, toast]);

  const handleDelete = useCallback(() => {
    if (!confirmId) return;
    setDeleting(true);
    services_.remove(confirmId);
    toast.success("Service deleted");
    setDeleting(false);
    setConfirmId(null);
  }, [confirmId, services_, toast]);

  const toggleVisible = useCallback(
    (s: Service) => {
      services_.update({ ...s, visible: !s.visible });
      toast.info(s.visible ? "Service hidden" : "Service visible");
    },
    [services_, toast]
  );

  const toggleFeatured = useCallback(
    (s: Service) => {
      services_.update({ ...s, featured: !s.featured });
      toast.info(s.featured ? "Removed from featured" : "Marked as featured");
    },
    [services_, toast]
  );

  const addPackage = () => setPackages((p) => [...p, blankPackage()]);
  const removePackage = (id: string) =>
    setPackages((p) => p.filter((x) => x.id !== id));
  const updatePackage = (
    id: string,
    field: keyof ServicePackage,
    val: unknown
  ) =>
    setPackages((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: val } : x))
    );

  // ── table columns ───────────────────────────────────────────────────

  const columns: Column<Service>[] = [
    {
      key: "order",
      label: "#",
      sortable: true,
      width: "56px",
      render: (s) => (
        <span className="text-[#7d8590] font-mono text-xs">{s.order}</span>
      ),
    },
    {
      key: "title",
      label: "Service",
      sortable: true,
      render: (s) => (
        <div>
          <p className="text-[#e6edf3] font-medium text-sm">{s.title}</p>
          <p className="text-[#7d8590] text-xs mt-0.5 line-clamp-1">
            {s.description}
          </p>
        </div>
      ),
    },
    {
      key: "startingPrice",
      label: "Starting Price",
      sortable: true,
      render: (s) => (
        <span className="text-[#e6edf3] font-mono text-sm">
          {s.currency} {s.startingPrice.toLocaleString()}
        </span>
      ),
    },
    {
      key: "timeline",
      label: "Timeline",
      sortable: true,
      render: (s) => (
        <span className="text-[#7d8590] text-sm">{s.timeline}</span>
      ),
    },
    {
      key: "packages",
      label: "Packages",
      render: (s) => (
        <span className="admin-badge admin-badge-blue">
          {s.packages.length} pkg
        </span>
      ),
    },
    {
      key: "visible",
      label: "Visible",
      render: (s) => (
        <ToggleSwitch checked={s.visible} onChange={() => toggleVisible(s)} />
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (s) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFeatured(s);
          }}
          className={`transition-colors ${
            s.featured
              ? "text-[#ff5a00]"
              : "text-[#30363d] hover:text-[#7d8590]"
          }`}
        >
          <Star size={16} fill={s.featured ? "currentColor" : "none"} />
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <div className="flex items-center gap-1">
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(s);
            }}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm text-[#7d8590] hover:text-[#e6edf3]"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} />
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmId(s.id);
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  // ── render ──────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Services</h1>
            <p className="text-[#7d8590] text-sm mt-1">
              {services.length} service{services.length !== 1 ? "s" : ""} in catalog
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center border border-[#30363d] rounded overflow-hidden">
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                  view === "table"
                    ? "bg-[#ff5a00] text-white"
                    : "text-[#7d8590] hover:text-[#e6edf3]"
                }`}
              >
                <List size={13} /> Table
              </button>
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                  view === "grid"
                    ? "bg-[#ff5a00] text-white"
                    : "text-[#7d8590] hover:text-[#e6edf3]"
                }`}
              >
                <LayoutGrid size={13} /> Grid
              </button>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>
              <Plus size={14} /> New Service
            </button>
          </div>
        </div>

        <div className="admin-body">
          {view === "table" ? (
            <DataTable
              data={services}
              columns={columns}
              emptyMessage="No services yet. Create your first service."
              emptyIcon={<Package size={32} />}
              onRowClick={openEdit}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div key={s.id} className="admin-card flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="admin-heading-sm truncate">{s.title}</h3>
                      <p className="text-[#7d8590] text-xs mt-1 line-clamp-2">
                        {s.description}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFeatured(s)}
                      className={`ml-2 flex-shrink-0 transition-colors ${
                        s.featured
                          ? "text-[#ff5a00]"
                          : "text-[#30363d] hover:text-[#7d8590]"
                      }`}
                    >
                      <Star
                        size={15}
                        fill={s.featured ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="admin-badge admin-badge-blue">
                      {s.packages.length} packages
                    </span>
                    <span className="text-[#7d8590] text-xs">{s.timeline}</span>
                  </div>
                  <p className="text-[#ff5a00] font-mono text-sm font-semibold">
                    {s.currency} {s.startingPrice.toLocaleString()}+
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
                    <div className="flex items-center gap-2">
                      {s.visible ? (
                        <Eye size={12} className="text-[#7d8590]" />
                      ) : (
                        <EyeOff size={12} className="text-[#7d8590]" />
                      )}
                      <ToggleSwitch
                        checked={s.visible}
                        onChange={() => toggleVisible(s)}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm hover:text-red-400"
                        onClick={() => setConfirmId(s.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openEdit(s)}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="col-span-3 text-center py-16 text-[#7d8590]">
                  No services yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? "Edit Service" : "New Service"}
        subtitle={
          editing ? editing.title : "Add a new service to your catalog"
        }
        width="xl"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setSlideOpen(false)}
            >
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Service"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="admin-field">
            <label className="admin-field-label">Service Title</label>
            <input
              className="admin-input"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Brand Identity Design"
            />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Short Description</label>
            <input
              className="admin-input"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="One-line summary shown in listings"
            />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Overview</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={form.overview}
              onChange={(e) =>
                setForm((f) => ({ ...f, overview: e.target.value }))
              }
              placeholder="Full description of this service..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Starting Price</label>
              <input
                type="number"
                className="admin-input"
                value={form.startingPrice}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    startingPrice: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Currency</label>
              <select
                className="admin-select"
                value={form.currency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, currency: e.target.value }))
                }
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field">
              <label className="admin-field-label">Timeline</label>
              <input
                className="admin-input"
                value={form.timeline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeline: e.target.value }))
                }
                placeholder="e.g. 4–6 weeks"
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Display Order</label>
              <input
                type="number"
                className="admin-input"
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) =>
                  setForm((f) => ({ ...f, visible: e.target.checked }))
                }
                className="accent-[#ff5a00]"
              />
              <span className="admin-label">Visible on site</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="accent-[#ff5a00]"
              />
              <span className="admin-label">Featured</span>
            </label>
          </div>

          {/* Packages section */}
          <div className="border-t border-[#30363d] pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="admin-heading-sm">Packages</h3>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={addPackage}
              >
                <Plus size={12} /> Add Package
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {packages.length === 0 && (
                <p className="text-[#7d8590] text-sm">
                  No packages yet. Add one above.
                </p>
              )}
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border border-[#30363d] rounded-lg p-3 bg-[#0d1117] flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      className="admin-input flex-1"
                      placeholder="Package name"
                      value={pkg.name}
                      onChange={(e) =>
                        updatePackage(pkg.id, "name", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="admin-input w-28"
                      placeholder="Price"
                      value={pkg.price}
                      onChange={(e) =>
                        updatePackage(pkg.id, "price", Number(e.target.value))
                      }
                    />
                    <label className="flex items-center gap-1 text-xs text-[#7d8590] whitespace-nowrap cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkg.popular}
                        onChange={(e) =>
                          updatePackage(pkg.id, "popular", e.target.checked)
                        }
                        className="accent-[#ff5a00]"
                      />
                      Popular
                    </label>
                    <button
                      onClick={() => removePackage(pkg.id)}
                      className="text-[#7d8590] hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    className="admin-input"
                    placeholder="Duration (e.g. 2 weeks)"
                    value={pkg.duration}
                    onChange={(e) =>
                      updatePackage(pkg.id, "duration", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete Service"
        description="This will permanently remove the service from your catalog. This action cannot be undone."
        confirmLabel="Delete Service"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </AdminLayout>
  );
}
