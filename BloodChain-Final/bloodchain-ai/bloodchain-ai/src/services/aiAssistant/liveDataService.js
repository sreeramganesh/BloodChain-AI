import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

/**
 * BloodChain AI Assistant — Safe Read-Only Live Data Service (Phase 4)
 *
 * STRICT SAFETY & SECURITY RULES:
 * - 100% READ-ONLY (SELECT only).
 * - Zero database mutations, zero writes.
 * - Uses existing anon Supabase client; no service role key.
 * - Explicit allowlisted column projections (no raw SQL injection).
 * - Safe fallback and error handling without exposing internal DB details.
 */

// Helper: Normalize error handling
function handleDbError(err, context) {
  console.warn(`[BloodChain Live Data] ${context}:`, err?.message || err);
  if (err?.code === "42501" || err?.message?.toLowerCase().includes("permission")) {
    return {
      success: false,
      error: "I don't have permission to access that live data for your current account.",
      data: null
    };
  }
  return {
    success: false,
    error: "I couldn't retrieve the current BloodChain data right now. Please try again.",
    data: null
  };
}

// =========================================================================
// 1. BLOOD INVENTORY LIVE QUERIES
// =========================================================================
export async function getLiveBloodInventory(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("blood_inventory")
      .select("id, hospital, blood_group, available_units, reserved_units, total_units, expiry_date, status, location");

    if (filters.bloodGroup) {
      query = query.eq("blood_group", filters.bloodGroup);
    }
    if (filters.hospital) {
      query = query.ilike("hospital", `%${filters.hospital}%`);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters.district) {
      query = query.ilike("location", `%${filters.district}%`);
    }

    const { data, error } = await query.order("available_units", { ascending: false });

    if (error) {
      return handleDbError(error, "getLiveBloodInventory");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveBloodInventory");
  }
}

// =========================================================================
// 2. BLOOD REQUESTS LIVE QUERIES
// =========================================================================
export async function getLiveBloodRequests(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("blood_requests")
      .select("id, patient_name, blood_group, units_needed, hospital, request_type, urgency, status, district, requested_by, created_at");

    if (filters.requestId) {
      query = query.eq("id", filters.requestId);
    }
    if (filters.urgency) {
      query = query.ilike("urgency", filters.urgency);
    }
    if (filters.status) {
      query = query.ilike("status", filters.status);
    }
    if (filters.bloodGroup) {
      query = query.eq("blood_group", filters.bloodGroup);
    }
    if (filters.hospital) {
      query = query.ilike("hospital", `%${filters.hospital}%`);
    }
    if (filters.district) {
      query = query.ilike("district", `%${filters.district}%`);
    }

    const limit = filters.limit || 10;
    const { data, error } = await query.limit(limit);

    if (error) {
      return handleDbError(error, "getLiveBloodRequests");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveBloodRequests");
  }
}

// =========================================================================
// 3. FACILITIES (HOSPITALS & BLOOD BANKS) LIVE QUERIES
// =========================================================================
export async function getLiveFacilities(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("facilities")
      .select("id, name, facility_type, district, state, phone, emergency_contact, address, is_active");

    if (filters.facilityType) {
      query = query.ilike("facility_type", `%${filters.facilityType}%`);
    }
    if (filters.district) {
      query = query.ilike("district", `%${filters.district}%`);
    }
    if (filters.state) {
      query = query.ilike("state", `%${filters.state}%`);
    }
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }

    const limit = filters.limit || 15;
    const { data, error } = await query.limit(limit);

    if (error) {
      return handleDbError(error, "getLiveFacilities");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveFacilities");
  }
}

// =========================================================================
// 4. TRANSFERS LIVE QUERIES
// =========================================================================
export async function getLiveTransfers(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("transfers")
      .select("id, blood_group, units, from_location, to_location, status, reason, requested_by, created_at");

    if (filters.transferId) {
      query = query.eq("id", filters.transferId);
    }
    if (filters.status) {
      query = query.ilike("status", filters.status);
    }
    if (filters.bloodGroup) {
      query = query.eq("blood_group", filters.bloodGroup);
    }
    if (filters.fromLocation) {
      query = query.ilike("from_location", `%${filters.fromLocation}%`);
    }
    if (filters.toLocation) {
      query = query.ilike("to_location", `%${filters.toLocation}%`);
    }

    const limit = filters.limit || 10;
    const { data, error } = await query.limit(limit);

    if (error) {
      return handleDbError(error, "getLiveTransfers");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveTransfers");
  }
}

// =========================================================================
// 5. SHORTAGE RISKS LIVE QUERIES
// =========================================================================
export async function getLiveShortageRisks(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("shortage_risks")
      .select("id, blood_group, assessment_date, current_available_units, reserved_units, predicted_demand_units, safety_stock_units, shortage_units, risk_score, risk_level, facilities:facility_id(name)");

    if (filters.bloodGroup) {
      query = query.eq("blood_group", filters.bloodGroup);
    }
    if (filters.riskLevel) {
      query = query.eq("risk_level", filters.riskLevel);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      return handleDbError(error, "getLiveShortageRisks");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveShortageRisks");
  }
}

// =========================================================================
// 6. EXPIRY RISKS LIVE QUERIES
// =========================================================================
export async function getLiveExpiryRisks(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("expiry_risks")
      .select("id, blood_group, available_units, expiry_date, days_remaining, risk_score, risk_level, recommended_action, facilities:facility_id(name)");

    if (filters.bloodGroup) {
      query = query.eq("blood_group", filters.bloodGroup);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      return handleDbError(error, "getLiveExpiryRisks");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveExpiryRisks");
  }
}

// =========================================================================
// 7. DEMAND PREDICTIONS LIVE QUERIES
// =========================================================================
export async function getLiveDemandPredictions(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("demand_predictions")
      .select("id, blood_group, prediction_date, forecast_horizon_days, predicted_units, lower_bound, upper_bound, confidence, model_name, facilities:facility_id(name)");

    if (filters.bloodGroup) {
      query = query.eq("blood_group", filters.bloodGroup);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      return handleDbError(error, "getLiveDemandPredictions");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveDemandPredictions");
  }
}

// =========================================================================
// 8. AI RECOMMENDATIONS DATA LIVE QUERIES
// =========================================================================
export async function getLiveRecommendationData(filters = {}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: "Live database connection is not configured.",
      data: null
    };
  }

  try {
    let query = supabase
      .from("ai_recommendations")
      .select("id, request_id, blood_group, recommended_units, compatibility_status, distance_km, estimated_transport_minutes, recommendation_score, priority, recommendation_reason, status, source:source_facility_id(name), destination:destination_facility_id(name)");

    if (filters.requestId) {
      query = query.eq("request_id", filters.requestId);
    }

    const { data, error } = await query.limit(5);

    if (error) {
      return handleDbError(error, "getLiveRecommendationData");
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (err) {
    return handleDbError(err, "getLiveRecommendationData");
  }
}
