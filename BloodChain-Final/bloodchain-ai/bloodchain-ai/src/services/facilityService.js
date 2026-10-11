import { HOSPITAL_MASTER } from "../constants/hospitalMasterData.js";
import { STATE_DISTRICTS } from "../constants/locationData.js";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/**
 * Standard State Centroids for geographic view centering
 * (Used strictly for map viewpoint centering when no specific hospital marker is focused)
 */
export const STATE_CENTROIDS = {
  "Tamil Nadu": { lat: 10.8041, lng: 78.6853 },
  "Kerala": { lat: 10.8505, lng: 76.2711 },
  "Andhra Pradesh": { lat: 15.9129, lng: 79.7400 },
  "Karnataka": { lat: 15.3173, lng: 75.7139 },
  "New Delhi / Delhi": { lat: 28.6139, lng: 77.2090 },
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Puducherry": { lat: 11.9416, lng: 79.8083 },
};

/**
 * Verified Coordinates Registry
 * ONLY verified coordinates from real-world facilities and existing database records.
 * NO random or fake coordinates are generated.
 */
export const VERIFIED_COORDINATES = {
  "Tiruchirappalli": {
    "Trichy Blood Bank": { lat: 10.8035, lng: 78.6872, type: "Blood Bank" },
    "SRM Hospital": { lat: 10.9234, lng: 78.7391, type: "Hospital" },
    "Kauvery Hospital": { lat: 10.8062, lng: 78.6865, type: "Hospital" },
    "Kauvery Hospital, Trichy": { lat: 10.8062, lng: 78.6865, type: "Hospital" },
    "Apollo Hospital": { lat: 10.8354, lng: 78.6948, type: "Hospital" },
    "Apollo Speciality Hospitals, Trichy": { lat: 10.8354, lng: 78.6948, type: "Hospital" },
    "Trichy Government Hospital": { lat: 10.8041, lng: 78.6853, type: "Government Hospital" },
    "Mahatma Gandhi Memorial Government Hospital": { lat: 10.8041, lng: 78.6853, type: "Government Hospital" },
    "K.A.P. Viswanatham Government Medical College Hospital": { lat: 10.8041, lng: 78.6853, type: "Medical College Hospital" },
    "Government Hospital, Srirangam": { lat: 10.8622, lng: 78.6983, type: "Government Hospital" },
    "Srirangam PHC": { lat: 10.8622, lng: 78.6983, type: "PHC" },
    "MGM Hospital": { lat: 10.8285, lng: 78.6857, type: "Hospital" },
    "Cauvery Medical Center": { lat: 10.8174, lng: 78.6879, type: "Hospital" },
    "Thillai Nagar Blood Bank": { lat: 10.8291, lng: 78.6860, type: "Blood Bank" },
  },
  "Trichy": {
    "Trichy Blood Bank": { lat: 10.8035, lng: 78.6872, type: "Blood Bank" },
    "SRM Hospital": { lat: 10.9234, lng: 78.7391, type: "Hospital" },
    "Kauvery Hospital": { lat: 10.8062, lng: 78.6865, type: "Hospital" },
    "Kauvery Hospital, Trichy": { lat: 10.8062, lng: 78.6865, type: "Hospital" },
    "Apollo Hospital": { lat: 10.8354, lng: 78.6948, type: "Hospital" },
    "Apollo Speciality Hospitals, Trichy": { lat: 10.8354, lng: 78.6948, type: "Hospital" },
    "Trichy Government Hospital": { lat: 10.8041, lng: 78.6853, type: "Government Hospital" },
    "Mahatma Gandhi Memorial Government Hospital": { lat: 10.8041, lng: 78.6853, type: "Government Hospital" },
    "K.A.P. Viswanatham Government Medical College Hospital": { lat: 10.8041, lng: 78.6853, type: "Medical College Hospital" },
    "Government Hospital, Srirangam": { lat: 10.8622, lng: 78.6983, type: "Government Hospital" },
    "Srirangam PHC": { lat: 10.8622, lng: 78.6983, type: "PHC" },
    "MGM Hospital": { lat: 10.8285, lng: 78.6857, type: "Hospital" },
    "Cauvery Medical Center": { lat: 10.8174, lng: 78.6879, type: "Hospital" },
    "Thillai Nagar Blood Bank": { lat: 10.8291, lng: 78.6860, type: "Blood Bank" },
  },
};

