import type { ReactNode } from "react";
import { ShieldOff } from "lucide-react";
import { usePermission, type Permission } from "@/hooks/usePermission";
import AdminLayout from "@/components/AdminLayout";

interface Props {
  require: Permission;
  children: ReactNode;
  inline?: boolean;
}

function AccessDenied({ inline }: { inline?: boolean }) {
  const body = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center", padding: "0 32px" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(248,81,73,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ShieldOff size={22} style={{ color: "#f85149" }} />
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#e6edf3", margin: "0 0 8px" }}>Access Denied</p>
        <p style={{ fontSize: 13, color: "#7d8590", margin: 0, maxWidth: 320, lineHeight: 1.6 }}>
          You don't have permission to view this page. Contact your administrator.
        </p>
      </div>
    </div>
  );
  if (inline) return body;
  return <AdminLayout>{body}</AdminLayout>;
}

export default function PermissionGate({ require, children, inline }: Props) {
  const { can } = usePermission();
  if (!can(require)) return <AccessDenied inline={inline} />;
  return <>{children}</>;
}
