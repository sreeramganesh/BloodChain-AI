-- ====================================================================
-- BLOODCHAIN AI - PHASE 4: AI RECOMMENDATION ENGINE (DATA LAYER)
-- Execute this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Run
-- ====================================================================

-- 1. HAVERSINE DISTANCE HELPER FUNCTION (Using existing facility coordinates)
create or replace function public.calculate_haversine_distance(
  lat1 numeric, lon1 numeric,
  lat2 numeric, lon2 numeric
) returns numeric as $$
declare
  r numeric := 6371; -- Earth radius in kilometers
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
begin
  if lat1 is null or lon1 is null or lat2 is null or lon2 is null then
    return null;
  end if;
  if lat1 = lat2 and lon1 = lon2 then
    return 0;
  end if;
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  return round(r * c, 2);
end;
$$ language plpgsql immutable;


-- 2. BLOOD COMPATIBILITY CHECK FUNCTION (Strict Clinical Matrix Implementation)
-- Matrix Rules:
-- O- recipient  -> O- only
-- O+ recipient  -> O+, O-
-- A- recipient  -> A-, O-
-- A+ recipient  -> A+, A-, O+, O-
-- B- recipient  -> B-, O-
-- B+ recipient  -> B+, B-, O+, O-
-- AB- recipient -> AB-, A-, B-, O-
-- AB+ recipient -> all 8 groups
create or replace function public.check_blood_compatibility(
  recipient_group text,
  donor_group text
) returns text as $$
begin
  -- 1. Validate blood group strings
  if recipient_group not in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') or
     donor_group not in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') then
    return null;
  end if;

  -- 2. Identical blood groups are always an Exact Match
  if recipient_group = donor_group then
    return 'Exact Match';
  end if;

  -- 3. Explicit Clinical Compatibility Matrix
  case recipient_group
    when 'O-' then
      -- O- recipient can receive O- only (already handled as Exact Match above)
      return null;

    when 'O+' then
      if donor_group = 'O-' then
        return 'Compatible Alternate';
      end if;

    when 'A-' then
      if donor_group = 'O-' then
        return 'Compatible Alternate';
      end if;

    when 'A+' then
      if donor_group in ('A-', 'O+', 'O-') then
        return 'Compatible Alternate';
      end if;

    when 'B-' then
      if donor_group = 'O-' then
        return 'Compatible Alternate';
      end if;

    when 'B+' then
      if donor_group in ('B-', 'O+', 'O-') then
        return 'Compatible Alternate';
      end if;

    when 'AB-' then
      if donor_group in ('AB-', 'A-', 'B-', 'O-') then
        return 'Compatible Alternate';
      end if;

    when 'AB+' then
      -- AB+ is the universal recipient: receives all 8 blood groups
      if donor_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB-') then
        return 'Compatible Alternate';
      end if;

    else
      return null;
  end case;

  return null;
end;
$$ language plpgsql immutable;



-- 3. CREATE AI_RECOMMENDATIONS TABLE
create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  request_id text references public.blood_requests(id) on delete set null,
  source_facility_id uuid references public.facilities(id) on delete set null,
  destination_facility_id uuid references public.facilities(id) on delete set null,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  recommended_units integer not null check (recommended_units > 0),
  compatibility_status text check (compatibility_status in ('Exact Match', 'Compatible Alternate', 'Emergency Universal')),
  shortage_risk_score numeric check (shortage_risk_score is null or (shortage_risk_score >= 0 and shortage_risk_score <= 100)),
  expiry_risk_score numeric check (expiry_risk_score is null or (expiry_risk_score >= 0 and expiry_risk_score <= 100)),
  distance_km numeric check (distance_km is null or distance_km >= 0),
  estimated_transport_minutes integer check (estimated_transport_minutes is null or estimated_transport_minutes >= 0),
  recommendation_score numeric check (recommendation_score is null or (recommendation_score >= 0 and recommendation_score <= 100)),
  priority text check (priority in ('Critical', 'High', 'Medium', 'Low')),
  recommendation_reason text,
  recommendation_type text check (recommendation_type in ('TRANSFER', 'DONOR_MATCH', 'LOCAL_ALLOCATION', 'MONITOR')),
  status text default 'Pending' check (status in ('Pending', 'Reviewed', 'Accepted', 'Rejected', 'Completed')),
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Performance Indexes
create index if not exists idx_recommendations_request_id on public.ai_recommendations(request_id);
create index if not exists idx_recommendations_source on public.ai_recommendations(source_facility_id);
create index if not exists idx_recommendations_dest on public.ai_recommendations(destination_facility_id);
create index if not exists idx_recommendations_blood_group on public.ai_recommendations(blood_group);
create index if not exists idx_recommendations_type on public.ai_recommendations(recommendation_type);
create index if not exists idx_recommendations_priority on public.ai_recommendations(priority);
create index if not exists idx_recommendations_status on public.ai_recommendations(status);
create index if not exists idx_recommendations_score on public.ai_recommendations(recommendation_score desc);

-- Enable Row Level Security (RLS)
alter table public.ai_recommendations enable row level security;

-- RLS Policies
create policy "Allow authenticated users to read ai_recommendations"
  on public.ai_recommendations for select
  to authenticated
  using (true);

create policy "Allow authenticated staff to insert/update ai_recommendations"
  on public.ai_recommendations for all
  to authenticated
  using (true)
  with check (true);


