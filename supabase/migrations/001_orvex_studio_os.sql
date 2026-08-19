-- ORVEX STUDIO OS - PHASE 1
-- Database foundation: roles, team, clients, projects, tasks, files,
-- messaging, availability, payments, notifications, invoices and audit logs.
-- Run this migration once in a new Supabase project.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('SUPER_ADMIN','ADMIN','PROJECT_LEAD','TEAM_COLLABORATOR','CLIENT');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.team_status as enum ('APPLICANT','SHORTLISTED','TRIAL','VERIFIED','CORE','LEAD','SUSPENDED','ARCHIVED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.availability_status as enum ('AVAILABLE','BUSY','UNAVAILABLE');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.project_status as enum ('LEAD','DISCOVERY','QUOTATION','APPROVED','PLANNING','IN_PRODUCTION','INTERNAL_REVIEW','CLIENT_REVIEW','REVISION','FINAL_DELIVERY','COMPLETED','ARCHIVED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.task_status as enum ('TODO','IN_PROGRESS','BLOCKED','INTERNAL_REVIEW','REVISION_REQUIRED','APPROVED','COMPLETED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.task_priority as enum ('LOW','MEDIUM','HIGH','URGENT');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.payment_status as enum ('PENDING','APPROVED_FOR_PAYMENT','PAID','DISPUTED','CANCELLED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.message_visibility as enum ('INTERNAL','CLIENT');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', avatar_url text, bio text,
  role public.app_role not null default 'TEAM_COLLABORATOR',
  timezone text not null default 'Asia/Colombo', phone text,
  social_links jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  description text, created_at timestamptz not null default now()
);
create table if not exists public.role_permissions (
  role public.app_role not null, permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role, permission_id)
);
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status public.team_status not null default 'APPLICANT', experience text,
  software text[] not null default '{}', preferred_project_types text[] not null default '{}',
  rate numeric(12,2), payment_method_metadata jsonb not null default '{}',
  portfolio_url text, internal_notes text, rating numeric(4,2),
  completed_projects integer not null default 0, current_workload numeric(5,2) not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.team_skills (
  team_member_id uuid not null references public.team_members(user_id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (team_member_id, skill_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), user_id uuid unique references public.profiles(id) on delete set null,
  company_name text, billing_email text, phone text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), project_code text not null unique,
  client_id uuid references public.clients(id) on delete set null, name text not null,
  description text, category text, status public.project_status not null default 'LEAD',
  priority public.task_priority not null default 'MEDIUM', budget numeric(12,2), deadline timestamptz,
  creative_director uuid references public.profiles(id) on delete set null,
  project_lead uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(), primary key (project_id,user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  title text not null, description text, status public.task_status not null default 'TODO',
  priority public.task_priority not null default 'MEDIUM', budget numeric(12,2), deadline timestamptz,
  deliverables text[] not null default '{}', created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(), primary key(task_id,user_id)
);
create table if not exists public.task_checklists (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null, is_complete boolean not null default false, position integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade, body text not null,
  visibility public.message_visibility not null default 'INTERNAL', created_at timestamptz not null default now()
);
create table if not exists public.task_submissions (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade, comment text,
  version_label text not null, is_final boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.submission_versions (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.task_submissions(id) on delete cascade,
  version_number integer not null, created_at timestamptz not null default now(), unique(submission_id,version_number)
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(), uploaded_by uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade, task_id uuid references public.tasks(id) on delete cascade,
  submission_id uuid references public.task_submissions(id) on delete cascade, file_name text not null,
  storage_path text not null, mime_type text, file_size bigint,
  visibility public.message_visibility not null default 'INTERNAL', created_at timestamptz not null default now()
);
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id) on delete cascade,
  visibility public.message_visibility not null default 'INTERNAL', subject text,
  created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade, body text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.team_members(user_id) on delete cascade,
  status public.availability_status not null default 'AVAILABLE', weekday smallint check(weekday between 0 and 6),
  start_time time, end_time time, effective_date date, created_at timestamptz not null default now()
);
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(), team_member_id uuid not null references public.team_members(user_id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  quality numeric(3,2) check(quality between 0 and 5), communication numeric(3,2) check(communication between 0 and 5),
  reliability numeric(3,2) check(reliability between 0 and 5), speed numeric(3,2) check(speed between 0 and 5),
  technical_skill numeric(3,2) check(technical_skill between 0 and 5), revision_handling numeric(3,2) check(revision_handling between 0 and 5),
  score numeric(4,2), notes text, created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null, title text not null, body text, entity_type text, entity_id uuid,
  read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.task_payments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null unique references public.tasks(id) on delete cascade,
  team_member_id uuid not null references public.team_members(user_id) on delete restrict,
  agreed_amount numeric(12,2) not null, status public.payment_status not null default 'PENDING',
  payment_date timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(), client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null, invoice_number text not null unique,
  amount numeric(12,2) not null default 0, status text not null default 'PENDING', due_date date,
  created_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id) on delete set null,
  action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role() returns public.app_role
language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path=public
as $$ select coalesce(public.current_user_role() in ('SUPER_ADMIN','ADMIN'),false) $$;
create or replace function public.is_project_member(target_project uuid) returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.project_members where project_id=target_project and user_id=auth.uid())
 or exists(select 1 from public.projects where id=target_project and (project_lead=auth.uid() or creative_director=auth.uid())) $$;
