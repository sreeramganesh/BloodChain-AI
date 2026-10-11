-- ====================================================================
-- BLOODCHAIN AI - PHASE 3: RISK DETECTION DATA LAYER
-- Execute this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Run
-- ====================================================================

-- 1. CREATE SHORTAGE RISKS TABLE
create table if not exists public.shortage_risks (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  assessment_date date not null default current_date,
  current_available_units integer not null default 0 check (current_available_units >= 0),
  reserved_units integer not null default 0 check (reserved_units >= 0),
  predicted_demand_units numeric check (predicted_demand_units is null or predicted_demand_units >= 0),
  safety_stock_units numeric check (safety_stock_units is null or safety_stock_units >= 0),
  shortage_units numeric check (shortage_units is null or shortage_units >= 0),
  risk_score numeric check (risk_score is null or (risk_score >= 0 and risk_score <= 100)),
  risk_level text check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  expected_shortage_date date,
  calculation_method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_facility_group_assessment unique (facility_id, blood_group, assessment_date)
);

-- Indexes for shortage_risks
create index if not exists idx_shortage_risks_facility_id on public.shortage_risks(facility_id);
create index if not exists idx_shortage_risks_blood_group on public.shortage_risks(blood_group);
create index if not exists idx_shortage_risks_assessment_date on public.shortage_risks(assessment_date);
create index if not exists idx_shortage_risks_level on public.shortage_risks(risk_level);

-- Enable RLS on shortage_risks
alter table public.shortage_risks enable row level security;

create policy "Allow authenticated users to read shortage_risks"
  on public.shortage_risks for select
  to authenticated
  using (true);

create policy "Allow authenticated staff to insert/update shortage_risks"
  on public.shortage_risks for all
  to authenticated
  using (true)
  with check (true);


-- 2. CREATE EXPIRY RISKS TABLE
create table if not exists public.expiry_risks (
  id uuid primary key default gen_random_uuid(),
  inventory_id bigint not null references public.blood_inventory(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  available_units integer not null default 0 check (available_units >= 0),
  expiry_date date not null,
  days_remaining integer,
  risk_score numeric check (risk_score is null or (risk_score >= 0 and risk_score <= 100)),
  risk_level text check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  recommended_action text,
  assessment_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for expiry_risks
create index if not exists idx_expiry_risks_inventory_id on public.expiry_risks(inventory_id);
create index if not exists idx_expiry_risks_facility_id on public.expiry_risks(facility_id);
create index if not exists idx_expiry_risks_expiry_date on public.expiry_risks(expiry_date);
create index if not exists idx_expiry_risks_level on public.expiry_risks(risk_level);

-- Enable RLS on expiry_risks
alter table public.expiry_risks enable row level security;

create policy "Allow authenticated users to read expiry_risks"
  on public.expiry_risks for select
  to authenticated
  using (true);

create policy "Allow authenticated staff to insert/update expiry_risks"
  on public.expiry_risks for all
  to authenticated
  using (true)
  with check (true);


-- ====================================================================
-- 3. SEED DEMO RULE-BASED EXPIRY RISKS (Derived from Blood Inventory)
-- ====================================================================
insert into public.expiry_risks (
  inventory_id, facility_id, blood_group, available_units, expiry_date, days_remaining, risk_score, risk_level, recommended_action, assessment_date
)
select
  bi.id as inventory_id,
  bi.facility_id,
  bi.blood_group,
  bi.available_units,
  bi.expiry_date,
  greatest(0, (bi.expiry_date - current_date)) as days_remaining,
  case
    when (bi.expiry_date - current_date) <= 1 then 95
    when (bi.expiry_date - current_date) <= 3 then 75
    when (bi.expiry_date - current_date) <= 5 then 50
    else 15
  end as risk_score,
  case
    when (bi.expiry_date - current_date) <= 1 then 'Critical'
    when (bi.expiry_date - current_date) <= 3 then 'High'
    when (bi.expiry_date - current_date) <= 5 then 'Medium'
    else 'Low'
  end as risk_level,
  case
    when (bi.expiry_date - current_date) <= 1 then 'Immediate priority use for pending surgeries or emergency inter-hospital transfer'
    when (bi.expiry_date - current_date) <= 3 then 'Flag for rapid local allocation or transfer to high-volume emergency trauma center'
    when (bi.expiry_date - current_date) <= 5 then 'Monitor consumption rate; reserve for incoming scheduled requirements'
    else 'Standard cold storage monitoring and FIFO rotation'
  end as recommended_action,
  current_date as assessment_date
from public.blood_inventory bi
where bi.facility_id is not null
on conflict do nothing;


-- ====================================================================
-- 4. SEED DEMO RULE-BASED SHORTAGE RISKS (Derived from Current Inventory)
-- ====================================================================
insert into public.shortage_risks (
  facility_id, blood_group, assessment_date, current_available_units, reserved_units,
  predicted_demand_units, safety_stock_units, shortage_units, risk_score, risk_level,
  expected_shortage_date, calculation_method
)
select
  bi.facility_id,
  bi.blood_group,
  current_date as assessment_date,
  bi.available_units as current_available_units,
  bi.reserved_units as reserved_units,
  -- Demo baseline rule: buffer threshold derived from facility capacity
  case
    when bi.hospital in ('Trichy Government Hospital', 'Apollo Hospital') then 40
    when bi.hospital in ('Kauvery Hospital', 'SRM Hospital') then 30
    else 25
  end as predicted_demand_units,
  case
    when bi.hospital in ('Trichy Government Hospital', 'Apollo Hospital') then 35
    else 20
  end as safety_stock_units,
  greatest(0, (case when bi.hospital in ('Trichy Government Hospital', 'Apollo Hospital') then 35 else 20 end) - bi.available_units) as shortage_units,
  case
    when bi.available_units <= 15 then 92
    when bi.available_units <= 25 then 78
    when bi.available_units <= 40 then 45
    else 12
  end as risk_score,
  case
    when bi.available_units <= 15 then 'Critical'
    when bi.available_units <= 25 then 'High'
    when bi.available_units <= 40 then 'Medium'
    else 'Low'
  end as risk_level,
  case
    when bi.available_units <= 15 then current_date + interval '1 day'
    when bi.available_units <= 25 then current_date + interval '3 days'
    when bi.available_units <= 40 then current_date + interval '6 days'
    else current_date + interval '14 days'
  end::date as expected_shortage_date,
  'Demo Rule-Based Risk Engine' as calculation_method
from public.blood_inventory bi
where bi.facility_id is not null
on conflict (facility_id, blood_group, assessment_date) do nothing;
