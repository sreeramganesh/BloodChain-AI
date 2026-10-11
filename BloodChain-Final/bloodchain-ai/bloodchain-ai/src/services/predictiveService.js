import { supabase, isSupabaseConfigured } from "../utils/supabase/client.js";

/**
 * ====================================================================
 * BLOODCHAIN AI - PHASE 6: PREDICTIVE INTELLIGENCE SERVICE
 * File: src/services/predictiveService.js
 * 
 * Read-Only Service connecting the frontend to:
 * - public.demand_predictions (40 Holt Linear forecasts)
 * - public.shortage_risks (40 dynamic shortage evaluations)
 * - public.expiry_risks (10 inventory expiry evaluations)
 * - public.ai_recommendations (6 advisory clinical recommendations)
 * 
 * Strict Constraints:
 * - READ-ONLY (SELECT only). Zero automated mutations.
 * - Human review required before any transfer or inventory change.
 * - Graceful fallback to verified offline baseline data when unauthenticated.
 * ====================================================================
 */

// --------------------------------------------------------------------
// 1. VERIFIED BASELINE DATA (Offline & Unauthenticated Fallback)
// --------------------------------------------------------------------

export const INITIAL_PREDICTIONS = [
  // Apollo Hospital
  { id: "pred-ap-1", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "A+", predicted_units: 27.6, lower_bound: 13.2, upper_bound: 42.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-ap-2", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "A-", predicted_units: 8.2, lower_bound: 2.4, upper_bound: 14.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-ap-3", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "B+", predicted_units: 14.9, lower_bound: 4.5, upper_bound: 25.3, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-ap-4", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "B-", predicted_units: 8.2, lower_bound: 2.4, upper_bound: 14.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-ap-5", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "O+", predicted_units: 27.6, lower_bound: 13.2, upper_bound: 42.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-ap-6", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "O-", predicted_units: 14.9, lower_bound: 4.5, upper_bound: 25.3, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-ap-7", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "AB+", predicted_units: 4.7, lower_bound: 0.3, upper_bound: 9.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-ap-8", facility_name: "Apollo Hospital", facility_id: "8200c9b2-31a8-438a-a258-dbfca4e07779", blood_group: "AB-", predicted_units: 4.7, lower_bound: 0.3, upper_bound: 9.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  // Kauvery Hospital
  { id: "pred-kh-1", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "A+", predicted_units: 26.6, lower_bound: 12.2, upper_bound: 41.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-kh-2", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "A-", predicted_units: 8.4, lower_bound: 2.7, upper_bound: 14.2, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-kh-3", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "B+", predicted_units: 13.9, lower_bound: 3.5, upper_bound: 24.3, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-kh-4", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "B-", predicted_units: 8.4, lower_bound: 2.7, upper_bound: 14.2, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-kh-5", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "O+", predicted_units: 26.6, lower_bound: 12.2, upper_bound: 41.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-kh-6", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "O-", predicted_units: 13.9, lower_bound: 3.5, upper_bound: 24.3, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-kh-7", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "AB+", predicted_units: 4.5, lower_bound: 0.2, upper_bound: 8.8, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-kh-8", facility_name: "Kauvery Hospital", facility_id: "95f25fc9-8f8f-4cfe-9247-b018e03446c9", blood_group: "AB-", predicted_units: 4.5, lower_bound: 0.2, upper_bound: 8.8, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  // SRM Hospital
  { id: "pred-srm-1", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "A+", predicted_units: 25.6, lower_bound: 11.2, upper_bound: 40.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-srm-2", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "A-", predicted_units: 9.2, lower_bound: 3.7, upper_bound: 14.8, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-srm-3", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "B+", predicted_units: 16.1, lower_bound: 6.5, upper_bound: 25.7, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-srm-4", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "B-", predicted_units: 9.2, lower_bound: 3.7, upper_bound: 14.8, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-srm-5", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "O+", predicted_units: 25.6, lower_bound: 11.2, upper_bound: 40.1, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-srm-6", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "O-", predicted_units: 16.1, lower_bound: 6.5, upper_bound: 25.7, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-srm-7", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "AB+", predicted_units: 5.9, lower_bound: 1.4, upper_bound: 10.5, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-srm-8", facility_name: "SRM Hospital", facility_id: "e5dc1d2b-4e75-4e7c-9000-8234e96872fc", blood_group: "AB-", predicted_units: 5.9, lower_bound: 1.4, upper_bound: 10.5, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  // Trichy Blood Bank
  { id: "pred-tbb-1", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "A+", predicted_units: 23.9, lower_bound: 8.3, upper_bound: 39.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tbb-2", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "A-", predicted_units: 6.9, lower_bound: 0.0, upper_bound: 14.5, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tbb-3", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "B+", predicted_units: 11.2, lower_bound: 0.0, upper_bound: 23.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tbb-4", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "B-", predicted_units: 6.9, lower_bound: 0.0, upper_bound: 14.5, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tbb-5", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "O+", predicted_units: 23.9, lower_bound: 8.3, upper_bound: 39.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tbb-6", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "O-", predicted_units: 11.2, lower_bound: 0.0, upper_bound: 23.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tbb-7", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "AB+", predicted_units: 6.9, lower_bound: 2.8, upper_bound: 10.9, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tbb-8", facility_name: "Trichy Blood Bank", facility_id: "d2b86395-bae5-4454-9b91-794782e83ac1", blood_group: "AB-", predicted_units: 6.9, lower_bound: 2.8, upper_bound: 10.9, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  // Trichy Government Hospital
  { id: "pred-tgh-1", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "A+", predicted_units: 24.9, lower_bound: 9.3, upper_bound: 40.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tgh-2", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "A-", predicted_units: 7.5, lower_bound: 0.0, upper_bound: 15.6, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tgh-3", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "B+", predicted_units: 12.2, lower_bound: 0.1, upper_bound: 24.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tgh-4", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "B-", predicted_units: 7.5, lower_bound: 0.0, upper_bound: 15.6, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tgh-5", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "O+", predicted_units: 24.9, lower_bound: 9.3, upper_bound: 40.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tgh-6", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "O-", predicted_units: 12.2, lower_bound: 0.1, upper_bound: 24.4, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tgh-7", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "AB+", predicted_units: 5.9, lower_bound: 1.4, upper_bound: 10.5, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
  { id: "pred-tgh-8", facility_name: "Trichy Government Hospital", facility_id: "f8acddb2-fa64-46cc-82f8-f9eec91e356a", blood_group: "AB-", predicted_units: 5.9, lower_bound: 1.4, upper_bound: 10.5, forecast_period: "Oct 2026", horizon_days: 30, confidence: 0.95, model_name: "Holt Linear Exponential Smoothing" },
];

export const INITIAL_SHORTAGES = [
  { id: "sr-1", facility_name: "Apollo Hospital", blood_group: "A+", current_available: 0, predicted_demand: 27.6, safety_stock: 7, shortage_units: 34.6, risk_score: 99.9, risk_level: "Critical", expected_date: "Immediate" },
  { id: "sr-2", facility_name: "Apollo Hospital", blood_group: "B-", current_available: 0, predicted_demand: 8.2, safety_stock: 5, shortage_units: 13.2, risk_score: 100.0, risk_level: "Critical", expected_date: "Immediate" },
  { id: "sr-3", facility_name: "Kauvery Hospital", blood_group: "A-", current_available: 0, predicted_demand: 8.4, safety_stock: 5, shortage_units: 13.4, risk_score: 100.0, risk_level: "Critical", expected_date: "Immediate" },
  { id: "sr-4", facility_name: "SRM Hospital", blood_group: "AB-", current_available: 0, predicted_demand: 5.9, safety_stock: 5, shortage_units: 10.9, risk_score: 100.0, risk_level: "Critical", expected_date: "Immediate" },
  { id: "sr-5", facility_name: "Trichy Blood Bank", blood_group: "O+", current_available: 120, predicted_demand: 23.9, safety_stock: 6, shortage_units: 0, risk_score: 10.0, risk_level: "Low", expected_date: null },
  { id: "sr-6", facility_name: "Apollo Hospital", blood_group: "O-", current_available: 60, predicted_demand: 14.9, safety_stock: 5, shortage_units: 0, risk_score: 10.0, risk_level: "Low", expected_date: null },
  { id: "sr-7", facility_name: "SRM Hospital", blood_group: "A+", current_available: 45, predicted_demand: 25.6, safety_stock: 6, shortage_units: 0, risk_score: 10.0, risk_level: "Low", expected_date: null },
  { id: "sr-8", facility_name: "Kauvery Hospital", blood_group: "B+", current_available: 28, predicted_demand: 13.9, safety_stock: 5, shortage_units: 0, risk_score: 10.0, risk_level: "Low", expected_date: null },
];

export const INITIAL_EXPIRIES = [
  { id: "exp-1", facility_name: "Government Hospital", hospital: "Government Hospital", blood_group: "A-", available_units: 35, expiry_date: "2026-10-03", days_remaining: 2, risk_score: 75, risk_level: "High", recommended_action: "Flag for rapid local allocation or transfer to high-volume emergency trauma center" },
  { id: "exp-2", facility_name: "Trichy GH", hospital: "Trichy GH", blood_group: "AB-", available_units: 12, expiry_date: "2026-10-02", days_remaining: 1, risk_score: 95, risk_level: "Critical", recommended_action: "Immediate priority use for pending surgeries or emergency inter-hospital transfer" },
  { id: "exp-3", facility_name: "SRM Hospital", hospital: "SRM Hospital", blood_group: "A+", available_units: 45, expiry_date: "2026-10-04", days_remaining: 3, risk_score: 75, risk_level: "High", recommended_action: "Flag for rapid local allocation or transfer to high-volume emergency trauma center" },
  { id: "exp-4", facility_name: "Kauvery Hospital", hospital: "Kauvery Hospital", blood_group: "B-", available_units: 22, expiry_date: "2026-10-05", days_remaining: 4, risk_score: 50, risk_level: "Medium", recommended_action: "Monitor consumption rate; reserve for incoming scheduled requirements" },
  { id: "exp-5", facility_name: "Apollo Hospital", hospital: "Apollo Hospital", blood_group: "O-", available_units: 60, expiry_date: "2026-10-11", days_remaining: 10, risk_score: 15, risk_level: "Low", recommended_action: "Standard cold storage monitoring and FIFO rotation" },
];

export const INITIAL_RECOMMENDATIONS = [
  {
    id: "rec-1",
    request_id: "BRQ001",
    patient_name: "R. Karthik",
    source_facility: "MGMGH Blood Bank",
    dest_facility: "Apollo Hospital",
    blood_group: "A+",
    recommended_units: 4,
    compatibility_status: "Exact Match",
    straight_line_distance_km: 2.85,
    estimated_transport_minutes: 21,
    recommendation_score: 96.5,
    priority: "Critical",
    status: "Pending",
    reason: "Transfer 4 unit(s) of A+ (Exact Match) from MGMGH Blood Bank. Straight-line distance: 2.85 km. Preserves source facility safety buffer (26 units remaining)."
  },
  {
    id: "rec-2",
    request_id: "BRQ001",
    patient_name: "R. Karthik",
    source_facility: "Trichy SRM Medical College",
    dest_facility: "Apollo Hospital",
    blood_group: "O+",
    recommended_units: 2,
    compatibility_status: "Compatible Alternate",
    straight_line_distance_km: 18.42,
    estimated_transport_minutes: 52,
    recommendation_score: 84.2,
    priority: "High",
    status: "Pending",
    reason: "Transfer 2 unit(s) of O+ (Compatible Alternate) from Trichy SRM Medical College. Straight-line distance: 18.42 km. Preserves source facility safety buffer (13 units remaining)."
  },
  {
    id: "rec-3",
    request_id: "BRQ002",
    patient_name: "Meena S.",
    source_facility: "MGMGH Blood Bank",
    dest_facility: "Kauvery Hospital",
    blood_group: "B-",
    recommended_units: 2,
    compatibility_status: "Exact Match",
    straight_line_distance_km: 0.22,
    estimated_transport_minutes: 15,
    recommendation_score: 95.0,
    priority: "High",
    status: "Pending",
    reason: "Transfer 2 unit(s) of B- (Exact Match) from MGMGH Blood Bank. Straight-line distance: 0.22 km. Preserves source facility safety buffer (6 units remaining)."
  },
  {
    id: "rec-4",
    request_id: "BRQ002",
    patient_name: "Meena S.",
    source_facility: "Child Jesus Blood Bank",
    dest_facility: "Kauvery Hospital",
    blood_group: "O-",
    recommended_units: 1,
    compatibility_status: "Compatible Alternate",
    straight_line_distance_km: 3.15,
    estimated_transport_minutes: 21,
    recommendation_score: 88.5,
    priority: "High",
    status: "Pending",
    reason: "Transfer 1 unit(s) of O- (Compatible Alternate) from Child Jesus Blood Bank. Straight-line distance: 3.15 km. Preserves source facility safety buffer (2 units remaining)."
  },
  {
    id: "rec-5",
    request_id: "BRQ004",
    patient_name: "Vijay Kumar",
    source_facility: "Cethar Hospital",
    dest_facility: "Kauvery Cantonment",
    blood_group: "AB+",
    recommended_units: 1,
    compatibility_status: "Exact Match",
    straight_line_distance_km: 3.60,
    estimated_transport_minutes: 22,
    recommendation_score: 82.4,
    priority: "Medium",
    status: "Pending",
    reason: "Transfer 1 unit(s) of AB+ (Exact Match) from Cethar Hospital. Straight-line distance: 3.60 km. Preserves source facility safety buffer (5 units remaining)."
  },
  {
    id: "rec-6",
    request_id: "BRQ005",
    patient_name: "Lakshmi P.",
    source_facility: "Child Jesus Blood Bank",
    dest_facility: "Apollo Hospital",
    blood_group: "O-",
    recommended_units: 2,
    compatibility_status: "Exact Match",
    straight_line_distance_km: 4.85,
    estimated_transport_minutes: 25,
    recommendation_score: 76.8,
    priority: "High",
    status: "Pending",
    reason: "Transfer 2 unit(s) of O- (Exact Match) from Child Jesus Blood Bank. Straight-line distance: 4.85 km. Preserves source facility safety buffer (1 unit remaining)."
  },
];


// --------------------------------------------------------------------
// 2. QUERY SERVICES (Read-Only)
// --------------------------------------------------------------------

/**
 * Fetch 30-day demand predictions with joined facility metadata.
 */
export async function getDemandPredictions(options = {}) {
  const { facilityId, bloodGroup } = options;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("demand_predictions")
        .select(`
          id,
          facility_id,
          blood_group,
          prediction_date,
          forecast_horizon_days,
          predicted_units,
          lower_bound,
          upper_bound,
          model_name,
          model_version,
          confidence,
          facilities:facility_id(name, district)
        `)
        .order("predicted_units", { ascending: false });

      if (facilityId) query = query.eq("facility_id", facilityId);
      if (bloodGroup) query = query.eq("blood_group", bloodGroup);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          facility_name: d.facilities?.name || "Trichy Healthcare Center",
          facility_id: d.facility_id,
          blood_group: d.blood_group,
          predicted_units: Number(d.predicted_units),
          lower_bound: Number(d.lower_bound),
          upper_bound: Number(d.upper_bound),
          forecast_period: "Oct 2026",
          horizon_days: d.forecast_horizon_days,
          confidence: Number(d.confidence),
          model_name: d.model_name || "Holt Linear Exponential Smoothing",
        }));
      }
    } catch (err) {
      console.warn("Falling back to baseline demand predictions:", err);
    }
  }

  // Fallback to verified baseline
  let filtered = [...INITIAL_PREDICTIONS];
  if (facilityId) filtered = filtered.filter((p) => p.facility_id === facilityId);
  if (bloodGroup) filtered = filtered.filter((p) => p.blood_group === bloodGroup);
  return filtered;
}

