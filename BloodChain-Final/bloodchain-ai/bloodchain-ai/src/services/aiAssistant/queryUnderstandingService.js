/**
 * BloodChain AI Assistant — Deterministic Query Understanding Layer (Phase 5)
 *
 * STRICT SAFETY & QUALITY PRINCIPLES:
 * - 100% Deterministic (Zero external LLMs, zero non-deterministic APIs).
 * - Allowlisted vocabulary, robust entity extraction, alias normalization.
 * - Extracts structured intent, operation, entities, filters, and context.
 * - Supports natural-language inventory variations, location separation,
 *   multi-condition filters, multi-source intents, comparisons, and clarifications.
 * - Session-level follow-up context resolution without persistent user profiling.
 */

// Canonical Blood Group Set
export const VALID_BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

// Allowlisted Facilities in BloodChain
export const KNOWN_FACILITIES = [
  {
    canonical: "Apollo Hospital",
    aliases: ["apollo hospital", "apollo hospitals", "apollo", "apollo trichy"],
  },
  {
    canonical: "Kauvery Hospital",
    aliases: ["kauvery hospital", "kauvery", "kauvery trichy"],
  },
  {
    canonical: "SRM Hospital",
    aliases: ["srm hospital", "srm", "srm medical"],
  },
  {
    canonical: "Trichy GH",
    aliases: [
      "trichy gh",
      "government hospital",
      "govt hospital",
      "trichy government hospital",
      "govt. hospital",
    ],
  },
  {
    canonical: "MGM Hospital",
    aliases: ["mgm hospital", "mgmgh", "mgm", "mgmgh blood bank"],
  },
  {
    canonical: "Cauvery Medical Center",
    aliases: ["cauvery medical center", "cauvery medical", "cauvery center"],
  },
  {
    canonical: "Trichy Blood Bank",
    aliases: ["trichy blood bank", "central blood bank trichy"],
  },
  {
    canonical: "Thillai Nagar Blood Bank",
    aliases: ["thillai nagar blood bank", "thillai nagar bank", "thillai nagar"],
  },
  {
    canonical: "Srirangam PHC",
    aliases: ["srirangam phc", "srirangam hospital", "srirangam primary health", "srirangam"],
  },
];

// Allowlisted Districts and States
export const KNOWN_DISTRICTS = [
  "trichy",
  "tiruchirappalli",
  "chennai",
  "madurai",
  "coimbatore",
  "thanjavur",
  "salem",
];

export const KNOWN_STATES = ["tamil nadu", "tn"];

/**
 * Normalizes user text for parsing
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
 * Extracts and normalizes blood group from text.
 * Strictly adheres to O+, O-, A+, A-, B+, B-, AB+, AB-.
 * Rejects invalid groups like Z+, C-, etc.
 */
export function extractBloodGroup(text) {
  if (!text || typeof text !== "string") return null;

  // 1. Symbol matching: O+, A-, AB+, B+, etc.
  const symbolRegex = /\b(ab|a|b|o)\s*([+-])(?=[^a-zA-Z0-9]|$)/i;
  const symbolMatch = text.match(symbolRegex);
  if (symbolMatch) {
    const canonical = `${symbolMatch[1].toUpperCase()}${symbolMatch[2]}`;
    if (VALID_BLOOD_GROUPS.includes(canonical)) return canonical;
  }

  // 2. Word matching: O positive, A negative, AB positive, etc.
  const wordRegex = /\b(ab|a|b|o)\s+(positive|negative)(?=[^a-zA-Z0-9]|$)/i;
  const wordMatch = text.match(wordRegex);
  if (wordMatch) {
    const sign = wordMatch[2].toLowerCase() === "positive" ? "+" : "-";
    const canonical = `${wordMatch[1].toUpperCase()}${sign}`;
    if (VALID_BLOOD_GROUPS.includes(canonical)) return canonical;
  }

  return null;
}

/**
 * Extracts single or multiple facility references from text
 */
