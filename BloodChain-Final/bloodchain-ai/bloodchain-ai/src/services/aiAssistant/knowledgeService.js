import { BLOODCHAIN_KNOWLEDGE } from "./bloodChainKnowledge.js";
import { isSupabaseConfigured } from "../supabaseClient.js";
import {
  extractBloodGroup,
  extractRequestId,
  extractTransferId,
  extractHospital,
  executeInventoryQuery,
  executeBloodRequestQuery,
  executeFacilityQuery,
  executeTransferQuery,
  executeShortageRiskQuery,
  executeExpiryRiskQuery,
  executeDemandPredictionQuery,
  executeRecommendationQuery,
  executeComparisonQuery,
  executeMultiSourceQuery,
} from "./liveQueryFormatter.js";
import { understandQuery } from "./queryUnderstandingService.js";
import {
  explainRecommendation,
  explainSourceSelection,
  explainShortageRisk,
  explainExpiryRisk,
  explainDemandPrediction,
  getDecisionSupportSummary,
  explainTransferDecision,
} from "./decisionSupportService.js";

/**
 * Normalizes input text for deterministic intent matching
 */
export function normalizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deterministically classifies query as STATIC_KNOWLEDGE, LIVE_DATA, MIXED, or UNSUPPORTED
 * (Preserved for backwards compatibility with Phase 4)
 */
export function classifyQueryType(normalized, rawText) {
  // Check for MIXED intent (e.g. "Why is shortage risk important, and what is the current O+ risk?")
  const hasConceptInquiry =
    normalized.includes("why is") ||
    normalized.includes("how does") ||
    normalized.includes("how do") ||
    normalized.includes("what is") ||
    normalized.includes("explain");

  const hasLiveInquiry =
    normalized.includes("current") ||
    normalized.includes("live") ||
    normalized.includes("status of") ||
    normalized.includes("how many") ||
    normalized.includes("available right now") ||
    extractRequestId(rawText) !== null ||
    extractTransferId(rawText) !== null;

  if (hasConceptInquiry && hasLiveInquiry && (normalized.includes("and") || normalized.includes("also"))) {
    return "MIXED";
  }

  // Check for LIVE DATA intent
  const bloodGroupDetected = extractBloodGroup(rawText) !== null;
  const isLive =
    normalized.startsWith("how many") ||
    normalized.startsWith("how much") ||
    normalized.startsWith("show current") ||
    normalized.startsWith("show live") ||
    normalized.startsWith("who requested") ||
    normalized.startsWith("where is") ||
    normalized.startsWith("which request") ||
    normalized.startsWith("which facility") ||
    normalized.startsWith("which facilities") ||
    normalized.startsWith("which hospital") ||
    normalized.startsWith("which hospitals") ||
    normalized.startsWith("which blood bank") ||
    normalized.startsWith("which blood banks") ||
    normalized.startsWith("which blood group") ||
    normalized.includes("do we have") ||
    normalized.includes("units are available") ||
    normalized.includes("status of") ||
    normalized.includes("current inventory") ||
    normalized.includes("current stock") ||
    normalized.includes("current blood requests") ||
    normalized.includes("current blood availability") ||
    normalized.includes("current shortage") ||
    normalized.includes("current expiry") ||
    normalized.includes("current transfer") ||
    normalized.includes("current recommendation") ||
    normalized.includes("active transfers") ||
    normalized.includes("pending blood requests") ||
    normalized.includes("critical requests") ||
    normalized.includes("urgent requests") ||
    normalized.includes("connected hospitals") ||
    normalized.includes("available blood banks") ||
    normalized.includes("find hospitals in") ||
    normalized.includes("facilities in") ||
    normalized.includes("predicted demand") ||
    normalized.includes("demand predictions") ||
    normalized.includes("forecast for") ||
    normalized.includes("shortage risks") ||
    normalized.includes("expiry risks") ||
    normalized.includes("units expire soon") ||
    normalized.includes("blood is at expiry risk") ||
    extractRequestId(rawText) !== null ||
    extractTransferId(rawText) !== null ||
    (bloodGroupDetected &&
      (normalized.includes("at shortage risk") ||
        normalized.includes("shortage") ||
        normalized.includes("expiry") ||
        normalized.includes("available") ||
        normalized.includes("stock") ||
        normalized.includes("units") ||
        normalized.includes("facility") ||
        normalized.includes("hospital") ||
        normalized.includes("bank") ||
        normalized.includes("has") ||
        normalized.includes("have"))) ||
    ((normalized.includes("available") || normalized.includes("units") || normalized.includes("stock")) &&
      (normalized.includes("now") || normalized.includes("currently") || normalized.includes("today") || extractHospital(rawText) !== null));

  if (isLive) {
    return "LIVE_DATA";
  }

  return "STATIC_KNOWLEDGE";
}

