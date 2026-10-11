-- ====================================================================
-- BLOODCHAIN AI - PHASE 2: PREDICTIVE FOUNDATION MIGRATION
-- Execute this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Run
-- ====================================================================

-- 1. CREATE DONATIONS TABLE
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id bigint not null references public.donors(id) on delete restrict,
  facility_id uuid references public.facilities(id) on delete set null,
  donation_date date not null,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units numeric not null default 1 check (units > 0),
  component_type text check (component_type in ('Whole Blood', 'RBC', 'Platelets', 'FFP')),
  screening_status text default 'Pending' check (screening_status in ('Pending', 'Passed', 'Failed')),
  bag_id text unique,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for donations
create index if not exists idx_donations_donor_id on public.donations(donor_id);
create index if not exists idx_donations_facility_id on public.donations(facility_id);
create index if not exists idx_donations_donation_date on public.donations(donation_date);
create index if not exists idx_donations_blood_group on public.donations(blood_group);

-- Enable RLS on donations
alter table public.donations enable row level security;

create policy "Allow authenticated users to read donations"
  on public.donations for select
  to authenticated
  using (true);

create policy "Allow authenticated staff to insert/update donations"
  on public.donations for all
  to authenticated
  using (true)
  with check (true);


-- 2. CREATE HISTORICAL DEMAND TABLE
create table if not exists public.historical_demand (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  demand_date date not null,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units_requested integer not null default 0 check (units_requested >= 0),
  units_fulfilled integer not null default 0 check (units_fulfilled >= 0),
  emergency_requests integer not null default 0 check (emergency_requests >= 0),
  routine_requests integer not null default 0 check (routine_requests >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_facility_date_blood_group unique (facility_id, demand_date, blood_group)
);

-- Indexes for historical_demand
create index if not exists idx_historical_demand_facility_id on public.historical_demand(facility_id);
create index if not exists idx_historical_demand_date on public.historical_demand(demand_date);
create index if not exists idx_historical_demand_blood_group on public.historical_demand(blood_group);

-- Enable RLS on historical_demand
alter table public.historical_demand enable row level security;

create policy "Allow authenticated users to read historical_demand"
  on public.historical_demand for select
  to authenticated
  using (true);

create policy "Allow authenticated staff to insert/update historical_demand"
  on public.historical_demand for all
  to authenticated
  using (true)
  with check (true);


-- 3. CREATE DEMAND PREDICTIONS TABLE (Storage layer for ML model outputs)
create table if not exists public.demand_predictions (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  prediction_date date not null,
  forecast_horizon_days integer not null check (forecast_horizon_days in (7, 14, 30)),
  predicted_units numeric not null check (predicted_units >= 0),
  lower_bound numeric check (lower_bound is null or lower_bound >= 0),
  upper_bound numeric check (upper_bound is null or upper_bound >= coalesce(lower_bound, 0)),
  model_name text,
  model_version text,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for demand_predictions
create index if not exists idx_predictions_facility_id on public.demand_predictions(facility_id);
create index if not exists idx_predictions_blood_group on public.demand_predictions(blood_group);
create index if not exists idx_predictions_date on public.demand_predictions(prediction_date);
create index if not exists idx_predictions_horizon on public.demand_predictions(forecast_horizon_days);

-- Enable RLS on demand_predictions
alter table public.demand_predictions enable row level security;

create policy "Allow authenticated users to read demand_predictions"
  on public.demand_predictions for select
  to authenticated
  using (true);

create policy "Allow authenticated staff to insert/update demand_predictions"
  on public.demand_predictions for all
  to authenticated
  using (true)
  with check (true);


-- ====================================================================
-- 4. SEED SYNTHETIC DEMO DONATION HISTORY
-- ====================================================================
insert into public.donations (
  donor_id, facility_id, donation_date, blood_group, units, component_type, screening_status, bag_id, notes
)
select
  d.id as donor_id,
  f.id as facility_id,
  v.donation_date,
  d.blood_group,
  v.units,
  v.component_type,
  v.screening_status,
  v.bag_id,
  v.notes
from (values
  (1, 'Trichy Blood Bank', date '2026-03-12', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2026-001', 'Routine voluntary blood donation. All screenings clear.'),
  (2, 'Trichy Blood Bank', date '2026-05-05', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2026-002', 'Annual college blood donation camp.'),
  (3, 'Trichy Government Hospital', date '2026-02-18', 1, 'RBC', 'Passed', 'BAG-TRY-2026-003', 'Emergency replacement donation.'),
  (4, 'SRM Hospital', date '2026-06-20', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2026-004', 'Voluntary regular donor walk-in.'),
  (5, 'Kauvery Hospital', date '2026-04-10', 1, 'Platelets', 'Passed', 'BAG-TRY-2026-005', 'Single donor platelets (SDP) apheresis collection.'),
  (6, 'Thillai Nagar Blood Bank', date '2026-01-02', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2026-006', 'New Year blood drive donor.'),
  (7, 'MGM Hospital', date '2026-05-15', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2026-007', 'Rare O- blood group voluntary donation.'),
  (8, 'Trichy Government Hospital', date '2026-03-09', 1, 'FFP', 'Passed', 'BAG-TRY-2026-008', 'Fresh frozen plasma component separation.'),
  (1, 'Trichy Government Hospital', date '2025-11-10', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2025-089', 'Prior donation cycle (4 months prior).'),
  (4, 'Apollo Hospital', date '2026-01-15', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2026-010', 'Scheduled voluntary hospital donor session.'),
  (5, 'Trichy Blood Bank', date '2025-12-05', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2025-102', 'Previous winter donation drive.'),
  (7, 'Kauvery Hospital', date '2025-10-20', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2025-077', 'O- donor voluntary emergency response donation.'),
  (2, 'SRM Hospital', date '2025-10-12', 1, 'Platelets', 'Passed', 'BAG-TRY-2025-072', 'Apheresis collection session.'),
  (3, 'Trichy Blood Bank', date '2025-09-04', 1, 'Whole Blood', 'Passed', 'BAG-TRY-2025-055', 'Voluntary community blood drive.')
) as v(donor_id, facility_name, donation_date, units, component_type, screening_status, bag_id, notes)
join public.donors d on d.id = v.donor_id
join public.facilities f on f.name = v.facility_name
on conflict (bag_id) do nothing;


-- ====================================================================
-- 5. SEED SYNTHETIC HISTORICAL DEMAND DATA (12 Months Coverage)
-- ====================================================================
-- Generates realistic demand patterns across previous 12 months for major facilities & 8 blood groups
insert into public.historical_demand (
  facility_id, demand_date, blood_group, units_requested, units_fulfilled, emergency_requests, routine_requests
)
select
  f.id as facility_id,
  d_dates.m_date as demand_date,
  bg.blood_group,
  -- Demand modeling: higher demand for O+ / A+, higher emergency requests in GH/Apollo
  case 
    when bg.blood_group in ('O+', 'A+') then (18 + ((extract(month from d_dates.m_date)::int * 3 + f.weight) % 15))
    when bg.blood_group in ('B+', 'O-') then (10 + ((extract(month from d_dates.m_date)::int * 2 + f.weight) % 10))
    when bg.blood_group in ('A-', 'B-') then (6 + ((extract(month from d_dates.m_date)::int + f.weight) % 6))
    else (4 + ((extract(month from d_dates.m_date)::int + f.weight) % 4))
  end as units_requested,

  -- Fulfilled units: 85-100% fulfillment rate
  case 
    when bg.blood_group in ('O+', 'A+') then (16 + ((extract(month from d_dates.m_date)::int * 3 + f.weight) % 13))
    when bg.blood_group in ('B+', 'O-') then (8 + ((extract(month from d_dates.m_date)::int * 2 + f.weight) % 9))
    when bg.blood_group in ('A-', 'B-') then (5 + ((extract(month from d_dates.m_date)::int + f.weight) % 5))
    else (3 + ((extract(month from d_dates.m_date)::int + f.weight) % 4))
  end as units_fulfilled,

  -- Emergency requests breakdown
  case
    when f.name in ('Trichy Government Hospital', 'Apollo Hospital') then (5 + (extract(month from d_dates.m_date)::int % 5))
    else (2 + (extract(month from d_dates.m_date)::int % 3))
  end as emergency_requests,

  -- Routine requests breakdown
  case 
    when bg.blood_group in ('O+', 'A+') then (12 + (extract(month from d_dates.m_date)::int % 8))
    else (5 + (extract(month from d_dates.m_date)::int % 4))
  end as routine_requests

from (
  select id, name,
    case 
      when name = 'Trichy Government Hospital' then 7
      when name = 'Apollo Hospital' then 5
      when name = 'Kauvery Hospital' then 4
      when name = 'SRM Hospital' then 3
      when name = 'Trichy Blood Bank' then 6
      else 2
    end as weight
  from public.facilities
  where name in (
    'Trichy Government Hospital',
    'Apollo Hospital',
    'Kauvery Hospital',
    'SRM Hospital',
    'Trichy Blood Bank'
  )
) f
cross join (
  -- 12 monthly sample dates from past 12 months (Oct 2025 - Sep 2026)
  select (date '2025-10-01' + (n || ' months')::interval)::date as m_date
  from generate_series(0, 11) as n
) d_dates
cross join (
  values ('A+'), ('A-'), ('B+'), ('B-'), ('O+'), ('O-'), ('AB+'), ('AB-')
) as bg(blood_group)
on conflict (facility_id, demand_date, blood_group) do nothing;