/**
 * Classifies facility type accurately based on the source naming distinction
 */
export function classifyFacilityType(name) {
  if (!name) return "Hospital";
  const lower = name.toLowerCase();
  if (lower.includes("blood bank") || lower.includes("blood center")) {
    return "Blood Bank";
  }
  if (lower.includes("medical college")) {
    return "Medical College Hospital";
  }
  if (lower.includes("primary health") || lower.includes("phc")) {
    return "PHC";
  }
  if (lower.includes("community health") || lower.includes("chc")) {
    return "CHC";
  }
  if (
    lower.includes("government") ||
    lower.includes("govt.") ||
    lower.includes("govt ") ||
    lower.includes("district headquarters")
  ) {
    return "Government Hospital";
  }
  return "Hospital";
}

/**
 * Generate a deterministic stable ID for a facility
 */
function generateFacilityId(state, district, name, index) {
  const stCode = (state || "").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
  const dtCode = (district || "").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  const nameCode = (name || "").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  return `FAC-${stCode}-${dtCode}-${nameCode}-${index + 1}`;
}

/**
 * Get all 740 authoritative facilities from the source file
 */
export function getAllAuthoritativeFacilities() {
  const list = [];
  let globalIndex = 0;

  for (const [st, dists] of Object.entries(HOSPITAL_MASTER)) {
    for (const [dist, hospitals] of Object.entries(dists)) {
      hospitals.forEach((hospName, idx) => {
        globalIndex++;
        const type = classifyFacilityType(hospName);

        // Check if verified coordinates exist for this facility
        const verifiedMatch =
          VERIFIED_COORDINATES[dist]?.[hospName] ||
          VERIFIED_COORDINATES[dist]?.[hospName.replace(", Trichy", "")];

        const latitude = verifiedMatch ? verifiedMatch.lat : null;
        const longitude = verifiedMatch ? verifiedMatch.lng : null;

        list.push({
          id: generateFacilityId(st, dist, hospName, idx),
          name: hospName,
          type: verifiedMatch?.type || type,
          facility_type: verifiedMatch?.type || type,
          state: st,
          district: dist,
          latitude,
          longitude,
          hasCoordinates: latitude !== null && longitude !== null,
          status: "Active",
          is_active: true,
          location: `${dist}, ${st}`,
          data_type: "Authoritative Master",
        });
      });
    }
  }

  return list;
}

/**
 * Normalizes state name to match HOSPITAL_MASTER key
 */
function normalizeStateName(stateName) {
  if (!stateName) return "Tamil Nadu";
  if (stateName === "New Delhi / Delhi" || stateName === "Delhi" || stateName === "New Delhi") {
    return "Delhi";
  }
  return stateName;
}

/**
 * Fetch facilities filtered by State and District
 * Returns facilities with verified coordinates attached where available,
 * and tracks facilities with missing coordinates.
 */
