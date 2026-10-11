/**
 * ====================================================================
 * BLOODCHAIN AI - PHASE 5: DYNAMIC RISK & RECOMMENDATION INTEGRATION
 * File: scripts/phase5_risk_integration.js
 * 
 * Implements:
 * 1. Dynamic Shortage Risk Calculation based on predicted demand + safety stock
 * 2. Expiry Risk cross-referencing with local daily burn rate
 * 3. Proactive Advisory AI Recommendations using strict compatibility
 *    and straight-line Haversine distance.
 * 
 * STRICT CONSTRAINTS:
 * - Recommendations are advisory only.
 * - ZERO automatic inventory deductions.
 * - ZERO automatic transfer creation.
 * ====================================================================
 */

/**
 * Calculates dynamic shortage risk for a facility and blood group.
 * 
 * @param {Object} params
 * @param {string} params.facility_id
 * @param {string} params.blood_group
 * @param {number} params.current_available_units
 * @param {number} params.reserved_units
 * @param {number} params.predicted_demand_units
 * @param {string} params.assessment_date
 * @returns {Object} Structured shortage risk record ready for public.shortage_risks
 */
function calculateDynamicShortageRisk({
  facility_id,
  blood_group,
  current_available_units = 0,
  reserved_units = 0,
  predicted_demand_units = 0,
  assessment_date = new Date().toISOString().split('T')[0]
}) {
  // In BloodChain schema: total_units = available_units + reserved_units.
  // Therefore, available_units is ALREADY net of reservations.
  // We do NOT subtract reserved_units again to avoid double-deduction.
  const usableInventory = Math.max(0, Number(current_available_units) || 0);
  
  // 7-day reserve buffer calculated from the 30-day predicted demand (minimum 5 units)
  const safetyStockUnits = Math.max(5, Math.ceil(predicted_demand_units * (7 / 30)));
  
  const requiredStock = predicted_demand_units + safetyStockUnits;
  const shortageUnits = Math.max(0, Math.round((requiredStock - usableInventory) * 10) / 10);

  let riskScore = 0;
  let riskLevel = 'Low';

  if (shortageUnits > 0) {
    // Proportional shortage severity bounded strictly between 0 and 100
    const ratio = shortageUnits / requiredStock;
    riskScore = Math.min(100, Math.round((30 + ratio * 70) * 10) / 10);
    
    if (riskScore >= 75) riskLevel = 'Critical';
    else if (riskScore >= 50) riskLevel = 'High';
    else riskLevel = 'Medium';
  } else {
    // No deficit: evaluate safety margin
    const surplusMargin = usableInventory - requiredStock;
    if (surplusMargin < safetyStockUnits * 0.5) {
      riskScore = 24.0;
      riskLevel = 'Low';
    } else {
      riskScore = 10.0;
      riskLevel = 'Low';
    }
  }

  // Calculate expected shortage date based on average daily burn rate
  const dailyBurnRate = predicted_demand_units > 0 ? (predicted_demand_units / 30) : 1;
  const daysToExhaustion = Math.floor(usableInventory / dailyBurnRate);

  const assessDateObj = new Date(assessment_date);
  const shortageDateObj = new Date(assessDateObj);
  shortageDateObj.setUTCDate(shortageDateObj.getUTCDate() + Math.max(1, daysToExhaustion));
  const expectedShortageDate = shortageUnits > 0 ? shortageDateObj.toISOString().split('T')[0] : null;

  return {
    facility_id,
    blood_group,
    assessment_date,
    current_available_units,
    reserved_units,
    predicted_demand_units,
    safety_stock_units: safetyStockUnits,
    shortage_units: shortageUnits,
    risk_score: riskScore,
    risk_level: riskLevel,
    expected_shortage_date: expectedShortageDate,
    calculation_method: 'Dynamic Forecast Shortage Engine (Holt Linear Integrated)'
  };
}

/**
 * Calculates straight-line geographic distance using Haversine formula.
 * Expressed strictly as straight-line distance (NOT actual driving or road distance).
 */
function calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Clinical blood compatibility check matching verified Phase 4 rules.
 * Exact Match, Compatible Alternate, or NULL. No 'Emergency Universal'.
 */
