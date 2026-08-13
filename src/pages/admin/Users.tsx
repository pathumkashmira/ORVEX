import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Shield,
  Eye,
  UserCog,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin, type AdminUser } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { useApp } from "@/contexts/AppContext";
import type React from "react";

// ── Helpers ────────────────────────────────────────────────────────

type Role = AdminUser["role"];
type Status = AdminUser["status"];

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_BADGE: Record<Role, string> = {
  super_admin: "admin-badge-purple",
  admin: "admin-badge-orange",
  editor: "admin-badge-blue",
  viewer: "admin-badge-gray",
};

const ROLE_ICON: Record<Role, React.ReactElement> = {
  super_admin: <ShieldCheck size={11} />,
  admin: <Shield size={11} />,
  editor: <Pencil size={11} />,
  viewer: <Eye size={11} />,
};

const AVATAR_COLORS: Record<Role, string> = {
  super_admin: "bg-[#8b5cf6]/20 border-[#8b5cf6]/30 text-[#8b5cf6]",
  admin: "bg-[#ff5a00]/20 border-[#ff5a00]/30 text-[#ff5a00]",
  editor: "bg-[#58a6ff]/20 border-[#58a6ff]/30 text-[#58a6ff]",
  viewer: "bg-[#7d8590]/20 border-[#30363d] text-[#7d8590]",
};

function userInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function fmtDate(d: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

// ── Form ────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  role: Role;
  status: Status;
}

const BLANK: FormState = { name: "", email: "", role: "editor", status: "active" };

function toForm(u: AdminUser): FormState {
  return { name: u.name, email: u.email, role: u.role, status: u.status };
}

// ── Component ───────────────────────────────────────────────────────