export function getFilteredMasterFacilities({
  state = "Tamil Nadu",
  district = "",
  type = "All",
  searchQuery = "",
  customFacilities = [],
}) {
  const isAllStates = !state || state === "All" || state === "All States";
  const isAllDistricts = !district || district === "All" || district === "All Districts";

  const targetStates = isAllStates
    ? Object.keys(HOSPITAL_MASTER)
    : [normalizeStateName(state)];

  let facilities = [];

  targetStates.forEach((stKey) => {
    const stateDistricts = HOSPITAL_MASTER[stKey] || {};
    const effectiveState = stKey === "Delhi" ? "New Delhi / Delhi" : stKey;

    if (!isAllDistricts) {
      // Specific district selected
      const hospNames = stateDistricts[district] || [];
      hospNames.forEach((name, idx) => {
        const detectedType = classifyFacilityType(name);
        const verified =
          VERIFIED_COORDINATES[district]?.[name] ||
          VERIFIED_COORDINATES[district]?.[name.replace(", Trichy", "")];

        const latitude = verified ? verified.lat : null;
        const longitude = verified ? verified.lng : null;

        facilities.push({
          id: generateFacilityId(effectiveState, district, name, idx),
          name,
          type: verified?.type || detectedType,
          facility_type: verified?.type || detectedType,
          state: effectiveState,
          district,
          latitude,
          longitude,
          hasCoordinates: latitude !== null && longitude !== null,
          status: "Active",
          is_active: true,
          location: district,
          data_type: "Authoritative Master",
        });
      });

      // If Trichy, also include existing verified facilities from DB if not already represented
      const isTrichy = district.toLowerCase() === "tiruchirappalli" || district.toLowerCase() === "trichy";
      if (isTrichy && stKey === "Tamil Nadu" && VERIFIED_COORDINATES["Trichy"]) {
        const existingNames = new Set(facilities.map((f) => f.name.toLowerCase()));
        Object.entries(VERIFIED_COORDINATES["Trichy"]).forEach(([vfName, coords], vIdx) => {
          const lower = vfName.toLowerCase();
          const alreadyInList = Array.from(existingNames).some(
            (en) => en.includes(lower) || lower.includes(en)
          );
          if (!alreadyInList) {
            facilities.push({
              id: `FAC-TN-TRY-${coords.type.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${vIdx + 1}`,
              name: vfName,
              type: coords.type,
              facility_type: coords.type,
              state: "Tamil Nadu",
              district: "Tiruchirappalli",
              latitude: coords.lat,
              longitude: coords.lng,
              hasCoordinates: true,
              status: "Active",
              is_active: true,
              location: "Tiruchirappalli",
              data_type: "Verified DB Facility",
            });
          }
        });
      }
    } else {
      // All districts of the state
      let idx = 0;
      for (const [dName, hospNames] of Object.entries(stateDistricts)) {
        hospNames.forEach((name) => {
          idx++;
          const detectedType = classifyFacilityType(name);
          const verified =
            VERIFIED_COORDINATES[dName]?.[name] ||
            VERIFIED_COORDINATES[dName]?.[name.replace(", Trichy", "")];

          const latitude = verified ? verified.lat : null;
          const longitude = verified ? verified.lng : null;

          facilities.push({
            id: generateFacilityId(effectiveState, dName, name, idx),
            name,
            type: verified?.type || detectedType,
            facility_type: verified?.type || detectedType,
            state: effectiveState,
            district: dName,
            latitude,
            longitude,
            hasCoordinates: latitude !== null && longitude !== null,
            status: "Active",
            is_active: true,
            location: dName,
            data_type: "Authoritative Master",
          });
        });
      }

      // If Tamil Nadu, include verified Trichy DB facilities once
      if (stKey === "Tamil Nadu" && VERIFIED_COORDINATES["Trichy"]) {
        const existingNames = new Set(facilities.map((f) => f.name.toLowerCase()));
        Object.entries(VERIFIED_COORDINATES["Trichy"]).forEach(([vfName, coords], vIdx) => {
          const lower = vfName.toLowerCase();
          const alreadyInList = Array.from(existingNames).some(
            (en) => en.includes(lower) || lower.includes(en)
          );
          if (!alreadyInList) {
            facilities.push({
              id: `FAC-TN-TRY-${coords.type.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${vIdx + 1}`,
              name: vfName,
              type: coords.type,
              facility_type: coords.type,
              state: "Tamil Nadu",
              district: "Tiruchirappalli",
              latitude: coords.lat,
              longitude: coords.lng,
              hasCoordinates: true,
              status: "Active",
              is_active: true,
              location: "Tiruchirappalli",
              data_type: "Verified DB Facility",
            });
          }
        });
      }
    }
  });

  // Merge custom user-added institutions for this district if any
  if (customFacilities && customFacilities.length > 0) {
    const matchingCustom = customFacilities.filter((cf) => {
      const matchesState = isAllStates || !cf.state || cf.state.toLowerCase() === state.toLowerCase();
      const matchesDistrict =
        isAllDistricts ||
        !cf.district ||
        cf.district.toLowerCase() === district.toLowerCase();
      return matchesState && matchesDistrict;
    });
    facilities = [...matchingCustom, ...facilities];
  }

  // Filter by facility type if specified
  if (type && type !== "All") {
    facilities = facilities.filter((f) => {
      if (type === "Hospital") {
        return (
          f.type === "Hospital" ||
          f.type === "Government Hospital" ||
          f.type === "Medical College Hospital"
        );
      }
      return f.type.toLowerCase() === type.toLowerCase();
    });
  }

  // Filter by search query if specified
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    facilities = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.district && f.district.toLowerCase().includes(q)) ||
        (f.type && f.type.toLowerCase().includes(q))
    );
  }

  const mappedFacilities = facilities.filter((f) => f.hasCoordinates);
  const unmappedFacilities = facilities.filter((f) => !f.hasCoordinates);

  return {
    facilities,
    mappedFacilities,
    unmappedFacilities,
    totalCount: facilities.length,
    mappedCount: mappedFacilities.length,
    unmappedCount: unmappedFacilities.length,
  };
}

