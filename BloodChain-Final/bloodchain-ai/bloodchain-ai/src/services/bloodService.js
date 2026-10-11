import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

// ====================================================================
// INITIAL FALLBACK DATA (Used if Supabase is not yet connected)
// ====================================================================
export const INITIAL_INVENTORY = [
  { id: 1, hospital: "Trichy Blood Bank", group: "O+", available: 120, reserved: 40, total: 160, expiry: "22 Sep 2026", status: "Sufficient", cost_per_unit: 1400 },
  { id: 2, hospital: "SRM Hospital", group: "A+", available: 45, reserved: 10, total: 55, expiry: "18 Sep 2026", status: "Moderate", cost_per_unit: 1300 },
  { id: 3, hospital: "Kauvery Hospital", group: "B+", available: 28, reserved: 5, total: 33, expiry: "20 Sep 2026", status: "Low Stock", cost_per_unit: 1350 },
  { id: 4, hospital: "Apollo Hospital", group: "O-", available: 60, reserved: 20, total: 80, expiry: "25 Sep 2026", status: "Sufficient", cost_per_unit: 1650 },
  { id: 5, hospital: "Government Hospital", group: "A-", available: 35, reserved: 10, total: 45, expiry: "17 Sep 2026", status: "Expiring Soon", cost_per_unit: 1350 },
  { id: 6, hospital: "MGM Hospital", group: "AB+", available: 18, reserved: 7, total: 25, expiry: "21 Sep 2026", status: "Low Stock", cost_per_unit: 1500 },
  { id: 7, hospital: "Cauvery Medical Center", group: "B-", available: 22, reserved: 8, total: 30, expiry: "19 Sep 2026", status: "Moderate", cost_per_unit: 1400 },
  { id: 8, hospital: "Trichy GH", group: "AB-", available: 12, reserved: 3, total: 15, expiry: "16 Sep 2026", status: "Expiring Soon", cost_per_unit: 1550 },
  { id: 9, hospital: "Srirangam PHC", group: "O+", available: 40, reserved: 10, total: 50, expiry: "24 Sep 2026", status: "Sufficient", cost_per_unit: 1600 },
  { id: 10, hospital: "Thillai Nagar Blood Bank", group: "A+", available: 55, reserved: 15, total: 70, expiry: "23 Sep 2026", status: "Sufficient", cost_per_unit: 1450 },
];

export const INITIAL_REQUESTS = [
  { id: "BRQ001", patient: "R. Karthik", group: "O+", units: 2, hospital: "Trichy GH", type: "Patient", urgency: "Critical", status: "Pending", time: "16 Sep, 09:40 AM" },
  { id: "BRQ002", patient: "Meena S.", group: "A-", units: 1, hospital: "Kauvery Hospital", type: "Patient", urgency: "High", status: "In Progress", time: "16 Sep, 08:15 AM" },
  { id: "BRQ003", patient: "S. Prakash", group: "B+", units: 3, hospital: "Apollo Hospital", type: "Patient", urgency: "Medium", status: "Matched", time: "15 Sep, 06:20 PM" },
  { id: "BRQ004", patient: "Vijay Kumar", group: "AB-", units: 1, hospital: "SRM Hospital", type: "Patient", urgency: "High", status: "Pending", time: "15 Sep, 02:10 PM" },
  { id: "BRQ005", patient: "Lakshmi P.", group: "O-", units: 2, hospital: "MGM Hospital", type: "Patient", urgency: "Critical", status: "In Review", time: "15 Sep, 11:05 AM" },
  { id: "BRQ006", patient: "Rahul D.", group: "A+", units: 1, hospital: "Govt. Hospital", type: "Patient", urgency: "Medium", status: "Fulfilled", time: "14 Sep, 07:30 AM" },
  { id: "BRQ007", patient: "Divya M.", group: "B-", units: 1, hospital: "Trichy GH", type: "Patient", urgency: "High", status: "Pending", time: "14 Sep, 10:12 AM" },
  { id: "BRQ008", patient: "Arun N.", group: "O+", units: 4, hospital: "Cauvery Medical Center", type: "Patient", urgency: "Critical", status: "Pending", time: "13 Sep, 09:45 AM" },
];

