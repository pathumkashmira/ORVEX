import AdminLayout from "@/components/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";

type Role = "viewer" | "editor" | "admin" | "super_admin";

interface Permission {
  key: string;
  label: string;
  viewer: boolean;
  editor: boolean;
  admin: boolean;
  super_admin: boolean;
}

const PERMISSIONS: Permission[] = [
  { key: "view_analytics",    label: "View Analytics",      viewer: true,  editor: true,  admin: true,  super_admin: true  },
  { key: "view_audit",        label: "View Audit Log",      viewer: true,  editor: false, admin: true,  super_admin: true  },
  { key: "create_projects",   label: "Create Projects",     viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "edit_projects",     label: "Edit Projects",       viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "delete_projects",   label: "Delete Projects",     viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "publish_projects",  label: "Publish Projects",    viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_journal",    label: "Manage Journal",      viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_media",      label: "Manage Media",        viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_orders",     label: "Manage Orders",       viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_bookings",   label: "Manage Bookings",     viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_customers",  label: "Manage Customers",    viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_invoices",   label: "Manage Invoices",     viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_users",      label: "Manage Users",        viewer: false, editor: false, admin: false, super_admin: true  },
  { key: "manage_roles",      label: "Manage Roles",        viewer: false, editor: false, admin: false, super_admin: true  },
  { key: "manage_settings",   label: "Manage Settings",     viewer: false, editor: false, admin: false, super_admin: true  },
];

const ROLE_COLUMNS: { key: Role; label: string }[] = [
  { key: "viewer",      label: "Viewer" },
  { key: "editor",      label: "Editor" },
  { key: "admin",       label: "Admin" },
  { key: "super_admin", label: "Super Admin" },
];

const ROLE_DESCRIPTIONS: Record<Role, { badge: string; badgeClass: string; desc: string }> = {
  viewer: {
    badge: "Viewer",
    badgeClass: "admin-badge admin-badge-gray",
    desc: "Read-only access. Can view analytics and the audit log. No ability to create, edit, or delete any content.",
  },
  editor: {
    badge: "Editor",
    badgeClass: "admin-badge admin-badge-blue",
    desc: "Content management access. Can create, edit, and publish projects, journal posts, and media. Can view analytics.",
  },
  admin: {
    badge: "Admin",
    badgeClass: "admin-badge admin-badge-orange",
    desc: "Full operational access. Can manage orders, bookings, customers, invoices, content, and view reports. Cannot manage users, roles, or system settings.",
  },
  super_admin: {
    badge: "Super Admin",
    badgeClass: "admin-badge admin-badge-red",
    desc: "Unrestricted access to all features including user management, role assignments, and system settings. Full control.",
  },
};

function CheckMark({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <span style={{ color: "#3fb950", fontSize: 16 }}>✓</span>
  ) : (
    <span style={{ color: "#30363d", fontSize: 16 }}>—</span>
  );
}

export default function AdminRoles() {
  const { users } = useAdmin();

  const countByRole = (role: Role) =>
    users.filter((u) => u.role === role || u.role === role.replace("_", "_")).length;

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Roles &amp; Permissions</h1>
            <p className="text-sm text-[#7d8590] mt-1">
              Permissions matrix is read-only. Role assignments are managed in Users &amp; Roles.
            </p>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="admin-card mb-6 overflow-x-auto p-0">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0d1117" }}>
                <th
                  style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "#7d8590",
                    borderBottom: "1px solid #30363d",
                    minWidth: 200,
                  }}
                >
                  PERMISSION
                </th>
                {ROLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "12px 20px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: "#7d8590",
                      borderBottom: "1px solid #30363d",
                      minWidth: 110,
                    }}
                  >
                    {col.label.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, idx) => (
                <tr
                  key={perm.key}
                  style={{
                    background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                    borderBottom: "1px solid #21262d",
                  }}
                >
                  <td
                    style={{
                      padding: "11px 20px",
                      fontSize: 13,
                      color: "#e6edf3",
                    }}
                  >
                    {perm.label}
                  </td>
                  {ROLE_COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      style={{ padding: "11px 20px", textAlign: "center" }}
                    >
                      <CheckMark allowed={perm[col.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role Description Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {ROLE_COLUMNS.map((col) => {
            const info = ROLE_DESCRIPTIONS[col.key];
            const count = countByRole(col.key);
            const permCount = PERMISSIONS.filter((p) => p[col.key]).length;
            return (
              <div key={col.key} className="admin-card">
                <div className="flex items-center justify-between mb-3">
                  <span className={info.badgeClass}>{info.badge}</span>
                  <span className="text-xs text-[#7d8590]">{count} user{count !== 1 ? "s" : ""}</span>
                </div>
                <p className="text-sm text-[#7d8590] leading-relaxed mb-3">{info.desc}</p>
                <p className="text-xs text-[#484f58]">
                  {permCount}/{PERMISSIONS.length} permissions
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
