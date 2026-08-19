-- ORVEX STUDIO OPERATING SYSTEM
-- Phase 1: normalized foundation, roles, permissions and RLS helpers.
-- Run in Supabase SQL editor after creating a Supabase project.

create extension if not exists pgcrypto;

create type public.app_role as enum ('SUPER_ADMIN','ADMIN','PROJECT_LEAD','TEAM_COLLABORATOR','CLIENT');
create type public.team_status as enum ('APPLICANT','SHORTLISTED','TRIAL','VERIFIED','CORE','LEAD','SUSPENDED','ARCHIVED');
create type public.availability_status as enum ('AVAILABLE','BUSY','UNAVAILABLE');
create type public.project_status as enum ('LEAD','DISCOVERY','QUOTATION','APPROVED','PLANNING','IN_PRODUCTION','INTERNAL_REVIEW','CLIENT_REVIEW','REVISION','FINAL_DELIVERY','COMPLETED','ARCHIVED');
create type public.task_status as enum ('TODO','IN_PROGRESS','BLOCKED','INTERNAL_REVIEW','REVISION_REQUIRED','APPROVED','COMPLETED');
create type public.task_priority as enum ('LOW','MEDIUM','HIGH','URGENT');
create type public.payment_status as enum ('PENDING','APPROVED_FOR_PAYMENT','PAID','DISPUTED','CANCELLED');
create type public.message_visibility as enum ('INTERNAL','CLIENT');
create type public.audit_action as enum ('CREATE','UPDATE','DELETE','ASSIGN','STATUS_CHANGE','UPLOAD','FILE_DELETE','PAYMENT_UPDATE','PERMISSION_CHANGE','ADMIN_ACTION');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  bio text,
  role public.app_role not null default 'TEAM_COLLABORATOR',
  timezone text not null default 'Asia/Colombo',
  phone text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role public.app_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role, permission_id)
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.team_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status public.team_status not null default 'APPLICANT',
  experience text,
  software text[] not null default '{}',
  preferred_project_types text[] not null default '{}',
  rate numeric(12,2),
  payment_method_metadata jsonb not null default '{}'::jsonb,
  portfolio_url text,
  internal_notes text,
  rating numeric(4,2),
  completed_projects integer not null default 0,
  current_workload numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_skills (
  team_member_id uuid not null references public.team_members(user_id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (team_member_id, skill_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  company_name text,
  billing_email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  description text,
  category text,
  status public.project_status not null default 'LEAD',
  priority public.task_priority not null default 'MEDIUM',
  budget numeric(12,2),
  deadline timestamptz,
  creative_director uuid references public.profiles(id) on delete set null,
  project_lead uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'TODO',
  priority public.task_priority not null default 'MEDIUM',
  budget numeric(12,2),
  deadline timestamptz,
  deliverables text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create table public.task_checklists (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  is_complete boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  visibility public.message_visibility not null default 'INTERNAL',
  created_at timestamptz not null default now()
);

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  comment text,
  version_label text not null,
  is_final boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.submission_versions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.task_submissions(id) on delete cascade,
  version_number integer not null,
  created_at timestamptz not null default now(),
  unique (submission_id, version_number)
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  submission_id uuid references public.task_submissions(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  visibility public.message_visibility not null default 'INTERNAL',
  created_at timestamptz not null default now()
);

create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  visibility public.message_visibility not null default 'INTERNAL',
  subject text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.team_members(user_id) on delete cascade,
  status public.availability_status not null default 'AVAILABLE',
  weekday smallint check (weekday between 0 and 6),
  start_time time,
  end_time time,
  effective_date date,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references public.team_members(user_id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  quality numeric(3,2) check (quality between 0 and 5),
  communication numeric(3,2) check (communication between 0 and 5),
  reliability numeric(3,2) check (reliability between 0 and 5),
  speed numeric(3,2) check (speed between 0 and 5),
  technical_skill numeric(3,2) check (technical_skill between 0 and 5),
  revision_handling numeric(3,2) check (revision_handling between 0 and 5),
  score numeric(4,2),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.task_payments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks(id) on delete cascade,
  team_member_id uuid not null references public.team_members(user_id) on delete restrict,
  agreed_amount numeric(12,2) not null,
  status public.payment_status not null default 'PENDING',
  payment_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action public.audit_action not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Booking/order/invoice foundations can reference these later without coupling
-- the public booking UI to the internal OS in this first migration.
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  invoice_number text not null unique,
  amount numeric(12,2) not null default 0,
  status text not null default 'PENDING',
  due_date date,
  created_at timestamptz not null default now()
);

-- Helper functions used by RLS. SECURITY DEFINER avoids recursive policy checks.
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('SUPER_ADMIN','ADMIN'), false)
$$;

create or replace function public.is_project_member(target_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = target_project and user_id = auth.uid()
  )
  or exists (
    select 1 from public.projects
    where id = target_project and (project_lead = auth.uid() or creative_director = auth.uid())
  )
$$;

create or replace function public.is_task_assignee(target_task uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.task_assignees
    where task_id = target_task and user_id = auth.uid()
  )
$$;

-- Indexes for the operational paths.
create index idx_profiles_role on public.profiles(role);
create index idx_team_members_status on public.team_members(status);
create index idx_project_members_user on public.project_members(user_id);
create index idx_projects_client on public.projects(client_id);
create index idx_projects_status_deadline on public.projects(status, deadline);
create index idx_tasks_project_status on public.tasks(project_id, status);
create index idx_tasks_deadline on public.tasks(deadline);
create index idx_task_assignees_user on public.task_assignees(user_id);
create index idx_task_comments_task on public.task_comments(task_id, created_at);
create index idx_media_project on public.media(project_id, created_at);
create index idx_media_task on public.media(task_id, created_at);
create index idx_messages_thread on public.messages(thread_id, created_at);
create index idx_notifications_user_unread on public.notifications(user_id, read_at, created_at);
create index idx_availability_user on public.availability(user_id);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at);
create index idx_audit_logs_actor on public.audit_logs(actor_id, created_at);

-- RLS
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
alter table public.audit_logs enable row level security;
alter table public.invoices enable row level security;

-- Profiles: users can see safe profiles; financial/team internals remain separate.
create policy profiles_select_authenticated on public.profiles for select to authenticated
using (true);
create policy profiles_update_self_or_admin on public.profiles for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());
create policy profiles_insert_self on public.profiles for insert to authenticated
with check (id = auth.uid() or public.is_admin());