export const INITIAL_DONORS = [
  { id: 1, name: "Dinesh K", age: 22, gender: "Male", blood_group: "O+", location: "Trichy", lastDonation: "12 Mar 2026", availability: "Available", phone: "+91 98765 11001" },
  { id: 2, name: "Hari Prasath S", age: 24, gender: "Male", blood_group: "O+", location: "Srirangam", lastDonation: "5 May 2026", availability: "Available", phone: "+91 98765 11002" },
  { id: 3, name: "Arjun R", age: 21, gender: "Male", blood_group: "O+", location: "Thuvakudi", lastDonation: "18 Feb 2026", availability: "Available", phone: "+91 98765 11003" },
  { id: 4, name: "Karthik V", age: 25, gender: "Male", blood_group: "A+", location: "Trichy", lastDonation: "20 Jun 2026", availability: "Available", phone: "+91 98765 11004" },
  { id: 5, name: "Santhosh M", age: 23, gender: "Male", blood_group: "B+", location: "Lalgudi", lastDonation: "10 Apr 2026", availability: "Available", phone: "+91 98765 11005" },
  { id: 6, name: "Vignesh B", age: 26, gender: "Male", blood_group: "AB+", location: "Thillai Nagar", lastDonation: "2 Jan 2026", availability: "Available", phone: "+91 98765 11006" },
  { id: 7, name: "Praveen S", age: 22, gender: "Male", blood_group: "O-", location: "Mannachanallur", lastDonation: "15 May 2026", availability: "Available", phone: "+91 98765 11007" },
  { id: 8, name: "Sathish R", age: 24, gender: "Male", blood_group: "A-", location: "Trichy", lastDonation: "9 Mar 2026", availability: "Available", phone: "+91 98765 11008" },
];

export const INITIAL_TRANSFERS = [
  { id: "TRF001", blood: "O+", units: 20, from: "Trichy Blood Bank", to: "Trichy GH", date: "16 Sep, 09:40 AM", status: "Pending", reason: "Emergency surgery - O+ units required immediately." },
  { id: "TRF002", blood: "A-", units: 10, from: "SRM Hospital", to: "Kauvery Hospital", date: "16 Sep, 11:20 AM", status: "Approved", reason: "Urgent cardiovascular procedure." },
  { id: "TRF003", blood: "B+", units: 15, from: "Government Hospital", to: "Apollo Hospital", date: "15 Sep, 06:15 PM", status: "In Transit", reason: "Scheduled surgical operations." },
  { id: "TRF004", blood: "AB-", units: 5, from: "MGM Hospital", to: "Trichy GH", date: "15 Sep, 02:30 PM", status: "Pending", reason: "Rare blood type emergency." },
  { id: "TRF005", blood: "O-", units: 12, from: "Kauvery Hospital", to: "MGM Hospital", date: "14 Sep, 10:45 AM", status: "Completed", reason: "Trauma ward stock replenishment." },
];

// Local storage fallback helpers for state persistence across reloads
const _bloodMemoryCache = new Map();

