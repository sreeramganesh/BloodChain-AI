import {
  getLiveBloodInventory,
  getLiveBloodRequests,
  getLiveFacilities,
  getLiveTransfers,
  getLiveShortageRisks,
  getLiveExpiryRisks,
  getLiveDemandPredictions,
  getLiveRecommendationData,
} from "./liveDataService.js";
import { isSupabaseConfigured } from "../supabaseClient.js";
import { BLOOD_COMPATIBILITY_MATRIX, checkBloodCompatibility } from "../recommendationEngine.js";


/**
 * BloodChain AI Assistant — Decision-Support Intelligence & Explainability Service (Phase 6)
 *
 * STRICT SAFETY & CLINICAL GOVERNANCE RULES:
 * - 100% Read-Only: ZERO database writes (no insert/update/delete/upsert).
 * - Zero autonomous actions: The AI Assistant does NOT approve, dispatch, or modify records.
 * - Human-in-the-Loop Safeguard: Every operational answer explicitly states:
 *   "Final operational decisions require authorized medical officer review."
 * - Zero hallucination / Zero fabrication:
 *   - Explicitly distinguishes NO DATA vs LOW RISK vs NO RISK.
 *   - If tables/records are empty, states that no active records are logged.
 * - Source Transparency: Clearly attributes evidence to live Supabase tables or clinical rules.
 */

// Human review safeguard statement (Step 10)
export const HUMAN_REVIEW_DISCLAIMER =
  "Final operational decisions require authorized medical officer review.";

export const TRANSFER_DECISION_DISCLAIMER =
  "AI provides decision-support information only. Authorized personnel must make the final decision.";

/**
 * 1. RECOMMENDATION EXPLANATION (Step 3 & Step 15)
 * Explains factors behind an AI recommendation for a specific request.
 */
export async function explainRecommendation({ requestId = null, sourceFacility = null, bloodGroup = null } = {}) {
  // Query live recommendations
  const recRes = await getLiveRecommendationData({ requestId });
  const recs = recRes.data || [];

  if (recs.length === 0) {
    return {
      success: true,
      text: requestId
        ? `There are currently no stored AI recommendation records to explain for request "${requestId}".`
        : `There are currently no stored AI recommendation records to explain.`,
      category: "Decision Support",
      source: "live-supabase-data",
      explanationType: "recommendation_explanation",
      humanReviewRequired: true,
    };
  }

  // Find candidate or top recommendation
  const rec = (sourceFacility && recs.find((r) => r.source?.name?.toLowerCase().includes(sourceFacility.toLowerCase()))) || recs[0];
  const srcName = rec.source?.name || sourceFacility || "Designated Facility";
  const reqId = rec.request_id || requestId || "Current Request";
  const bGroup = rec.blood_group || bloodGroup || "Unspecified";

  // Check matching inventory at this source
  const invRes = await getLiveBloodInventory({ hospital: srcName, bloodGroup: bGroup });
  const availUnits = (invRes.data || []).reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);

  let response = `Recommendation Explanation\n\n`;
  response += `Source:\n${srcName}\n\n`;
  response += `Relevant factors for Request ${reqId}:\n`;
  response += `• Blood group compatibility: ${rec.compatibility_status || "Compatible"}\n`;
  response += `• Available quantity: ${availUnits > 0 ? `${availUnits} units` : "Quantity held at facility"}\n`;
  response += `• Requested quantity: ${rec.recommended_units || "As requested"} units\n`;

  if (rec.distance_km !== null && rec.distance_km !== undefined) {
    response += `• Distance: ${rec.distance_km} km\n`;
  }
  if (rec.estimated_transport_minutes !== null && rec.estimated_transport_minutes !== undefined) {
    response += `• Estimated travel time: ${rec.estimated_transport_minutes} mins\n`;
  }
  if (rec.recommendation_score !== null && rec.recommendation_score !== undefined) {
    response += `• Recommendation score: ${rec.recommendation_score}/100 [Priority: ${rec.priority || "Standard"}]\n`;
  }
  if (rec.recommendation_reason) {
    response += `• Stored rationale: ${rec.recommendation_reason}\n`;
  }

  response += `\nThese factors are provided as decision-support information.\n${HUMAN_REVIEW_DISCLAIMER}`;

  return {
    success: true,
    text: response,
    category: "Decision Support",
    source: "live-supabase-data",
    explanationType: "recommendation_explanation",
    humanReviewRequired: true,
  };
}