export default function AdminUsers() {
  const { users, users_ } = useAdmin();
  const { toast } = useToast();
  const { user: currentUser } = useApp();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Status>("ALL");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // ── Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    admins: users.filter((u) => u.role === "super_admin" || u.role === "admin").length,
    editors: users.filter((u) => u.role === "editor").length,
  }), [users]);

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  // ── Actions ───────────────────────────────────────────────────────
  function isSelf(u: AdminUser) {
    return currentUser?.email === u.email;
  }

  function openCreate() {
    setEditing(null);
    setForm(BLANK);
    setSlideOpen(true);
  }

  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm(toForm(u));
    setSlideOpen(true);
  }

  function closeSlide() {
    setSlideOpen(false);
    setEditing(null);
    setForm(BLANK);
  }

  function handleSave() {
    if (!form.name || !form.email) return;
    if (editing) {
      users_.update({ ...editing, ...form });
      toast.success("User updated");
    } else {
      users_.create({
        id: `u-${Date.now()}`,
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        lastLogin: "",
        createdAt: new Date().toISOString().slice(0, 10),
      });
      toast.success("User invited", `${form.name} has been added.`);
    }
    closeSlide();
  }

  function handleToggleStatus(u: AdminUser) {
    if (isSelf(u)) return;
    const next = u.status === "active" ? "inactive" : "active";
    users_.update({ ...u, status: next });
    toast.info(next === "active" ? "User activated" : "User deactivated");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    users_.remove(deleteTarget.id);
    toast.success("User removed");
    setDeleteTarget(null);
  }

  // ── Table columns ─────────────────────────────────────────────────
  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${AVATAR_COLORS[u.role]}`}
          >
            {userInitials(u.name)}
          </div>
          <div>
            <p className="text-[#e6edf3] text-sm font-medium leading-tight">
              {u.name}
              {isSelf(u) && (
                <span className="ml-1.5 text-[9px] text-[#ff5a00] font-semibold">(you)</span>
              )}
            </p>
            <p className="text-[#7d8590] text-xs">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (u) => (
        <span className={`admin-badge ${ROLE_BADGE[u.role]} flex items-center gap-1 w-fit`}>
          {ROLE_ICON[u.role]}
          {ROLE_LABELS[u.role]}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (u) => (
        <span className={`admin-badge ${u.status === "active" ? "admin-badge-green" : "admin-badge-gray"}`}>
          {u.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      sortable: true,
      render: (u) => (
        <span className="text-[#7d8590] text-xs">{u.lastLogin ? fmtDate(u.lastLogin) : "Never"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (u) => <span className="text-[#7d8590] text-xs">{fmtDate(u.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "",
      width: "140px",
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={(e) => { e.stopPropagation(); openEdit(u); }}
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            className={`admin-btn admin-btn-ghost admin-btn-sm ${
              isSelf(u) ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={(e) => { e.stopPropagation(); if (!isSelf(u)) handleToggleStatus(u); }}
            title={u.status === "active" ? "Deactivate" : "Activate"}
            disabled={isSelf(u)}
          >
            {u.status === "active" ? (
              <UserX size={13} className="text-[#d29922]" />
            ) : (
              <UserCheck size={13} className="text-[#3fb950]" />
            )}
          </button>
          <button
            className={`admin-btn admin-btn-ghost admin-btn-sm text-[#f85149] ${
              isSelf(u) ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={(e) => { e.stopPropagation(); if (!isSelf(u)) setDeleteTarget(u); }}
            title="Delete"
            disabled={isSelf(u)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  function field(label: string, node: React.ReactNode) {
    return (
      <div className="admin-field">
        <label className="admin-field-label">{label}</label>
        {node}
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div className="flex items-center gap-3">
            <h1 className="admin-heading">Users &amp; Access</h1>
            <span className="admin-badge admin-badge-blue">{users.length}</span>
          </div>
          <button className="admin-btn admin-btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={15} />
            Invite User
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-[#7d8590]" />
              <span className="admin-label text-[#7d8590]">TOTAL USERS</span>
            </div>
            <p className="text-2xl font-bold text-[#e6edf3]">{stats.total}</p>
          </div>
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck size={14} className="text-[#3fb950]" />
              <span className="admin-label text-[#7d8590]">ACTIVE</span>
            </div>
            <p className="text-2xl font-bold text-[#3fb950]">{stats.active}</p>
          </div>
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-[#ff5a00]" />
              <span className="admin-label text-[#7d8590]">ADMINS</span>
            </div>
            <p className="text-2xl font-bold text-[#ff5a00]">{stats.admins}</p>
          </div>
          <div className="admin-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <UserCog size={14} className="text-[#58a6ff]" />
              <span className="admin-label text-[#7d8590]">EDITORS</span>
            </div>
            <p className="text-2xl font-bold text-[#58a6ff]">{stats.editors}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="admin-search">
            <svg className="admin-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8.5" cy="8.5" r="5.75" />
              <path d="M13 13l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              className="admin-input pl-9"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          >
            <option value="ALL">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="No users match your filters."
          emptyIcon={<Users size={32} />}
        />

        {/* Invite / Edit SlideOver */}
        <SlideOver
          open={slideOpen}
          onClose={closeSlide}
          title={editing ? "Edit User" : "Invite User"}
          subtitle={
            editing
              ? `Editing ${editing.name}`
              : "Send an invitation to a new team member."
          }
          footer={
            <>
              <button className="admin-btn admin-btn-secondary" onClick={closeSlide}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editing ? "Save Changes" : "Send Invite"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {field(
              "Full Name *",
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Jordan Reyes"
              />,
            )}
            {field(
              "Email Address *",
              <input
                className="admin-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. jordan@orvex.studio"
              />,
            )}
            {field(
              "Role",
              <select
                className="admin-select w-full"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>,
            )}
            {field(
              "Status",
              <select
                className="admin-select w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>,
            )}

            {/* Role descriptions */}
            <div className="admin-card p-3 mt-2 space-y-2">
              <p className="admin-label text-[#7d8590] mb-2">ROLE PERMISSIONS</p>
              {(["super_admin", "admin", "editor", "viewer"] as Role[]).map((r) => (
                <div
                  key={r}
                  className={`flex items-center gap-2 text-xs transition-opacity ${
                    form.role === r ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <span className={`admin-badge ${ROLE_BADGE[r]} flex items-center gap-1`}>
                    {ROLE_ICON[r]}
                    {ROLE_LABELS[r]}
                  </span>
                  <span className="text-[#7d8590]">
                    {r === "super_admin" && "Full access including settings and user management."}
                    {r === "admin" && "Full access except system settings and user roles."}
                    {r === "editor" && "Can create and edit content; no billing or users."}
                    {r === "viewer" && "Read-only access to all sections."}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SlideOver>

        {/* Delete ConfirmDialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Remove User"
          description={`This will permanently remove ${deleteTarget?.name} from the system. This action cannot be undone.`}
          confirmLabel="Remove User"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
}
