/**
 * BloodChain AI Assistant — Phase 6 Decision Support & Explainability Verification Suite
 *
 * Minimum Test Sections:
 * A. Recommendation explanation
 * B. Source-selection explanation
 * C. Shortage-risk explanation
 * D. Expiry-risk explanation
 * E. Demand-prediction explanation
 * F. Request decision support
 * G. Transfer decision support
 * H. Human-review safeguard
 * I. Missing recommendation data
 * J. Missing shortage data
 * K. Missing expiry data
 * L. Missing prediction data
 * M. Contextual explanation follow-up
 * N. Source/badge correctness
 * O. No fabricated values
 * P. No database writes
 * Q. No external LLM
 * R. No service-role key
 * S. Phase 3 regression
 * T. Phase 4 regression
 * U. Phase 5 regression
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

async function runPhase6Tests() {
  console.log("\n=======================================================");
  console.log("  BLOODCHAIN AI ASSISTANT — PHASE 6 VERIFICATION SUITE");
  console.log("=======================================================\n");

  // Load modules
  const {
    getBloodChainKnowledgeResponse,
    getStaticKnowledgeResponse,
    classifyQueryType,
  } = await import("../src/services/aiAssistant/knowledgeService.js");

  const { understandQuery } = await import(
    "../src/services/aiAssistant/queryUnderstandingService.js"
  );

  const decisionSupportService = await import(
    "../src/services/aiAssistant/decisionSupportService.js"
  );

  const liveDataService = await import(
    "../src/services/aiAssistant/liveDataService.js"
  );

  // -------------------------------------------------------------------------
  // A. RECOMMENDATION EXPLANATION
  // -------------------------------------------------------------------------
  console.log("[Section A] Recommendation Explanation");
  const recParsed = understandQuery("Why was this recommendation being made?");
  assert(recParsed.intent === "explain_recommendation", "detects explain_recommendation intent");

  const recResp = await getBloodChainKnowledgeResponse("Why was this recommendation being made?");
  assert(recResp.topic === "decisionSupport", "routed to decisionSupport topic");
  assert(recResp.category === "Decision Support", "category is Decision Support");
  assert(
    recResp.answer.includes("Recommendation Explanation") ||
    recResp.answer.includes("no stored AI recommendation records"),
    "explains stored factors or reports no stored recommendation records"
  );

  const factorsQuery = await getBloodChainKnowledgeResponse("What factors affect this recommendation?");
  assert(factorsQuery.topic === "decisionSupport", "factors inquiry routed to decisionSupport");

  // -------------------------------------------------------------------------
  // B. SOURCE-SELECTION EXPLANATION
  // -------------------------------------------------------------------------
  console.log("\n[Section B] Source-Selection Explanation");
  const srcSelParsed = understandQuery("Why choose Apollo?");
  assert(srcSelParsed.intent === "explain_source_selection", "detects explain_source_selection intent");

  const srcSelResp = await getBloodChainKnowledgeResponse("Why choose Apollo?");
  assert(srcSelResp.topic === "decisionSupport", "source selection routed to decisionSupport");
  assert(srcSelResp.answer.includes("Apollo Hospital"), "explains Apollo Hospital sourcing");
  assert(srcSelResp.answer.includes("Stock status") || srcSelResp.answer.includes("stock"), "explains stock status");
  assert(!srcSelResp.answer.includes("best") && !srcSelResp.answer.includes("perfect"), "does not use subjective superlatives");

  const compSources = await getBloodChainKnowledgeResponse("Compare possible sources.");
  assert(compSources.topic === "decisionSupport", "compare possible sources routed to decisionSupport");
  assert(compSources.answer.includes("Source Comparison"), "formats as Source Comparison");

  // -------------------------------------------------------------------------
  // C. SHORTAGE-RISK EXPLANATION
  // -------------------------------------------------------------------------
  console.log("\n[Section C] Shortage-Risk Explanation");
  const shortExpParsed = understandQuery("Why is O+ at shortage risk?");
  assert(shortExpParsed.intent === "explain_shortage", "detects explain_shortage intent");
  assert(shortExpParsed.entities.bloodGroup === "O+", "extracts bloodGroup O+");

  const shortExpResp = await getBloodChainKnowledgeResponse("Why is O+ at shortage risk?");
  assert(shortExpResp.topic === "decisionSupport", "shortage explanation routed to decisionSupport");
  assert(
    shortExpResp.answer.includes("no active shortage-risk record") ||
    shortExpResp.answer.includes("Shortage Risk Evaluation"),
    "truthfully explains active stored shortage data or reports zero active records"
  );

  const shortFactors = await getBloodChainKnowledgeResponse("What factors contribute to shortage?");
  assert(shortFactors.topic === "decisionSupport", "shortage factors routed to decisionSupport");

  // -------------------------------------------------------------------------
  // D. EXPIRY-RISK EXPLANATION
  // -------------------------------------------------------------------------
  console.log("\n[Section D] Expiry-Risk Explanation");
  const expParsed = understandQuery("Why is this blood expiring soon?");
  assert(expParsed.intent === "explain_expiry", "detects explain_expiry intent");

  const expResp = await getBloodChainKnowledgeResponse("Why is this blood expiring soon?");
  assert(expResp.topic === "decisionSupport", "expiry explanation routed to decisionSupport");
  assert(
    expResp.answer.includes("no active expiry-risk records") ||
    expResp.answer.includes("FEFO"),
    "truthfully explains active stored expiry data or reports zero active records"
  );

  const fefoQuery = await getBloodChainKnowledgeResponse("Which stock should be used first?");
  assert(fefoQuery.topic === "decisionSupport", "FEFO query routed to decisionSupport");

  // -------------------------------------------------------------------------
  // E. DEMAND-PREDICTION EXPLANATION
  // -------------------------------------------------------------------------
  console.log("\n[Section E] Demand-Prediction Explanation");
  const demandParsed = understandQuery("Why is demand predicted to increase?");
  assert(demandParsed.intent === "explain_demand", "detects explain_demand intent");

  const demandResp = await getBloodChainKnowledgeResponse("Why is demand predicted to increase?");
  assert(demandResp.topic === "decisionSupport", "demand prediction explanation routed to decisionSupport");
  assert(
    demandResp.answer.includes("no stored demand predictions") ||
    demandResp.answer.includes("BloodChain's stored demand prediction"),
    "truthfully explains stored forecasts or reports zero stored predictions"
  );

  // -------------------------------------------------------------------------
  // F. REQUEST DECISION SUPPORT
  // -------------------------------------------------------------------------
  console.log("\n[Section F] Request Decision Support");
  const reqDsParsed = understandQuery("How should I review BRQ001?");
  assert(reqDsParsed.intent === "decision_support_request", "detects decision_support_request intent");
  assert(reqDsParsed.entities.requestId === "BRQ001", "extracts requestId BRQ001");

  const reqDsResp = await getBloodChainKnowledgeResponse("How should I review BRQ001?");
  assert(reqDsResp.topic === "decisionSupport", "request decision support routed to decisionSupport");
  assert(reqDsResp.answer.includes("Decision Support Summary for BRQ001"), "contains Decision Support Summary header");
  assert(reqDsResp.answer.includes("R. Karthik"), "identifies patient R. Karthik");
  assert(reqDsResp.answer.includes("Critical"), "identifies Critical urgency");
  assert(reqDsResp.answer.includes("Current Matching Inventory"), "includes live matching inventory section");
  assert(reqDsResp.answer.includes("Risk Information"), "includes risk information section");
  assert(!reqDsResp.answer.includes("Approve this request"), "does NOT approve request automatically");

  const urgencyQuery = await getBloodChainKnowledgeResponse("Why is BRQ001 urgent?");
  assert(urgencyQuery.topic === "decisionSupport", "urgency explanation routed to decisionSupport");
  assert(urgencyQuery.answer.includes("Critical"), "explains Critical urgency rationale");

  // -------------------------------------------------------------------------
  // G. TRANSFER DECISION SUPPORT
  // -------------------------------------------------------------------------
  console.log("\n[Section G] Transfer Decision Support");
  const trfDsParsed = understandQuery("What should I review before approving TRF001?");
  assert(trfDsParsed.intent === "decision_support_transfer", "detects decision_support_transfer intent");
  assert(trfDsParsed.entities.transferId === "TRF001", "extracts transferId TRF001");

  const trfDsResp = await getBloodChainKnowledgeResponse("What should I review before approving TRF001?");
  assert(trfDsResp.topic === "decisionSupport", "transfer decision support routed to decisionSupport");
  assert(trfDsResp.answer.includes("Transfer Decision Support Checklist for TRF001"), "contains Transfer Checklist header");
  assert(trfDsResp.answer.includes("Trichy Blood Bank") && trfDsResp.answer.includes("Trichy GH"), "identifies transfer route");
  assert(trfDsResp.answer.includes("cold-chain"), "includes cold-chain protocol checklist");
  assert(trfDsResp.answer.includes("Pending"), "identifies Pending status");
  assert(!trfDsResp.answer.includes("Approved"), "does NOT automatically approve transfer");

  // -------------------------------------------------------------------------
  // H. HUMAN-REVIEW SAFEGUARD
  // -------------------------------------------------------------------------
  console.log("\n[Section H] Human-Review Safeguard");
  assert(
    reqDsResp.answer.includes("Final operational decisions require authorized medical officer review."),
    "request decision support contains required human review safeguard"
  );
  assert(
    trfDsResp.answer.includes("AI provides decision-support information only. Authorized personnel must make the final decision."),
    "transfer decision support contains transfer authorized personnel disclaimer"
  );
  assert(
    srcSelResp.answer.includes("Final operational decisions require authorized medical officer review."),
    "source selection contains human review safeguard"
  );

  // -------------------------------------------------------------------------
  // I. MISSING RECOMMENDATION DATA HANDLING
  // -------------------------------------------------------------------------
  console.log("\n[Section I] Missing Recommendation Data");
  const emptyRec = await decisionSupportService.explainRecommendation({ requestId: "NONEXISTENT_REQ" });
  assert(
    emptyRec.text.includes("There are currently no stored AI recommendation records to explain"),
    "truthfully reports missing recommendation data without fabricating recommendations"
  );

  // -------------------------------------------------------------------------
  // J. MISSING SHORTAGE DATA HANDLING
  // -------------------------------------------------------------------------
  console.log("\n[Section J] Missing Shortage Data");
  const emptyShort = await decisionSupportService.explainShortageRisk({ bloodGroup: "O+" });
  assert(
    emptyShort.text.includes("BloodChain currently has no active shortage-risk record for O+"),
    "truthfully reports missing shortage records without hallucinating shortage scores"
  );

  // -------------------------------------------------------------------------
  // K. MISSING EXPIRY DATA HANDLING
  // -------------------------------------------------------------------------
  console.log("\n[Section K] Missing Expiry Data");
  const emptyExp = await decisionSupportService.explainExpiryRisk({ bloodGroup: "O+" });
  assert(
    emptyExp.text.includes("There are currently no active expiry-risk records to explain"),
    "truthfully reports missing expiry records without hallucinating expiry dates"
  );

  // -------------------------------------------------------------------------
  // L. MISSING PREDICTION DATA HANDLING
  // -------------------------------------------------------------------------
  console.log("\n[Section L] Missing Prediction Data");
  const emptyPred = await decisionSupportService.explainDemandPrediction({ bloodGroup: "O+" });
  assert(
    emptyPred.text.includes("There are currently no stored demand predictions to explain"),
    "truthfully reports missing demand predictions without inventing predicted units"
  );

  // -------------------------------------------------------------------------
  // M. CONTEXTUAL EXPLANATION FOLLOW-UP
  // -------------------------------------------------------------------------
  console.log("\n[Section M] Contextual Explanation Follow-up");
  // Turn 1: Show BRQ001
  const t1 = await getBloodChainKnowledgeResponse("Show BRQ001.");
  const ctx1 = t1.contextState;
  assert(ctx1?.requestId === "BRQ001", "Turn 1 established requestId BRQ001");

  // Turn 2: What should I review?
  const t2 = await getBloodChainKnowledgeResponse("What should I review?", ctx1);
  assert(t2.topic === "decisionSupport", "Turn 2 follow-up 'What should I review?' routed to decisionSupport");
  assert(t2.answer.includes("BRQ001"), "Turn 2 inherited requestId BRQ001 from context");

  // Turn 3: Why is it urgent?
  const t3 = await getBloodChainKnowledgeResponse("Why is it urgent?", t2.contextState);
  assert(t3.topic === "decisionSupport", "Turn 3 follow-up 'Why is it urgent?' routed to decisionSupport");
  assert(t3.answer.includes("Critical"), "Turn 3 explained urgency for BRQ001");

  // Contextual Shortage -> Why?
  const shortTurn1 = await getBloodChainKnowledgeResponse("Is there shortage risk?");
  const ctxShort = shortTurn1.contextState;
  assert(ctxShort?.intent === "shortage", "established shortage intent in context");

  const shortTurn2 = await getBloodChainKnowledgeResponse("Why?", ctxShort);
  assert(shortTurn2.topic === "decisionSupport", "Turn 2 follow-up 'Why?' routed to shortage explanation");
  assert(shortTurn2.answer.includes("shortage-risk record"), "Turn 2 answered shortage explanation");

  // -------------------------------------------------------------------------
  // N. SOURCE & BADGE CORRECTNESS
  // -------------------------------------------------------------------------
  console.log("\n[Section N] Source & Badge Correctness");
  assert(reqDsResp.source === "live-supabase-data", "decision support marked as live-supabase-data");
  assert(trfDsResp.source === "live-supabase-data", "transfer decision support marked as live-supabase-data");
  assert(srcSelResp.source === "live-supabase-data", "source selection marked as live-supabase-data");

  // -------------------------------------------------------------------------
  // O. NO FABRICATED VALUES
  // -------------------------------------------------------------------------
  console.log("\n[Section O] No Fabricated Values");
  const noDataCheck = await decisionSupportService.explainShortageRisk({ bloodGroup: "Z+" });
  assert(!noDataCheck.text.includes("Risk Level: Critical"), "does not assign fake risk level when 0 records exist");
  assert(!noDataCheck.text.includes("Risk Score: 100"), "does not assign fake risk score when 0 records exist");

  // -------------------------------------------------------------------------
  // P. READ-ONLY SAFETY (ZERO DATABASE MUTATIONS)
  // -------------------------------------------------------------------------
  console.log("\n[Section P] Read-Only Safety (Zero Database Mutations)");
  const dsFile = fs.readFileSync(path.join(projectRoot, "src/services/aiAssistant/decisionSupportService.js"), "utf8");
  assert(!dsFile.includes(".insert("), "decisionSupportService contains zero .insert() calls");
  assert(!dsFile.includes(".update("), "decisionSupportService contains zero .update() calls");
  assert(!dsFile.includes(".delete("), "decisionSupportService contains zero .delete() calls");
  assert(!dsFile.includes(".upsert("), "decisionSupportService contains zero .upsert() calls");

  // -------------------------------------------------------------------------
  // Q. NO EXTERNAL LLM / APIS
  // -------------------------------------------------------------------------
  console.log("\n[Section Q] No External LLMs");
  assert(!dsFile.includes("openai"), "No OpenAI endpoints");
  assert(!dsFile.includes("anthropic"), "No Anthropic endpoints");
  assert(!dsFile.includes("@google/genai"), "No external Google AI SDK");

  // -------------------------------------------------------------------------
  // R. NO SERVICE-ROLE KEY
  // -------------------------------------------------------------------------
  console.log("\n[Section R] No Supabase Service-Role Key");
  const srcFiles = ["knowledgeService.js", "liveDataService.js", "liveQueryFormatter.js", "decisionSupportService.js"];
  let hasServiceRole = false;
  for (const f of srcFiles) {
    const content = fs.readFileSync(path.join(projectRoot, "src/services/aiAssistant", f), "utf8");
    if (content.includes("service_role") || content.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      hasServiceRole = true;
    }
  }
  assert(!hasServiceRole, "Zero service_role key usage in assistant services");

  // -------------------------------------------------------------------------
  // S. PHASE 3 STATIC KNOWLEDGE REGRESSION
  // -------------------------------------------------------------------------
  console.log("\n[Section S] Phase 3 Static Knowledge Regression");
  const p3Static1 = await getBloodChainKnowledgeResponse("What is BloodChain?");
  assert(p3Static1.source === "bloodchain-knowledge", "What is BloodChain is bloodchain-knowledge");
  assert(p3Static1.topic === "platform", "topic is platform");

  const p3Static2 = await getBloodChainKnowledgeResponse("What is shortage risk?");
  assert(p3Static2.source === "bloodchain-knowledge", "What is shortage risk is bloodchain-knowledge");
  assert(p3Static2.topic === "shortageRisk", "topic is shortageRisk");

  // -------------------------------------------------------------------------
  // T. PHASE 4 LIVE DATA REGRESSION
  // -------------------------------------------------------------------------
  console.log("\n[Section T] Phase 4 Live Data Regression");
  const p4Inv = await getBloodChainKnowledgeResponse("How many O+ units are available?");
  assert(p4Inv.source === "live-supabase-data", "inventory query marked as live-supabase-data");
  assert(p4Inv.answer.includes("160"), "retrieves actual 160 O+ units");

  const p4Req = await getBloodChainKnowledgeResponse("What is the status of BRQ001?");
  assert(p4Req.source === "live-supabase-data", "BRQ001 query marked as live-supabase-data");
  assert(p4Req.answer.includes("R. Karthik"), "identifies patient R. Karthik");

  // -------------------------------------------------------------------------
  // U. PHASE 5 QUERY UNDERSTANDING REGRESSION
  // -------------------------------------------------------------------------
  console.log("\n[Section U] Phase 5 Query Understanding Regression");
  const p5Nl = await getBloodChainKnowledgeResponse("Do we have O positive?");
  assert(p5Nl.source === "live-supabase-data", "natural language inventory is live query");
  assert(p5Nl.answer.includes("160"), "retrieves 160 units for O positive");

  const p5Comp = await getBloodChainKnowledgeResponse("Which has more O+ stock, Apollo or Kauvery?");
  assert(p5Comp.source === "live-supabase-data", "comparison is live query");
  assert(p5Comp.answer.includes("Comparison"), "formats as comparison");

  const p5Clar = await getBloodChainKnowledgeResponse("Show blood");
  assert(p5Clar.topic === "clarification", "clarification triggered for ambiguous query");

  // Summary
  console.log("\n=======================================================");
  console.log(`  PHASE 6 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