function getLocal(key, defaultVal) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const data = window.localStorage.getItem(`bloodchain_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    }
    const mem = _bloodMemoryCache.get(`bloodchain_${key}`);
    return mem ? JSON.parse(JSON.stringify(mem)) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(`bloodchain_${key}`, JSON.stringify(val));
    } else {
      _bloodMemoryCache.set(`bloodchain_${key}`, JSON.parse(JSON.stringify(val)));
    }
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// ====================================================================
// 1. BLOOD INVENTORY SERVICES
// ====================================================================
import {
  getSyntheticInventoryForDistrict,
  getSyntheticRequestsForDistrict,
  getSyntheticTransfersForDistrict,
  getSyntheticDonorsForDistrict,
  getHospitalsForDistrict,
} from "../constants/hospitalMasterData.js";

// ====================================================================
// 1. BLOOD INVENTORY SERVICES
// ====================================================================
export async function getBloodInventory(options = {}) {
  const { state, district } = options;

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("blood_inventory")
        .select("*")
        .order("id", { ascending: true });

      if (district && district !== "All" && district !== "All Districts") {
        query = query.or(`location.ilike.%${district}%,hospital.ilike.%${district}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.batch_id || d.id,
          hospital: d.hospital,
          group: d.blood_group,
          available: d.available_units,
          reserved: d.reserved_units,
          total: d.total_units || d.available_units + d.reserved_units,
          expiry: new Date(d.expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          status: d.status,
          location: d.location,
          batch_id: d.batch_id,
          cost_per_unit: d.cost_per_unit != null ? Number(d.cost_per_unit) : 1400,
          data_type: d.data_type || "Synthetic/Demo",
        }));
      }
    } catch (e) {
      console.warn("Falling back to synthetic inventory:", e);
    }
  }

  // Location-based synthetic fallback for any district in the 74 districts
  if (district && district !== "All" && district !== "All Districts" && district !== "Tiruchirappalli" && district !== "Trichy") {
    const synRows = getSyntheticInventoryForDistrict(state || "Tamil Nadu", district);
    if (synRows.length > 0) return synRows;
  }

  return getLocal("inventory", INITIAL_INVENTORY);
}

export async function addInventoryStock(item) {
  const rawCost = item.cost_per_unit ?? item.costPerUnit;
  const costPerUnit = rawCost != null && !isNaN(parseFloat(rawCost)) ? parseFloat(rawCost) : 1400;
  const availUnits = parseInt(item.available ?? item.units, 10) || 0;
  const resUnits = parseInt(item.reserved ?? 0, 10) || 0;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("blood_inventory")
        .insert({
          hospital: item.hospital || item.bloodBankName || "Connected Blood Bank",
          blood_group: item.group || item.blood_group,
          available_units: availUnits,
          reserved_units: resUnits,
          expiry_date: item.expiryDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          status: item.status || "Sufficient",
          cost_per_unit: costPerUnit,
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase add inventory failed, writing locally:", e);
    }
  }
  const current = getLocal("inventory", INITIAL_INVENTORY);
  const newItem = {
    id: Date.now(),
    hospital: item.hospital || item.bloodBankName || "Connected Blood Bank",
    group: item.group || item.blood_group,
    available: availUnits,
    reserved: resUnits,
    total: availUnits + resUnits,
    expiry: item.expiry || "14 days",
    status: item.status || "Sufficient",
    cost_per_unit: costPerUnit,
    ...item,
  };
  current.unshift(newItem);
  setLocal("inventory", current);
  return newItem;
}

export async function updateInventoryStock(id, updates) {
  const rawCost = updates.cost_per_unit ?? updates.costPerUnit;
  const costPerUnit = rawCost !== undefined && !isNaN(parseFloat(rawCost)) ? parseFloat(rawCost) : undefined;
  const availUnits = updates.available !== undefined ? parseInt(updates.available, 10) : (updates.units !== undefined ? parseInt(updates.units, 10) : undefined);
  const resUnits = updates.reserved !== undefined ? parseInt(updates.reserved, 10) : undefined;

  if (isSupabaseConfigured()) {
    try {
      const payload = {};
      if (availUnits !== undefined) payload.available_units = availUnits;
      if (resUnits !== undefined) payload.reserved_units = resUnits;
      if (updates.expiryDate) payload.expiry_date = updates.expiryDate;
      if (updates.status) payload.status = updates.status;
      if (costPerUnit !== undefined) payload.cost_per_unit = costPerUnit;

      const { data, error } = await supabase
        .from("blood_inventory")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return { success: true, data };
    } catch (e) {
      console.warn("Supabase update inventory failed, writing locally:", e);
    }
  }

  const current = getLocal("inventory", INITIAL_INVENTORY);
  const updated = current.map((item) => {
    if (item.id === id || String(item.id) === String(id)) {
      const newAvail = availUnits !== undefined ? availUnits : (item.available || 0);
      const newRes = resUnits !== undefined ? resUnits : (item.reserved || 0);
      return {
        ...item,
        ...updates,
        available: newAvail,
        reserved: newRes,
        total: newAvail + newRes,
        cost_per_unit: costPerUnit !== undefined ? costPerUnit : item.cost_per_unit,
      };
    }
    return item;
  });
  setLocal("inventory", updated);
  return { success: true, data: updated.find((i) => i.id === id || String(i.id) === String(id)) };
}

