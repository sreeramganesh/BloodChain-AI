import { createClient } from "@supabase/supabase-js";

const url = "https://iaaidwwrjpgpktcqynva.supabase.co";
const key = "sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i";
const supabase = createClient(url, key);

async function inspectDb() {
  const tables = [
    "profiles",
    "facilities",
    "blood_inventory",
    "blood_requests",
    "donors",
    "donations",
    "historical_demand",
    "demand_predictions",
    "shortage_risks",
    "expiry_risks",
    "ai_recommendations",
    "transfers",
  ];

  console.log("=== SUPABASE BASELINE COUNTS ===");
  for (const t of tables) {
    try {
      const { count, error } = await supabase
        .from(t)
        .select("*", { count: "exact", head: true });
      if (error) {
        console.log(`${t}: Error -> ${error.message}`);
      } else {
        console.log(`${t}: ${count} records`);
      }
    } catch (e) {
      console.log(`${t}: Exception -> ${e.message}`);
    }
  }

  // Also inspect existing facilities in DB
  try {
    const { data: facs, error: facErr } = await supabase
      .from("facilities")
      .select("id, name, facility_type, district, state, latitude, longitude");
    if (!facErr && facs) {
      console.log(`\nExisting facilities in DB (${facs.length}):`);
      facs.slice(0, 10).forEach((f) => {
        console.log(`- ${f.name} (${f.facility_type}) in ${f.district}, ${f.state} [lat: ${f.latitude}, lng: ${f.longitude}]`);
      });
    }
  } catch (e) {
    console.log("Facilities query error:", e.message);
  }
}

inspectDb();
