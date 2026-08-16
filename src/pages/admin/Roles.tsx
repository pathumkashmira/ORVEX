import { useMemo } from "react";
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
  { key: "view_dashboard",       label: "View Dashboard",        viewer: true,  editor: true,  admin: true,  super_admin: true  },
  { key: "view_analytics",       label: "View Analytics",        viewer: true,  editor: true,  admin: true,  super_admin: true  },
  { key: "view_audit_log",       label: "View Audit Log",        viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_projects",      label: "Manage Projects",       viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_services",      label: "Manage Services",       viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_journal",       label: "Manage Journal",        viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_media",         label: "Manage Media",          viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_testimonials",  label: "Manage Testimonials",   viewer: false, editor: true,  admin: true,  super_admin: true  },
  { key: "manage_orders",        label: "Manage Orders",         viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_bookings",      label: "Manage Bookings",       viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_customers",     label: "Manage Customers",      viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_leads",         label: "Manage Leads",          viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_invoices",      label: "Manage Invoices",       viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_payments",      label: "Manage Payments",       viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_messages",      label: "Manage Messages",       viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_seo",           label: "Manage SEO",            viewer: false, editor: false, admin: true,  super_admin: true  },
  { key: "manage_settings",      label: "Manage Settings",       viewer: false, editor: false, admin: false, super_admin: true  },
  { key: "manage_users",         label: "Manage Users",          viewer: false, editor: false, admin: false, super_admin: true  },
  { key: "manage_roles",         label: "Manage Roles",          viewer: false, editor: false, admin: false, super_admin: true  },
];

const ROLES: { key: Role; label: string; color: string; bg: string; border: string; desc: string }[] = [
  {
    key: "viewer",
    label: "Viewer",
    color: "#8b949e",
    bg: "rgba(139,148,158,0.08)",
    border: "rgba(139,148,158,0.2)",
    desc: "Read-only access to dashboard and analytics. Cannot modify any content or settings. Ideal for stakeholders who need visibility without edit rights.",
  },
  {
    key: "editor",
    label: "Editor",
    color: "#58a6ff",
    bg: "rgba(88,166,255,0.08)",
    border: "rgba(88,166,255,0.2)",
    desc: "Can create and edit all content (projects, journal, media, testimonials, services). Cannot manage orders, finances, users, or system settings.",
  },
  {
    key: "admin",
    label: "Admin",
    color: "#ff5a00",
    bg: "rgba(255,90,0,0.08)",
    border: "rgba(255,90,0,0.2)",
    desc: "Full access to business operations including orders, bookings, customers, leads, invoices, payments, and SEO. Cannot manage users, roles, or system settings.",
  },
  {
    key: "super_admin",
    label: "Super Admin",
    color: "#f85149",
    bg: "rgba(248,81,73,0.08)",
    border: "rgba(248,81,73,0.2)",
    desc: "Unrestricted access to all features including user management, role assignment, system settings, and the audit log. Assign sparingly.",
  },
];

export default function AdminRoles() {
  const ctx = useAdmin();

  const userCountByRole = useMemo(() => {
    const map: Partial<Record<Role, number>> = {};
    ctx.users.forEach((u) => { map[u.role] = (map[u.role] ?? 0) + 1; });
    return map;
  }, [ctx.users]);

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#484f58", textTransform: "uppercase", marginBottom: 4 }}>SYSTEM</p>
            <h1 className="admin-heading">Roles &amp; Permissions</h1>
          </div>
        </div>

        {/* Permissions matrix */}
        <div className="admin-card" style={{ marginBottom: 28, overflowX: "auto" }}>
          <table className="admin-table" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Permission</th>
                <th style={{ textAlign: "center" }}>Viewer</th>
                <th style={{ textAlign: "center" }}>Editor</th>
                <th style={{ textAlign: "center" }}>Admin</th>
                <th style={{ textAlign: "center" }}>Super Admin</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.key}>
                  <td>
                    <span style={{ color: "#c9d1d9", fontSize: 13 }}>{p.label}</span>
                    <span style={{ display: "block", fontSize: 10, color: "#484f58", fontFamily: "monospace" }}>{p.key}</span>
                  </td>
                  {(["viewer", "editor", "admin", "super_admin"] as Role[]).map((role) => (
                    <td key={role} style={{ textAlign: "center" }}>
                      {p[role] ? (
                        <span style={{ color: "#3fb950", fontSize: 15, fontWeight: 700 }}>✓</span>
                      ) : (
                        <span style={{ color: "#30363d", fontSize: 15 }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role description cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {ROLES.map((r) => (
            <div
              key={r.key}
              style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 8, padding: 20 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: r.color }}>{r.label}</p>
                <span style={{ fontSize: 11, background: r.bg, border: `1px solid ${r.border}`, color: r.color, borderRadius: 20, padding: "2px 8px", fontWeight: 500 }}>
                  {userCountByRole[r.key] ?? 0} user{(userCountByRole[r.key] ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#7d8590", lineHeight: 1.6 }}>{r.desc}</p>
              <div style={{ marginTop: 12, borderTop: `1px solid ${r.border}`, paddingTop: 10 }}>
                <p style={{ fontSize: 11, color: "#484f58", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {PERMISSIONS.filter((p) => p[r.key]).length} / {PERMISSIONS.length} permissions
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
