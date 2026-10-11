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

import {
  extractBloodGroup,
  extractRequestId,
  extractTransferId,
  extractFacilities,
  extractDistrict,
  extractState,
  extractUrgency,
  extractStatus,
} from "./queryUnderstandingService.js";

// Legacy export compatibility
export {
  extractBloodGroup,
  extractRequestId,
  extractTransferId,
};

/**
 * Extracts hospital keyword for legacy compatibility
 */
export function extractHospital(text) {
  const facs = extractFacilities(text);
  return facs.length > 0 ? facs[0] : null;
}

/**
 * Executes and formats live inventory queries (Phase 4 + Phase 5)
 */
export async function executeInventoryQuery(normalized, rawText, structured = null) {
  const bloodGroup = structured?.entities?.bloodGroup ?? extractBloodGroup(rawText);
  const hospital = structured?.entities?.facility ?? extractHospital(rawText);
  const district = structured?.entities?.district ?? extractDistrict(rawText);

  const res = await getLiveBloodInventory({ bloodGroup, hospital, district });
  if (!res.success) {
    return {
      success: false,
      text: res.error,
      category: "Blood Inventory",
    };
  }

  const records = res.data;
  if (!records || records.length === 0) {
    const filterDesc = [
      bloodGroup ? `for ${bloodGroup}` : "",
      hospital ? `at ${hospital}` : "",
      district ? `in ${district}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      success: true,
      text: `No matching live inventory records were found in the database ${filterDesc}.`.trim(),
      category: "Blood Inventory",
    };
  }

  // Calculate aggregates
  const totalAvailable = records.reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);
  const totalReserved = records.reduce((sum, r) => sum + (Number(r.reserved_units) || 0), 0);
  const facilityCount = new Set(records.map((r) => r.hospital)).size;

  let response = "";

  // Case A: Specific Blood Group across facilities or in a district
  if (bloodGroup && !hospital) {
    const locDesc = district ? ` in ${district}` : "";
    response += `Current Blood Availability${locDesc}\n\n`;
    response += `• Blood Group: ${bloodGroup}\n`;
    response += `• Total Available Units: ${totalAvailable} units\n`;
    response += `• Reserved Units: ${totalReserved} units\n`;
    response += `• Facilities with stock: ${facilityCount}\n\n`;
    response += `Facility Breakdown:\n`;
    records.forEach((r) => {
      response += `  - ${r.hospital} (${r.location}): ${r.available_units} units available [Status: ${r.status}, Expiry: ${r.expiry_date}]\n`;
    });

    response += `\nRelated Actions:\n`;
    response += `• Check ${bloodGroup} shortage risk\n`;
    response += `• Show ${bloodGroup} expiry risks\n`;
    response += `• Show pending blood requests`;
  }
  // Case B: Specific Hospital inventory across blood groups
  else if (hospital && !bloodGroup) {
    response += `Current Blood Availability at ${records[0].hospital}\n\n`;
    records.forEach((r) => {
      response += `• ${r.blood_group}: ${r.available_units} units available (${r.reserved_units} reserved, total ${r.total_units || r.available_units + r.reserved_units}) [${r.status}]\n`;
    });
    response += `\nTotal unreserved units at facility: ${totalAvailable} units.\n`;
    response += `\nRelated Actions:\n`;
    response += `• Check shortage risks at ${records[0].hospital}\n`;
    response += `• Show connected blood banks\n`;
    response += `• Show active transfers`;
  }
  // Case C: Specific Blood Group at Specific Hospital
  else if (bloodGroup && hospital) {
    const r = records[0];
    response += `Current Blood Availability for ${bloodGroup} at ${r.hospital}\n\n`;
    response += `• Available Units: ${r.available_units} units\n`;
    response += `• Reserved Units: ${r.reserved_units} units\n`;
    response += `• Expiry Date: ${r.expiry_date}\n`;
    response += `• Stock Status: ${r.status}\n`;
    response += `• Location: ${r.location}\n`;

    response += `\nRelated Actions:\n`;
    response += `• Compare ${bloodGroup} with other facilities\n`;
    response += `• Check ${bloodGroup} shortage risk\n`;
    response += `• Show pending requests for ${bloodGroup}`;
  }
  // Case D: General Network Summary
  else {
    response += `Current BloodChain Network Inventory (${records.length} records retrieved):\n\n`;
    const groups = {};
    records.forEach((r) => {
      groups[r.blood_group] = (groups[r.blood_group] || 0) + (Number(r.available_units) || 0);
    });
    response += `Available Units by Blood Group:\n`;
    Object.keys(groups)
      .sort()
      .forEach((bg) => {
        response += `• ${bg}: ${groups[bg]} available units\n`;
      });
    response += `\nTotal Network Unreserved Stock: ${totalAvailable} units across connected facilities.\n`;
    response += `\nRelated Actions:\n`;
    response += `• Show current blood requests\n`;
    response += `• Show available blood banks\n`;
    response += `• Check shortage risks`;
  }

  response += `\n\nFinal operational allocations remain subject to authorized medical officer review.`;

  return {
    success: true,
    text: response,
    category: "Blood Inventory",
  };
}

/**
 * Executes and formats live blood request queries
 */
export async function executeBloodRequestQuery(normalized, rawText, structured = null) {
  const requestId = structured?.entities?.requestId ?? extractRequestId(rawText);
  const bloodGroup = structured?.entities?.bloodGroup ?? extractBloodGroup(rawText);
  const district = structured?.entities?.district ?? extractDistrict(rawText);

  let urgency = structured?.entities?.urgency;
  if (!urgency) {
    if (normalized.includes("critical")) urgency = "Critical";
    else if (normalized.includes("urgent") || normalized.includes("high")) urgency = "High";
  }

  let status = structured?.entities?.status;
  if (!status) {
    if (normalized.includes("pending")) status = "Pending";
    else if (normalized.includes("progress")) status = "In Progress";
    else if (normalized.includes("fulfilled") || normalized.includes("completed")) status = "Fulfilled";
  }

  // 1. Specific Request ID lookup
  if (requestId) {
    const res = await getLiveBloodRequests({ requestId });
    if (!res.success) {
      return { success: false, text: res.error, category: "Blood Requests" };
    }
    if (!res.data || res.data.length === 0) {
      return {
        success: true,
        text: `I couldn't find a live blood request with ID "${requestId}" in the database.`,
        category: "Blood Requests",
      };
    }

    const r = res.data[0];
    const dateFormatted = r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent";
    const text =
      `Live Blood Request Details for ${r.id}:\n\n` +
      `• Patient Name: ${r.patient_name}\n` +
      `• Blood Group: ${r.blood_group}\n` +
      `• Units Needed: ${r.units_needed} units\n` +
      `• Hospital: ${r.hospital} (${r.district || "Trichy"})\n` +
      `• Urgency Level: ${r.urgency}\n` +
      `• Current Status: ${r.status}\n` +
      `• Requested By: ${r.requested_by || "Clinical Staff"}\n` +
      `• Created: ${dateFormatted}\n\n` +
      `Related Actions:\n` +
      `• Show similar pending requests\n` +
      `• Check ${r.blood_group} stock availability\n` +
      `• View transfer status\n\n` +
      `Note: Request status updates and source allocation require authorized clinical review.`;

    return { success: true, text, category: "Blood Requests" };
  }

  // 2. Filtered or general requests list
  const res = await getLiveBloodRequests({ bloodGroup, urgency, status, district, limit: 8 });
  if (!res.success) {
    return { success: false, text: res.error, category: "Blood Requests" };
  }

  const requests = res.data;
  if (!requests || requests.length === 0) {
    const filterDesc = [
      urgency ? `${urgency.toLowerCase()}` : "",
      status ? `${status.toLowerCase()}` : "",
      district ? `in ${district}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      success: true,
      text: `No matching live ${filterDesc || "blood"} requests were found in the database.`.replace(/\s+/g, " "),
      category: "Blood Requests",
    };
  }

  let text = `Current BloodChain Live Requests (${requests.length} records):\n\n`;
  requests.forEach((r) => {
    text += `• ${r.id}: ${r.patient_name} (${r.blood_group}, ${r.units_needed} units) at ${r.hospital} — Priority: ${r.urgency} | Status: ${r.status}\n`;
  });

  const criticalCount = requests.filter((r) => r.urgency === "Critical").length;
  if (criticalCount > 0) {
    text += `\n⚠️ Alert: ${criticalCount} critical emergency request(s) currently active.\n`;
  }

  text += `\nRelated Actions:\n`;
  text += `• Check matching inventory\n`;
  text += `• View active transfers`;

  return { success: true, text, category: "Blood Requests" };
}

/**
 * Executes and formats live facilities queries
 */
export async function executeFacilityQuery(normalized, rawText, structured = null) {
  let facilityType = null;
  if (normalized.includes("blood bank") || normalized.includes("blood banks")) {
    facilityType = "Blood Bank";
  } else if (normalized.includes("hospital") || normalized.includes("hospitals")) {
    facilityType = "Hospital";
  }

  let district = structured?.entities?.district ?? extractDistrict(rawText);

  const res = await getLiveFacilities({ facilityType, district, limit: 10 });
  if (!res.success) {
    return { success: false, text: res.error, category: "Connected Facilities" };
  }

  const facilities = res.data;
  if (!facilities || facilities.length === 0) {
    return {
      success: true,
      text: "No connected facilities were found matching that criteria in the database.",
      category: "Connected Facilities",
    };
  }

  let text = `Connected BloodChain Facilities (${facilities.length} verified):\n\n`;
  facilities.forEach((f) => {
    text += `• ${f.name} [${f.facility_type}]\n`;
    text += `  Location: ${f.address ? `${f.address}, ` : ""}${f.district}, ${f.state}\n`;
    if (f.phone) text += `  Contact: ${f.phone}\n`;
  });

  text += `\nAll facilities are verified for regional inter-hospital dispatch and emergency coordination.`;
  return { success: true, text, category: "Connected Facilities" };
}

/**
 * Executes and formats live transfer queries
 */
export async function executeTransferQuery(normalized, rawText, structured = null) {
  const transferId = structured?.entities?.transferId ?? extractTransferId(rawText);

  if (transferId) {
    const res = await getLiveTransfers({ transferId });
    if (!res.success) {
      return { success: false, text: res.error, category: "Transfers" };
    }
    if (!res.data || res.data.length === 0) {
      return {
        success: true,
        text: `I couldn't find a live blood transfer with ID "${transferId}" in the database.`,
        category: "Transfers",
      };
    }

    const t = res.data[0];
    const text =
      `Live Blood Transfer Details for ${t.id}:\n\n` +
      `• Blood Group: ${t.blood_group}\n` +
      `• Units: ${t.units} units\n` +
      `• Source Facility: ${t.from_location}\n` +
      `• Destination Facility: ${t.to_location}\n` +
      `• Transit Status: ${t.status}\n` +
      `• Clinical Reason: ${t.reason || "Inter-hospital transfer"}\n` +
      `• Authorized/Requested By: ${t.requested_by || "Clinical Officer"}\n\n` +
      `Related Actions:\n` +
      `• Show active transfers\n` +
      `• Check ${t.blood_group} inventory\n` +
      `• Show connected facilities\n\n` +
      `Note: Blood transfers require strict cold-chain compliance (2°C–6°C) and physical custody confirmation.`;

    return { success: true, text, category: "Transfers" };
  }

  let status = structured?.entities?.status;
  if (!status) {
    if (normalized.includes("completed")) status = "Completed";
    else if (normalized.includes("approved")) status = "Approved";
    else if (normalized.includes("transit") || normalized.includes("active")) status = "In Transit";
    else if (normalized.includes("pending")) status = "Pending";
  }

  let fromLocation = null;
  if (normalized.includes("from")) {
    const facs = extractFacilities(rawText);
    if (facs.length > 0) fromLocation = facs[0];
  }

  const res = await getLiveTransfers({ status, fromLocation, limit: 6 });
  if (!res.success) {
    return { success: false, text: res.error, category: "Transfers" };
  }

  const transfers = res.data;
  if (!transfers || transfers.length === 0) {
    return {
      success: true,
      text: "No matching blood transfers were found in the live database.",
      category: "Transfers",
    };
  }

  let text = `Current BloodChain Transfers (${transfers.length} records):\n\n`;
  transfers.forEach((t) => {
    text += `• ${t.id}: ${t.units} units of ${t.blood_group} from "${t.from_location}" to "${t.to_location}" — Status: ${t.status}\n`;
  });

  return { success: true, text, category: "Transfers" };
}

