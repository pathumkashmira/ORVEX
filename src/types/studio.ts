export type AppRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PROJECT_LEAD"
  | "TEAM_COLLABORATOR"
  | "CLIENT";

export type TeamStatus =
  | "APPLICANT" | "SHORTLISTED" | "TRIAL" | "VERIFIED" | "CORE" | "LEAD" | "SUSPENDED" | "ARCHIVED";
export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE";

export interface TeamMember {
  id: string; full_name: string; email: string; avatar_url?: string | null; bio?: string | null;
  role: AppRole; team_status: TeamStatus; skills: string[]; software: string[]; portfolio_url?: string | null;
  social_links?: Record<string, string>; experience?: string | null; timezone?: string | null;
  preferred_project_types: string[]; rate?: number | null; currency?: string; availability_status: AvailabilityStatus;
  rating?: number | null; completed_projects: number; active_projects: number; pending_tasks: number;
  workload_percentage: number; quality_rating?: number | null; communication_rating?: number | null;
  reliability_rating?: number | null; speed_rating?: number | null; technical_rating?: number | null;
  revision_rating?: number | null; internal_notes?: string | null; created_at?: string; updated_at?: string;
}
export interface TeamSkill { id: string; name: string; category?: string | null; }
export interface AvailabilitySlot { id: string; team_member_id: string; day_of_week: number; start_time: string; end_time: string; enabled: boolean; }
export interface TeamWorkload { team_member_id: string; active_projects: number; pending_tasks: number; workload_percentage: number; availability: AvailabilityStatus; deadline_risk: "LOW" | "MEDIUM" | "HIGH"; }

export type DeliverableStatus = "DRAFT" | "IN_PROGRESS" | "INTERNAL_REVIEW" | "CLIENT_REVIEW" | "REVISION_REQUIRED" | "APPROVED" | "DELIVERED" | "ARCHIVED";
export interface StudioDeliverable {
  id: string;
  project_id: string;
  task_id?: string | null;
  title: string;
  description?: string | null;
  deliverable_type: string;
  status: DeliverableStatus;
  version: number;
  file_url?: string | null;
  preview_url?: string | null;
  due_date?: string | null;
  delivered_at?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}