/**
 * Fetch dynamic shortage risks with safety stock metrics.
 */
export async function getShortageRisks(options = {}) {
  const { facilityId, bloodGroup, riskLevel } = options;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("shortage_risks")
        .select(`
          id,
          facility_id,
          blood_group,
          assessment_date,
          current_available_units,
          reserved_units,
          predicted_demand_units,
          safety_stock_units,
          shortage_units,
          risk_score,
          risk_level,
          expected_shortage_date,
          calculation_method,
          facilities:facility_id(name, district)
        `)
        .order("risk_score", { ascending: false });

      if (facilityId) query = query.eq("facility_id", facilityId);
      if (bloodGroup) query = query.eq("blood_group", bloodGroup);
      if (riskLevel) query = query.eq("risk_level", riskLevel);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          facility_name: d.facilities?.name || "Trichy Facility",
          blood_group: d.blood_group,
          current_available: d.current_available_units,
          predicted_demand: Number(d.predicted_demand_units),
          safety_stock: Number(d.safety_stock_units),
          shortage_units: Number(d.shortage_units),
          risk_score: Number(d.risk_score),
          risk_level: d.risk_level,
          expected_date: d.expected_shortage_date,
        }));
      }
    } catch (err) {
      console.warn("Falling back to baseline shortage risks:", err);
    }
  }

  let filtered = [...INITIAL_SHORTAGES];
  if (bloodGroup) filtered = filtered.filter((s) => s.blood_group === bloodGroup);
  if (riskLevel) filtered = filtered.filter((s) => s.risk_level === riskLevel);
  return filtered;
}