/**
 * Pure static knowledge resolution (Phase 3 baseline)
 */
export function getStaticKnowledgeResponse(normalized) {
  // 1. High priority domain-specific patterns
  if (
    normalized.includes("automatically approve") ||
    normalized.includes("auto approve") ||
    normalized.includes("does ai approve") ||
    normalized.includes("does ai automatically") ||
    normalized.includes("human review") ||
    normalized.includes("who approves") ||
    normalized.includes("medical authority")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "humanReview");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("compatibility") ||
    normalized.includes("universal donor") ||
    normalized.includes("universal recipient") ||
    normalized.includes("compatible alternate")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "bloodCompatibility");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("transport time") ||
    normalized.includes("travel duration") ||
    normalized.includes("transit time") ||
    normalized.includes("how does transport time affect")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "mapsAndLocation");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("recommend a source") ||
    normalized.includes("recommend a blood source") ||
    normalized.includes("how does bloodchain recommend") ||
    normalized.includes("how does ai recommend") ||
    normalized.includes("ai recommendation") ||
    normalized.includes("recommendation engine") ||
    normalized.includes("scoring model")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "aiRecommendations");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("shortage risk") ||
    normalized.includes("shortage prediction") ||
    normalized.includes("what is shortage") ||
    normalized.includes("predict shortage")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "shortageRisk");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("expiry risk") ||
    normalized.includes("track expiry") ||
    normalized.includes("what is expiry") ||
    normalized.includes("shelf life") ||
    normalized.includes("blood expiration")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "expiryRisk");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("create a blood request") ||
    normalized.includes("create request") ||
    normalized.includes("request blood") ||
    normalized.includes("how do i request") ||
    normalized.includes("blood request")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "bloodRequests");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("check blood availability") ||
    normalized.includes("blood availability") ||
    normalized.includes("blood inventory") ||
    normalized.includes("blood stock")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "bloodAvailability");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("find a blood bank") ||
    normalized.includes("find blood bank") ||
    normalized.includes("find hospital") ||
    normalized.includes("find a hospital") ||
    normalized.includes("hospitals and blood banks") ||
    normalized.includes("connected facilities") ||
    normalized.includes("nearby blood bank")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "hospitalsAndBloodBanks");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("what is a blood transfer") ||
    normalized.includes("blood transfer") ||
    normalized.includes("track a transfer") ||
    normalized.includes("transfer workflow") ||
    normalized.includes("transfer")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "transfers");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("map") ||
    normalized.includes("gps") ||
    normalized.includes("location") ||
    normalized.includes("distance")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "mapsAndLocation");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("navigate") ||
    normalized.includes("pages") ||
    normalized.includes("routes") ||
    normalized.includes("where can i find") ||
    normalized.includes("how to go to")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "navigation");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("what can you do") ||
    normalized.includes("what can the ai assistant") ||
    normalized.includes("assistant help me with") ||
    normalized.includes("who are you") ||
    normalized.includes("how can you help")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "assistantCapabilities");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  if (
    normalized.includes("what is bloodchain") ||
    normalized.includes("what does bloodchain do") ||
    normalized.includes("what does bloodchain ai do") ||
    normalized.includes("purpose of bloodchain") ||
    normalized.includes("about bloodchain") ||
    normalized.includes("bloodchain platform")
  ) {
    const item = BLOODCHAIN_KNOWLEDGE.find((k) => k.topic === "platform");
    if (item) return { matched: true, topic: item.topic, category: item.category, answer: item.answer, source: "bloodchain-knowledge" };
  }

  // 2. Broad keyword scan
  const STOP_WORDS = new Set(["what", "how", "why", "when", "where", "does", "the", "for", "with", "can", "and", "make", "you", "your", "who", "are", "about", "tell"]);
  let bestMatch = null;
  let maxScore = 0;

  for (const item of BLOODCHAIN_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      const normKw = normalizeText(kw);
      if (normalized === normKw) {
        score += 10;
      } else if (normalized.includes(normKw)) {
        score += 6;
      } else {
        const words = normKw.split(" ").filter((w) => w.length > 2 && !STOP_WORDS.has(w));
        if (words.length > 0) {
          const matchCount = words.filter((w) => normalized.includes(w)).length;
          if (matchCount === words.length) {
            score += 4;
          }
        }
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore >= 4) {
    return {
      matched: true,
      topic: bestMatch.topic,
      category: bestMatch.category,
      answer: bestMatch.answer,
      source: "bloodchain-knowledge"
    };
  }

  // 3. Fallback
  return {
    matched: false,
    topic: "fallback",
    category: "General Guidance",
    answer:
      "I'm currently focused on helping with BloodChain features, blood requests, availability, hospitals and blood banks, risk insights, AI recommendations, transfers, and platform usage.\n\n" +
      "Try asking me:\n" +
      "• \"How do I create a blood request?\"\n" +
      "• \"How can I check blood availability?\"\n" +
      "• \"How does BloodChain recommend a source?\"\n" +
      "• \"What is shortage risk and expiry risk?\"\n" +
      "• \"Does AI automatically approve a transfer?\"",
    source: "fallback"
  };
}