export function extractFacilities(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = [];

  for (const fac of KNOWN_FACILITIES) {
    for (const alias of fac.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, "i");
      if (regex.test(lower)) {
        if (!matched.includes(fac.canonical)) {
          matched.push(fac.canonical);
        }
        break;
      }
    }
  }

  return matched;
}

/**
 * Extracts district entity (e.g. Trichy, Chennai, Madurai)
 */
export function extractDistrict(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  for (const dist of KNOWN_DISTRICTS) {
    const regex = new RegExp(`\\b(in|at|around|for)?\\s*${dist}\\b`, "i");
    if (regex.test(lower)) {
      if (dist === "tiruchirappalli" || dist === "trichy") return "Trichy";
      return dist.charAt(0).toUpperCase() + dist.slice(1);
    }
  }
  return null;
}

/**
 * Extracts state entity (e.g. Tamil Nadu)
 */
export function extractState(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  for (const state of KNOWN_STATES) {
    const regex = new RegExp(`\\b(in|at)?\\s*${state}\\b`, "i");
    if (regex.test(lower)) {
      return "Tamil Nadu";
    }
  }
  return null;
}

/**
 * Extracts request ID (e.g. BRQ001, BRQ-002)
 */
export function extractRequestId(text) {
  if (!text) return null;
  const match = text.match(/\b(brq[-\s]?\w+)\b/i);
  if (match) {
    return match[1].toUpperCase().replace(/\s+/, "");
  }
  return null;
}

/**
 * Extracts transfer ID (e.g. TRF001, TRF-198493-73C)
 */
export function extractTransferId(text) {
  if (!text) return null;
  const match = text.match(/\b(trf[-\s]?[\w-]+)\b/i);
  if (match) {
    return match[1].toUpperCase().replace(/\s+/, "");
  }
  return null;
}

/**
 * Extracts urgency level
 */
export function extractUrgency(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("critical")) return "Critical";
  if (lower.includes("urgent") || lower.includes("high priority") || lower.includes("urgent ones")) return "High";
  if (lower.includes("medium") || lower.includes("moderate")) return "Medium";
  if (lower.includes("low")) return "Low";
  return null;
}

/**
 * Extracts status filter
 */
export function extractStatus(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("pending")) return "Pending";
  if (lower.includes("in progress") || lower.includes("in transit") || lower.includes("active")) return "In Progress";
  if (lower.includes("fulfilled") || lower.includes("completed")) return "Fulfilled";
  if (lower.includes("in review")) return "In Review";
  if (lower.includes("matched")) return "Matched";
  if (lower.includes("approved")) return "Approved";
  return null;
}

/**
 * Detects whether the query is a comparison between two facilities
 */
export function detectComparison(text, facilities) {
  if (!text || facilities.length < 2) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("compare") ||
    lower.includes("which has more") ||
    lower.includes("who has more") ||
    lower.includes("higher stock") ||
    lower.includes("or") ||
    lower.includes("between")
  );
}

/**
 * Detects whether the query is asking for multiple distinct data sources
 * (e.g. Inventory + Shortage Risk)
 */
export function detectMultiSource(normalized) {
  const hasInventory =
    normalized.includes("inventory") ||
    normalized.includes("stock") ||
    normalized.includes("available") ||
    normalized.includes("do we have") ||
    normalized.includes("how much") ||
    normalized.includes("how many");

  const hasShortage = normalized.includes("shortage");
  const hasExpiry = normalized.includes("expir");
  const hasRequests = normalized.includes("request");

  const count = [hasInventory, hasShortage, hasExpiry, hasRequests].filter(Boolean).length;
  if (count >= 2 && (normalized.includes("and") || normalized.includes("also") || normalized.includes("&"))) {
    const sources = [];
    if (hasInventory) sources.push("inventory");
    if (hasShortage) sources.push("shortage");
    if (hasExpiry) sources.push("expiry");
    if (hasRequests) sources.push("requests");
    return { isMultiSource: true, sources };
  }
  return { isMultiSource: false, sources: [] };
}

/**
 * Detects whether the query is a contextual follow-up question
 * (e.g. "What about A+?", "What about Apollo?", "What about critical ones?")
 */