/**
 * Executes and formats live shortage risk queries
 */
export async function executeShortageRiskQuery(normalized, rawText, structured = null) {
  const bloodGroup = structured?.entities?.bloodGroup ?? extractBloodGroup(rawText);
  const res = await getLiveShortageRisks({ bloodGroup });

  if (!res.success) {
    return { success: false, text: res.error, category: "Shortage Risk" };
  }

  const risks = res.data;
  if (!risks || risks.length === 0) {
    return {
      success: true,
      text: bloodGroup
        ? `No active shortage risk records are currently logged in the live database for blood group ${bloodGroup}.`
        : `No active shortage risk records are currently logged in the live database.`,
      category: "Shortage Risk",
    };
  }

  let text = `Current Live Shortage Risks (${risks.length} records):\n\n`;
  risks.forEach((r) => {
    const facName = r.facilities?.name || "Facility";
    text += `• ${r.blood_group} at ${facName}: Risk Score ${r.risk_score || "N/A"} (${r.risk_level || "Monitored"}) — Available: ${r.current_available_units} units, Projected Deficit: ${r.shortage_units || 0} units\n`;
  });

  return { success: true, text, category: "Shortage Risk" };
}

/**
 * Executes and formats live expiry risk queries
 */
export async function executeExpiryRiskQuery(normalized, rawText, structured = null) {
  const bloodGroup = structured?.entities?.bloodGroup ?? extractBloodGroup(rawText);
  const res = await getLiveExpiryRisks({ bloodGroup });

  if (!res.success) {
    return { success: false, text: res.error, category: "Expiry Risk" };
  }

  const expiries = res.data;
  if (!expiries || expiries.length === 0) {
    return {
      success: true,
      text: bloodGroup
        ? `No active expiry risk records are currently logged in the live database for blood group ${bloodGroup}.`
        : `No active expiry risk records are currently logged in the live database.`,
      category: "Expiry Risk",
    };
  }

  let text = `Current Live Expiry Risks (${expiries.length} units flagged):\n\n`;
  expiries.forEach((e) => {
    const facName = e.facilities?.name || "Facility";
    text += `• ${e.blood_group} (${e.available_units} units) at ${facName} — ${e.days_remaining} day(s) remaining (Expires: ${e.expiry_date}) [Priority: ${e.risk_level || "Active"}]\n`;
  });

  return { success: true, text, category: "Expiry Risk" };
}