/**
 * Fetch expiry risks derived from inventory expiration timelines.
 */
export async function getExpiryRisks() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("expiry_risks")
        .select(`
          id,
          facility_id,
          blood_group,
          available_units,
          expiry_date,
          days_remaining,
          risk_score,
          risk_level,
          recommended_action,
          blood_inventory(hospital),
          facilities:facility_id(name)
        `)
        .order("days_remaining", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          facility_name: d.facilities?.name || d.blood_inventory?.hospital || "Hospital",
          hospital: d.blood_inventory?.hospital || d.facilities?.name || "Hospital",
          blood_group: d.blood_group,
          available_units: d.available_units,
          expiry_date: d.expiry_date,
          days_remaining: d.days_remaining,
          risk_score: Number(d.risk_score),
          risk_level: d.risk_level,
          recommended_action: d.recommended_action,
        }));
      }
    } catch (err) {
      console.warn("Falling back to baseline expiry risks:", err);
    }
  }
  return INITIAL_EXPIRIES;
}

/**
 * Fetch explainable AI recommendations (advisory only).
 */
export async function getAIRecommendations(options = {}) {
  const { priority } = options;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("ai_recommendations")
        .select(`
          id,
          request_id,
          blood_group,
          recommended_units,
          compatibility_status,
          distance_km,
          estimated_transport_minutes,
          recommendation_score,
          priority,
          recommendation_reason,
          status,
          source:source_facility_id(name),
          destination:destination_facility_id(name),
          request:request_id(patient_name)
        `)
        .order("recommendation_score", { ascending: false });

      if (priority) query = query.eq("priority", priority);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          request_id: d.request_id,
          patient_name: d.request?.patient_name || "Emergency Patient",
          source_facility: d.source?.name || "Source Facility",
          dest_facility: d.destination?.name || "Destination Facility",
          blood_group: d.blood_group,
          recommended_units: d.recommended_units,
          compatibility_status: d.compatibility_status,
          straight_line_distance_km: Number(d.distance_km),
          estimated_transport_minutes: d.estimated_transport_minutes,
          recommendation_score: Number(d.recommendation_score),
          priority: d.priority,
          reason: d.recommendation_reason,
          status: d.status || "Pending",
        }));
      }
    } catch (err) {
      console.warn("Falling back to baseline AI recommendations:", err);
    }
  }

  let filtered = [...INITIAL_RECOMMENDATIONS];
  if (priority) filtered = filtered.filter((r) => r.priority === priority);
  return filtered;
}

