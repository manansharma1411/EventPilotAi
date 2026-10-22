-- ==============================================================================
-- EventPilot AI - Database & RLS Verification Suite
-- Run this in the Supabase SQL Editor to verify schema and RLS policies
-- ==============================================================================

-- 1. Check Table Existence
select
  table_name,
  (select count(*) from information_schema.columns c where c.table_name = t.table_name and c.table_schema = 'public') as column_count
from information_schema.tables t
where table_schema = 'public'
  and table_name in ('profiles', 'events', 'budget_items', 'tasks', 'vendors', 'event_vendors', 'event_plan_versions')
order by table_name;

-- 2. Verify Row Level Security is Enabled on All 7 Tables
select
  relname as table_name,
  case when relrowsecurity then 'RLS_ENABLED (PASS)' else 'RLS_DISABLED (FAIL)' end as rls_status
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('profiles', 'events', 'budget_items', 'tasks', 'vendors', 'event_vendors', 'event_plan_versions')
order by relname;

-- 3. List All Active RLS Policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 4. Verify Foreign Key Cascade Constraints
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
join information_schema.referential_constraints rc on tc.constraint_name = rc.constraint_name
join information_schema.constraint_column_usage ccu on rc.unique_constraint_name = ccu.constraint_name
where tc.table_schema = 'public' and tc.constraint_type = 'FOREIGN KEY'
order by tc.table_name;