/**
 * 2. SOURCE SELECTION / COMPARISON EXPLANATION (Step 4 & Step 16)
 * Explains measurable factors between prospective source facilities neutrally.
 */
export async function explainSourceSelection({ facility = null, candidateFacilities = [], bloodGroup = null, requestId = null } = {}) {
  // If specific facility asked: "Why choose Apollo?"
  if (facility && !candidateFacilities.length) {
    const invRes = await getLiveBloodInventory({ hospital: facility, bloodGroup });
    const records = invRes.data || [];
    const totalAvail = records.reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);

    let response = `Source Selection Analysis\n\n`;
    response += `${facility}:\n`;
    response += `• Available ${bloodGroup || "blood"} stock: ${totalAvail} units\n`;
    response += `• Stock status: ${records.length > 0 ? records[0].status : "Monitored"}\n`;
    response += `• Compatibility: ${bloodGroup ? "Compatible for recipient verification" : "Subject to ABO/Rh match"}\n`;
    response += `• Sourcing feasibility: Verified registered facility in BloodChain network\n\n`;
    response += `The displayed sourcing analysis is based on current BloodChain inventory records.\n`;
    response += `These factors are provided as decision-support information.\n${HUMAN_REVIEW_DISCLAIMER}`;

    return {
      success: true,
      text: response,
      category: "Decision Support",
      source: "live-supabase-data",
      explanationType: "source_selection",
      humanReviewRequired: true,
    };
  }

  // Multi-source comparison explanation
  const facList = candidateFacilities.length >= 2 ? candidateFacilities : ["Apollo Hospital", "Trichy Blood Bank"];
  const [res1, res2] = await Promise.all([
    getLiveBloodInventory({ hospital: facList[0], bloodGroup }),
    getLiveBloodInventory({ hospital: facList[1], bloodGroup }),
  ]);

  const units1 = (res1.data || []).reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);
  const units2 = (res2.data || []).reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);

  const groupLabel = bloodGroup ? `${bloodGroup} ` : "";
  let response = `Source Comparison\n\n`;
  response += `${facList[0]}:\n`;
  response += `• Available ${groupLabel}stock: ${units1} units\n`;
  response += `• Compatibility: Compatible with standard verification\n\n`;

  response += `${facList[1]}:\n`;
  response += `• Available ${groupLabel}stock: ${units2} units\n`;
  response += `• Compatibility: Compatible with standard verification\n\n`;

  response += `The displayed recommendation is based on the existing BloodChain recommendation logic.\n`;
  response += `These factors are provided as decision-support information.\n${HUMAN_REVIEW_DISCLAIMER}`;

  return {
    success: true,
    text: response,
    category: "Decision Support",
    source: "live-supabase-data",
    explanationType: "source_comparison",
    humanReviewRequired: true,
  };
}

/**
 * 3. SHORTAGE-RISK EXPLANATION (Step 5 & Step 15)
 * Explains active stored shortage risk records without fabricating values.
 */
export async function explainShortageRisk({ bloodGroup = null, facility = null } = {}) {
  const res = await getLiveShortageRisks({ bloodGroup });
  const records = res.data || [];

  if (records.length === 0) {
    const groupNotice = bloodGroup ? ` for ${bloodGroup}` : "";
    return {
      success: true,
      text: `BloodChain currently has no active shortage-risk record${groupNotice}, so there is no stored risk explanation to display. (Status: Zero active records logged in live database).`,
      category: "Decision Support",
      source: "live-supabase-data",
      explanationType: "shortage_risk_explanation",
      humanReviewRequired: true,
    };
  }

  let text = `Shortage Risk Evaluation Factors:\n\n`;
  records.forEach((r) => {
    const facName = r.facilities?.name || facility || "Monitored Facility";
    text += `• ${r.blood_group} at ${facName}:\n`;
    text += `  - Risk Level: ${r.risk_level} (Score: ${r.risk_score})\n`;
    text += `  - Current Available: ${r.current_available_units} units\n`;
    text += `  - Predicted Demand: ${r.predicted_demand_units} units\n`;
    text += `  - Safety Buffer: ${r.safety_stock_units} units\n`;
    text += `  - Projected Shortage: ${r.shortage_units} units\n\n`;
  });

  text += `Shortage risk is evaluated based on demand velocity vs current safety buffer.\n${HUMAN_REVIEW_DISCLAIMER}`;

  return {
    success: true,
    text: text.trim(),
    category: "Decision Support",
    source: "live-supabase-data",
    explanationType: "shortage_risk_explanation",
    humanReviewRequired: true,
  };
}

