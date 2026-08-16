import { useAdmin } from "@/contexts/AdminContext";
import { useApp } from "@/contexts/AppContext";

export type Permission =
  | "view_dashboard" | "view_analytics" | "view_audit_log"
  | "manage_projects" | "manage_services" | "manage_journal" | "manage_media" | "manage_testimonials"
  | "manage_orders" | "manage_bookings" | "manage_customers" | "manage_leads"
  | "manage_invoices" | "manage_payments" | "manage_messages"
  | "manage_seo" | "manage_settings" | "manage_users" | "manage_roles";

type AdminRole = "super_admin" | "admin" | "editor" | "viewer";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  viewer: ["view_dashboard", "view_analytics", "view_audit_log"],
  editor: [
    "view_dashboard", "view_analytics",
    "manage_projects", "manage_services", "manage_journal", "manage_media", "manage_testimonials",
  ],
  admin: [
    "view_dashboard", "view_analytics", "view_audit_log",
    "manage_projects", "manage_services", "manage_journal", "manage_media", "manage_testimonials",
    "manage_orders", "manage_bookings", "manage_customers", "manage_leads",
    "manage_invoices", "manage_payments", "manage_messages",
    "manage_seo",
  ],
  super_admin: [
    "view_dashboard", "view_analytics", "view_audit_log",
    "manage_projects", "manage_services", "manage_journal", "manage_media", "manage_testimonials",
    "manage_orders", "manage_bookings", "manage_customers", "manage_leads",
    "manage_invoices", "manage_payments", "manage_messages",
    "manage_seo", "manage_settings", "manage_users", "manage_roles",
  ],
};

export function usePermission() {
  const { user } = useApp();
  const { users } = useAdmin();

  const adminUser = users.find((u) => u.email === user?.email);
  const role: AdminRole = adminUser?.role ?? "admin";
  const permissions = ROLE_PERMISSIONS[role];

  const can = (p: Permission) => permissions.includes(p);
  const canAny = (...ps: Permission[]) => ps.some((p) => permissions.includes(p));

  return { can, canAny, role, permissions };
}