/**
 * Calculates dynamic estimated blood component cost range across suitable connected sources.
 * Factual, non-speculative, healthcare-appropriate.
 */
export async function calculateEstimatedCostRange({ bloodGroup, units, state = "Tamil Nadu", district = "Tiruchirappalli", inventory = null }) {
  if (!bloodGroup) return null;
  const numUnits = parseInt(units, 10);
  if (isNaN(numUnits) || numUnits <= 0) return null;

  let stockList = inventory;
  if (!stockList || !Array.isArray(stockList) || stockList.length === 0) {
    try {
      stockList = await getBloodInventory({ state, district });
    } catch {
      stockList = INITIAL_INVENTORY;
    }
  }

  // Filter suitable sources that:
  // 1. Match requested blood group
  // 2. Have sufficient available unreserved stock (available >= numUnits)
  // 3. Have a valid configured positive cost_per_unit
  const suitableSources = stockList.filter((item) => {
    const group = item.group || item.blood_group;
    if (group !== bloodGroup) return false;

    const available = item.available !== undefined ? item.available : item.available_units;
    if (typeof available !== "number" || available < numUnits) return false;

    const cost = item.cost_per_unit != null ? Number(item.cost_per_unit) : null;
    return typeof cost === "number" && !isNaN(cost) && cost > 0;
  });

  if (suitableSources.length === 0) {
    return {
      status: "unavailable",
      message: "No suitable blood source is currently available.",
      minCost: null,
      maxCost: null,
      count: 0,
      displayCost: "Unavailable",
    };
  }

  const totals = suitableSources.map((s) => Number(s.cost_per_unit) * numUnits);
  const minCost = Math.min(...totals);
  const maxCost = Math.max(...totals);

  if (minCost === maxCost) {
    return {
      status: "single",
      minCost,
      maxCost,
      count: suitableSources.length,
      sampleHospital: suitableSources[0].hospital,
      displayCost: `From ₹${minCost.toLocaleString("en-IN")}`,
    };
  }

  return {
    status: "range",
    minCost,
    maxCost,
    count: suitableSources.length,
    displayCost: `₹${minCost.toLocaleString("en-IN")} – ₹${maxCost.toLocaleString("en-IN")}`,
  };
}

