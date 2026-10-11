// Single Source of Truth for State -> District Location Filter across BloodChain AI
export const STATE_DISTRICTS = {
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Salem",
    "Tiruchirappalli",
    "Tirunelveli",
    "Erode",
    "Vellore",
    "Thanjavur",
    "Dindigul",
    "Kanyakumari",
    "Tiruppur",
    "Cuddalore",
    "Thoothukudi",
    "Sivaganga",
  ],
  "Kerala": [
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod",
  ],
  "Andhra Pradesh": [
    "Anakapalli",
    "Anantapuramu",
    "Chittoor",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Kakinada",
    "Krishna",
    "Kurnool",
    "Nandyal",
    "Nellore",
    "Prakasam",
    "Srikakulam",
    "Tirupati",
    "Visakhapatnam",
  ],
  "Karnataka": [
    "Bengaluru Urban",
    "Mysuru",
    "Belagavi",
    "Ballari",
    "Bengaluru Rural",
    "Chikkaballapur",
    "Chikkamagaluru",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Hassan",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Mandya",
  ],
  "New Delhi / Delhi": [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  "Puducherry": [
    "Puducherry",
    "Karaikal",
    "Mahe",
    "Yanam",
  ],
};

export const STATES_LIST = Object.keys(STATE_DISTRICTS);

export function getDistrictsForState(stateName) {
  if (!stateName) return [];
  // All States query -> return all unique districts across all states
  if (stateName === "All" || stateName === "All States") {
    return Array.from(new Set(Object.values(STATE_DISTRICTS).flat()));
  }
  // Direct match
  if (STATE_DISTRICTS[stateName]) return STATE_DISTRICTS[stateName];
  // Handle "Delhi" or "New Delhi"
  if (stateName === "Delhi" || stateName === "New Delhi") {
    return STATE_DISTRICTS["New Delhi / Delhi"] || [];
  }
  return [];
}
