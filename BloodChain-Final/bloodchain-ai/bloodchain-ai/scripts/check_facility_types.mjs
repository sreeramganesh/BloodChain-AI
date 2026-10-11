import { createClient } from "@supabase/supabase-js";

const url = "https://iaaidwwrjpgpktcqynva.supabase.co";
const key = "sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i";
const supabase = createClient(url, key);

async function testFacilityTypeCheck() {
  console.log("=== TESTING FACILITY TYPE CONSTRAINT ===");

  // Let's test what facility_type values exist currently
  const { data, error } = await supabase
    .from("facilities")
    .select("facility_type");
  
  if (error) {
    console.log("Error selecting facility_type:", error.message);
  } else {
    const types = [...new Set(data.map(d => d.facility_type))];
    console.log("Existing facility_types in DB:", types);
  }
}

testFacilityTypeCheck();
