-- ====================================================================
-- BLOODCHAIN AI - PHASE 1: FACILITY NORMALIZATION MIGRATION
-- Execute this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Run
-- ====================================================================

-- 1. CREATE FACILITIES MASTER TABLE
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_type text not null check (facility_type in ('Hospital', 'Blood Bank')),
  address text,
  district text default 'Trichy',
  state text default 'Tamil Nadu',
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  phone text,
  email text,
  license_number text,
  emergency_contact text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_facility_name_district unique (name, district)
);

-- Enable Row Level Security (RLS) on facilities
alter table public.facilities enable row level security;

-- RLS Policies for facilities
create policy "Allow public read access on facilities"
  on public.facilities for select
  using (true);

create policy "Allow authenticated staff to manage facilities"
  on public.facilities for all
  to authenticated
  using (true)
  with check (true);

-- 2. ADD NULLABLE FOREIGN-KEY COLUMNS (Zero-Downtime: preserves existing text columns)
alter table public.blood_inventory
  add column if not exists facility_id uuid references public.facilities(id) on delete set null;

alter table public.blood_requests
  add column if not exists facility_id uuid references public.facilities(id) on delete set null;

alter table public.transfers
  add column if not exists source_facility_id uuid references public.facilities(id) on delete set null,
  add column if not exists destination_facility_id uuid references public.facilities(id) on delete set null;

-- 3. CREATE PERFORMANCE INDEXES
create index if not exists idx_facilities_facility_type on public.facilities(facility_type);
create index if not exists idx_facilities_district on public.facilities(district);
create index if not exists idx_facilities_state on public.facilities(state);
create index if not exists idx_blood_inventory_facility_id on public.blood_inventory(facility_id);
create index if not exists idx_blood_requests_facility_id on public.blood_requests(facility_id);
create index if not exists idx_transfers_source_facility_id on public.transfers(source_facility_id);
create index if not exists idx_transfers_destination_facility_id on public.transfers(destination_facility_id);

-- 4. SEED REALISTIC SYNTHETIC TRICHY MEDICAL FACILITIES
insert into public.facilities (
  name, facility_type, address, district, state, latitude, longitude, phone, email, license_number, emergency_contact
) values
  (
    'Trichy Blood Bank',
    'Blood Bank',
    '12, Cantonment Main Road, Cantonment',
    'Trichy',
    'Tamil Nadu',
    10.803500,
    78.687200,
    '+91 431 241 0001',
    'contact@trichybloodbank.org',
    'TN-BB-TRY-2021-042',
    '+91 98765 00001'
  ),
  (
    'SRM Hospital',
    'Hospital',
    'SRM Medical College Campus, Irungalur',
    'Trichy',
    'Tamil Nadu',
    10.923400,
    78.739100,
    '+91 431 225 8000',
    'emergency@srmhospitaltrichy.ac.in',
    'TN-HSP-TRY-2018-109',
    '+91 98765 00002'
  ),
  (
    'Kauvery Hospital',
    'Hospital',
    '6, Royal Road, Cantonment',
    'Trichy',
    'Tamil Nadu',
    10.806200,
    78.686500,
    '+91 431 400 6000',
    'bloodbank@kauveryhospital.com',
    'TN-HSP-TRY-2015-088',
    '+91 98765 00003'
  ),
  (
    'Apollo Hospital',
    'Hospital',
    'Chennai-Madurai Highway, Melachinthamani',
    'Trichy',
    'Tamil Nadu',
    10.835400,
    78.694800,
    '+91 431 407 7777',
    'apollo_trichy@apollohospitals.com',
    'TN-HSP-TRY-2017-095',
    '+91 98765 00004'
  ),
  (
    'Trichy Government Hospital',
    'Hospital',
    'Collectorate Road, Cantonment',
    'Trichy',
    'Tamil Nadu',
    10.804100,
    78.685300,
    '+91 431 241 3333',
    'gh_trichy@tn.gov.in',
    'TN-GOV-TRY-1994-001',
    '+91 98765 00005'
  ),
  (
    'MGM Hospital',
    'Hospital',
    'Salai Road, Thillai Nagar',
    'Trichy',
    'Tamil Nadu',
    10.828500,
    78.685700,
    '+91 431 276 4444',
    'info@mgmtrichy.com',
    'TN-HSP-TRY-2019-112',
    '+91 98765 00006'
  ),
  (
    'Cauvery Medical Center',
    'Hospital',
    'Sasthri Road, Tennur',
    'Trichy',
    'Tamil Nadu',
    10.817400,
    78.687900,
    '+91 431 274 5555',
    'help@cmctrichy.org',
    'TN-HSP-TRY-2016-077',
    '+91 98765 00007'
  ),
  (
    'Srirangam PHC',
    'Hospital',
    'Gandhi Road, Srirangam',
    'Trichy',
    'Tamil Nadu',
    10.862200,
    78.698300,
    '+91 431 243 2222',
    'phc_srirangam@tn.gov.in',
    'TN-PHC-TRY-2005-014',
    '+91 98765 00008'
  ),
  (
    'Thillai Nagar Blood Bank',
    'Blood Bank',
    '11th Cross, Thillai Nagar',
    'Trichy',
    'Tamil Nadu',
    10.829100,
    78.686000,
    '+91 431 274 1111',
    'support@thillainagarbloodbank.com',
    'TN-BB-TRY-2020-039',
    '+91 98765 00009'
  )
on conflict (name, district) do nothing;

-- 5. MAP EXISTING DEMO RECORDS TO THE APPROPRIATE FACILITY IDs

-- 5.1 Map Blood Inventory
update public.blood_inventory bi
set facility_id = f.id
from public.facilities f
where (
  bi.hospital = f.name
  or (bi.hospital in ('Government Hospital', 'Trichy GH', 'Govt. Hospital') and f.name = 'Trichy Government Hospital')
)
and bi.facility_id is null;

-- 5.2 Map Blood Requests
update public.blood_requests br
set facility_id = f.id
from public.facilities f
where (
  br.hospital = f.name
  or (br.hospital in ('Government Hospital', 'Trichy GH', 'Govt. Hospital') and f.name = 'Trichy Government Hospital')
)
and br.facility_id is null;

-- 5.3 Map Transfers (Source & Destination)
update public.transfers t
set source_facility_id = f.id
from public.facilities f
where (
  t.from_location = f.name
  or (t.from_location in ('Government Hospital', 'Trichy GH', 'Govt. Hospital') and f.name = 'Trichy Government Hospital')
)
and t.source_facility_id is null;

update public.transfers t
set destination_facility_id = f.id
from public.facilities f
where (
  t.to_location = f.name
  or (t.to_location in ('Government Hospital', 'Trichy GH', 'Govt. Hospital') and f.name = 'Trichy Government Hospital')
)
and t.destination_facility_id is null;