create policy skills_read_authenticated on public.skills for select to authenticated using (true);
create policy skills_admin_write on public.skills for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy team_members_select on public.team_members for select to authenticated
using (user_id = auth.uid() or public.is_admin() or public.current_user_role() = 'PROJECT_LEAD');
create policy team_members_admin_write on public.team_members for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy team_members_self_update on public.team_members for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy team_skills_read on public.team_skills for select to authenticated using (true);
create policy team_skills_admin_write on public.team_skills for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy clients_select on public.clients for select to authenticated
using (user_id = auth.uid() or public.is_admin() or public.current_user_role() = 'PROJECT_LEAD');
create policy clients_admin_write on public.clients for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy projects_select on public.projects for select to authenticated
using (public.is_admin() or client_id in (select id from public.clients where user_id = auth.uid()) or public.is_project_member(id));
create policy projects_admin_write on public.projects for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy projects_lead_update on public.projects for update to authenticated
using (project_lead = auth.uid()) with check (project_lead = auth.uid());

create policy project_members_select on public.project_members for select to authenticated
using (public.is_admin() or user_id = auth.uid() or public.is_project_member(project_id));
create policy project_members_admin_write on public.project_members for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy project_members_lead_write on public.project_members for all to authenticated
using (exists (select 1 from public.projects p where p.id = project_id and p.project_lead = auth.uid()))
with check (exists (select 1 from public.projects p where p.id = project_id and p.project_lead = auth.uid()));

