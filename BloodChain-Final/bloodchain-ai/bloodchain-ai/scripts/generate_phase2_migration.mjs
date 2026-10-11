import fs from "fs";
import { HOSPITAL_MASTER } from "../src/constants/hospitalMasterData.js";

function classifyFacilityType(name) {
  if (!name) return "Hospital";
  const lower = name.toLowerCase();
  if (lower.includes("blood bank") || lower.includes("blood center")) {
    return "Blood Bank";
  }
  if (lower.includes("medical college")) {
    return "Medical College Hospital";
  }
  if (lower.includes("primary health") || lower.includes("phc")) {
    return "PHC";
  }
  if (lower.includes("community health") || lower.includes("chc")) {
    return "CHC";
  }
  if (
    lower.includes("government") ||
    lower.includes("govt.") ||
    lower.includes("govt ") ||
    lower.includes("district headquarters")
  ) {
    return "Government Hospital";
  }
  return "Hospital";
}

const VERIFIED_COORDS = {
  "Tiruchirappalli": {
    "Trichy Blood Bank": { lat: 10.8035, lng: 78.6872, type: "Blood Bank" },
    "SRM Hospital": { lat: 10.9234, lng: 78.7391, type: "Hospital" },
    "Kauvery Hospital": { lat: 10.8062, lng: 78.6865, type: "Hospital" },
    "Kauvery Hospital, Trichy": { lat: 10.8062, lng: 78.6865, type: "Hospital" },
    "Apollo Hospital": { lat: 10.8354, lng: 78.6948, type: "Hospital" },
    "Apollo Speciality Hospitals, Trichy": { lat: 10.8354, lng: 78.6948, type: "Hospital" },
    "Trichy Government Hospital": { lat: 10.8041, lng: 78.6853, type: "Government Hospital" },
    "Mahatma Gandhi Memorial Government Hospital": { lat: 10.8041, lng: 78.6853, type: "Government Hospital" },
    "K.A.P. Viswanatham Government Medical College Hospital": { lat: 10.8041, lng: 78.6853, type: "Medical College Hospital" },
    "Government Hospital, Srirangam": { lat: 10.8622, lng: 78.6983, type: "Government Hospital" },
    "Srirangam PHC": { lat: 10.8622, lng: 78.6983, type: "PHC" },
    "MGM Hospital": { lat: 10.8285, lng: 78.6857, type: "Hospital" },
    "Cauvery Medical Center": { lat: 10.8174, lng: 78.6879, type: "Hospital" },
    "Thillai Nagar Blood Bank": { lat: 10.8291, lng: 78.6860, type: "Blood Bank" },
  }
};

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

function generateSql() {
  let sql = `-- ====================================================================
-- BLOODCHAIN AI — PHASE 2: FACILITY MASTER DATA MIGRATION
-- Authoritative Hospital Master (740 Facilities across 6 States & 74 Districts)
-- Idempotent script: Safe to run multiple times without duplicates or data loss
-- ====================================================================

-- 1. UPDATE FACILITY TYPE CONSTRAINT TO PRESERVE SOURCE DISTINCTIONS
alter table public.facilities drop constraint if exists facilities_facility_type_check;
alter table public.facilities add constraint facilities_facility_type_check
  check (facility_type in (
    'Hospital',
    'Government Hospital',
    'Medical College Hospital',
    'Blood Bank',
    'PHC',
    'CHC'
  ));

-- 2. ENSURE UNIQUE CONSTRAINT EXISTS FOR IDEMPOTENT IMPORTS
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'uq_facility_name_district'
  ) then
    alter table public.facilities add constraint uq_facility_name_district unique (name, district);
  end if;
end $$;

-- 3. INSERT AUTHORITATIVE 740 FACILITIES (PRESERVING EXISTING RECORDS)
insert into public.facilities (
  name,
  facility_type,
  district,
  state,
  latitude,
  longitude,
  is_active
) values
`;

  const rows = [];
  let count = 0;

  for (const [st, dists] of Object.entries(HOSPITAL_MASTER)) {
    const stateName = st === "Delhi" ? "New Delhi / Delhi" : st;
    for (const [dist, hospitals] of Object.entries(dists)) {
      for (const h of hospitals) {
        count++;
        const detectedType = classifyFacilityType(h);
        const verified = VERIFIED_COORDS[dist]?.[h];
        const type = verified?.type || detectedType;
        const lat = verified ? verified.lat : "null";
        const lng = verified ? verified.lng : "null";

        rows.push(
          `  ('${escapeSql(h)}', '${type}', '${escapeSql(dist)}', '${escapeSql(stateName)}', ${lat}, ${lng}, true)`
        );
      }
    }
  }

  sql += rows.join(",\n");
  sql += `
on conflict (name, district) do nothing;

-- 4. VERIFY IMPORT TOTALS
select count(*) as total_facilities,
       count(latitude) as facilities_with_verified_coords,
       count(*) - count(latitude) as facilities_without_coords
from public.facilities;
`;

  fs.writeFileSync("supabase/migration_phase2_facility_master.sql", sql, "utf8");
  console.log(`Successfully generated supabase/migration_phase2_facility_master.sql with ${count} facilities.`);
}

generateSql();
