import { createClient } from "@supabase/supabase-js";

const url = "https://iaaidwwrjpgpktcqynva.supabase.co";
const key = "sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i";
const supabase = createClient(url, key);

async function testInsert() {
  const { data, error } = await supabase
    .from("facilities")
    .insert({
      name: "__test_facility_temp__",
      facility_type: "Government Hospital",
      district: "__test_district__",
      state: "Tamil Nadu",
    })
    .select();

  if (error) {
    console.log("Check constraint active? Error:", error.message);
  } else {
    console.log("Insert succeeded, cleaning up...");
    await supabase.from("facilities").delete().eq("name", "__test_facility_temp__");
  }
}

testInsert();