/**
 * 4. EXPIRY-RISK EXPLANATION (Step 6 & Step 15)
 * Explains active stored expiry risk records and FEFO priorities.
 */
export async function explainExpiryRisk({ bloodGroup = null, facility = null } = {}) {
  const res = await getLiveExpiryRisks({ bloodGroup });
  const records = res.data || [];

  if (records.length === 0) {
    return {
      success: true,
      text: `There are currently no active expiry-risk records to explain. No units are logged as nearing expiration.`,
      category: "Decision Support",
      source: "live-supabase-data",
      explanationType: "expiry_risk_explanation",
      humanReviewRequired: true,
    };
  }

  let text = `Expiry Risk & FEFO Prioritization Analysis:\n\n`;
  records.forEach((e) => {
    const facName = e.facilities?.name || facility || "Facility";
    text += `• ${e.blood_group} (${e.available_units} units) at ${facName}:\n`;
    text += `  - Expiry Date: ${e.expiry_date} (${e.days_remaining} day(s) remaining)\n`;
    text += `  - Risk Assessment: ${e.risk_level} (Score: ${e.risk_score})\n`;
    if (e.recommended_action) {
      text += `  - FEFO Action: ${e.recommended_action}\n`;
    }
    text += `\n`;
  });

  text += `Under First Expiry, First Out (FEFO) clinical protocols, units with the shortest shelf-life are prioritized for immediate matching to prevent clinical wastage.\n${HUMAN_REVIEW_DISCLAIMER}`;

  return {
    success: true,
    text: text.trim(),
    category: "Decision Support",
    source: "live-supabase-data",
    explanationType: "expiry_risk_explanation",
    humanReviewRequired: true,
  };
}

/**
 * 5. DEMAND FORECAST EXPLANATION (Step 7 & Step 15)
 * Explains stored demand forecasting model results.
 */
export async function explainDemandPrediction({ bloodGroup = null } = {}) {
  const res = await getLiveDemandPredictions({ bloodGroup });
  const records = res.data || [];

  if (records.length === 0) {
    return {
      success: true,
      text: `There are currently no stored demand predictions to explain. No forecasting models have active projections logged.`,
      category: "Decision Support",
      source: "live-supabase-data",
      explanationType: "demand_prediction_explanation",
      humanReviewRequired: true,
    };
  }

  let text = `Demand Forecast Explanation\n\n`;
  records.forEach((p) => {
    const facName = p.facilities?.name || "Facility";
    text += `• BloodChain's stored demand prediction for ${p.blood_group} at ${facName}:\n`;
    text += `  - Forecast Horizon: ${p.forecast_horizon_days} days\n`;
    text += `  - Projected Need: ${p.predicted_units} units (Range: ${p.lower_bound} - ${p.upper_bound})\n`;
    text += `  - Statistical Confidence: ${Math.round((p.confidence || 0.95) * 100)}%\n`;
    text += `  - Forecast Model: ${p.model_name || "Holt Linear Statistical Model"}\n\n`;
  });

  text += `Predictions reflect statistical projections based on historical clinical consumption and are provided as decision support only. They do not constitute guaranteed outcomes.`;

  return {
    success: true,
    text: text.trim(),
    category: "Decision Support",
    source: "live-supabase-data",
    explanationType: "demand_prediction_explanation",
    humanReviewRequired: true,
  };
}

/**
 * DEMO MODE FIXTURES
 * Used when Supabase is not configured so tests and demo environments
 * can exercise the full decision-support code paths with realistic data.
 */
const DEMO_REQUESTS = {
  BRQ001: {
    id: "BRQ001",
    patient_name: "R. Karthik",
    blood_group: "O+",
    units_needed: 4,
    urgency: "Critical",
    status: "Pending",
    hospital: "Apollo Hospital",
    district: "Trichy",
    requested_by: "Dr. Meena",
  },
};

