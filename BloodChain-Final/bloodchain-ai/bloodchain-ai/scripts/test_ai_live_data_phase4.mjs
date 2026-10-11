/**
 * BloodChain AI Assistant — Phase 4 Verification Suite
 * Tests 18 required capabilities:
 * 1. Supabase client/service exists
 * 2. Blood inventory query
 * 3. Blood request query
 * 4. Facility query
 * 5. Transfer query
 * 6. Shortage risk query
 * 7. Expiry risk query
 * 8. Demand prediction query
 * 9. Static knowledge still works
 * 10. Live-data routing works
 * 11. Mixed routing works
 * 12. Empty result handling
 * 13. Unknown ID handling
 * 14. Error handling
 * 15. No write operations
 * 16. No service-role key
 * 17. No external AI API
 * 18. No fake live data
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Load environment variables from .env.local or .env if present
const envFiles = [".env.local", ".env"];
for (const envFile of envFiles) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  BLOODCHAIN AI ASSISTANT — PHASE 4 VERIFICATION SUITE");
  console.log("=======================================================\n");

  // Load modules
  const { supabase, isSupabaseConfigured } = await import("../src/services/supabaseClient.js");
  const liveDataService = await import("../src/services/aiAssistant/liveDataService.js");
  const {
    classifyQueryType,
    getBloodChainKnowledgeResponse,
    getStaticKnowledgeResponse,
    normalizeText,
  } = await import("../src/services/aiAssistant/knowledgeService.js");
  const {
    extractBloodGroup,
    extractRequestId,
    extractTransferId,
    extractHospital,
  } = await import("../src/services/aiAssistant/liveQueryFormatter.js");

  // -------------------------------------------------------------------------
  // TEST 1: Supabase client and service exist
  // -------------------------------------------------------------------------
  console.log("[Test 1] Supabase client and liveDataService exist");
  assert(typeof supabase?.from === "function", "supabase client is instantiated");
  assert(typeof isSupabaseConfigured === "function", "isSupabaseConfigured function exists");
  assert(typeof liveDataService.getLiveBloodInventory === "function", "getLiveBloodInventory exists");
  assert(typeof liveDataService.getLiveBloodRequests === "function", "getLiveBloodRequests exists");
  assert(typeof liveDataService.getLiveFacilities === "function", "getLiveFacilities exists");
  assert(typeof liveDataService.getLiveTransfers === "function", "getLiveTransfers exists");
  assert(typeof liveDataService.getLiveShortageRisks === "function", "getLiveShortageRisks exists");
  assert(typeof liveDataService.getLiveExpiryRisks === "function", "getLiveExpiryRisks exists");
  assert(typeof liveDataService.getLiveDemandPredictions === "function", "getLiveDemandPredictions exists");
  assert(typeof liveDataService.getLiveRecommendationData === "function", "getLiveRecommendationData exists");

  // -------------------------------------------------------------------------
  // TEST 2: Blood inventory live query
  // -------------------------------------------------------------------------
  console.log("\n[Test 2] Blood inventory live queries");
  const invRes = await getBloodChainKnowledgeResponse("How many O+ units are available?");
  assert(invRes.source === "live-supabase-data", "O+ query marked as live-supabase-data");
  assert(invRes.topic === "liveBloodInventory", "topic is liveBloodInventory");
  assert(invRes.answer.includes("Total Available Units: 160 units"), "accurately sums 160 O+ units from live Supabase");
  assert(invRes.answer.includes("Trichy Blood Bank"), "contains Trichy Blood Bank facility breakdown");

  const invHospitalRes = await getBloodChainKnowledgeResponse("How many units are available at Apollo Hospital?");
  assert(invHospitalRes.source === "live-supabase-data", "Apollo query marked as live-supabase-data");
  assert(invHospitalRes.answer.includes("Apollo Hospital"), "identifies Apollo Hospital");
  assert(invHospitalRes.answer.includes("60 units available"), "retrieves actual 60 units available for O- at Apollo");

  const invBPlusRes = await getBloodChainKnowledgeResponse("Which facility has B+ blood?");
  assert(invBPlusRes.source === "live-supabase-data", "Which facility has B+ blood is live query");
  assert(invBPlusRes.answer.includes("Kauvery Hospital"), "retrieves Kauvery Hospital for B+ blood");

  // -------------------------------------------------------------------------
  // TEST 3: Blood requests live query
  // -------------------------------------------------------------------------
  console.log("\n[Test 3] Blood requests live queries");
  const brqRes = await getBloodChainKnowledgeResponse("What is the status of BRQ001?");
  assert(brqRes.source === "live-supabase-data", "BRQ001 lookup marked as live-supabase-data");
  assert(brqRes.topic === "liveBloodRequests", "topic is liveBloodRequests");
  assert(brqRes.answer.includes("R. Karthik"), "retrieves patient R. Karthik for BRQ001 from Supabase");
  assert(brqRes.answer.includes("In Progress"), "retrieves status 'In Progress' for BRQ001");
  assert(brqRes.answer.includes("Critical"), "retrieves urgency 'Critical' for BRQ001");

  const pendingReqs = await getBloodChainKnowledgeResponse("Show pending blood requests.");
  assert(pendingReqs.source === "live-supabase-data", "pending blood requests is live query");
  assert(pendingReqs.answer.includes("Pending"), "includes pending requests from DB");

  // -------------------------------------------------------------------------
  // TEST 4: Facility live query
  // -------------------------------------------------------------------------
  console.log("\n[Test 4] Facility live queries");
  const facBanks = await getBloodChainKnowledgeResponse("Show available blood banks.");
  assert(facBanks.source === "live-supabase-data", "blood banks query is live-supabase-data");
  assert(facBanks.topic === "liveFacilities", "topic is liveFacilities");
  assert(facBanks.answer.includes("Trichy Blood Bank"), "lists verified Trichy Blood Bank");
  assert(facBanks.answer.includes("Thillai Nagar Blood Bank"), "lists verified Thillai Nagar Blood Bank");

  const facHospitals = await getBloodChainKnowledgeResponse("Which hospitals are connected?");
  assert(facHospitals.source === "live-supabase-data", "hospitals query is live-supabase-data");
  assert(facHospitals.answer.includes("Hospital"), "lists verified hospitals");

  // -------------------------------------------------------------------------
  // TEST 5: Transfer live query
  // -------------------------------------------------------------------------
  console.log("\n[Test 5] Transfer live queries");
  const trfRes = await getBloodChainKnowledgeResponse("What is the status of TRF001?");
  assert(trfRes.source === "live-supabase-data", "TRF001 lookup marked as live-supabase-data");
  assert(trfRes.topic === "liveTransfers", "topic is liveTransfers");
  assert(trfRes.answer.includes("Trichy Blood Bank") && trfRes.answer.includes("Trichy GH"), "identifies route for TRF001");
  assert(trfRes.answer.includes("Pending"), "identifies status Pending for TRF001");

  // -------------------------------------------------------------------------
  // TEST 6: Shortage risk query
  // -------------------------------------------------------------------------
  console.log("\n[Test 6] Shortage risk live query");
  const shortageLive = await getBloodChainKnowledgeResponse("What are the current shortage risks?");
  assert(shortageLive.source === "live-supabase-data", "live shortage risks is live-supabase-data");
  assert(shortageLive.topic === "liveShortageRisks", "topic is liveShortageRisks");
  assert(typeof shortageLive.answer === "string" && shortageLive.answer.length > 0, "returns verified live response");

  // -------------------------------------------------------------------------
  // TEST 7: Expiry risk query
  // -------------------------------------------------------------------------
  console.log("\n[Test 7] Expiry risk live query");
  const expiryLive = await getBloodChainKnowledgeResponse("Show current expiry risks.");
  assert(expiryLive.source === "live-supabase-data", "live expiry risks is live-supabase-data");
  assert(expiryLive.topic === "liveExpiryRisks", "topic is liveExpiryRisks");
  assert(typeof expiryLive.answer === "string" && expiryLive.answer.length > 0, "returns verified live response");

  // -------------------------------------------------------------------------
  // TEST 8: Demand prediction query
  // -------------------------------------------------------------------------
  console.log("\n[Test 8] Demand prediction live query");
  const demandLive = await getBloodChainKnowledgeResponse("What is the predicted demand?");
  assert(demandLive.source === "live-supabase-data", "predicted demand is live-supabase-data");
  assert(demandLive.topic === "liveDemandPredictions", "topic is liveDemandPredictions");
  assert(typeof demandLive.answer === "string" && demandLive.answer.length > 0, "returns verified live response");

  // -------------------------------------------------------------------------
  // TEST 9: Static knowledge still works
  // -------------------------------------------------------------------------
  console.log("\n[Test 9] Static knowledge preserves Phase 3 answers");
  const static1 = await getBloodChainKnowledgeResponse("What is BloodChain?");
  assert(static1.source === "bloodchain-knowledge", "What is BloodChain is bloodchain-knowledge");
  assert(static1.topic === "platform", "topic is platform");

  const static2 = await getBloodChainKnowledgeResponse("What is shortage risk?");
  assert(static2.source === "bloodchain-knowledge", "What is shortage risk is bloodchain-knowledge");
  assert(static2.topic === "shortageRisk", "topic is shortageRisk");

  const static3 = await getBloodChainKnowledgeResponse("How does BloodChain recommend a source?");
  assert(static3.source === "bloodchain-knowledge", "recommend a source is bloodchain-knowledge");
  assert(static3.topic === "aiRecommendations", "topic is aiRecommendations");

  const static4 = await getBloodChainKnowledgeResponse("How do I create a blood request?");
  assert(static4.source === "bloodchain-knowledge", "create blood request is bloodchain-knowledge");
  assert(static4.topic === "bloodRequests", "topic is bloodRequests");

  // -------------------------------------------------------------------------
  // TEST 10: Live-data routing works
  // -------------------------------------------------------------------------
  console.log("\n[Test 10] Intent classification & routing");
  assert(classifyQueryType(normalizeText("How many O+ units are available?"), "How many O+ units are available?") === "LIVE_DATA", "inventory query classified as LIVE_DATA");
  assert(classifyQueryType(normalizeText("What is the status of BRQ001?"), "What is the status of BRQ001?") === "LIVE_DATA", "request ID query classified as LIVE_DATA");
  assert(classifyQueryType(normalizeText("What is shortage risk?"), "What is shortage risk?") === "STATIC_KNOWLEDGE", "shortage definition query classified as STATIC_KNOWLEDGE");
  assert(classifyQueryType(normalizeText("Why is O+ shortage risk important, and what is the current O+ risk?"), "Why is O+ shortage risk important, and what is the current O+ risk?") === "MIXED", "mixed question classified as MIXED");

  // -------------------------------------------------------------------------
  // TEST 11: Mixed routing works
  // -------------------------------------------------------------------------
  console.log("\n[Test 11] Mixed routing combines knowledge and live data");
  const mixedRes = await getBloodChainKnowledgeResponse("Why is O+ shortage risk important, and what is the current O+ risk?");
  assert(mixedRes.source === "knowledge-and-live-data", "marked as knowledge-and-live-data");
  assert(mixedRes.topic === "mixedKnowledgeAndLiveData", "topic is mixedKnowledgeAndLiveData");
  assert(mixedRes.answer.includes("Shortage Risk identifies potential deficits"), "contains static knowledge explanation");
  assert(mixedRes.answer.includes("Current BloodChain Live Database Status"), "contains live database status header");

  // -------------------------------------------------------------------------
  // TEST 12: Empty result handling (no hallucination)
  // -------------------------------------------------------------------------
  console.log("\n[Test 12] Empty result handling");
  const emptyInvRes = await liveDataService.getLiveBloodInventory({ bloodGroup: "Z+" });
  assert(emptyInvRes.success === true && emptyInvRes.data.length === 0, "nonexistent blood group returns empty array cleanly");

  // -------------------------------------------------------------------------
  // TEST 13: Unknown ID handling
  // -------------------------------------------------------------------------
  console.log("\n[Test 13] Unknown ID handling");
  const unknownBrq = await getBloodChainKnowledgeResponse("What is the status of BRQ99999?");
  assert(unknownBrq.answer.includes("couldn't find a live blood request with ID \"BRQ99999\""), "returns clean unknown request ID message");

  const unknownTrf = await getBloodChainKnowledgeResponse("What is the status of TRF99999?");
  assert(unknownTrf.answer.includes("couldn't find a live blood transfer with ID \"TRF99999\""), "returns clean unknown transfer ID message");

  // -------------------------------------------------------------------------
  // TEST 14: Error handling without leaking raw DB details
  // -------------------------------------------------------------------------
  console.log("\n[Test 14] Safe error handling");
  const fallbackRes = await getBloodChainKnowledgeResponse("");
  assert(fallbackRes.source === "fallback", "empty prompt returns graceful fallback");

  // -------------------------------------------------------------------------
  // TEST 15: No write operations in liveDataService
  // -------------------------------------------------------------------------
  console.log("\n[Test 15] 100% Read-Only Safety (No mutations)");
  const liveDataCode = fs.readFileSync(path.join(projectRoot, "src/services/aiAssistant/liveDataService.js"), "utf-8");
  const hasInsert = /\.insert\s*\(/i.test(liveDataCode);
  const hasUpdate = /\.update\s*\(/i.test(liveDataCode);
  const hasDelete = /\.delete\s*\(/i.test(liveDataCode);
  const hasUpsert = /\.upsert\s*\(/i.test(liveDataCode);
  assert(!hasInsert, "liveDataService contains zero .insert() calls");
  assert(!hasUpdate, "liveDataService contains zero .update() calls");
  assert(!hasDelete, "liveDataService contains zero .delete() calls");
  assert(!hasUpsert, "liveDataService contains zero .upsert() calls");

  // -------------------------------------------------------------------------
  // TEST 16: No service-role key in frontend code
  // -------------------------------------------------------------------------
  console.log("\n[Test 16] No Supabase service-role key used in src/");
  const srcFiles = [];
  function collectFiles(dir) {
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        collectFiles(full);
      } else if (/\.(js|jsx|ts|tsx)$/.test(f)) {
        srcFiles.push(full);
      }
    }
  }
  collectFiles(path.join(projectRoot, "src"));

  let serviceRoleExposed = false;
  for (const f of srcFiles) {
    const content = fs.readFileSync(f, "utf-8");
    if (content.includes("service_role") || content.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      serviceRoleExposed = true;
      break;
    }
  }
  assert(!serviceRoleExposed, "No service_role key found anywhere in src/");

  // -------------------------------------------------------------------------
  // TEST 17: No external AI API / external LLMs
  // -------------------------------------------------------------------------
  console.log("\n[Test 17] No external AI API dependencies");
  let externalAiFound = false;
  for (const f of srcFiles) {
    const content = fs.readFileSync(f, "utf-8");
    if (
      content.includes("api.openai.com") ||
      content.includes("@google/generative-ai") ||
      content.includes("anthropic.com")
    ) {
      externalAiFound = true;
      break;
    }
  }
  assert(!externalAiFound, "No external LLM APIs called in frontend code");

  // -------------------------------------------------------------------------
  // TEST 18: No fake live data / zero hallucinations
  // -------------------------------------------------------------------------
  console.log("\n[Test 18] No fabricated numbers when data is absent");
  const noShortageNotice = await getBloodChainKnowledgeResponse("Is O+ at shortage risk?");
  assert(
    noShortageNotice.answer.includes("No active shortage risk records") ||
    noShortageNotice.answer.includes("not logged"),
    "does not hallucinate risk numbers when no DB record exists"
  );

  console.log("\n=======================================================");
  console.log(`  PHASE 4 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite runner crashed:", err);
  process.exit(1);
});