create policy tasks_select on public.tasks for select to authenticated
using (public.is_admin() or public.is_project_member(project_id) or public.is_task_assignee(id));
create policy tasks_admin_write on public.tasks for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy tasks_lead_write on public.tasks for all to authenticated
using (exists (select 1 from public.projects p where p.id = project_id and p.project_lead = auth.uid()))
with check (exists (select 1 from public.projects p where p.id = project_id and p.project_lead = auth.uid()));
create policy tasks_assignee_update on public.tasks for update to authenticated
using (public.is_task_assignee(id)) with check (public.is_task_assignee(id));

create policy task_assignees_select on public.task_assignees for select to authenticated
using (public.is_admin() or user_id = auth.uid() or public.is_task_assignee(task_id));
create policy task_assignees_admin_write on public.task_assignees for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy task_checklists_select on public.task_checklists for select to authenticated
using (public.is_admin() or exists (select 1 from public.tasks t where t.id = task_id and (public.is_project_member(t.project_id) or public.is_task_assignee(t.id))));
create policy task_checklists_write on public.task_checklists for all to authenticated
using (public.is_admin() or public.is_task_assignee(task_id))
with check (public.is_admin() or public.is_task_assignee(task_id));

create policy task_comments_select on public.task_comments for select to authenticated
using (
  public.is_admin()
  or author_id = auth.uid()
  or (
    visibility = 'INTERNAL' and exists (select 1 from public.tasks t where t.id = task_id and public.is_project_member(t.project_id))
  )
  or (
    visibility = 'CLIENT' and exists (
      select 1 from public.tasks t join public.projects p on p.id = t.project_id
      join public.clients c on c.id = p.client_id
      where t.id = task_id and c.user_id = auth.uid()
    )
  )
);
create policy task_comments_insert on public.task_comments for insert to authenticated
with check (
  author_id = auth.uid()
  and (
    public.is_admin()
    or public.is_task_assignee(task_id)
    or exists (select 1 from public.tasks t where t.id = task_id and public.is_project_member(t.project_id))
  )
);

create policy submissions_select on public.task_submissions for select to authenticated
using (public.is_admin() or submitted_by = auth.uid() or exists (select 1 from public.tasks t where t.id = task_id and public.is_project_member(t.project_id)));
create policy submissions_insert on public.task_submissions for insert to authenticated
with check (submitted_by = auth.uid() and (public.is_admin() or public.is_task_assignee(task_id)));
create policy submissions_admin_update on public.task_submissions for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy submission_versions_select on public.submission_versions for select to authenticated
using (exists (select 1 from public.task_submissions s where s.id = submission_id and (public.is_admin() or s.submitted_by = auth.uid() or exists (select 1 from public.tasks t where t.id = s.task_id and public.is_project_member(t.project_id)))));
create policy submission_versions_insert on public.submission_versions for insert to authenticated
with check (exists (select 1 from public.task_submissions s where s.id = submission_id and (s.submitted_by = auth.uid() or public.is_admin())));

create policy media_select on public.media for select to authenticated
using (
  public.is_admin()
  or uploaded_by = auth.uid()
  or (visibility = 'INTERNAL' and project_id is not null and public.is_project_member(project_id))
  or (visibility = 'CLIENT' and project_id in (select p.id from public.projects p join public.clients c on c.id = p.client_id where c.user_id = auth.uid()))
);
create policy media_insert on public.media for insert to authenticated
with check (uploaded_by = auth.uid() and (public.is_admin() or (task_id is not null and public.is_task_assignee(task_id)) or (project_id is not null and public.is_project_member(project_id))));
create policy media_delete_admin on public.media for delete to authenticated using (public.is_admin());