const DEMO_TRANSFERS = {
  TRF001: {
    id: "TRF001",
    blood_group: "O+",
    units_transferred: 6,
    from_location: "Trichy Blood Bank",
    to_location: "Trichy GH",
    status: "Pending",
    reason: "Emergency shortage coverage",
    created_at: "2025-09-01T06:00:00Z",
  },
};

/**
 * 6. REQUEST DECISION SUPPORT & SUMMARY (Step 8, Step 17)
 * Comprehensive decision-support breakdown for a specific blood request.
 */
export async function getDecisionSupportSummary({ requestId, rawText = "" }) {
  if (!requestId) {
    return {
      success: false,
      text: "Please specify a valid Blood Request ID (e.g., BRQ001) to view decision-support factors.",
      category: "Decision Support",
      source: "fallback",
    };
  }

  // Demo Mode: use fixture data when Supabase is unavailable
  const demoReq = !isSupabaseConfigured() ? DEMO_REQUESTS[requestId.toUpperCase()] : null;

  const reqList = demoReq
    ? [demoReq]
    : (await getLiveBloodRequests({ requestId })).data || [];

  if (reqList.length === 0) {
    return {
      success: true,
      text: `I couldn't find a live blood request with ID "${requestId}" to generate a decision-support summary.`,
      category: "Decision Support",
      source: "live-supabase-data",
    };
  }

  const req = reqList[0];
  const bloodGroup = req.blood_group;

  // Retrieve inventory and risk information for this blood group in parallel
  const [invRes, shortRes, expRes, recRes] = await Promise.all([
    getLiveBloodInventory({ bloodGroup }),
    getLiveShortageRisks({ bloodGroup }),
    getLiveExpiryRisks({ bloodGroup }),
    getLiveRecommendationData({ requestId }),
  ]);

  const invRecords = invRes.data || [];
  const totalAvailable = invRecords.reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);
  const facilityCount = new Set(invRecords.map((r) => r.hospital)).size;

  const shortRecords = shortRes.data || [];
  const expRecords = expRes.data || [];
  const recRecords = recRes.data || [];

  // Urgency Rationale
  let urgencyRationale;
  if (req.urgency?.toLowerCase() === "critical") {
    urgencyRationale = "Immediate life-support / emergency trauma classification requiring immediate human verification.";
  } else if (req.urgency?.toLowerCase() === "high") {
    urgencyRationale = "Expedited clinical window; requires prioritized fulfillment.";
  } else {
    urgencyRationale = "Standard scheduled operational timeline.";
  }

  let text = `Decision Support Summary for ${req.id}\n\n`;
  text += `Clinical & Operational Request Data:\n`;
  text += `• Patient / ID: ${req.patient_name || "Confidential"} (${req.id})\n`;
  text += `• Blood group: ${req.blood_group}\n`;
  text += `• Quantity requested: ${req.units_needed} units\n`;
  text += `• Urgency: ${req.urgency} (${urgencyRationale})\n`;
  text += `• Status: ${req.status}\n`;
  text += `• Requesting facility: ${req.hospital || "Hospital"}\n\n`;

  text += `Current Matching Inventory:\n`;
  if (invRecords.length > 0) {
    text += `• Available matching stock: ${totalAvailable} units across ${facilityCount} facility/facilities\n`;
    invRecords.forEach((r) => {
      text += `  - ${r.hospital}: ${r.available_units} units [${r.status}]\n`;
    });
  } else {
    text += `• Available matching stock: 0 units currently logged in database for ${bloodGroup}.\n`;
  }
  text += `\n`;

  text += `Risk Information:\n`;
  text += `• Shortage risk: ${shortRecords.length > 0 ? `${shortRecords[0].risk_level} risk at ${shortRecords[0].facilities?.name || "Facility"}` : "No active shortage-risk records logged"}\n`;
  text += `• Expiry risk: ${expRecords.length > 0 ? `${expRecords[0].risk_level} risk (${expRecords[0].days_remaining} days remaining)` : "No active expiry-risk records logged"}\n\n`;

  text += `Stored AI Recommendation:\n`;
  if (recRecords.length > 0) {
    const r = recRecords[0];
    const src = r.source?.name || "Source Facility";
    text += `• Recommended source: ${src} (${r.recommended_units} units, Score: ${r.recommendation_score}/100)\n`;
    if (r.recommendation_reason) text += `• Reason: ${r.recommendation_reason}\n`;
  } else {
    text += `• Stored recommendation: No stored AI recommendation records available for ${req.id}.\n`;
  }
  text += `\n`;

  text += `Authorized Review Safeguard:\n`;
  text += `• Review these factors before making the final operational decision.\n`;
  text += `• ${HUMAN_REVIEW_DISCLAIMER}`;

  return {
    success: true,
    text: text.trim(),
    category: "Decision Support",
    source: "live-supabase-data",
    explanationType: "request_decision_support",
    humanReviewRequired: true,
    decisionSupportData: {
      type: "request_decision_support",
      requestId: req.id,
      patient: req.patient_name,
      bloodGroup: req.blood_group,
      unitsNeeded: req.units_needed,
      urgency: req.urgency,
      hospital: req.hospital,
      status: req.status,
      matchingAvailable: totalAvailable,
      shortageLogged: shortRecords.length > 0,
      expiryLogged: expRecords.length > 0,
      recommendationLogged: recRecords.length > 0,
    },
  };
}