/**
 * Routes and executes live database queries
 */
export async function executeLiveQuery(normalized, rawText, structured = null) {
  // If structured understanding is passed, use it directly
  if (structured) {
    if (structured.intent === "comparison") {
      const res = await executeComparisonQuery(structured);
      return {
        matched: true,
        topic: "liveComparison",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "multi_source") {
      const res = await executeMultiSourceQuery(structured);
      return {
        matched: true,
        topic: "liveMultiSource",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "requests") {
      const res = await executeBloodRequestQuery(normalized, rawText, structured);
      return {
        matched: true,
        topic: "liveBloodRequests",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "transfers") {
      const res = await executeTransferQuery(normalized, rawText, structured);
      return {
        matched: true,
        topic: "liveTransfers",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "shortage") {
      const res = await executeShortageRiskQuery(normalized, rawText, structured);
      return {
        matched: true,
        topic: "liveShortageRisks",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "expiry") {
      const res = await executeExpiryRiskQuery(normalized, rawText, structured);
      return {
        matched: true,
        topic: "liveExpiryRisks",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "demand") {
      const res = await executeDemandPredictionQuery(normalized, rawText, structured);
      return {
        matched: true,
        topic: "liveDemandPredictions",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "recommendations") {
      const res = await executeRecommendationQuery(normalized, rawText, structured);
      return {
        matched: true,
        topic: "liveRecommendations",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    if (structured.intent === "facilities") {
      const res = await executeFacilityQuery(normalized, rawText, structured);
      return {
        matched: true,
        topic: "liveFacilities",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
      };
    }

    // Default: Inventory
    const res = await executeInventoryQuery(normalized, rawText, structured);
    return {
      matched: true,
      topic: "liveBloodInventory",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  // Fallback direct execution if structured query wasn't supplied (Phase 4 compatibility)
  if (
    extractRequestId(rawText) !== null ||
    normalized.includes("request") ||
    normalized.includes("who requested")
  ) {
    const res = await executeBloodRequestQuery(normalized, rawText);
    return {
      matched: true,
      topic: "liveBloodRequests",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  if (
    extractTransferId(rawText) !== null ||
    normalized.includes("transfer") ||
    normalized.includes("where is trf")
  ) {
    const res = await executeTransferQuery(normalized, rawText);
    return {
      matched: true,
      topic: "liveTransfers",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  if (normalized.includes("shortage")) {
    const res = await executeShortageRiskQuery(normalized, rawText);
    return {
      matched: true,
      topic: "liveShortageRisks",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  if (normalized.includes("expir") || normalized.includes("shelf life")) {
    const res = await executeExpiryRiskQuery(normalized, rawText);
    return {
      matched: true,
      topic: "liveExpiryRisks",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  if (normalized.includes("predict") || normalized.includes("demand") || normalized.includes("forecast")) {
    const res = await executeDemandPredictionQuery(normalized, rawText);
    return {
      matched: true,
      topic: "liveDemandPredictions",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  if (normalized.includes("recommend")) {
    const res = await executeRecommendationQuery(normalized, rawText);
    return {
      matched: true,
      topic: "liveRecommendations",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  const hasBloodGroup = extractBloodGroup(rawText) !== null;
  const isInventorySpecific =
    hasBloodGroup ||
    normalized.includes("blood inventory") ||
    normalized.includes("blood stock") ||
    normalized.includes("units are available") ||
    normalized.includes("how much") ||
    normalized.includes("how many") ||
    (normalized.includes("units") && !normalized.includes("blood bank"));

  const isFacilityDirectory =
    !isInventorySpecific &&
    (normalized.includes("blood bank") ||
      normalized.includes("blood banks") ||
      normalized.includes("hospitals") ||
      normalized.includes("facilities") ||
      normalized.includes("connected") ||
      normalized.includes("in trichy") ||
      normalized.includes("in tamil nadu"));

  if (isFacilityDirectory) {
    const res = await executeFacilityQuery(normalized, rawText);
    return {
      matched: true,
      topic: "liveFacilities",
      category: res.category,
      answer: res.text,
      source: "live-supabase-data",
    };
  }

  const res = await executeInventoryQuery(normalized, rawText);
  return {
    matched: true,
    topic: "liveBloodInventory",
    category: res.category,
    answer: res.text,
    source: "live-supabase-data",
  };
}

// Helper: Supports both synchronous property access and Promise resolution for static responses
function makeDualResponse(data) {
  const p = Promise.resolve(data);
  Object.assign(p, data);
  return p;
}

/**
 * Primary Unified AI Assistant Response Function (Phase 4 & Phase 5)
 * Supports:
 * - Deterministic Query Understanding
 * - Contextual follow-up memory resolution
 * - Clarification questions
 * - Multi-condition queries
 * - Multi-source parallel queries
 * - Factual facility comparisons
 * - STATIC KNOWLEDGE (Dual Sync/Async)
 * - LIVE SUPABASE DATA (Async)
 * - MIXED (Knowledge + Live Data) (Async)
 *
 * @param {string} question
 * @param {object|null} context - Session-level conversation context
 * @returns {Promise<{ matched: boolean, topic: string, category: string, answer: string, source: string, contextState: object }>}
 */
export function getBloodChainKnowledgeResponse(question, context = null) {
  const normalized = normalizeText(question);

  if (!normalized) {
    return makeDualResponse({
      matched: false,
      topic: "fallback",
      category: "Advisory",
      answer: "Please ask a question about BloodChain features, live inventory, requests, or clinical workflows.",
      source: "fallback",
      contextState: null,
    });
  }

  // 1. Run deterministic query understanding with session context
  const structured = understandQuery(question, context);

  // 2. Check for clarification requirement (Step 16)
  if (structured.intent === "clarification" && structured.clarificationQuestion) {
    return makeDualResponse({
      matched: true,
      topic: "clarification",
      category: "Clarification Needed",
      answer: structured.clarificationQuestion,
      source: "fallback",
      contextState: structured.contextState,
    });
  }

  // 3. Phase 6 Decision Support & Explainability Routes
  // NOTE: These run BEFORE the offline/live-data boundary check because
  // decisionSupportService handles empty Supabase data gracefully on its own.
  if (structured.intent === "decision_support_request") {
    return (async () => {
      const res = await getDecisionSupportSummary({
        requestId: structured.entities.requestId,
        rawText: question,
      });
      return {
        matched: true,
        topic: "decisionSupport",
        category: res.category || "Decision Support",
        answer: res.text,
        source: res.source || "live-supabase-data",
        contextState: structured.contextState,
        decisionSupportData: res.decisionSupportData,
      };
    })();
  }

  if (structured.intent === "decision_support_transfer") {
    return (async () => {
      const res = await explainTransferDecision({
        transferId: structured.entities.transferId,
      });
      return {
        matched: true,
        topic: "decisionSupport",
        category: res.category || "Decision Support",
        answer: res.text,
        source: res.source || "live-supabase-data",
        contextState: structured.contextState,
        decisionSupportData: res.decisionSupportData,
      };
    })();
  }

  if (structured.intent === "explain_shortage") {
    return (async () => {
      const res = await explainShortageRisk({
        bloodGroup: structured.entities.bloodGroup,
        facility: structured.entities.facility,
      });
      return {
        matched: true,
        topic: "decisionSupport",
        category: res.category || "Decision Support",
        answer: res.text,
        source: res.source || "live-supabase-data",
        contextState: structured.contextState,
      };
    })();
  }

  if (structured.intent === "explain_expiry") {
    return (async () => {
      const res = await explainExpiryRisk({
        bloodGroup: structured.entities.bloodGroup,
        facility: structured.entities.facility,
      });
      return {
        matched: true,
        topic: "decisionSupport",
        category: res.category || "Decision Support",
        answer: res.text,
        source: res.source || "live-supabase-data",
        contextState: structured.contextState,
      };
    })();
  }

  if (structured.intent === "explain_demand") {
    return (async () => {
      const res = await explainDemandPrediction({
        bloodGroup: structured.entities.bloodGroup,
      });
      return {
        matched: true,
        topic: "decisionSupport",
        category: res.category || "Decision Support",
        answer: res.text,
        source: res.source || "live-supabase-data",
        contextState: structured.contextState,
      };
    })();
  }

  if (structured.intent === "explain_source_selection") {
    return (async () => {
      const res = await explainSourceSelection({
        facility: structured.entities.facility,
        candidateFacilities: structured.entities.facilities,
        bloodGroup: structured.entities.bloodGroup,
        requestId: structured.entities.requestId,
      });
      return {
        matched: true,
        topic: "decisionSupport",
        category: res.category || "Decision Support",
        answer: res.text,
        source: res.source || "live-supabase-data",
        contextState: structured.contextState,
      };
    })();
  }

  if (structured.intent === "explain_recommendation") {
    return (async () => {
      const res = await explainRecommendation({
        requestId: structured.entities.requestId,
        sourceFacility: structured.entities.facility,
        bloodGroup: structured.entities.bloodGroup,
      });
      return {
        matched: true,
        topic: "decisionSupport",
        category: res.category || "Decision Support",
        answer: res.text,
        source: res.source || "live-supabase-data",
        contextState: structured.contextState,
      };
    })();
  }

  // 4. Offline / Live Data Boundary Check (Phase 3 baseline & offline safety)
  // Only applies to non-Phase-6 live data intents (inventory, requests, transfers, etc.)
  if (structured.requiresLiveData && structured.intent !== "static" && !isSupabaseConfigured()) {
    let boundaryAnswer = "I can explain how BloodChain works, but real-time database queries are unavailable in offline mode (Phase 4 integration scheduled).";
    if (structured.intent === "inventory" || structured.intent === "comparison" || structured.intent === "multi_source") {
      boundaryAnswer = "I can explain how BloodChain tracks inventory, but I cannot query live inventory quantities directly in this phase (Phase 4 integration scheduled).";
    } else if (structured.intent === "requests") {
      boundaryAnswer = "I can explain how blood requests work, but I cannot query active request statuses directly in this phase (Phase 4 integration scheduled).";
    } else if (structured.intent === "transfers") {
      boundaryAnswer = "I can explain transfer procedures, but real-time transfer tracking is scheduled for Phase 4.";
    }
    return makeDualResponse({
      matched: true,
      topic: "liveDataBoundary",
      category: "Live Data Boundary",
      answer: boundaryAnswer,
      source: "live-data-boundary",
      contextState: structured.contextState,
    });
  }

  // 5. Factual Comparison Query (Step 15)
  if (structured.intent === "comparison") {
    return (async () => {
      const res = await executeComparisonQuery(structured);
      return {
        matched: true,
        topic: "liveComparison",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
        contextState: structured.contextState,
      };
    })();
  }

  // 6. Multi-Source Query (Step 14)
  if (structured.intent === "multi_source") {
    return (async () => {
      const res = await executeMultiSourceQuery(structured);
      return {
        matched: true,
        topic: "liveMultiSource",
        category: res.category,
        answer: res.text,
        source: "live-supabase-data",
        contextState: structured.contextState,
      };
    })();
  }

  // 7. Mixed Query (Static Knowledge Concept + Live Database Check) (Step 12)
  if (structured.intent === "mixed") {
    return (async () => {
      const staticRes = getStaticKnowledgeResponse(normalized);
      const liveRes = await executeLiveQuery(normalized, question, structured);

      const combinedAnswer =
        `${staticRes.answer}\n\n` +
        `────────────────────────\n` +
        `Current BloodChain Live Database Status:\n` +
        `${liveRes.answer}`;

      return {
        matched: true,
        topic: "mixedKnowledgeAndLiveData",
        category: liveRes.category || staticRes.category,
        answer: combinedAnswer,
        source: "knowledge-and-live-data",
        contextState: structured.contextState,
      };
    })();
  }

  // 8. Live Data Query (Step 4, 5, 6, 7, 8, 9, 10, 13)
  if (structured.requiresLiveData && structured.intent !== "static") {
    return (async () => {
      const liveRes = await executeLiveQuery(normalized, question, structured);
      return {
        ...liveRes,
        contextState: structured.contextState,
      };
    })();
  }

  // 9. Static Knowledge Query (Phase 3 baseline)
  const staticRes = getStaticKnowledgeResponse(normalized);
  return makeDualResponse({
    ...staticRes,
    contextState: structured.contextState,
  });
}

// Backwards compatibility alias
export const getBloodChainAssistantResponse = getBloodChainKnowledgeResponse;
