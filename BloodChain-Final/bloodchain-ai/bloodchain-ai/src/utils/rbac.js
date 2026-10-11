/**
 * Role-Based Access Control (RBAC) Module for BloodChain AI
 * File: src/utils/rbac.js
 * 
 * Defines normalized role values, display labels, permission checks,
 * role-specific navigation, and route permissions.
 */

export const ROLES = {
  DONOR: "donor",
  HOSPITAL: "hospital",
  BLOODBANK: "bloodbank",
};

export const ROLE_LABELS = {
  [ROLES.DONOR]: "Donor / User",
  [ROLES.HOSPITAL]: "Hospital",
  [ROLES.BLOODBANK]: "Blood Bank",
};

/**
 * Normalizes any role string (legacy, display, or lowercase) into one of the 3 primary roles:
 * 'donor' | 'hospital' | 'bloodbank'
 */
export function normalizeRole(rawRole) {
  if (!rawRole) return ROLES.DONOR;
  const str = String(rawRole).trim().toLowerCase();

  if (str === "bloodbank" || str.includes("blood") || str.includes("bank")) {
    return ROLES.BLOODBANK;
  }
  if (
    str === "hospital" ||
    str.includes("hospital") ||
    str.includes("admin") ||
    str.includes("clinic") ||
    str.includes("doctor")
  ) {
    return ROLES.HOSPITAL;
  }
  if (str === "donor" || str.includes("donor") || str.includes("user")) {
    return ROLES.DONOR;
  }
  return ROLES.DONOR;
}

/**
 * Returns user-friendly display label for a role
 */
export function getRoleLabel(role) {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized] || "Donor / User";
}

/**
 * Permissions Matrix
 */
export const PERMISSIONS = {
  // Navigation & Page access
  VIEW_DASHBOARD: [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_FIND_DONORS: [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_NOTIFICATIONS: [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_SETTINGS: [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_HELP: [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],

  VIEW_MY_DONATIONS: [ROLES.DONOR],
  VIEW_MY_REQUESTS: [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],

  VIEW_BLOOD_INVENTORY: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_BLOOD_REQUESTS_OP: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_AI_RECOMMENDATION: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_APPROVAL_TRANSFER: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  VIEW_HOSPITALS_BLOODBANKS: [ROLES.HOSPITAL, ROLES.BLOODBANK],

  // Operational Actions
  MANAGE_INVENTORY: [ROLES.BLOODBANK],
  VIEW_INVENTORY_STATS: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  APPROVE_TRANSFER: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  REJECT_TRANSFER: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  CREATE_TRANSFER: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  REVIEW_RECOMMENDATION: [ROLES.HOSPITAL, ROLES.BLOODBANK],
  MANAGE_HOSPITAL_DATA: [ROLES.HOSPITAL, ROLES.BLOODBANK],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permissionKey) {
  const normalized = normalizeRole(role);
  const allowed = PERMISSIONS[permissionKey];
  if (!allowed) return false;
  return allowed.includes(normalized);
}

/**
 * Role-Aware Navigation Configuration
 * Defines primary sidebar menu items per normalized role.
 * Settings, Help & Support, and Logout are consistently rendered in the bottom menu.
 */
export const NAVIGATION_BY_ROLE = {
  [ROLES.DONOR]: [
    { label: "Dashboard", path: "/dashboard", iconName: "Home" },
    { label: "Find Donors", path: "/find-donors", iconName: "Users" },
    { label: "My Donations", path: "/my-donations", iconName: "Heart" },
    { label: "My Requests", path: "/my-requests", iconName: "FileText" },
    { label: "Notifications", path: "/notifications", iconName: "Bell" },
  ],
  [ROLES.HOSPITAL]: [
    { label: "Dashboard", path: "/dashboard", iconName: "Home" },
    { label: "Blood Inventory", path: "/blood-inventory", iconName: "Droplets" },
    { label: "Blood Request", path: "/blood-request", iconName: "FileText" },
    { label: "Find Donors", path: "/find-donors", iconName: "Users" },
    { label: "AI Recommendation", path: "/ai-recommendation", iconName: "Sun" },
    { label: "Approval & Transfer", path: "/approval-transfer", iconName: "Truck" },
    { label: "Hospitals & Blood Banks", path: "/hospitals-blood-banks", iconName: "Building2" },
    { label: "Notifications", path: "/notifications", iconName: "Bell" },
  ],
  [ROLES.BLOODBANK]: [
    { label: "Dashboard", path: "/dashboard", iconName: "Home" },
    { label: "Blood Inventory", path: "/blood-inventory", iconName: "Droplets" },
    { label: "Blood Request", path: "/blood-request", iconName: "FileText" },
    { label: "Find Donors", path: "/find-donors", iconName: "Users" },
    { label: "AI Recommendation", path: "/ai-recommendation", iconName: "Sun" },
    { label: "Approval & Transfer", path: "/approval-transfer", iconName: "Truck" },
    { label: "Hospitals & Blood Banks", path: "/hospitals-blood-banks", iconName: "Building2" },
    { label: "Notifications", path: "/notifications", iconName: "Bell" },
  ],
};

/**
 * Allowed roles per route path
 */
export const ROUTE_PERMISSIONS = {
  "/dashboard": [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/find-donors": [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/my-requests": [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/notifications": [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/settings": [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/help-support": [ROLES.DONOR, ROLES.HOSPITAL, ROLES.BLOODBANK],

  "/my-donations": [ROLES.DONOR],

  "/blood-inventory": [ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/blood-request": [ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/ai-recommendation": [ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/approval-transfer": [ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/approval-and-transfer": [ROLES.HOSPITAL, ROLES.BLOODBANK],
  "/hospitals-blood-banks": [ROLES.HOSPITAL, ROLES.BLOODBANK],
};