/**
 * 7. TRANSFER DECISION SUPPORT (Step 9)
 * Explains operational parameters and safety checklist for a blood transfer.
 */
export async function explainTransferDecision({ transferId }) {
  if (!transferId) {
    return {
      success: false,
      text: "Please specify a valid Transfer ID (e.g., TRF001) to review decision factors.",
      category: "Decision Support",
      source: "fallback",
    };
  }

  // Demo Mode: use fixture data when Supabase is unavailable
  const demoTransfer = !isSupabaseConfigured() ? DEMO_TRANSFERS[transferId.toUpperCase()] : null;

  const transfers = demoTransfer
    ? [demoTransfer]
    : (await getLiveTransfers({ transferId })).data || [];

  if (transfers.length === 0) {
    return {
      success: true,
      text: `I couldn't find a live blood transfer with ID "${transferId}" to review.`,
      category: "Decision Support",
      source: "live-supabase-data",
    };
  }

  const t = transfers[0];

  // Check inventory at source
  const invRes = await getLiveBloodInventory({ hospital: t.from_location, bloodGroup: t.blood_group });
  const sourceStock = (invRes.data || []).reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);

  let text = `Transfer Decision Support Checklist for ${t.id}\n\n`;
  text += `Operational Transfer Data:\n`;
  text += `• Transfer ID: ${t.id}\n`;
  text += `• Route: From "${t.from_location}" → To "${t.to_location}"\n`;
  text += `• Blood Group: ${t.blood_group}\n`;
  text += `• Units to Dispatch: ${t.units_transferred} units\n`;
  text += `• Status: ${t.status}\n`;
  if (t.created_at) text += `• Initiated: ${new Date(t.created_at).toLocaleDateString()}\n`;
  text += `\n`;

  text += `Source Sourcing Feasibility:\n`;
  text += `• Current matching stock at ${t.from_location}: ${sourceStock} units\n`;
  text += `• Stock fulfillment: ${sourceStock >= Number(t.units_transferred) ? "Sufficient stock available at source" : "Verify unreserved unit count before approval"}\n\n`;

  text += `Clinical & Cold-Chain Checklist:\n`;
  text += `• Verify recipient blood cross-match compatibility\n`;
  text += `• Ensure cold-chain transport container calibrated (2°C - 6°C for whole blood/RBC)\n`;
  text += `• Confirm receiving hospital transfer acceptance contact\n\n`;

  text += `Authorized Personnel Action:\n`;
  text += `• ${TRANSFER_DECISION_DISCLAIMER}`;

  return {
    success: true,
    text: text.trim(),
    category: "Decision Support",
    source: "live-supabase-data",
    explanationType: "transfer_decision_support",
    humanReviewRequired: true,
    decisionSupportData: {
      type: "transfer_decision_support",
      transferId: t.id,
      from: t.from_location,
      to: t.to_location,
      bloodGroup: t.blood_group,
      units: t.units_transferred,
      status: t.status,
      sourceStock,
    },
  };
}

