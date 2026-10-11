-- ====================================================================
-- BLOODCHAIN AI - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase Project: Dashboard -> SQL Editor
-- ====================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ====================================================================
-- 1. USER PROFILES TABLE (Linked with Supabase auth.users)
-- ====================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'Donor / User' check (role in ('Hospital Admin', 'Blood Bank', 'Donor / User', 'Admin')),
  organization text,
  phone text,
  district text default 'Trichy',
  state text default 'Tamil Nadu',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Allow public read access on profiles"
  on public.profiles for select
  using (true);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, organization, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'Donor / User'),
    coalesce(new.raw_user_meta_data->>'organization', 'Community Member'),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ====================================================================
-- 2. BLOOD INVENTORY TABLE
-- ====================================================================
create table if not exists public.blood_inventory (
  id bigserial primary key,
  hospital text not null,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  available_units integer not null default 0 check (available_units >= 0),
  reserved_units integer not null default 0 check (reserved_units >= 0),
  total_units integer generated always as (available_units + reserved_units) stored,
  expiry_date date not null,
  status text not null default 'Sufficient' check (status in ('Sufficient', 'Moderate', 'Low Stock', 'Expiring Soon')),
  cost_per_unit numeric(10, 2) default 1400.00 check (cost_per_unit >= 0),
  location text default 'Trichy',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on column public.blood_inventory.cost_per_unit is 'Prototype/demo estimated cost per unit. Not an official tariff.';

alter table public.blood_inventory enable row level security;

create policy "Allow public read access on blood_inventory"
  on public.blood_inventory for select
  using (true);

create policy "Allow authenticated users to insert/update inventory"
  on public.blood_inventory for all
  to authenticated
  using (true)
  with check (true);


-- ====================================================================
-- 3. BLOOD REQUESTS TABLE
-- ====================================================================
create table if not exists public.blood_requests (
  id text primary key,
  patient_name text not null,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units_needed integer not null check (units_needed > 0),
  hospital text not null,
  request_type text not null default 'Patient' check (request_type in ('Patient', 'Hospital')),
  urgency text not null default 'Medium' check (urgency in ('Critical', 'High', 'Medium', 'Low')),
  status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Matched', 'Fulfilled', 'In Review', 'Cancelled')),
  reason text,
  district text default 'Trichy',
  requested_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.blood_requests enable row level security;

create policy "Allow public read access on blood_requests"
  on public.blood_requests for select
  using (true);

create policy "Allow anyone to create blood requests"
  on public.blood_requests for insert
  with check (true);

create policy "Allow authenticated users to update blood requests"
  on public.blood_requests for update
  using (true);


-- ====================================================================
-- 4. REGISTERED DONORS TABLE
-- ====================================================================
create table if not exists public.donors (
  id bigserial primary key,
  name text not null,
  age integer not null check (age >= 18 and age <= 65),
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  district text not null default 'Trichy',
  location text not null,
  last_donation date,
  availability text not null default 'Available' check (availability in ('Available', 'Unavailable')),
  phone text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.donors enable row level security;

create policy "Allow public read access on donors"
  on public.donors for select
  using (true);

create policy "Allow authenticated users to manage donors"
  on public.donors for all
  using (true);


-- ====================================================================
-- 5. TRANSFERS & LOGISTICS TABLE
-- ====================================================================
create table if not exists public.transfers (
  id text primary key,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units integer not null check (units > 0),
  from_location text not null,
  to_location text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'In Transit', 'Completed', 'Rejected')),
  reason text,
  requested_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transfers enable row level security;

create policy "Allow public read access on transfers"
  on public.transfers for select
  using (true);

create policy "Allow authenticated users to manage transfers"
  on public.transfers for all
  using (true);


-- ====================================================================
-- 6. CONTACT MESSAGES TABLE
-- ====================================================================
create table if not exists public.contact_messages (
  id bigserial primary key,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;

create policy "Allow public insert on contact_messages"
  on public.contact_messages for insert
  with check (true);

create policy "Allow authenticated staff to read contact_messages"
  on public.contact_messages for select
  to authenticated
  using (true);


-- ====================================================================
-- SEED DATA (INITIAL DATA FOR DEMO & TESTING)
-- ====================================================================

-- Blood Inventory Seed Data
insert into public.blood_inventory (hospital, blood_group, available_units, reserved_units, expiry_date, status, location) values
  ('Trichy Blood Bank', 'O+', 120, 40, (current_date + interval '6 days'), 'Sufficient', 'Trichy'),
  ('SRM Hospital', 'A+', 45, 10, (current_date + interval '2 days'), 'Moderate', 'Trichy'),
  ('Kauvery Hospital', 'B+', 28, 5, (current_date + interval '4 days'), 'Low Stock', 'Trichy'),
  ('Apollo Hospital', 'O-', 60, 20, (current_date + interval '9 days'), 'Sufficient', 'Trichy'),
  ('Government Hospital', 'A-', 35, 10, (current_date + interval '1 day'), 'Expiring Soon', 'Trichy'),
  ('MGM Hospital', 'AB+', 18, 7, (current_date + interval '5 days'), 'Low Stock', 'Trichy'),
  ('Cauvery Medical Center', 'B-', 22, 8, (current_date + interval '3 days'), 'Moderate', 'Trichy'),
  ('Trichy GH', 'AB-', 12, 3, (current_date + interval '1 day'), 'Expiring Soon', 'Trichy'),
  ('Srirangam PHC', 'O+', 40, 10, (current_date + interval '8 days'), 'Sufficient', 'Trichy'),
  ('Thillai Nagar Blood Bank', 'A+', 55, 15, (current_date + interval '7 days'), 'Sufficient', 'Trichy')
on conflict do nothing;

-- Blood Requests Seed Data
insert into public.blood_requests (id, patient_name, blood_group, units_needed, hospital, request_type, urgency, status, district, requested_by) values
  ('BRQ001', 'R. Karthik', 'O+', 2, 'Trichy GH', 'Patient', 'Critical', 'Pending', 'Trichy', 'Trichy GH Emergency'),
  ('BRQ002', 'Meena S.', 'A-', 1, 'Kauvery Hospital', 'Patient', 'High', 'In Progress', 'Trichy', 'Kauvery ICU'),
  ('BRQ003', 'S. Prakash', 'B+', 3, 'Apollo Hospital', 'Patient', 'Medium', 'Matched', 'Trichy', 'Apollo Surgery'),
  ('BRQ004', 'Vijay Kumar', 'AB-', 1, 'SRM Hospital', 'Patient', 'High', 'Pending', 'Trichy', 'SRM Hospital'),
  ('BRQ005', 'Lakshmi P.', 'O-', 2, 'MGM Hospital', 'Patient', 'Critical', 'In Review', 'Trichy', 'MGM Trauma Center'),
  ('BRQ006', 'Rahul D.', 'A+', 1, 'Govt. Hospital', 'Patient', 'Medium', 'Fulfilled', 'Trichy', 'Govt. Hospital'),
  ('BRQ007', 'Divya M.', 'B-', 1, 'Trichy GH', 'Patient', 'High', 'Pending', 'Trichy', 'Trichy GH'),
  ('BRQ008', 'Arun N.', 'O+', 4, 'Cauvery Medical Center', 'Patient', 'Critical', 'Pending', 'Trichy', 'Emergency Ward')
on conflict (id) do nothing;

-- Donors Seed Data
insert into public.donors (name, age, gender, blood_group, district, location, last_donation, availability, phone) values
  ('Dinesh K', 22, 'Male', 'O+', 'Trichy', 'Trichy Cantonment', '2026-03-12', 'Available', '+91 98765 11001'),
  ('Hari Prasath S', 24, 'Male', 'O+', 'Trichy', 'Srirangam', '2026-05-05', 'Available', '+91 98765 11002'),
  ('Arjun R', 21, 'Male', 'O+', 'Trichy', 'Thuvakudi', '2026-02-18', 'Available', '+91 98765 11003'),
  ('Karthik V', 25, 'Male', 'A+', 'Trichy', 'Trichy City', '2026-06-20', 'Available', '+91 98765 11004'),
  ('Santhosh M', 23, 'Male', 'B+', 'Trichy', 'Lalgudi', '2026-04-10', 'Available', '+91 98765 11005'),
  ('Vignesh B', 26, 'Male', 'AB+', 'Trichy', 'Thillai Nagar', '2026-01-02', 'Available', '+91 98765 11006'),
  ('Praveen S', 22, 'Male', 'O-', 'Trichy', 'Mannachanallur', '2026-05-15', 'Available', '+91 98765 11007'),
  ('Sathish R', 24, 'Male', 'A-', 'Trichy', 'K.K. Nagar', '2026-03-09', 'Available', '+91 98765 11008')
on conflict do nothing;

-- Transfers Seed Data
insert into public.transfers (id, blood_group, units, from_location, to_location, status, reason, requested_by) values
  ('TRF001', 'O+', 20, 'Trichy Blood Bank', 'Trichy GH', 'Pending', 'Emergency surgery - O+ units required immediately.', 'Dr. Rajesh Sharma'),
  ('TRF002', 'A-', 10, 'SRM Hospital', 'Kauvery Hospital', 'Approved', 'Urgent cardiovascular procedure.', 'Kauvery Admin'),
  ('TRF003', 'B+', 15, 'Government Hospital', 'Apollo Hospital', 'In Transit', 'Scheduled surgical operations.', 'Apollo Admin'),
  ('TRF004', 'AB-', 5, 'MGM Hospital', 'Trichy GH', 'Pending', 'Rare blood type emergency.', 'Trichy GH'),
  ('TRF005', 'O-', 12, 'Kauvery Hospital', 'MGM Hospital', 'Completed', 'Trauma ward stock replenishment.', 'MGM Admin')
on conflict (id) do nothing;