/**
 * Executes and formats live demand predictions queries
 */
export async function executeDemandPredictionQuery(normalized, rawText, structured = null) {
  const bloodGroup = structured?.entities?.bloodGroup ?? extractBloodGroup(rawText);
  const res = await getLiveDemandPredictions({ bloodGroup });

  if (!res.success) {
    return { success: false, text: res.error, category: "Demand Predictions" };
  }

  const preds = res.data;
  if (!preds || preds.length === 0) {
    return {
      success: true,
      text: bloodGroup
        ? `No live demand prediction records are currently stored in the database for blood group ${bloodGroup}.`
        : `No live demand prediction records are currently stored in the database.`,
      category: "Demand Predictions",
    };
  }

  let text = `Stored BloodChain Model Demand Predictions (${preds.length} forecasts):\n\n`;
  preds.forEach((p) => {
    const facName = p.facilities?.name || "Facility";
    text += `• ${p.blood_group} at ${facName}: Predicted ${p.predicted_units} units (${p.forecast_horizon_days}-day horizon, ${Math.round((p.confidence || 0.95) * 100)}% confidence)\n`;
  });
  text += `\nModel predictions are calculated using historical transfusion velocity and provide decision-support only.`;

  return { success: true, text, category: "Demand Predictions" };
}

/**
 * Executes and formats live AI recommendations queries
 */
