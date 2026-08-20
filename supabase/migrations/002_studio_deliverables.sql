-- ORVEX STUDIO OS - PHASE 2
-- Deliverables, version/status tracking, and project/task linking.

create type public.deliverable_status as enum ('DRAFT','IN_PROGRESS','INTERNAL_REVIEW','CLIENT_REVIEW','REVISION_REQUIRED','APPROVED','DELIVERED','ARCHIVED');

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  description text,
  deliverable_type text not null default 'GENERAL',
  status public.deliverable_status not null default 'DRAFT',
  version integer not null default 1 check (version > 0),
  file_url text,
  preview_url text,
  due_date timestamptz,
  delivered_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deliverables_project_id_idx on public.deliverables(project_id);
create index if not exists deliverables_task_id_idx on public.deliverables(task_id);
create index if not exists deliverables_status_idx on public.deliverables(status);

alter table public.deliverables enable row level security;

drop policy if exists "Authenticated users can read deliverables" on public.deliverables;
drop policy if exists "Authenticated users can create deliverables" on public.deliverables;
drop policy if exists "Authenticated users can update deliverables" on public.deliverables;

create policy "Authenticated users can read deliverables" on public.deliverables for select to authenticated using (true);
create policy "Authenticated users can create deliverables" on public.deliverables for insert to authenticated with check (created_by = auth.uid() or created_by is null);
create policy "Authenticated users can update deliverables" on public.deliverables for update to authenticated using (true) with check (true);

create or replace function public.touch_deliverables_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists deliverables_updated_at on public.deliverables;
create trigger deliverables_updated_at before update on public.deliverables for each row execute function public.touch_deliverables_updated_at();