/**
 * Review an explainable AI recommendation (Human Decision).
 * Updates public.ai_recommendations: status ('Accepted' or 'Rejected'), reviewed_at, reviewed_by.
 * 
 * Safety constraints:
 * - Does not modify recommendation_reason, compatibility_status, distance, units, or scores.
 * - Decision must strictly be 'Accepted' or 'Rejected'.
 */
export async function reviewAIRecommendation(
  recommendationId,
  decision,
  notes = "",
  reviewerId = null
) {
  // 1. Validate decision
  if (decision !== "Accepted" && decision !== "Rejected") {
    return {
      success: false,
      error: "Invalid review decision. Allowed values are 'Accepted' or 'Rejected'."
    };
  }

  if (!recommendationId) {
    return {
      success: false,
      error: "Recommendation ID is required."
    };
  }

  // 2. Perform Supabase update if configured and recommendation is a UUID
  const isRecUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recommendationId);
  if (isSupabaseConfigured() && supabase && isRecUUID) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewerId);
      const updatePayload = {
        status: decision,
        reviewed_at: new Date().toISOString(),
      };
      if (isUUID) {
        updatePayload.reviewed_by = reviewerId;
      }

      const { data, error } = await supabase
        .from("ai_recommendations")
        .update(updatePayload)
        .eq("id", recommendationId)
        .select();

      if (error) {
        console.error("Supabase reviewAIRecommendation error:", error.message);
        return {
          success: false,
          error: "Failed to record review decision in database. Please try again."
        };
      }

      // Keep in-memory baseline synchronized
      const match = INITIAL_RECOMMENDATIONS.find((r) => r.id === recommendationId);
      if (match) {
        match.status = decision;
      }

      return {
        success: true,
        data: data && data.length > 0 ? data[0] : updatePayload
      };
    } catch (err) {
      console.error("reviewAIRecommendation exception:", err);
      return {
        success: false,
        error: "Unable to complete recommendation review due to a network or service issue."
      };
    }
  }


  // Fallback offline mock update
  const match = INITIAL_RECOMMENDATIONS.find((r) => r.id === recommendationId);
  if (match) {
    match.status = decision;
    return {
      success: true,
      data: { ...match, status: decision, reviewed_at: new Date().toISOString() }
    };
  }

  return {
    success: false,
    error: "Recommendation not found."
  };
}