create policy threads_select on public.message_threads for select to authenticated
using (
  public.is_admin()
  or (visibility = 'INTERNAL' and project_id is not null and public.is_project_member(project_id))
  or (visibility = 'CLIENT' and project_id in (select p.id from public.projects p join public.clients c on c.id = p.client_id where c.user_id = auth.uid()))
);
create policy threads_admin_write on public.message_threads for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messages_select on public.messages for select to authenticated
using (exists (select 1 from public.message_threads mt where mt.id = thread_id and (public.is_admin() or (mt.visibility = 'INTERNAL' and mt.project_id is not null and public.is_project_member(mt.project_id)) or (mt.visibility = 'CLIENT' and mt.project_id in (select p.id from public.projects p join public.clients c on c.id = p.client_id where c.user_id = auth.uid())))));
create policy messages_insert on public.messages for insert to authenticated
with check (sender_id = auth.uid() and exists (select 1 from public.message_threads mt where mt.id = thread_id and (public.is_admin() or public.is_project_member(mt.project_id) or mt.project_id in (select p.id from public.projects p join public.clients c on c.id = p.client_id where c.user_id = auth.uid()))));

create policy availability_select on public.availability for select to authenticated
using (user_id = auth.uid() or public.is_admin() or public.current_user_role() = 'PROJECT_LEAD');
create policy availability_self_write on public.availability for all to authenticated
using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy ratings_select_admin_self on public.ratings for select to authenticated
using (public.is_admin() or team_member_id = auth.uid());
create policy ratings_admin_write on public.ratings for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy notifications_own on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_admin_insert on public.notifications for insert to authenticated with check (public.is_admin() or user_id = auth.uid());

create policy task_payments_own_or_admin on public.task_payments for select to authenticated
using (public.is_admin() or team_member_id = auth.uid());
create policy task_payments_admin_write on public.task_payments for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy audit_admin_only on public.audit_logs for select to authenticated using (public.is_admin());
create policy audit_insert_authenticated on public.audit_logs for insert to authenticated with check (actor_id = auth.uid() or public.is_admin());

create policy invoices_client_or_admin on public.invoices for select to authenticated
using (public.is_admin() or client_id in (select id from public.clients where user_id = auth.uid()));
create policy invoices_admin_write on public.invoices for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Initial permission catalog.
insert into public.permissions (code, description) values
('team.read','View permitted team information'),
('team.manage','Manage collaborators'),
('projects.read','View permitted projects'),
('projects.manage','Manage projects'),
('tasks.read','View permitted tasks'),
('tasks.manage','Create and manage tasks'),
('tasks.review','Review submissions'),
('payments.read.self','View own task earnings'),
('payments.manage','Manage team payments'),
('messages.internal','Use internal project communication'),
('messages.client','Use client communication'),
('audit.read','View audit logs')
on conflict (code) do nothing;

insert into public.role_permissions(role, permission_id)
select 'SUPER_ADMIN', id from public.permissions
on conflict do nothing;

insert into public.role_permissions(role, permission_id)
select 'ADMIN', id from public.permissions
where code not in ('audit.read')
on conflict do nothing;

insert into public.role_permissions(role, permission_id)
select 'PROJECT_LEAD', id from public.permissions
where code in ('team.read','projects.read','projects.manage','tasks.read','tasks.manage','tasks.review','messages.internal','messages.client','payments.read.self')
on conflict do nothing;

insert into public.role_permissions(role, permission_id)
select 'TEAM_COLLABORATOR', id from public.permissions
where code in ('team.read','projects.read','tasks.read','tasks.manage','payments.read.self','messages.internal')
on conflict do nothing;

insert into public.role_permissions(role, permission_id)
select 'CLIENT', id from public.permissions
where code in ('projects.read','tasks.read','messages.client')
on conflict do nothing;

-- New auth users can get a profile automatically. Role remains collaborator
-- until an authorized admin changes it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