export async function executeRecommendationQuery(normalized, rawText, structured = null) {
  const requestId = structured?.entities?.requestId ?? extractRequestId(rawText);
  const res = await getLiveRecommendationData({ requestId });

  if (!res.success) {
    return { success: false, text: res.error, category: "AI Recommendations" };
  }

  const recs = res.data;
  if (!recs || recs.length === 0) {
    return {
      success: true,
      text: requestId
        ? `No stored recommendation records were found for request "${requestId}" in the live database.`
        : `No stored recommendation records were found in the live database.`,
      category: "AI Recommendations",
    };
  }

  let text = `Live AI Sourcing Recommendations (${recs.length} records):\n\n`;
  recs.forEach((r) => {
    const srcName = r.source?.name || "Source Facility";
    const destName = r.destination?.name || "Destination Hospital";
    text += `• Request ${r.request_id} (${r.blood_group}, ${r.recommended_units} units): Recommended "${srcName}" → "${destName}" [Score: ${r.recommendation_score}/100, Priority: ${r.priority}]\n`;
    if (r.recommendation_reason) text += `  Rationale: ${r.recommendation_reason}\n`;
  });
  text += `\nHuman Review: Final transfer execution requires authorized clinical coordinator authorization.`;

  return { success: true, text, category: "AI Recommendations" };
}

/**
 * Executes and formats factual comparison between two facilities (Phase 5 Step 15)
 */