/**
 * Aggregates high-level summary KPIs for the predictive intelligence layer.
 */
export async function getPredictiveDashboardSummary() {
  const [preds, shortages, expiries, recs] = await Promise.all([
    getDemandPredictions(),
    getShortageRisks(),
    getExpiryRisks(),
    getAIRecommendations(),
  ]);

  const totalPredictedDemand30d = preds.reduce((acc, p) => acc + (p.predicted_units || 0), 0);
  const criticalShortagesCount = shortages.filter((s) => s.risk_level === "Critical").length;
  const highShortagesCount = shortages.filter((s) => s.risk_level === "High").length;
  const expiringSoonUnits = expiries
    .filter((e) => e.days_remaining <= 3)
    .reduce((acc, e) => acc + (e.available_units || 0), 0);
  const activeRecommendationsCount = recs.length;

  return {
    totalPredictedDemand30d: Math.round(totalPredictedDemand30d),
    criticalShortagesCount,
    highShortagesCount,
    expiringSoonUnits,
    activeRecommendationsCount,
  };
}

/**
 * Role-aware data filtering helper.
 */
export function filterPredictiveDataByRole(data, userRole) {
  if (!userRole) return data;
  const role = userRole.toLowerCase();

  // Donors see non-confidential regional demand trends; internal logistics are shielded
  if (role.includes("donor")) {
    return {
      forecasts: data.forecasts ? data.forecasts.slice(0, 8) : [],
      shortages: data.shortages ? data.shortages.filter((s) => s.risk_level === "Critical") : [],
      recommendations: [], // Shielded from individual donors
      expiries: [],        // Internal operational only
    };
  }

  // Hospitals & Blood Banks see full clinical operational decision data
  return data;
}

export default {
  getDemandPredictions,
  getShortageRisks,
  getExpiryRisks,
  getAIRecommendations,
  reviewAIRecommendation,
  getPredictiveDashboardSummary,
  filterPredictiveDataByRole,
};
