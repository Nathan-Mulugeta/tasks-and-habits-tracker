-- Initial schema for tasks-and-habits-tracker
-- This migration is designed to match current frontend query usage.

create extension if not exists pgcrypto;

-- -----------------------------
-- HABITS
-- -----------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  frequency text not null,
  target_amount numeric not null default 1 check (target_amount >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------
-- HABIT LOGS
-- -----------------------------
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_at timestamptz not null,
  actual_amount numeric not null default 1 check (actual_amount >= 0),
  created_at timestamptz not null default now()
);

-- -----------------------------
-- TASKS
-- -----------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  google_task_id text not null unique,
  title text not null,
  status text not null,
  category text,
  due_date timestamptz,
  initial_due_date timestamptz,
  created_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- -----------------------------
-- INDEXES
-- -----------------------------
create index if not exists idx_habits_is_active on public.habits(is_active);
create index if not exists idx_habits_category on public.habits(category);

create index if not exists idx_habit_logs_habit_id on public.habit_logs(habit_id);
create index if not exists idx_habit_logs_completed_at on public.habit_logs(completed_at desc);
create index if not exists idx_habit_logs_habit_completed on public.habit_logs(habit_id, completed_at desc);

create index if not exists idx_tasks_due_date on public.tasks(due_date desc);
create index if not exists idx_tasks_created_at on public.tasks(created_at desc);
create index if not exists idx_tasks_completed_at on public.tasks(completed_at desc);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_category on public.tasks(category);
create index if not exists idx_tasks_initial_due_date on public.tasks(initial_due_date desc);

-- -----------------------------
-- RLS + POLICIES
-- Frontend uses anon client-side reads, so allow SELECT for anon/authenticated.
-- Write operations should be performed by backend/service-role (bypasses RLS).
-- -----------------------------
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Allow read habits" on public.habits;
create policy "Allow read habits"
on public.habits
for select
to anon, authenticated
using (true);

drop policy if exists "Allow read habit_logs" on public.habit_logs;
create policy "Allow read habit_logs"
on public.habit_logs
for select
to anon, authenticated
using (true);

drop policy if exists "Allow read tasks" on public.tasks;
create policy "Allow read tasks"
on public.tasks
for select
to anon, authenticated
using (true);

-- Helpful grants for API access in some Supabase setups.
grant usage on schema public to anon, authenticated;
grant select on public.habits to anon, authenticated;
grant select on public.habit_logs to anon, authenticated;
grant select on public.tasks to anon, authenticated;