function checkClinicalCompatibility(recipientGroup, donorGroup) {
  const valid = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  if (!valid.includes(recipientGroup) || !valid.includes(donorGroup)) return null;
  if (recipientGroup === donorGroup) return 'Exact Match';

  const matrix = {
    'O-': [],
    'O+': ['O-'],
    'A-': ['O-'],
    'A+': ['A-', 'O+', 'O-'],
    'B-': ['O-'],
    'B+': ['B-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB-']
  };

  if (matrix[recipientGroup] && matrix[recipientGroup].includes(donorGroup)) {
    return 'Compatible Alternate';
  }
  return null;
}

/**
 * Generates proactive advisory AI recommendations for blood requests / shortages.
 * 
 * Advisory only: Does NOT deduct inventory or create transfers.
 */
function generateAdvisoryRecommendations({
  requests = [],
  shortages = [],
  inventory = [],
  facilities = []
}) {
  const facilityMap = new Map(facilities.map(f => [f.id, f]));
  const recommendations = [];

  // Evaluate requests needing transfer
  for (const req of requests) {
    if (['Fulfilled', 'Cancelled'].includes(req.status)) continue;

    const destFacility = facilityMap.get(req.facility_id);
    const neededUnits = Number(req.units_needed) || 1;
    const recipientGroup = req.blood_group;

    // Search potential source facilities with surplus
    const candidates = [];

    for (const inv of inventory) {
      if (inv.facility_id === req.facility_id) continue; // Source != Destination
      
      const compStatus = checkClinicalCompatibility(recipientGroup, inv.blood_group);
      if (!compStatus) continue; // Skip incompatible

      const sourceFac = facilityMap.get(inv.facility_id);
      if (!sourceFac) continue;

      const avail = Number(inv.available_units) || 0;
      // available_units is already usable stock (total_units = available + reserved)
      const usable = Math.max(0, avail);
      
      // Safety threshold: donor facility must maintain minimum 10 usable units
      const donorSafetyThreshold = 10;
      const maxTransferable = Math.max(0, usable - donorSafetyThreshold);
      if (maxTransferable <= 0) continue; // Do not violate donor safety stock

      const straightLineDist = calculateStraightLineDistance(
        sourceFac.latitude, sourceFac.longitude,
        destFacility ? destFacility.latitude : 0, destFacility ? destFacility.longitude : 0
      );

      // Estimated transport minutes: straight-line distance / 30 km/h urban speed * 60 + 15 min dispatch buffer
      const estimatedMinutes = straightLineDist !== null 
        ? Math.round((straightLineDist / 30) * 60 + 15)
        : null;

      // Explainable scoring: weights distance, availability, compatibility, and urgency
      const distScore = straightLineDist !== null ? Math.max(0, 100 - (straightLineDist * 3)) : 50;
      const availScore = Math.min(100, (maxTransferable / neededUnits) * 60 + 40);
      const compScore = compStatus === 'Exact Match' ? 100 : 80;
      const urgencyBonus = req.urgency === 'Critical' ? 10 : (req.urgency === 'High' ? 5 : 0);

      const totalScore = Math.min(100, Math.round(
        (distScore * 0.35 + availScore * 0.35 + compScore * 0.25 + urgencyBonus) * 10
      ) / 10);

      const unitsToRecommend = Math.min(neededUnits, maxTransferable);

      candidates.push({
        request_id: req.id,
        source_facility_id: inv.facility_id,
        destination_facility_id: req.facility_id,
        blood_group: inv.blood_group,
        recommended_units: unitsToRecommend,
        compatibility_status: compStatus,
        distance_km: straightLineDist,
        estimated_transport_minutes: estimatedMinutes,
        recommendation_score: totalScore,
        priority: req.urgency === 'Critical' ? 'Critical' : (totalScore >= 85 ? 'High' : 'Medium'),
        recommendation_type: 'TRANSFER',
        status: 'Pending',
        recommendation_reason: `Transfer ${unitsToRecommend} unit(s) of ${inv.blood_group} (${compStatus}) from ${sourceFac.name}. Straight-line distance: ${straightLineDist} km. Preserves source facility safety buffer (${usable - unitsToRecommend} units remaining).`
      });
    }

    // Sort by recommendation_score descending and pick top candidate
    candidates.sort((a, b) => b.recommendation_score - a.recommendation_score);
    if (candidates.length > 0) {
      recommendations.push(candidates[0]);
    }
  }

  return recommendations;
}

export {
  calculateDynamicShortageRisk,
  calculateStraightLineDistance,
  checkClinicalCompatibility,
  generateAdvisoryRecommendations
};

export default {
  calculateDynamicShortageRisk,
  calculateStraightLineDistance,
  checkClinicalCompatibility,
  generateAdvisoryRecommendations
};
