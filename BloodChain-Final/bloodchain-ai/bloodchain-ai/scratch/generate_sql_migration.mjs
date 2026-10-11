import fs from 'fs';

const raw = fs.readFileSync('src/constants/syntheticOperationalData.json', 'utf-8');
const { facilities, inventory, requests } = JSON.parse(raw);

console.log('Writing migration_phase9_synthetic_operational_data.sql...');

let sql = `-- ====================================================================
-- BLOODCHAIN AI - PHASE 9: SYNTHETIC OPERATIONAL DATA MIGRATION
-- Target Environment: Supabase SQL Editor (Dashboard -> SQL Editor -> Run)
--
-- Objective:
-- Populates all 740 hospitals across 74 districts in 6 states from the
-- master hospital directory with 8 blood groups * 3 batches = 24 inventory
-- records per hospital (Total: 17,760 inventory records).
--
-- Features:
-- - Clearly marked with data_type = 'Synthetic/Demo'
-- - 100% idempotent: on conflict do nothing & where not exists
-- - Preserves existing Trichy seed facilities, inventory & requests
-- ====================================================================

-- 1. ENSURE SCHEMA SUPPORTS BATCH IDENTIFIER AND DATA TYPE MARKER
alter table public.blood_inventory
  add column if not exists batch_id text,
  add column if not exists data_type text default 'Synthetic/Demo';

create index if not exists idx_blood_inventory_batch_id on public.blood_inventory(batch_id);
create index if not exists idx_blood_inventory_data_type on public.blood_inventory(data_type);

-- 2. INSERT 740 FACILITIES (HOSPITAL MASTER)
insert into public.facilities (name, facility_type, district, state)
values
`;

const facilityValues = facilities.map(f => {
  const cleanName = f.name.replace(/'/g, "''");
  const cleanDist = f.district.replace(/'/g, "''");
  const cleanState = f.state.replace(/'/g, "''");
  return `  ('${cleanName}', 'Hospital', '${cleanDist}', '${cleanState}')`;
}).join(',\n');

sql += facilityValues;
sql += `\non conflict (name, district) do nothing;\n\n`;

// 3. INSERT 17,760 INVENTORY RECORDS IN CHUNKS OF 1,500 ROWS
sql += `-- 3. INSERT 17,760 SYNTHETIC INVENTORY RECORDS (24 PER HOSPITAL)\n`;

const CHUNK_SIZE = 1500;
const totalChunks = Math.ceil(inventory.length / CHUNK_SIZE);

for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
  const chunk = inventory.slice(chunkIdx * CHUNK_SIZE, (chunkIdx + 1) * CHUNK_SIZE);
  sql += `-- Chunk ${chunkIdx + 1} of ${totalChunks} (${chunk.length} records)\n`;
  sql += `insert into public.blood_inventory (
  facility_id, hospital, blood_group, available_units, reserved_units, expiry_date, status, location, batch_id, data_type
)
select
  f.id as facility_id,
  v.hospital,
  v.blood_group,
  v.available_units::integer,
  v.reserved_units::integer,
  v.expiry_date::date,
  v.status,
  v.location,
  v.batch_id,
  'Synthetic/Demo' as data_type
from (
  values\n`;

  const valuesRows = chunk.map(i => {
    const cleanHosp = i.hospital.replace(/'/g, "''");
    const cleanDist = i.district.replace(/'/g, "''");
    return `    ('${cleanHosp}', '${cleanDist}', '${i.blood_group}', ${i.available_units}, ${i.reserved_units}, '${i.expiry_date}', '${i.status}', '${cleanDist}', '${i.batch_id}')`;
  }).join(',\n');

  sql += valuesRows;
  sql += `\n) as v(hospital, district, blood_group, available_units, reserved_units, expiry_date, status, location, batch_id)
join public.facilities f on f.name = v.hospital and f.district = v.district
where not exists (
  select 1 from public.blood_inventory bi where bi.batch_id = v.batch_id
);\n\n`;
}

// 4. INSERT SYNTHETIC BLOOD REQUESTS
sql += `-- 4. INSERT SAMPLE SYNTHETIC BLOOD REQUESTS FOR EXTENDED NETWORK\n`;
sql += `insert into public.blood_requests (
  id, patient_name, blood_group, units_needed, hospital, request_type, urgency, status, reason, district, requested_by, created_at, facility_id
)
select
  v.id,
  v.patient_name,
  v.blood_group,
  v.units_needed::integer,
  v.hospital,
  v.request_type,
  v.urgency,
  v.status,
  v.reason,
  v.district,
  v.requested_by,
  v.created_at::timestamptz,
  f.id as facility_id
from (
  values\n`;

const reqRows = requests.map(r => {
  const cleanHosp = r.hospital.replace(/'/g, "''");
  const cleanPatient = r.patient_name.replace(/'/g, "''");
  const cleanReason = r.reason.replace(/'/g, "''");
  const cleanDist = r.district.replace(/'/g, "''");
  const cleanReqBy = r.requested_by.replace(/'/g, "''");
  return `  ('${r.id}', '${cleanPatient}', '${r.blood_group}', ${r.units_needed}, '${cleanHosp}', '${r.request_type}', '${r.urgency}', '${r.status}', '${cleanReason}', '${cleanDist}', '${cleanReqBy}', '${r.created_at}')`;
}).join(',\n');

sql += reqRows;
sql += `\n) as v(id, patient_name, blood_group, units_needed, hospital, request_type, urgency, status, reason, district, requested_by, created_at)
left join public.facilities f on f.name = v.hospital and f.district = v.district
on conflict (id) do nothing;\n`;

fs.writeFileSync('supabase/migration_phase9_synthetic_operational_data.sql', sql, 'utf-8');
console.log('Successfully wrote supabase/migration_phase9_synthetic_operational_data.sql!');
console.log(`File size: ${(fs.statSync('supabase/migration_phase9_synthetic_operational_data.sql').size / 1024 / 1024).toFixed(2)} MB`);
