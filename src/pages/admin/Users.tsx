import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Shield } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SlideOver from "@/components/admin/SlideOver";
import type { AdminUser } from "@/contexts/AdminContext";

const ROLE_BADGE: Record<AdminUser["role"], string> = {
  super_admin: "admin-badge admin-badge-red",
  admin: "admin-badge admin-badge-orange",
  editor: "admin-badge admin-badge-blue",
  viewer: "admin-badge admin-badge-gray",
};

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const EMPTY_FORM: Omit<AdminUser, "id" | "lastLogin" | "createdAt"> = {
  name: "",
  email: "",
  role: "viewer",
  status: "active",
};

function uid() {
  return "U" + Date.now().toString(36).toUpperCase();
}

export default function AdminUsers() {
  const ctx = useAdmin();
  const { toast } = useToast(); const success = toast.success; const error = toast.error;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUser["role"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<Omit<AdminUser, "id" | "lastLogin" | "createdAt">>(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    return ctx.users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [ctx.users, search, roleFilter, statusFilter]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlideOpen(true);
  }

  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setSlideOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      error("Name and email are required.");
      return;
    }
    if (editing) {
      ctx.users_.edit(editing.id, form);
      success("User updated.");
    } else {
      ctx.users_.add({
        id: uid(),
        ...form,
        lastLogin: "—",
        createdAt: new Date().toISOString().slice(0, 10),
      });
      success("User created.");
    }
    setSlideOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    ctx.users_.del(deleteTarget.id);
    success("User deleted.");
    setDeleteTarget(null);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#484f58", textTransform: "uppercase", marginBottom: 4 }}>SYSTEM</p>
            <h1 className="admin-heading">Users</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/admin/roles" className="admin-btn admin-btn-ghost admin-btn-sm">
              <Shield size={13} /> Roles &amp; Permissions
            </Link>
            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openAdd}>
              <Plus size={14} /> Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-bar">
          <div className="admin-search">
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-input"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-input admin-select" style={{ width: "auto" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}>
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <select className="admin-input admin-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span style={{ fontSize: 12, color: "#484f58", marginLeft: "auto" }}>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="admin-card admin-table-wrap">
          {filtered.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"><Shield size={20} color="#484f58" /></div>
              <p style={{ fontSize: 13, color: "#484f58" }}>No users match your filters.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#21262d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#8b949e", flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#e6edf3" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "#7d8590" }}>{u.email}</td>
                    <td><span className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</span></td>
                    <td>
                      <span className={`admin-badge ${u.status === "active" ? "admin-badge-green" : "admin-badge-gray"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ color: "#7d8590" }}>{u.lastLogin}</td>
                    <td style={{ color: "#484f58" }}>{u.createdAt}</td>
                    <td>
                      <div className="actions">
                        <button className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-icon" onClick={() => openEdit(u)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon" onClick={() => setDeleteTarget(u)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SlideOver form */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? "Edit User" : "Add User"}
        subtitle={editing ? `Editing ${editing.name}` : "Create a new admin user"}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setSlideOpen(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>{editing ? "Save Changes" : "Create User"}</button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="admin-field">
            <label className="admin-field-label">Name</label>
            <input className="admin-input" value={form.name} onChange={set("name")} placeholder="Full name" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Email</label>
            <input className="admin-input" type="email" value={form.email} onChange={set("email")} placeholder="user@orvex.studio" />
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Role</label>
            <select className="admin-input admin-select" value={form.role} onChange={set("role")}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-field-label">Status</label>
            <select className="admin-input admin-select" value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