/**
 * Retrieves all facilities across all states and districts that have verified coordinates.
 * Excludes facilities without verified coordinates.
 */
export function getAllVerifiedFacilities(customFacilities = []) {
  const allMaster = getAllAuthoritativeFacilities();
  const verifiedList = allMaster.filter((f) => f.hasCoordinates);

  // Also include verified Trichy database facilities if not already present
  const existingNames = new Set(verifiedList.map((f) => f.name.toLowerCase()));
  if (VERIFIED_COORDINATES["Trichy"]) {
    Object.entries(VERIFIED_COORDINATES["Trichy"]).forEach(([vfName, coords], vIdx) => {
      const lower = vfName.toLowerCase();
      const alreadyInList = Array.from(existingNames).some(
        (en) => en.includes(lower) || lower.includes(en)
      );
      if (!alreadyInList) {
        verifiedList.push({
          id: `FAC-TN-TRY-${coords.type.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${vIdx + 1}`,
          name: vfName,
          type: coords.type,
          facility_type: coords.type,
          state: "Tamil Nadu",
          district: "Tiruchirappalli",
          latitude: coords.lat,
          longitude: coords.lng,
          hasCoordinates: true,
          status: "Active",
          is_active: true,
          location: "Tiruchirappalli",
          data_type: "Verified DB Facility",
        });
      }
    });
  }

  // Also include custom facilities if they have coordinates
  if (customFacilities && customFacilities.length > 0) {
    customFacilities.forEach((cf) => {
      if (
        cf.latitude != null &&
        cf.longitude != null &&
        !isNaN(cf.latitude) &&
        !isNaN(cf.longitude)
      ) {
        verifiedList.push({ ...cf, hasCoordinates: true });
      }
    });
  }

  return verifiedList;
}

/**
 * Optionally sync facilities from Supabase facilities table (Read-Only safe query)
 */
export async function fetchSupabaseFacilities() {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from("facilities")
      .select("id, name, facility_type, district, state, latitude, longitude, is_active, phone, address")
      .eq("is_active", true);

    if (error) {
      console.warn("Supabase fetch facilities warning:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("fetchSupabaseFacilities exception:", err);
    return [];
  }
}