// ====================================================================
// 2. BLOOD REQUESTS SERVICES
// ====================================================================
export async function getBloodRequests(options = {}) {
  const { state, district } = options;

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("blood_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (district && district !== "All" && district !== "All Districts") {
        query = query.or(`district.ilike.%${district}%,hospital.ilike.%${district}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          patient: d.patient_name,
          group: d.blood_group,
          units: d.units_needed,
          hospital: d.hospital,
          type: d.request_type,
          urgency: d.urgency,
          status: d.status,
          time: new Date(d.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          reason: d.reason,
          district: d.district,
          data_type: "Synthetic/Demo",
        }));
      }
    } catch (e) {
      console.warn("Falling back to local requests:", e);
    }
  }

  // Location-based synthetic fallback for any district in the 74 districts
  if (district && district !== "All" && district !== "All Districts" && district !== "Tiruchirappalli" && district !== "Trichy") {
    const synReqs = getSyntheticRequestsForDistrict(state || "Tamil Nadu", district);
    if (synReqs.length > 0) return synReqs;
  }

  return getLocal("requests", INITIAL_REQUESTS);
}

export async function createBloodRequest(req) {
  const reqId = `BRQ${String(Math.floor(Math.random() * 900) + 100)}`;
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("blood_requests")
        .insert({
          id: reqId,
          patient_name: req.patientName,
          blood_group: req.bloodGroup,
          units_needed: parseInt(req.unitsNeeded, 10),
          hospital: req.hospital || "Trichy GH",
          urgency: req.urgency || "High",
          reason: req.reason || "",
          status: "Pending",
          request_type: req.requestType || "Patient",
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase create request failed, writing locally:", e);
    }
  }
  const current = getLocal("requests", INITIAL_REQUESTS);
  const newReq = {
    id: reqId,
    patient: req.patientName,
    group: req.bloodGroup,
    units: parseInt(req.unitsNeeded, 10),
    hospital: req.hospital || "Trichy GH",
    type: req.requestType || "Patient",
    urgency: req.urgency || "High",
    status: "Pending",
    time: "Just now",
    reason: req.reason || "",
  };
  current.unshift(newReq);
  setLocal("requests", current);
  return newReq;
}

// ====================================================================
// 3. DONORS SERVICES
// ====================================================================
export async function getDonors(options = {}) {
  const { state, district } = options;

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("donors")
        .select("*")
        .order("id", { ascending: true });

      if (district && district !== "All" && district !== "All Districts") {
        query = query.or(`district.ilike.%${district}%,location.ilike.%${district}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          age: d.age,
          gender: d.gender,
          blood_group: d.blood_group,
          location: d.location,
          district: d.district,
          lastDonation: d.last_donation || "Never",
          availability: d.availability,
          phone: d.phone,
          data_type: "Synthetic/Demo",
        }));
      }
    } catch (e) {
      console.warn("Falling back to local donors:", e);
    }
  }

  if (district && district !== "All" && district !== "All Districts" && district !== "Tiruchirappalli" && district !== "Trichy") {
    const synDonors = getSyntheticDonorsForDistrict(state || "Tamil Nadu", district);
    if (synDonors.length > 0) return synDonors;
  }

  return getLocal("donors", INITIAL_DONORS);
}

export async function registerDonor(donor) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("donors")
        .insert({
          name: donor.name,
          age: parseInt(donor.age, 10),
          gender: donor.gender,
          blood_group: donor.bloodGroup,
          district: donor.district || "Trichy",
          location: donor.location,
          phone: donor.phone,
          availability: "Available",
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase donor register failed, writing locally:", e);
    }
  }
  const current = getLocal("donors", INITIAL_DONORS);
  const newDonor = { id: Date.now(), ...donor, availability: "Available", lastDonation: "Never" };
  current.unshift(newDonor);
  setLocal("donors", current);
  return newDonor;
}