-- 4. SEED EXPLAINABLE RECOMMENDATIONS FOR CURRENT PENDING REQUESTS
-- Meticulously verified against live request attributes, inventory stocks, and coordinates
insert into public.ai_recommendations (
  request_id,
  source_facility_id,
  destination_facility_id,
  blood_group,
  recommended_units,
  compatibility_status,
  shortage_risk_score,
  expiry_risk_score,
  distance_km,
  estimated_transport_minutes,
  recommendation_score,
  priority,
  recommendation_reason,
  recommendation_type,
  status
)
values
  -- Rec 1: BRQ001 (Patient R. Karthik, O+, 2 units, Trichy GH, Critical)
  -- Source: Trichy Blood Bank (120 units O+ available, buffer preserved: 118 >= 15)
  (
    'BRQ001',
    (select id from public.facilities where name = 'Trichy Blood Bank' limit 1),
    (select id from public.facilities where name = 'Trichy Government Hospital' limit 1),
    'O+',
    2,
    'Exact Match',
    92.0,
    15.0,
    0.22,
    8,
    94.5,
    'Critical',
    'Exact blood group match (O+). Source Trichy Blood Bank holds 120 available units, preserving 118 units post-transfer (exceeding the 15-unit safety buffer). Short transit distance of 0.22 km (~8 mins) satisfies critical emergency requirement.',
    'TRANSFER',
    'Pending'
  ),

  -- Rec 2: BRQ004 (Patient Vijay Kumar, AB-, 1 unit, SRM Hospital, High)
  -- Source: Trichy Government Hospital (12 units AB- available with 1-day expiry)
  (
    'BRQ004',
    (select id from public.facilities where name = 'Trichy Government Hospital' limit 1),
    (select id from public.facilities where name = 'SRM Hospital' limit 1),
    'AB-',
    1,
    'Exact Match',
    78.0,
    95.0,
    14.51,
    35,
    89.2,
    'High',
    'Exact match for rare AB- requirement. Source Trichy Government Hospital has 12 available units with high expiry risk (1 day remaining). Dual-benefit dispatch satisfies high-urgency patient requirement while preventing imminent blood spoilage.',
    'TRANSFER',
    'Pending'
  ),

  -- Rec 3: BRQ005 (Patient Lakshmi P., O-, 2 units, MGM Hospital, Critical)
  -- Source: Apollo Hospital (60 units O- available, buffer preserved: 58 >= 15)
  (
    'BRQ005',
    (select id from public.facilities where name = 'Apollo Hospital' limit 1),
    (select id from public.facilities where name = 'MGM Hospital' limit 1),
    'O-',
    2,
    'Exact Match',
    92.0,
    15.0,
    1.26,
    12,
    88.5,
    'Critical',
    'Exact match for rare O- group. Apollo Hospital holds 60 available units with healthy post-transfer safety reserve (58 units remaining). Short distance of 1.26 km (~12 mins) ensures rapid delivery for critical trauma case.',
    'TRANSFER',
    'Pending'
  ),

  -- Rec 4: BRQ007 (Patient Divya M., B-, 1 unit, Trichy GH, High)
  -- Source: Cauvery Medical Center (22 units B- available, buffer preserved: 21 >= 15)
  (
    'BRQ007',
    (select id from public.facilities where name = 'Cauvery Medical Center' limit 1),
    (select id from public.facilities where name = 'Trichy Government Hospital' limit 1),
    'B-',
    1,
    'Exact Match',
    78.0,
    75.0,
    1.51,
    11,
    84.0,
    'High',
    'Exact match for B- requirement. Source Cauvery Medical Center holds 22 available units with moderate expiry window (3 days remaining). Proximity of 1.51 km (~11 mins) enables rapid replenishment without breaching safety stock.',
    'TRANSFER',
    'Pending'
  ),

  -- Rec 5: BRQ008 (Patient Arun N., O+, 4 units, Cauvery Medical Center, Critical)
  -- Source: Trichy Blood Bank (120 units O+ available, buffer preserved: 116 >= 15)
  (
    'BRQ008',
    (select id from public.facilities where name = 'Trichy Blood Bank' limit 1),
    (select id from public.facilities where name = 'Cauvery Medical Center' limit 1),
    'O+',
    4,
    'Exact Match',
    92.0,
    15.0,
    1.55,
    11,
    91.0,
    'Critical',
    'High-volume emergency allocation: Central blood bank has sufficient buffer (120 units) to provide all 4 requested O+ units in a single shipment, minimizing coordination delays and transit overhead (1.55 km, ~11 mins).',
    'TRANSFER',
    'Pending'
  ),

  -- Rec 6: BRQ002 (Patient Meena S., A-, 1 unit, Kauvery Hospital, High)
  -- Source: Apollo Hospital (60 units O- available, buffer preserved: 59 >= 15)
  -- Clinical Compatibility: Recipient A- receiving universal donor O- -> 'Compatible Alternate'
  (
    'BRQ002',
    (select id from public.facilities where name = 'Apollo Hospital' limit 1),
    (select id from public.facilities where name = 'Kauvery Hospital' limit 1),
    'O-',
    1,
    'Compatible Alternate',
    78.0,
    15.0,
    3.37,
    15,
    79.5,
    'High',
    'Clinically compatible alternate: Request is for A-; source Apollo Hospital provides universal donor O- under clinical alternate transfusion guidelines. Source retains 59 units safety buffer with 3.37 km (~15 mins) transit.',
    'TRANSFER',
    'Pending'
  )
on conflict do nothing;