export function detectFollowUp(normalized) {
  return (
    normalized === "why" ||
    normalized === "why?" ||
    normalized === "why is it" ||
    normalized === "why is it urgent" ||
    normalized.startsWith("why ") ||
    normalized.startsWith("why was") ||
    normalized.startsWith("why is") ||
    normalized.startsWith("what about") ||
    normalized.startsWith("how about") ||
    normalized.startsWith("and what about") ||
    normalized.startsWith("what of") ||
    normalized.startsWith("any for") ||
    normalized.startsWith("any at") ||
    normalized.startsWith("what should i review") ||
    normalized.startsWith("what should the doctor") ||
    normalized.startsWith("what should i check") ||
    normalized === "critical ones" ||
    normalized === "urgent ones" ||
    normalized === "pending ones"
  );
}

/**
 * Detects if the query is too ambiguous/underspecified and warrants a clarification
 */
export function detectClarificationNeed(normalized, entities) {
  // "show blood", "check blood", "blood"
  if (
    normalized === "show blood" ||
    normalized === "check blood" ||
    normalized === "blood" ||
    normalized === "blood stock"
  ) {
    return {
      needed: true,
      question: "Sure. Which blood group should I check? (e.g., O+, A+, B+, or all groups)",
    };
  }

  // "check apollo", "apollo" (facility given, but zero intent or blood group provided)
  if (
    (normalized === "check apollo" ||
      normalized === "apollo" ||
      normalized === "apollo hospital" ||
      normalized === "check kauvery") &&
    !entities.bloodGroup
  ) {
    const fac = entities.facility || "this facility";
    return {
      needed: true,
      question: `Which blood group should I check at ${fac}, or would you like to see all available inventory at this facility?`,
    };
  }

  return { needed: false, question: null };
}

/**
 * Main Deterministic Query Understanding Function
 *
 * @param {string} rawText
 * @param {object|null} context - Session-level conversation context
 * @returns {object} Structured Query Representation
 */