export async function executeComparisonQuery(structured) {
  const bloodGroup = structured.entities.bloodGroup;
  const compareFacilities = structured.entities.compareFacilities || [];

  if (compareFacilities.length < 2) {
    return {
      success: true,
      text: "Please specify two facilities to compare stock.",
      category: "Blood Inventory",
    };
  }

  const [fac1, fac2] = compareFacilities;

  // Run both queries in parallel
  const [res1, res2] = await Promise.all([
    getLiveBloodInventory({ hospital: fac1, bloodGroup }),
    getLiveBloodInventory({ hospital: fac2, bloodGroup }),
  ]);

  const units1 = (res1.data || []).reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);
  const units2 = (res2.data || []).reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);

  const groupDesc = bloodGroup ? `for ${bloodGroup}` : "across blood groups";
  let response = `Blood Stock Comparison ${groupDesc}:\n\n`;
  response += `• ${fac1}: ${units1} units available\n`;
  response += `• ${fac2}: ${units2} units available\n\n`;

  if (units1 > units2) {
    response += `Reported Difference: ${fac1} has ${units1 - units2} more available unit(s) than ${fac2}.\n`;
  } else if (units2 > units1) {
    response += `Reported Difference: ${fac2} has ${units2 - units1} more available unit(s) than ${fac1}.\n`;
  } else {
    response += `Reported Difference: Both facilities report equal stock (${units1} units).\n`;
  }

  // Network context if bloodGroup is specified
  if (bloodGroup && units1 === 0 && units2 === 0) {
    const netRes = await getLiveBloodInventory({ bloodGroup });
    const altFacilities = (netRes.data || []).filter((r) => r.available_units > 0);
    if (altFacilities.length > 0) {
      response += `\nNetwork Stock Note for ${bloodGroup}:\n`;
      altFacilities.forEach((r) => {
        response += `• ${r.hospital}: ${r.available_units} units available\n`;
      });
    }
  }

  response += `\nChecked from live BloodChain database. Final operational allocations require authorized medical officer review.`;

  return {
    success: true,
    text: response,
    category: "Blood Inventory",
  };
}

/**
 * Executes and formats multi-source live queries (Phase 5 Step 14)
 */
export async function executeMultiSourceQuery(structured) {
  const bloodGroup = structured.entities.bloodGroup;
  const sources = structured.multiSources || ["inventory", "shortage"];

  const queries = [];
  if (sources.includes("inventory")) {
    queries.push(getLiveBloodInventory({ bloodGroup }));
  } else {
    queries.push(Promise.resolve(null));
  }

  if (sources.includes("shortage")) {
    queries.push(getLiveShortageRisks({ bloodGroup }));
  } else {
    queries.push(Promise.resolve(null));
  }

  if (sources.includes("expiry")) {
    queries.push(getLiveExpiryRisks({ bloodGroup }));
  } else {
    queries.push(Promise.resolve(null));
  }

  const [invRes, shortRes, expRes] = await Promise.all(queries);

  let response = `Current BloodChain Multi-Source Intelligence`;
  if (bloodGroup) response += ` for ${bloodGroup}`;
  response += `:\n\n`;

  if (invRes && invRes.success) {
    const totalAvail = (invRes.data || []).reduce((sum, r) => sum + (Number(r.available_units) || 0), 0);
    const facilitiesCount = new Set((invRes.data || []).map((r) => r.hospital)).size;
    response += `Current inventory:\n`;
    response += `• ${bloodGroup || "Total"} available: ${totalAvail} units across ${facilitiesCount} facility/facilities\n`;
    (invRes.data || []).forEach((r) => {
      response += `  - ${r.hospital}: ${r.available_units} units [${r.status}]\n`;
    });
    response += `\n`;
  }

  if (shortRes && shortRes.success) {
    response += `Shortage risk:\n`;
    if (!shortRes.data || shortRes.data.length === 0) {
      response += `• Current shortage-risk records: none logged.\n\n`;
    } else {
      shortRes.data.forEach((r) => {
        response += `• ${r.blood_group} at ${r.facilities?.name || "Facility"}: Risk ${r.risk_score || "Monitored"} (${r.risk_level})\n`;
      });
      response += `\n`;
    }
  }

  if (expRes && expRes.success) {
    response += `Expiry risk:\n`;
    if (!expRes.data || expRes.data.length === 0) {
      response += `• Current expiry-risk records: none logged.\n\n`;
    } else {
      expRes.data.forEach((e) => {
        response += `• ${e.blood_group} (${e.available_units} units): ${e.days_remaining} day(s) remaining\n`;
      });
      response += `\n`;
    }
  }

  response += `Both values are from the current BloodChain database.\nFinal operational decisions require authorized medical officer review.`;

  return {
    success: true,
    text: response,
    category: "Multi-Source Intelligence",
  };
}
