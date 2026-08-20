import { supabase } from "@/lib/supabase";
import type { StudioProject, StudioTask, TeamMember, TeamStatus, AvailabilityStatus } from "@/types/studio";

function client() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function getStudioOverview() {
  const db = client();
  const [projects, tasks, team, profiles, notifications, projectMembers, taskAssignees] = await Promise.all([
    db.from("projects").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("tasks").select("*").order("deadline", { ascending: true, nullsFirst: false }).limit(500),
    db.from("team_members").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("profiles").select("id,full_name,avatar_url,role,timezone").limit(500),
    db.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("project_members").select("project_id,user_id,assigned_at"),
    db.from("task_assignees").select("task_id,user_id,assigned_at"),
  ]);
  const error = projects.error || tasks.error || team.error || profiles.error || notifications.error || projectMembers.error || taskAssignees.error;
  if (error) throw error;
  const profileMap = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  return {
    projects: (projects.data ?? []) as StudioProject[],
    tasks: (tasks.data ?? []) as StudioTask[],
    team: (team.data ?? []).map((member) => ({ ...(member as TeamMember), profile: profileMap.get(member.user_id) ?? null })),
    profiles: profiles.data ?? [],
    notifications: notifications.data ?? [],
    projectMembers: projectMembers.data ?? [],
    taskAssignees: taskAssignees.data ?? [],
  };
}

export async function getTeamMembers() {
  const db = client();
  const { data, error } = await db.from("team_members").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function getTeamMember(userId: string) {
  const db = client();
  const { data, error } = await db.from("team_members").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as TeamMember | null;
}

export async function getAvailability(userId: string) {
  const db = client();
  const { data, error } = await db.from("availability").select("*").eq("user_id", userId).order("day_of_week", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveAvailability(userId: string, status: AvailabilityStatus, slots: Array<{ day_of_week: number; start_time: string; end_time: string; enabled: boolean }>) {
  const db = client();
  const { error: memberError } = await db.from("team_members").update({ availability_status: status, updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (memberError) throw memberError;
  const { error: deleteError } = await db.from("availability").delete().eq("user_id", userId);
  if (deleteError) throw deleteError;
  if (slots.length) {
    const { error: insertError } = await db.from("availability").insert(slots.map((slot) => ({ ...slot, user_id: userId })));
    if (insertError) throw insertError;
  }
}

export async function updateTaskStatus(taskId: string, status: StudioTask["status"]) {
  const db = client();
  const { data, error } = await db.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", taskId).select("*").single();
  if (error) throw error;
  return data as StudioTask;
}

export async function updateProjectStatus(projectId: string, status: StudioProject["status"]) {
  const db = client();
  const { data, error } = await db.from("projects").update({ status, updated_at: new Date().toISOString() }).eq("id", projectId).select("*").single();
  if (error) throw error;
  return data as StudioProject;
}

export async function updateTeamMember(userId: string, input: { status?: TeamStatus; rate?: number | null; experience?: string; portfolio_url?: string; current_workload?: number; completed_projects?: number; availability_status?: AvailabilityStatus }) {
  const db = client();
  const { error } = await db.from("team_members").update({ ...input, updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (error) throw error;
}

export async function assignTask(taskId: string, userId: string) {
  const db = client();
  const { error } = await db.from("task_assignees").upsert({ task_id: taskId, user_id: userId }, { onConflict: "task_id,user_id" });
  if (error) throw error;
  await notify(userId, "task_assigned", "New task assigned", "A task has been assigned to you.", "task", taskId);
}

export async function removeTaskAssignee(taskId: string, userId: string) {
  const db = client();
  const { error } = await db.from("task_assignees").delete().eq("task_id", taskId).eq("user_id", userId);
  if (error) throw error;
}

export async function assignProject(projectId: string, userId: string) {
  const db = client();
  const { error } = await db.from("project_members").upsert({ project_id: projectId, user_id: userId }, { onConflict: "project_id,user_id" });
  if (error) throw error;
  await notify(userId, "project_assigned", "Added to project", "You have been added to a project.", "project", projectId);
}

export async function removeProjectMember(projectId: string, userId: string) {
  const db = client();
  const { error } = await db.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId);
  if (error) throw error;
}

export async function markNotificationRead(id: string) {
  const db = client();
  const { error } = await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function notify(userId: string, eventType: string, title: string, body: string, entityType?: string, entityId?: string) {
  const db = client();
  const { error } = await db.from("notifications").insert({ user_id: userId, event_type: eventType, title, body, entity_type: entityType ?? null, entity_id: entityId ?? null });
  if (error) throw error;
}

export async function createProject(input: Pick<StudioProject, "project_code" | "name" | "description" | "category" | "priority" | "budget" | "deadline">) {
  const db = client();
  const { data, error } = await db.from("projects").insert({ ...input, status: "LEAD" }).select("*").single();
  if (error) throw error;
  return data as StudioProject;
}

export async function createTask(input: Pick<StudioTask, "project_id" | "title" | "description" | "priority" | "budget" | "deadline" | "deliverables">) {
  const db = client();
  const { data: auth } = await db.auth.getUser();
  const { data, error } = await db.from("tasks").insert({ ...input, status: "TODO", created_by: auth.user?.id ?? null }).select("*").single();
  if (error) throw error;
  return data as StudioTask;
}

export async function addTaskChecklist(taskId: string, title: string) {
  const db = client();
  const { data, error } = await db.from("task_checklists").insert({ task_id: taskId, title }).select("*").single();
  if (error) throw error;
  return data;
}

export async function toggleTaskChecklist(id: string, isComplete: boolean) {
  const db = client();
  const { error } = await db.from("task_checklists").update({ is_complete: isComplete }).eq("id", id);
  if (error) throw error;
}

export async function addTaskComment(taskId: string, body: string, visibility: "INTERNAL" | "CLIENT" = "INTERNAL") {
  const db = client();
  const { data: auth } = await db.auth.getUser();
  const { error } = await db.from("task_comments").insert({ task_id: taskId, author_id: auth.user?.id, body, visibility });
  if (error) throw error;
}

export async function logAudit(action: string, entityType: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  const db = client();
  const { data: auth } = await db.auth.getUser();
  const { error } = await db.from("audit_logs").insert({ actor_id: auth.user?.id ?? null, action, entity_type: entityType, entity_id: entityId ?? null, metadata });
  if (error) throw error;
}
