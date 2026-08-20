import { requireSupabase } from "@/lib/supabase";

export interface StudioProject {
  id: string;
  project_code: string;
  name: string;
  category: string | null;
  status: string;
  priority: string;
  budget: number | null;
  deadline: string | null;
  client_id: string | null;
  project_lead: string | null;
  created_at: string;
}

export interface StudioTask {
  id: string;
  project_id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string | null;
  created_at: string;
}

export interface StudioNotification {
  id: string;
  event_type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export async function getStudioDashboardData(userId: string) {
  const supabase = requireSupabase();

  const [projectsResult, tasksResult, notificationsResult, teamResult] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, project_code, name, category, status, priority, budget, deadline, client_id, project_lead, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("tasks")
        .select("id, project_id, title, status, priority, deadline, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("notifications")
        .select(
          "id, event_type, title, body, entity_type, entity_id, read_at, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("team_members")
        .select("user_id", { count: "exact", head: true }),
    ]);

  const firstError =
    projectsResult.error ??
    tasksResult.error ??
    notificationsResult.error ??
    teamResult.error;

  if (firstError) {
    throw firstError;
  }

  return {
    projects: (projectsResult.data ?? []) as StudioProject[],
    tasks: (tasksResult.data ?? []) as StudioTask[],
    notifications: (notificationsResult.data ?? []) as StudioNotification[],
    teamCount: teamResult.count ?? 0,
  };
}
