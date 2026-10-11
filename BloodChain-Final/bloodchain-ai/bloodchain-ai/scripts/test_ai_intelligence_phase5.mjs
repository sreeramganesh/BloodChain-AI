/**
 * BloodChain AI Assistant — Phase 5 Verification Suite
 * Contextual Intelligence & Advanced Query Understanding
 *
 * Verifies all 21 test sections (A through U):
 * A. Blood-group normalization
 * B. Natural-language inventory questions
 * C. Facility extraction
 * D. District extraction
 * E. State extraction
 * F. Request ID extraction
 * G. Transfer ID extraction
 * H. Risk intent detection
 * I. Demand intent detection
 * J. Contextual follow-up questions
 * K. Multi-condition queries
 * L. Multi-source queries
 * M. Clarification behavior
 * N. Empty data behavior
 * O. Unknown entity behavior
 * P. No hallucinated values
 * Q. No write operations
 * R. No external AI API
 * S. No service-role key
 * T. Phase 3 static knowledge regression
 * U. Phase 4 live query regression
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

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase5TestSuite() {
  console.log("\n=======================================================");
  console.log("  BLOODCHAIN AI ASSISTANT — PHASE 5 VERIFICATION SUITE");
  console.log("=======================================================\n");

  const {
    understandQuery,
    extractBloodGroup,
    extractFacilities,
    extractDistrict,
    extractState,
    extractRequestId,
    extractTransferId,
    VALID_BLOOD_GROUPS,
  } = await import("../src/services/aiAssistant/queryUnderstandingService.js");

  const {
    getBloodChainKnowledgeResponse,
    getStaticKnowledgeResponse,
    classifyQueryType,
  } = await import("../src/services/aiAssistant/knowledgeService.js");

  const liveDataService = await import("../src/services/aiAssistant/liveDataService.js");

  // -------------------------------------------------------------------------
  // A. BLOOD-GROUP NORMALIZATION
  // -------------------------------------------------------------------------
  console.log("[Section A] Blood-Group Normalization");
  assert(extractBloodGroup("Do we have O positive?") === "O+", "normalizes 'O positive' to 'O+'");
  assert(extractBloodGroup("Check O- stock.") === "O-", "normalizes 'O-' to 'O-'");
  assert(extractBloodGroup("How much A positive is available?") === "A+", "normalizes 'A positive' to 'A+'");
  assert(extractBloodGroup("Show A negative units") === "A-", "normalizes 'A negative' to 'A-'");
  assert(extractBloodGroup("Is B positive available?") === "B+", "normalizes 'B positive' to 'B+'");
  assert(extractBloodGroup("Check B negative stock") === "B-", "normalizes 'B negative' to 'B-'");
  assert(extractBloodGroup("What about AB positive?") === "AB+", "normalizes 'AB positive' to 'AB+'");
  assert(extractBloodGroup("Show AB- units") === "AB-", "normalizes 'AB-' to 'AB-'");
  assert(extractBloodGroup("Any Z+ units?") === null, "rejects invalid blood group Z+");
  assert(extractBloodGroup("Check C negative") === null, "rejects invalid blood group C-");
  assert(VALID_BLOOD_GROUPS.length === 8, "exactly 8 canonical blood groups recognized");

  // -------------------------------------------------------------------------
  // B. NATURAL-LANGUAGE INVENTORY QUESTIONS
  // -------------------------------------------------------------------------
  console.log("\n[Section B] Natural-Language Inventory Questions");
  const natInv1 = await getBloodChainKnowledgeResponse("Do we have O positive?");
  assert(natInv1.source === "live-supabase-data", "'Do we have O positive?' resolved to live Supabase data");
  assert(natInv1.answer.includes("Total Available Units: 160 units"), "retrieves actual 160 units for O+");

  const natInv2 = await getBloodChainKnowledgeResponse("Check O- stock.");
  assert(natInv2.source === "live-supabase-data", "'Check O- stock.' resolved to live Supabase data");
  assert(natInv2.answer.includes("Apollo Hospital"), "identifies Apollo Hospital has O- stock");

  const natInv3 = await getBloodChainKnowledgeResponse("How much A+ is available?");
  assert(natInv3.source === "live-supabase-data", "'How much A+ is available?' is live query");
  assert(natInv3.answer.includes("A+"), "answers for blood group A+");

  const natInv4 = await getBloodChainKnowledgeResponse("Any O+ available?");
  assert(natInv4.source === "live-supabase-data", "'Any O+ available?' resolves to live inventory");

  const natInv5 = await getBloodChainKnowledgeResponse("Can I get O+ blood?");
  assert(natInv5.source === "live-supabase-data", "'Can I get O+ blood?' resolves to live inventory");

  // -------------------------------------------------------------------------
  // C. FACILITY EXTRACTION
  // -------------------------------------------------------------------------
  console.log("\n[Section C] Facility Extraction");
  assert(extractFacilities("Check stock at Apollo Hospital")[0] === "Apollo Hospital", "extracts Apollo Hospital");
  assert(extractFacilities("Check stock at Apollo")[0] === "Apollo Hospital", "resolves alias 'Apollo' to 'Apollo Hospital'");
  assert(extractFacilities("How much B+ at Kauvery?")[0] === "Kauvery Hospital", "resolves alias 'Kauvery' to 'Kauvery Hospital'");
  assert(extractFacilities("Find SRM")[0] === "SRM Hospital", "resolves alias 'SRM' to 'SRM Hospital'");
  assert(extractFacilities("Trichy Blood Bank")[0] === "Trichy Blood Bank", "extracts Trichy Blood Bank");

  // -------------------------------------------------------------------------
  // D. DISTRICT EXTRACTION
  // -------------------------------------------------------------------------
  console.log("\n[Section D] District Extraction");
  assert(extractDistrict("Show O+ in Trichy") === "Trichy", "extracts district 'Trichy'");
  assert(extractDistrict("Find blood in Tiruchirappalli") === "Trichy", "normalizes 'Tiruchirappalli' to 'Trichy'");
  assert(extractDistrict("Show requests in Chennai") === "Chennai", "extracts district 'Chennai'");

  // -------------------------------------------------------------------------
  // E. STATE EXTRACTION
  // -------------------------------------------------------------------------
  console.log("\n[Section E] State Extraction");
  assert(extractState("Show facilities in Tamil Nadu") === "Tamil Nadu", "extracts state 'Tamil Nadu'");
  assert(extractState("Facilities in TN") === "Tamil Nadu", "normalizes 'TN' to 'Tamil Nadu'");

  // -------------------------------------------------------------------------
  // F. REQUEST ID EXTRACTION
  // -------------------------------------------------------------------------
  console.log("\n[Section F] Request ID Extraction");
  assert(extractRequestId("What is the status of BRQ001?") === "BRQ001", "extracts 'BRQ001'");
  assert(extractRequestId("Look up BRQ-002") === "BRQ-002", "extracts 'BRQ-002'");
  assert(extractRequestId("Who requested BRQ005?") === "BRQ005", "extracts 'BRQ005'");

  // -------------------------------------------------------------------------
  // G. TRANSFER ID EXTRACTION
  // -------------------------------------------------------------------------
  console.log("\n[Section G] Transfer ID Extraction");
  assert(extractTransferId("What is TRF001?") === "TRF001", "extracts 'TRF001'");
  assert(extractTransferId("Where is TRF-198493-73C?") === "TRF-198493-73C", "extracts 'TRF-198493-73C'");

  // -------------------------------------------------------------------------
  // H. RISK INTENT DETECTION
  // -------------------------------------------------------------------------
  console.log("\n[Section H] Risk Intent Detection");
  const risk1 = understandQuery("Is O+ at shortage risk?");
  assert(risk1.intent === "shortage", "'Is O+ at shortage risk?' -> intent: shortage");
  assert(risk1.entities.bloodGroup === "O+", "extracts bloodGroup O+ for shortage risk");

  const risk2 = understandQuery("What blood expires soon?");
  assert(risk2.intent === "expiry", "'What blood expires soon?' -> intent: expiry");

  const risk3 = understandQuery("Which blood groups are at risk?");
  assert(risk3.intent === "shortage", "'Which blood groups are at risk?' -> intent: shortage");

  // -------------------------------------------------------------------------
  // I. DEMAND INTENT DETECTION
  // -------------------------------------------------------------------------
  console.log("\n[Section I] Demand Intent Detection");
  const dem1 = understandQuery("Forecast for O+");
  assert(dem1.intent === "demand", "'Forecast for O+' -> intent: demand");
  assert(dem1.entities.bloodGroup === "O+", "extracts bloodGroup O+ for demand forecast");

  const dem2 = understandQuery("What is the predicted demand?");
  assert(dem2.intent === "demand", "'What is the predicted demand?' -> intent: demand");

  // -------------------------------------------------------------------------
  // J. CONTEXTUAL FOLLOW-UP QUESTIONS
  // -------------------------------------------------------------------------
  console.log("\n[Section J] Contextual Follow-Up Memory");
  // Turn 1: O+ inventory
  const turn1 = understandQuery("How many O+ units are available?");
  assert(turn1.intent === "inventory" && turn1.entities.bloodGroup === "O+", "Turn 1 established O+ inventory");

  // Turn 2: "What about A+?"
  const turn2 = understandQuery("What about A+?", turn1.contextState);
  assert(turn2.intent === "inventory", "Follow-up 'What about A+?' maintains intent: inventory");
  assert(turn2.entities.bloodGroup === "A+", "Follow-up updates bloodGroup to A+");
  assert(turn2.isFollowUp === true, "isFollowUp flagged as true");

  const liveTurn2Res = await getBloodChainKnowledgeResponse("What about A+?", turn1.contextState);
  assert(liveTurn2Res.source === "live-supabase-data", "follow-up executes live query for A+");
  assert(liveTurn2Res.answer.includes("A+"), "returns live answer for A+");

  // Turn 3: "What about Apollo?" after inventory query
  const turn3 = understandQuery("What about Apollo?", turn2.contextState);
  assert(turn3.intent === "inventory", "Follow-up 'What about Apollo?' retains intent: inventory");
  assert(turn3.entities.facility === "Apollo Hospital", "resolves facility to Apollo Hospital");
  assert(turn3.entities.bloodGroup === "A+", "retains previous bloodGroup A+");

  // Turn 4: Requests follow-up
  const reqTurn1 = understandQuery("Show pending blood requests.");
  const reqTurn2 = understandQuery("What about critical ones?", reqTurn1.contextState);
  assert(reqTurn2.intent === "requests", "Follow-up maintains intent: requests");
  assert(reqTurn2.entities.urgency === "Critical", "updates urgency to Critical");

  // -------------------------------------------------------------------------
  // K. MULTI-CONDITION QUERIES
  // -------------------------------------------------------------------------
  console.log("\n[Section K] Multi-Condition Queries");
  const multiCond1 = await getBloodChainKnowledgeResponse("Show O+ in Trichy.");
  assert(multiCond1.source === "live-supabase-data", "O+ in Trichy is live query");
  assert(multiCond1.answer.includes("Trichy"), "includes Trichy location in response");

  const multiCond2 = await getBloodChainKnowledgeResponse("Show pending critical requests.");
  assert(multiCond2.source === "live-supabase-data", "pending critical requests is live query");
  assert(multiCond2.answer.includes("Critical"), "filters by Critical priority");

  const multiCond3 = await getBloodChainKnowledgeResponse("Show urgent requests in Trichy.");
  assert(multiCond3.source === "live-supabase-data", "urgent requests in Trichy is live query");

  // -------------------------------------------------------------------------
  // L. MULTI-SOURCE QUERIES
  // -------------------------------------------------------------------------
  console.log("\n[Section L] Multi-Source Queries");
  const multiSourceRes = await getBloodChainKnowledgeResponse("Do we have O+ and are there any shortage risks?");
  assert(multiSourceRes.source === "live-supabase-data", "multi-source query marked as live-supabase-data");
  assert(multiSourceRes.answer.includes("Current inventory") || multiSourceRes.answer.includes("Blood Availability"), "multi-source includes blood availability");
  assert(multiSourceRes.answer.includes("Shortage risk") || multiSourceRes.answer.includes("Shortage Risk Assessment"), "multi-source includes shortage risk assessment");
  assert(multiSourceRes.answer.includes("160"), "includes real live inventory units (160)");

  // Comparison Query
  const compRes = await getBloodChainKnowledgeResponse("Which has more O+ stock, Apollo or Kauvery?");
  assert(compRes.source === "live-supabase-data", "comparison query marked as live-supabase-data");
  assert(compRes.answer.includes("Blood Stock Comparison"), "formats as blood stock comparison");
  assert(compRes.answer.includes("Apollo Hospital") && compRes.answer.includes("Kauvery Hospital"), "mentions both facilities");

  // -------------------------------------------------------------------------
  // M. CLARIFICATION BEHAVIOR
  // -------------------------------------------------------------------------
  console.log("\n[Section M] Clarification Questions");
  const clar1 = await getBloodChainKnowledgeResponse("Show blood");
  assert(clar1.topic === "clarification", "vague query 'Show blood' triggers clarification");
  assert(clar1.answer.includes("Which blood group should I check?"), "asks user to specify blood group");

  const clar2 = await getBloodChainKnowledgeResponse("Check Apollo");
  assert(clar2.topic === "clarification", "'Check Apollo' triggers clarification");
  assert(clar2.answer.includes("Which blood group should I check at Apollo Hospital"), "asks for blood group at Apollo Hospital");

  // -------------------------------------------------------------------------
  // N. EMPTY DATA BEHAVIOR
  // -------------------------------------------------------------------------
  console.log("\n[Section N] Empty Data Behavior (Zero Fabrication)");
  const emptyRes = await liveDataService.getLiveBloodInventory({ bloodGroup: "Z+" });
  assert(emptyRes.success === true && emptyRes.data.length === 0, "empty query returns empty array cleanly");

  // -------------------------------------------------------------------------
  // O. UNKNOWN ENTITY BEHAVIOR
  // -------------------------------------------------------------------------
  console.log("\n[Section O] Unknown Identifier Handling");
  const unkReq = await getBloodChainKnowledgeResponse("What is BRQ999?");
  assert(unkReq.answer.includes("couldn't find a live blood request with ID \"BRQ999\""), "gracefully handles unknown BRQ999");

  const unkTrf = await getBloodChainKnowledgeResponse("What about TRF999?");
  assert(unkTrf.answer.includes("couldn't find a live blood transfer with ID \"TRF999\""), "gracefully handles unknown TRF999");

  // -------------------------------------------------------------------------
  // P. NO HALLUCINATED VALUES
  // -------------------------------------------------------------------------
  console.log("\n[Section P] No Hallucinated Values");
  const shortageCheck = await getBloodChainKnowledgeResponse("Is O+ at shortage risk?");
  assert(
    shortageCheck.answer.includes("No active shortage risk records are currently logged in the live database") ||
    shortageCheck.answer.includes("not logged"),
    "does not hallucinate risk scores when 0 rows in database"
  );

  // -------------------------------------------------------------------------
  // Q. NO WRITE OPERATIONS IN ASSISTANT CODE
  // -------------------------------------------------------------------------
  console.log("\n[Section Q] Read-Only Safety (Zero Database Mutations)");
  const codeLiveData = fs.readFileSync(path.join(projectRoot, "src/services/aiAssistant/liveDataService.js"), "utf-8");
  const codeQueryUnderstanding = fs.readFileSync(path.join(projectRoot, "src/services/aiAssistant/queryUnderstandingService.js"), "utf-8");
  const codeKnowledge = fs.readFileSync(path.join(projectRoot, "src/services/aiAssistant/knowledgeService.js"), "utf-8");
  const combinedCode = codeLiveData + codeQueryUnderstanding + codeKnowledge;

  assert(!/\.insert\s*\(/i.test(combinedCode), "Contains zero .insert() calls");
  assert(!/\.update\s*\(/i.test(combinedCode), "Contains zero .update() calls");
  assert(!/\.delete\s*\(/i.test(combinedCode), "Contains zero .delete() calls");
  assert(!/\.upsert\s*\(/i.test(combinedCode), "Contains zero .upsert() calls");

  // -------------------------------------------------------------------------
  // R. NO EXTERNAL AI API
  // -------------------------------------------------------------------------
  console.log("\n[Section R] No External AI APIs");
  assert(!combinedCode.includes("api.openai.com"), "No OpenAI endpoints");
  assert(!combinedCode.includes("anthropic.com"), "No Anthropic endpoints");
  assert(!combinedCode.includes("@google/generative-ai"), "No Gemini external SDK");

  // -------------------------------------------------------------------------
  // S. NO SERVICE-ROLE KEY
  // -------------------------------------------------------------------------
  console.log("\n[Section S] No Supabase Service-Role Key");
  assert(!combinedCode.includes("service_role"), "Zero service_role key usage");

  // -------------------------------------------------------------------------
  // T. PHASE 3 STATIC KNOWLEDGE REGRESSION
  // -------------------------------------------------------------------------
  console.log("\n[Section T] Phase 3 Static Knowledge Regression");
  const stat1 = await getBloodChainKnowledgeResponse("What is BloodChain?");
  assert(stat1.source === "bloodchain-knowledge", "'What is BloodChain?' is verified knowledge");
  assert(stat1.topic === "platform", "topic is platform");

  const stat2 = await getBloodChainKnowledgeResponse("What is shortage risk?");
  assert(stat2.source === "bloodchain-knowledge", "'What is shortage risk?' is verified knowledge");
  assert(stat2.topic === "shortageRisk", "topic is shortageRisk");

  const stat3 = await getBloodChainKnowledgeResponse("How does BloodChain recommend a source?");
  assert(stat3.source === "bloodchain-knowledge", "'How does BloodChain recommend a source?' is verified knowledge");
  assert(stat3.topic === "aiRecommendations", "topic is aiRecommendations");

  const stat4 = await getBloodChainKnowledgeResponse("How do I create a blood request?");
  assert(stat4.source === "bloodchain-knowledge", "'How do I create a blood request?' is verified knowledge");
  assert(stat4.topic === "bloodRequests", "topic is bloodRequests");

  // -------------------------------------------------------------------------
  // U. PHASE 4 LIVE QUERY REGRESSION
  // -------------------------------------------------------------------------
  console.log("\n[Section U] Phase 4 Live Query Regression");
  const p4Inv = await getBloodChainKnowledgeResponse("How many O+ units are available?");
  assert(p4Inv.source === "live-supabase-data" && p4Inv.topic === "liveBloodInventory", "Phase 4 inventory query preserved");

  const p4Req = await getBloodChainKnowledgeResponse("What is the status of BRQ001?");
  assert(p4Req.source === "live-supabase-data" && p4Req.topic === "liveBloodRequests", "Phase 4 BRQ001 query preserved");

  const p4Trf = await getBloodChainKnowledgeResponse("What is the status of TRF001?");
  assert(p4Trf.source === "live-supabase-data" && p4Trf.topic === "liveTransfers", "Phase 4 TRF001 query preserved");

  const p4Fac = await getBloodChainKnowledgeResponse("Show available blood banks.");
  assert(p4Fac.source === "live-supabase-data" && p4Fac.topic === "liveFacilities", "Phase 4 blood banks query preserved");

  console.log("\n=======================================================");
  console.log(`  PHASE 5 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5TestSuite().catch((err) => {
  console.error("Test suite runner crashed:", err);
  process.exit(1);
});