create or replace function public.is_task_assignee(target_task uuid) returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.task_assignees where task_id=target_task and user_id=auth.uid()) $$;

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_team_status on public.team_members(status);
create index if not exists idx_projects_client_status on public.projects(client_id,status);
create index if not exists idx_projects_deadline on public.projects(deadline);
create index if not exists idx_project_members_user on public.project_members(user_id);
create index if not exists idx_tasks_project_status on public.tasks(project_id,status);
create index if not exists idx_tasks_deadline on public.tasks(deadline);
create index if not exists idx_task_assignees_user on public.task_assignees(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id,read_at,created_at);
create index if not exists idx_audit_entity on public.audit_logs(entity_type,entity_id,created_at);

alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.skills enable row level security;
alter table public.team_members enable row level security;
alter table public.team_skills enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_checklists enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_submissions enable row level security;
alter table public.submission_versions enable row level security;
alter table public.media enable row level security;
alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
alter table public.availability enable row level security;
alter table public.ratings enable row level security;
alter table public.notifications enable row level security;
alter table public.task_payments enable row level security;
alter table public.invoices enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read on public.profiles for select to authenticated using(true);
create policy profiles_self_update on public.profiles for update to authenticated using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy profiles_self_insert on public.profiles for insert to authenticated with check(id=auth.uid() or public.is_admin());
create policy team_self_or_admin_read on public.team_members for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy team_admin_write on public.team_members for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy skills_authenticated_read on public.skills for select to authenticated using(true);
create policy skills_admin_write on public.skills for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy clients_owner_or_admin_read on public.clients for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy clients_admin_write on public.clients for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy projects_access_read on public.projects for select to authenticated using(public.is_admin() or public.is_project_member(id) or exists(select 1 from public.clients c where c.id=client_id and c.user_id=auth.uid()));
create policy projects_admin_write on public.projects for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy project_members_access on public.project_members for select to authenticated using(public.is_admin() or user_id=auth.uid() or public.is_project_member(project_id));
create policy project_members_admin_write on public.project_members for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy tasks_access_read on public.tasks for select to authenticated using(public.is_admin() or public.is_task_assignee(id) or public.is_project_member(project_id));
create policy tasks_admin_write on public.tasks for all to authenticated using(public.is_admin() or public.is_project_member(project_id)) with check(public.is_admin() or public.is_project_member(project_id));
create policy task_assignees_access on public.task_assignees for select to authenticated using(public.is_admin() or user_id=auth.uid() or public.is_task_assignee(task_id));
create policy task_assignees_admin_write on public.task_assignees for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy task_checklists_access on public.task_checklists for all to authenticated using(public.is_admin() or public.is_task_assignee(task_id) or exists(select 1 from public.tasks t where t.id=task_id and public.is_project_member(t.project_id))) with check(public.is_admin() or public.is_task_assignee(task_id) or exists(select 1 from public.tasks t where t.id=task_id and public.is_project_member(t.project_id)));
create policy task_comments_access on public.task_comments for all to authenticated using(public.is_admin() or author_id=auth.uid() or public.is_task_assignee(task_id) or exists(select 1 from public.tasks t where t.id=task_id and public.is_project_member(t.project_id))) with check(public.is_admin() or author_id=auth.uid() or public.is_task_assignee(task_id));
create policy submissions_access on public.task_submissions for all to authenticated using(public.is_admin() or submitted_by=auth.uid() or public.is_task_assignee(task_id) or exists(select 1 from public.tasks t where t.id=task_id and public.is_project_member(t.project_id))) with check(public.is_admin() or submitted_by=auth.uid() or public.is_task_assignee(task_id));
create policy submission_versions_access on public.submission_versions for select to authenticated using(public.is_admin() or exists(select 1 from public.task_submissions s where s.id=submission_id and (s.submitted_by=auth.uid() or public.is_task_assignee(s.task_id))));
create policy media_access on public.media for select to authenticated using(public.is_admin() or uploaded_by=auth.uid() or (project_id is not null and public.is_project_member(project_id)) or (task_id is not null and public.is_task_assignee(task_id)));
create policy media_owner_write on public.media for all to authenticated using(public.is_admin() or uploaded_by=auth.uid()) with check(public.is_admin() or uploaded_by=auth.uid());
create policy availability_self_admin on public.availability for all to authenticated using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy notifications_self on public.notifications for all to authenticated using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy task_payments_self_admin_read on public.task_payments for select to authenticated using(team_member_id=auth.uid() or public.is_admin());
create policy task_payments_admin_write on public.task_payments for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy invoices_owner_admin on public.invoices for select to authenticated using(public.is_admin() or exists(select 1 from public.clients c where c.id=client_id and c.user_id=auth.uid()));
create policy invoices_admin_write on public.invoices for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy audit_admin_read on public.audit_logs for select to authenticated using(public.is_admin());
create policy audit_admin_write on public.audit_logs for insert to authenticated with check(public.is_admin());
create policy permissions_admin_read on public.permissions for select to authenticated using(public.is_admin());
create policy role_permissions_admin_all on public.role_permissions for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy ratings_admin_all on public.ratings for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy message_threads_access on public.message_threads for select to authenticated using(public.is_admin() or (project_id is not null and public.is_project_member(project_id)));
create policy messages_access on public.messages for select to authenticated using(public.is_admin() or sender_id=auth.uid() or exists(select 1 from public.message_threads mt where mt.id=thread_id and mt.project_id is not null and public.is_project_member(mt.project_id)));
create policy messages_write on public.messages for insert to authenticated with check(sender_id=auth.uid() and (public.is_admin() or exists(select 1 from public.message_threads mt where mt.id=thread_id and public.is_project_member(mt.project_id))));