// ====================================================================
// 4. TRANSFERS SERVICES
// ====================================================================
export async function getTransfers(options = {}) {
  const { state, district } = options;

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("transfers")
        .select("*")
        .order("created_at", { ascending: false });

      if (district && district !== "All" && district !== "All Districts") {
        query = query.or(`from_location.ilike.%${district}%,to_location.ilike.%${district}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          blood: d.blood_group,
          units: d.units,
          from: d.from_location,
          to: d.to_location,
          status: d.status,
          date: new Date(d.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          reason: d.reason,
          data_type: "Synthetic/Demo",
        }));
      }
    } catch (e) {
      console.warn("Falling back to local transfers:", e);
    }
  }

  if (district && district !== "All" && district !== "All Districts" && district !== "Tiruchirappalli" && district !== "Trichy") {
    const synTransfers = getSyntheticTransfersForDistrict(state || "Tamil Nadu", district);
    if (synTransfers.length > 0) return synTransfers;
  }

  return getLocal("transfers", INITIAL_TRANSFERS);
}

export async function createTransfer(transferData) {
  if (!transferData.blood_group || !transferData.units || !transferData.from_location || !transferData.to_location) {
    return {
      success: false,
      error: "Missing required transfer fields (blood_group, units, from_location, to_location).",
    };
  }

  // Generate robust collision-safe transfer ID
  const timestamp = Date.now().toString().slice(-6);
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  const transferId = transferData.id || `TRF-${timestamp}-${suffix}`;

  const newRecord = {
    id: transferId,
    blood_group: transferData.blood_group,
    units: parseInt(transferData.units, 10),
    from_location: transferData.from_location,
    to_location: transferData.to_location,
    status: "Approved", // Approved immediately upon clinical acceptance
    reason: transferData.reason || "AI Advisory Recommendation approved by clinical officer.",
    requested_by: transferData.requested_by || "Clinical Officer",
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("transfers")
        .insert(newRecord)
        .select();

      if (error) {
        console.error("Supabase createTransfer error:", error.message);
        return {
          success: false,
          error: "Failed to create transfer record in live database. Please try again.",
        };
      }

      // Sync local storage
      const current = getLocal("transfers", INITIAL_TRANSFERS);
      const mappedNew = {
        id: newRecord.id,
        blood: newRecord.blood_group,
        units: newRecord.units,
        from: newRecord.from_location,
        to: newRecord.to_location,
        status: newRecord.status,
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
        reason: newRecord.reason,
      };
      setLocal("transfers", [mappedNew, ...current]);

      return {
        success: true,
        data: data && data.length > 0 ? data[0] : newRecord,
      };
    } catch (e) {
      console.error("createTransfer exception:", e);
      return {
        success: false,
        error: "Unable to create transfer due to a network connection or service failure.",
      };
    }
  }

  return {
    success: false,
    error: "Database service not configured. Write operations require active Supabase connection.",
  };
}

export async function updateTransferStatus(transferId, newStatus, currentStatus = null) {
  // Validate allowed transitions if currentStatus is provided
  if (currentStatus) {
    const allowed = {
      Pending: ["Approved", "Rejected"],
      Approved: ["In Transit"],
      "In Transit": ["Completed"],
      Completed: [],
      Rejected: [],
    };
    if (!allowed[currentStatus]?.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition transfer from '${currentStatus}' to '${newStatus}'.`,
      };
    }
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("transfers")
        .update({ status: newStatus })
        .eq("id", transferId)
        .select();

      if (error) {
        console.error("Supabase update transfer error:", error.message);
        return {
          success: false,
          error: "Failed to update transfer status in database.",
        };
      }

      // Sync local cache
      const current = getLocal("transfers", INITIAL_TRANSFERS);
      const updated = current.map((t) => (t.id === transferId ? { ...t, status: newStatus } : t));
      setLocal("transfers", updated);

      return {
        success: true,
        data: data && data.length > 0 ? data[0] : { id: transferId, status: newStatus },
      };
    } catch (e) {
      console.warn("Supabase update transfer failed:", e);
      return {
        success: false,
        error: "Unable to update transfer due to a network or service error.",
      };
    }
  }

  // Fallback local update
  const current = getLocal("transfers", INITIAL_TRANSFERS);
  const updated = current.map((t) => (t.id === transferId ? { ...t, status: newStatus } : t));
  setLocal("transfers", updated);
  return { success: true, data: { id: transferId, status: newStatus } };
}

export async function updateBloodRequestStatus(requestId, newStatus) {
  if (!requestId || !newStatus) {
    return { success: false, error: "Request ID and new status are required." };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      // Only transition if current status is Pending
      const { data, error } = await supabase
        .from("blood_requests")
        .update({ status: newStatus })
        .eq("id", requestId)
        .eq("status", "Pending")
        .select();

      if (error) {
        console.warn("Supabase updateBloodRequestStatus error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data && data.length > 0 ? data[0] : null };
    } catch (e) {
      console.warn("updateBloodRequestStatus exception:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true, localOnly: true };
}

// ====================================================================
// 5. CONTACT MESSAGE SERVICES
// ====================================================================
export async function submitContactMessage(msg) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .insert({
          name: msg.name,
          email: msg.email,
          phone: msg.phone || "",
          subject: msg.subject,
          message: msg.message,
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase contact submit failed:", e);
    }
  }
  return { success: true, localOnly: true };
}
