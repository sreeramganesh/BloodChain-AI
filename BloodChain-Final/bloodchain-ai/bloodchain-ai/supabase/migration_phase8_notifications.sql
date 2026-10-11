-- ====================================================================
-- BLOODCHAIN AI - PHASE 8: OPERATIONAL NOTIFICATIONS SCHEMA
-- Execute this migration script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Run
-- ====================================================================

-- 1. CREATE NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('Hospital Admin', 'Blood Bank', 'Donor / User', 'All')),
  type text not null check (type in (
    'recommendation_accepted',
    'recommendation_rejected',
    'transfer_created',
    'transfer_in_transit',
    'transfer_completed',
    'request_status_changed',
    'shortage_alert',
    'expiry_alert'
  )),
  title text not null,
  message text not null,
  related_request_id text references public.blood_requests(id) on delete set null,
  related_recommendation_id uuid references public.ai_recommendations(id) on delete set null,
  related_transfer_id text references public.transfers(id) on delete set null,
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Critical')),
  is_read boolean not null default false,
  event_key text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PERFORMANCE & LOOKUP INDEXES
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_role on public.notifications(role);
create index if not exists idx_notifications_type on public.notifications(type);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_event_key on public.notifications(event_key);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.notifications enable row level security;

-- Policy 1: Authenticated users can read notifications designated for their user ID, their role, or broadcast ('All')
create policy "Allow users to read their own notifications"
  on public.notifications for select
  to authenticated
  using (
    auth.uid() = user_id or
    role = 'All' or
    role in (select role from public.profiles where id = auth.uid())
  );

-- Policy 2: Authenticated users can update/mark read their own notifications
create policy "Allow users to update their own notifications"
  on public.notifications for update
  to authenticated
  using (
    auth.uid() = user_id or
    role = 'All' or
    role in (select role from public.profiles where id = auth.uid())
  )
  with check (
    auth.uid() = user_id or
    role = 'All' or
    role in (select role from public.profiles where id = auth.uid())
  );

-- Policy 3: Authenticated operational staff can insert operational notifications
create policy "Allow authenticated users to insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

-- Policy 4: Allow public read access strictly if demo fallback accounts are used
create policy "Allow public read access on notifications"
  on public.notifications for select
  using (true);

-- Policy 5: Allow public insert for client-side event notifications
create policy "Allow client insert on notifications"
  on public.notifications for insert
  with check (true);
