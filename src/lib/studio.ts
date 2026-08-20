import { supabase } from "@/lib/supabase";
import type { StudioProject, StudioTask, TeamMember } from "@/types/studio";

export async function getStudioOverview() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const [projects, tasks, team, notifications] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("tasks").select("*").order("deadline", { ascending: true, nullsFirst: false }).limit(200),
    supabase.from("team_members").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
  ]);
  const error = projects.error || tasks.error || team.error || notifications.error;
  if (error) throw error;
  return {
    projects: (projects.data ?? []) as StudioProject[],
    tasks: (tasks.data ?? []) as StudioTask[],
    team: (team.data ?? []) as TeamMember[],
    notifications: notifications.data ?? [],
  };
}

export async function updateTaskStatus(taskId: string, status: StudioTask["status"]) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", taskId).select("*").single();
  if (error) throw error;
  return data as StudioTask;
}

export async function updateProjectStatus(projectId: string, status: StudioProject["status"]) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.from("projects").update({ status, updated_at: new Date().toISOString() }).eq("id", projectId).select("*").single();
  if (error) throw error;
  return data as StudioProject;
}

export async function assignTask(taskId: string, userId: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("task_assignees").upsert({ task_id: taskId, user_id: userId }, { onConflict: "task_id,user_id" });
  if (error) throw error;
}

export async function assignProject(projectId: string, userId: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("project_members").upsert({ project_id: projectId, user_id: userId }, { onConflict: "project_id,user_id" });
  if (error) throw error;
}

export async function markNotificationRead(id: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function createProject(input: Pick<StudioProject, "project_code" | "name" | "description" | "category" | "priority" | "budget" | "deadline">) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.from("projects").insert({ ...input, status: "LEAD" }).select("*").single();
  if (error) throw error;
  return data as StudioProject;
}

export async function createTask(input: Pick<StudioTask, "project_id" | "title" | "description" | "priority" | "budget" | "deadline" | "deliverables">) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("tasks").insert({ ...input, status: "TODO", created_by: auth.user?.id ?? null }).select("*").single();
  if (error) throw error;
  return data as StudioTask;
}
