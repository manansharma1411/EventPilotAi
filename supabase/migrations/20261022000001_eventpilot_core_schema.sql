-- ==============================================================================
-- EventPilot AI - Core Database Schema & Row Level Security (RLS)
-- Migration: 20261022000001_eventpilot_core_schema.sql
-- Architecture: Supabase PostgreSQL with Strict RLS and Exact Monetary Types
-- ==============================================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. Profiles Table (Linked 1-to-1 with auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.profiles is 'User profiles linked to Supabase Auth users.';

-- Automatic profile creation trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger to execute upon auth.users creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 3. Events Table
-- ==============================================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  event_type text not null,
  event_date date not null,
  timezone text not null default 'UTC',
  location text not null,
  guest_count integer not null default 0 check (guest_count >= 0),
  total_budget numeric(12, 2) not null default 0.00 check (total_budget >= 0),
  currency text not null default 'USD',
  theme text,
  preferences jsonb not null default '{}'::jsonb,
  status text not null default 'planning' check (status in ('planning', 'confirmed', 'in_progress', 'completed', 'archived')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_events_user_id on public.events(user_id);
create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_events_status on public.events(status);

comment on table public.events is 'Core events managed by authenticated users.';

-- ==============================================================================
-- 4. Budget Items Table (Deterministic exact numeric ledger)
-- ==============================================================================
create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  category text not null,
  description text not null,
  estimated_cost numeric(12, 2) not null default 0.00 check (estimated_cost >= 0),
  actual_cost numeric(12, 2) not null default 0.00 check (actual_cost >= 0),
  currency text not null default 'USD',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_budget_items_event_id on public.budget_items(event_id);
create index if not exists idx_budget_items_category on public.budget_items(category);

comment on table public.budget_items is 'Itemized budget line items with exact numeric amounts.';

-- ==============================================================================
-- 5. Tasks Table (Run-of-show logistics & planning milestones)
-- ==============================================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'blocked')),
  dependencies text[] not null default '{}'::text[],
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_tasks_event_id on public.tasks(event_id);
create index if not exists idx_tasks_due_at on public.tasks(due_at);
create index if not exists idx_tasks_status on public.tasks(status);

comment on table public.tasks is 'Planning tasks and execution milestones.';

-- ==============================================================================
-- 6. Vendors Table (Directory of vetted & user-added providers)
-- ==============================================================================
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  location text not null,
  contact_info jsonb not null default '{}'::jsonb,
  source text not null default 'platform',
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'verified', 'featured')),
  is_public boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists idx_vendors_category on public.vendors(category);
create index if not exists idx_vendors_is_public on public.vendors(is_public);
create index if not exists idx_vendors_created_by on public.vendors(created_by);

comment on table public.vendors is 'Vendors directory including curated and custom vendors.';

-- ==============================================================================
-- 7. Event Vendors Table (Junction linking vendors to specific events)
-- ==============================================================================
create table if not exists public.event_vendors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  quoted_price numeric(12, 2) default 0.00 check (quoted_price >= 0),
  currency text not null default 'USD',
  selection_status text not null default 'inquired' check (selection_status in ('inquired', 'shortlisted', 'quoted', 'contract_signed', 'declined')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_event_vendor unique (event_id, vendor_id)
);

create index if not exists idx_event_vendors_event_id on public.event_vendors(event_id);
create index if not exists idx_event_vendors_vendor_id on public.event_vendors(vendor_id);

comment on table public.event_vendors is 'Contractual and selection status for vendors linked to an event.';

-- ==============================================================================
-- 8. Event Plan Versions Table (Audit history & AI snapshots)
-- ==============================================================================
create table if not exists public.event_plan_versions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  version_number integer not null check (version_number >= 1),
  plan_snapshot jsonb not null,
  change_summary text not null,
  created_at timestamptz default now() not null,
  constraint unique_event_version unique (event_id, version_number)
);

create index if not exists idx_plan_versions_event_id on public.event_plan_versions(event_id);

comment on table public.event_plan_versions is 'Immutable snapshots of event plans with versioning.';

-- ==============================================================================
-- 9. Automatic Updated_At Timestamp Trigger
-- ==============================================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create or replace trigger update_events_updated_at before update on public.events for each row execute function public.update_updated_at_column();
create or replace trigger update_budget_items_updated_at before update on public.budget_items for each row execute function public.update_updated_at_column();
create or replace trigger update_tasks_updated_at before update on public.tasks for each row execute function public.update_updated_at_column();
create or replace trigger update_event_vendors_updated_at before update on public.event_vendors for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.budget_items enable row level security;
alter table public.tasks enable row level security;
alter table public.vendors enable row level security;
alter table public.event_vendors enable row level security;
alter table public.event_plan_versions enable row level security;

-- PROFILES POLICIES
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- EVENTS POLICIES
create policy "Users can view their own events"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Users can create their own events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- BUDGET ITEMS POLICIES
create policy "Users can view budget items for their events"
  on public.budget_items for select
  using (
    exists (
      select 1 from public.events
      where events.id = budget_items.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can insert budget items for their events"
  on public.budget_items for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = budget_items.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can update budget items for their events"
  on public.budget_items for update
  using (
    exists (
      select 1 from public.events
      where events.id = budget_items.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can delete budget items for their events"
  on public.budget_items for delete
  using (
    exists (
      select 1 from public.events
      where events.id = budget_items.event_id
      and events.user_id = auth.uid()
    )
  );

-- TASKS POLICIES
create policy "Users can view tasks for their events"
  on public.tasks for select
  using (
    exists (
      select 1 from public.events
      where events.id = tasks.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can insert tasks for their events"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = tasks.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can update tasks for their events"
  on public.tasks for update
  using (
    exists (
      select 1 from public.events
      where events.id = tasks.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can delete tasks for their events"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.events
      where events.id = tasks.event_id
      and events.user_id = auth.uid()
    )
  );

-- VENDORS POLICIES
-- Public directory vendors can be viewed by any authenticated user; private vendors only by creator
create policy "Users can view public vendors or their own created vendors"
  on public.vendors for select
  using (
    is_public = true or created_by = auth.uid()
  );

create policy "Users can insert their own private vendors"
  on public.vendors for insert
  with check (
    auth.uid() is not null and (created_by = auth.uid() or created_by is null)
  );

create policy "Users can update their own created vendors"
  on public.vendors for update
  using (created_by = auth.uid());

create policy "Users can delete their own created vendors"
  on public.vendors for delete
  using (created_by = auth.uid());

-- EVENT VENDORS POLICIES
create policy "Users can view event vendors for their events"
  on public.event_vendors for select
  using (
    exists (
      select 1 from public.events
      where events.id = event_vendors.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can insert event vendors for their events"
  on public.event_vendors for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = event_vendors.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can update event vendors for their events"
  on public.event_vendors for update
  using (
    exists (
      select 1 from public.events
      where events.id = event_vendors.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can delete event vendors for their events"
  on public.event_vendors for delete
  using (
    exists (
      select 1 from public.events
      where events.id = event_vendors.event_id
      and events.user_id = auth.uid()
    )
  );

-- EVENT PLAN VERSIONS POLICIES
create policy "Users can view plan versions for their events"
  on public.event_plan_versions for select
  using (
    exists (
      select 1 from public.events
      where events.id = event_plan_versions.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can insert plan versions for their events"
  on public.event_plan_versions for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = event_plan_versions.event_id
      and events.user_id = auth.uid()
    )
  );