export function understandQuery(rawText, context = null) {
  const normalized = normalizeText(rawText);

  // 1. Initial Entity Extraction
  let bloodGroup = extractBloodGroup(rawText);
  const facilities = extractFacilities(rawText);
  let facility = facilities.length > 0 ? facilities[0] : null;
  let district = extractDistrict(rawText);
  let state = extractState(rawText);
  let requestId = extractRequestId(rawText);
  let transferId = extractTransferId(rawText);
  let urgency = extractUrgency(rawText);
  let status = extractStatus(rawText);

  const isFollowUp = detectFollowUp(normalized);

  // 2. Resolve Contextual Memory if this is a follow-up
  let inheritedFromContext = false;
  if (isFollowUp && context) {
    if (!bloodGroup && context.bloodGroup) {
      bloodGroup = context.bloodGroup;
      inheritedFromContext = true;
    }
    if (!facility && context.facility && !district) {
      facility = context.facility;
      inheritedFromContext = true;
    }
    if (!district && context.district && !facility) {
      district = context.district;
      inheritedFromContext = true;
    }
    if (!urgency && context.urgency) {
      urgency = context.urgency;
      inheritedFromContext = true;
    }
    if (!status && context.status) {
      status = context.status;
      inheritedFromContext = true;
    }
    if (!requestId && context.requestId) {
      requestId = context.requestId;
      inheritedFromContext = true;
    }
    if (!transferId && context.transferId) {
      transferId = context.transferId;
      inheritedFromContext = true;
    }
  }

  // 3. Multi-source & Comparison Detection
  const multiSourceCheck = detectMultiSource(normalized);
  const isComparison = detectComparison(rawText, facilities);

  // 4. Clarification check
  const clarificationCheck = detectClarificationNeed(normalized, {
    bloodGroup,
    facility,
    district,
  });

  if (clarificationCheck.needed) {
    return {
      rawText,
      normalized,
      intent: "clarification",
      operation: "ask",
      entities: { bloodGroup, facility, district, state, requestId, transferId, urgency, status },
      filters: {},
      requiresLiveData: false,
      isFollowUp: false,
      isMultiSource: false,
      multiSources: [],
      isComparison: false,
      clarificationQuestion: clarificationCheck.question,
      confidence: "high",
      contextState: { bloodGroup, facility, district, state, urgency, status },
    };
  }

  // 5. Intent Classification
  let intent;
  let operation;
  let requiresLiveData;

  // Mixed Query Detection (Concept + Current Live DB Status)
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
    requestId !== null ||
    transferId !== null;

  const isMixed = hasConceptInquiry && hasLiveInquiry && (normalized.includes("and") || normalized.includes("also"));

  if (isMixed) {
    intent = "mixed";
    operation = "explain_and_query";
    requiresLiveData = true;
  }
  // Static Knowledge Intent (Phase 3 baseline concepts & workflows)
  else if (
    normalized.startsWith("what is bloodchain") ||
    normalized.startsWith("what does bloodchain") ||
    normalized.startsWith("how do i create a blood request") ||
    normalized.startsWith("how to create a blood request") ||
    normalized.startsWith("how do i request blood") ||
    normalized.startsWith("what is a blood request") ||
    normalized.startsWith("how can i check blood availability") ||
    normalized.startsWith("how do i check blood availability") ||
    normalized.startsWith("how to check blood availability") ||
    normalized.startsWith("how do i find a blood bank") ||
    normalized.startsWith("how to find a blood bank") ||
    normalized.startsWith("how do i find connected blood banks") ||
    normalized.startsWith("what is shortage risk") ||
    normalized.startsWith("how does shortage risk") ||
    normalized.startsWith("what is expiry risk") ||
    normalized.startsWith("how does expiry risk") ||
    normalized.startsWith("how does bloodchain recommend") ||
    normalized.startsWith("how does ai recommend") ||
    normalized.startsWith("what is blood-group compatibility") ||
    normalized.startsWith("what is blood compatibility") ||
    normalized.startsWith("what is a blood transfer") ||
    normalized.startsWith("how do i track a transfer") ||
    normalized.startsWith("does ai automatically approve") ||
    normalized.startsWith("how does human review work") ||
    normalized.startsWith("what can you do") ||
    normalized.startsWith("who are you") ||
    normalized.startsWith("how does transport time affect")
  ) {
    intent = "static";
    operation = "explain";
    requiresLiveData = false;
  }
  // Comparison Intent
  else if (isComparison && facilities.length >= 2) {
    intent = "comparison";
    operation = "compare";
    requiresLiveData = true;
  }
  // Multi-Source Intent
  else if (multiSourceCheck.isMultiSource) {
    intent = "multi_source";
    operation = "aggregate";
    requiresLiveData = true;
  }
  // Facilities Directory Intent (Only if not asking about stock or blood units)
  else if (
    !bloodGroup &&
    !normalized.includes("blood inventory") &&
    !normalized.includes("blood stock") &&
    !normalized.includes("units are available") &&
    !normalized.startsWith("how many") &&
    !normalized.startsWith("how much") &&
    (normalized.includes("blood bank") ||
      normalized.includes("blood banks") ||
      normalized.includes("hospitals") ||
      normalized.includes("facilities") ||
      normalized.includes("connected") ||
      normalized.includes("in trichy") ||
      normalized.includes("in tamil nadu"))
  ) {
    intent = "facilities";
    operation = "directory";
    requiresLiveData = true;
  }
  // ==============================================================
  // PHASE 6: EXPLAINABILITY & DECISION SUPPORT INTENTS
  // ==============================================================

  // 1. Transfer Decision Support & Review (Step 9)
  else if (
    (transferId !== null && (normalized.includes("review") || normalized.includes("check") || normalized.includes("pending") || normalized.startsWith("explain") || normalized.includes("decision"))) ||
    normalized.includes("review before approving") ||
    normalized.includes("check before approving") ||
    normalized.includes("what should i check") ||
    normalized.includes("why is this transfer pending") ||
    normalized.includes("why is the transfer pending") ||
    normalized.includes("what information matters for this transfer") ||
    (normalized.includes("transfer") && (normalized.includes("review") || normalized.includes("pending") || normalized.includes("decision support") || normalized.includes("decision-support"))) ||
    (isFollowUp && (context?.transferId || context?.intent === "transfers" || context?.intent === "decision_support_transfer") && (normalized.includes("pending") || normalized.includes("review") || normalized === "why" || normalized === "why?"))
  ) {
    intent = "decision_support_transfer";
    operation = "explain";
    requiresLiveData = true;
  }
  // 2. Request Decision Support & Review (Step 8, Step 17)
  else if (
    (requestId !== null && (normalized.includes("urgent") || normalized.startsWith("explain") || normalized.includes("review") || normalized.includes("consider") || normalized.includes("decision"))) ||
    (!transferId && !normalized.includes("transfer") && !normalized.includes("approv") && (
      normalized.includes("decision support") ||
      normalized.includes("decision-support") ||
      normalized.includes("what should i review") ||
      normalized.includes("what should the doctor review") ||
      normalized.includes("what should the doctor consider") ||
      normalized.includes("what information should i consider") ||
      normalized.includes("how should i review") ||
      normalized.includes("why is it urgent") ||
      (isFollowUp && (context?.requestId || context?.intent === "requests" || context?.intent === "decision_support_request") && (normalized.includes("urgent") || normalized.includes("review") || normalized === "why" || normalized === "why?"))
    ))
  ) {
    intent = "decision_support_request";
    operation = "explain";
    requiresLiveData = true;
  }
  // 3. Shortage Risk Explanation (Step 5)
  else if (
    (normalized.includes("why is") && (normalized.includes("shortage") || normalized.includes("at risk"))) ||
    normalized.includes("what causes shortage") ||
    normalized.includes("factors contribute to shortage") ||
    normalized.includes("factors affect shortage") ||
    normalized.includes("explain this shortage") ||
    normalized.includes("explain shortage risk") ||
    (isFollowUp && (context?.intent === "shortage" || context?.intent === "explain_shortage") && (normalized === "why" || normalized === "why?"))
  ) {
    intent = "explain_shortage";
    operation = "explain";
    requiresLiveData = true;
  }
  // 4. Expiry Risk Explanation (Step 6)
  else if (
    (normalized.includes("why is") && (normalized.includes("expiring") || normalized.includes("expiry"))) ||
    normalized.includes("which stock should be used first") ||
    normalized.includes("explain expiry risk") ||
    normalized.includes("explain this expiry") ||
    (isFollowUp && (context?.intent === "expiry" || context?.intent === "explain_expiry") && (normalized === "why" || normalized === "why?"))
  ) {
    intent = "explain_expiry";
    operation = "explain";
    requiresLiveData = true;
  }
  // 5. Demand Forecast Explanation (Step 7)
  else if (
    normalized.includes("why is demand predicted") ||
    normalized.includes("what is the demand forecast based on") ||
    normalized.includes("explain the forecast") ||
    normalized.includes("explain the demand forecast") ||
    normalized.includes("explain demand prediction") ||
    (bloodGroup && normalized.includes("explain") && normalized.includes("forecast"))
  ) {
    intent = "explain_demand";
    operation = "explain";
    requiresLiveData = true;
  }
  // 6. Source Selection / Why this Facility (Step 4)
  else if (
    normalized.startsWith("why choose") ||
    (normalized.includes("why was") && normalized.includes("recommended") && facility) ||
    normalized.includes("why is this source better") ||
    normalized.includes("compare possible sources")
  ) {
    intent = "explain_source_selection";
    operation = "explain";
    requiresLiveData = true;
  }
  // 7. Recommendation Explanation & Factors (Step 3)
  else if (
    normalized.includes("why was this recommendation") ||
    normalized.includes("why is this recommendation") ||
    normalized.includes("why was this source recommended") ||
    normalized.includes("why this source") ||
    normalized.includes("why this hospital") ||
    normalized.includes("what factors affect this recommendation") ||
    normalized.includes("what factors were considered") ||
    normalized.includes("explain the recommendation") ||
    normalized.includes("explain recommendation") ||
    normalized.includes("which source has enough stock") ||
    normalized.includes("how does distance affect the recommendation") ||
    (isFollowUp && (context?.intent === "recommendations" || context?.intent === "explain_recommendation") && (normalized === "why" || normalized === "why?"))
  ) {
    intent = "explain_recommendation";
    operation = "explain";
    requiresLiveData = true;
  }
  // Request Lookup / List Intent
  else if (
    requestId !== null ||
    normalized.includes("request") ||
    normalized.includes("who requested") ||
    (isFollowUp && context?.intent === "requests")
  ) {
    intent = "requests";
    operation = requestId ? "lookup" : "list";
    requiresLiveData = true;
  }
  // Transfer Lookup / List Intent
  else if (
    transferId !== null ||
    normalized.includes("transfer") ||
    normalized.includes("where is trf") ||
    (isFollowUp && context?.intent === "transfers")
  ) {
    intent = "transfers";
    operation = transferId ? "lookup" : "list";
    requiresLiveData = true;
  }
  // Shortage Risk Intent
  else if (
    normalized.includes("shortage") ||
    normalized.includes("at risk") ||
    normalized.includes("shortage warning")
  ) {
    intent = "shortage";
    operation = "risk_assessment";
    requiresLiveData = true;
  }
  // Expiry Risk Intent
  else if (
    normalized.includes("expir") ||
    normalized.includes("shelf life") ||
    normalized.includes("what is expiring") ||
    normalized.includes("which blood expires")
  ) {
    intent = "expiry";
    operation = "risk_assessment";
    requiresLiveData = true;
  }
  // Demand Predictions Intent
  else if (
    normalized.includes("predict") ||
    normalized.includes("demand") ||
    normalized.includes("forecast")
  ) {
    intent = "demand";
    operation = "forecast";
    requiresLiveData = true;
  }
  // Recommendation Sourcing Intent
  else if (normalized.includes("recommend")) {
    intent = "recommendations";
    operation = "lookup";
    requiresLiveData = true;
  }
  // Live Inventory Intent (when explicit bloodGroup, units, stock, or inventory keywords are present)
  else if (
    bloodGroup !== null ||
    normalized.includes("inventory") ||
    normalized.includes("stock") ||
    normalized.includes("units") ||
    normalized.includes("available") ||
    normalized.includes("do we have") ||
    normalized.includes("how much") ||
    normalized.includes("how many") ||
    normalized.includes("can i get") ||
    normalized.includes("can we get")
  ) {
    intent = "inventory";
    operation = "availability";
    requiresLiveData = true;
  }
  // Otherwise default to static platform/fallback knowledge
  else {
    intent = "static";
    operation = "explain";
    requiresLiveData = false;
  }

  // 6. Build Filter Map
  const filters = {};
  if (bloodGroup) filters.bloodGroup = bloodGroup;
  if (facility) filters.hospital = facility;
  if (district) filters.district = district;
  if (state) filters.state = state;
  if (requestId) filters.requestId = requestId;
  if (transferId) filters.transferId = transferId;
  if (urgency) filters.urgency = urgency;
  if (status) filters.status = status;

  return {
    rawText,
    normalized,
    intent,
    operation,
    entities: {
      bloodGroup,
      facility,
      facilities,
      district,
      state,
      requestId,
      transferId,
      urgency,
      status,
      compareFacilities: isComparison ? facilities.slice(0, 2) : [],
    },
    filters,
    requiresLiveData,
    isFollowUp,
    inheritedFromContext,
    isMultiSource: multiSourceCheck.isMultiSource,
    multiSources: multiSourceCheck.sources,
    isComparison,
    clarificationQuestion: null,
    confidence: "high",
    // Context snapshot to persist for next session turn
    contextState: {
      intent,
      operation,
      bloodGroup: bloodGroup || context?.bloodGroup || null,
      facility: facility || context?.facility || null,
      district: district || context?.district || null,
      state: state || context?.state || null,
      requestId: requestId || context?.requestId || null,
      transferId: transferId || context?.transferId || null,
      urgency: urgency || context?.urgency || null,
      status: status || context?.status || null,
    },
  };
}
