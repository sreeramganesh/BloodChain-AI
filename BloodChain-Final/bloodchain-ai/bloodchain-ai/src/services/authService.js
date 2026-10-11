import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { normalizeRole, getRoleLabel } from "../utils/rbac.js";

/**
 * Modular Authentication Service
 * Seamlessly switches between Supabase Auth and localStorage / demo credentials.
 */

export const AUTH_STORAGE_KEY = "bloodchain_auth_user";
export const REGISTERED_USERS_KEY = "bloodchain_registered_users";

// Pre-seeded Demo Accounts with normalized RBAC roles
export const DEFAULT_DEMO_USERS = [
  {
    id: "demo-admin-1",
    name: "Dr. Rajesh Sharma",
    email: "admin@apollo.org",
    password: "password123",
    role: "hospital",
    displayRole: "Hospital Admin",
    organization: "Apollo Hospitals",
    phone: "+91 98765 43210",
  },
  {
    id: "demo-donor-1",
    name: "Priya Nair",
    email: "donor@bloodchain.ai",
    password: "password123",
    role: "donor",
    displayRole: "Donor / User",
    organization: "Community Blood Donor",
    phone: "+91 98111 22334",
  },
  {
    id: "demo-bloodbank-1",
    name: "Trichy Blood Bank Staff",
    email: "staff@bloodbank.org",
    password: "password123",
    role: "bloodbank",
    displayRole: "Blood Bank",
    organization: "Trichy Central Blood Bank",
    phone: "+91 98444 55667",
  },
];

const _authMemoryCache = new Map();

function safeGetStorage(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (_e) {
    void _e;
  }
  return _authMemoryCache.get(key) || null;
}

function safeSetStorage(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (_e) {
    void _e;
  }
  _authMemoryCache.set(key, value);
}

function safeRemoveStorage(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (_e) {
    void _e;
  }
  _authMemoryCache.delete(key);
}

/**
 * Retrieve all registered users from local cache (combining default demo users + custom registrations)
 */
export function getRegisteredUsers() {
  try {
    const stored = safeGetStorage(REGISTERED_USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const demoEmails = new Set(DEFAULT_DEMO_USERS.map((u) => u.email.toLowerCase()));
      const customUsers = Array.isArray(parsed)
        ? parsed.filter((u) => !demoEmails.has(u.email?.toLowerCase()))
        : [];
      return [...DEFAULT_DEMO_USERS, ...customUsers];
    }
  } catch (e) {
    console.error("Error reading registered users from storage:", e);
  }
  return DEFAULT_DEMO_USERS;
}

/**
 * Register a new user
 * If Supabase is connected, registers via supabase.auth.signUp()
 * Always saves locally as a reliable fallback.
 */
export async function registerUser(userData) {
  const normalizedEmail = (userData.email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email address is required.");
  }

  const fullName =
    userData.name ||
    `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
    "BloodChain User";

  // Check local demo and cached registered accounts for duplicates
  const existingUsers = getRegisteredUsers();
  if (existingUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("This email is already registered. Please sign in or use another email.");
  }

  let supabaseUser = null;
  let requiresEmailConfirmation = false;

  const normalizedRole = normalizeRole(userData.role);
  const displayRole = getRoleLabel(normalizedRole);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: userData.password,
        options: {
          data: {
            name: fullName,
            role: normalizedRole,
            display_role: displayRole,
            legacy_role: displayRole === "Hospital" ? "Hospital Admin" : displayRole,
            organization: userData.organization || "Health Network",
            phone: userData.phone || "+91 98765 43210",
          },
        },
      });

      if (error) {
        throw error;
      }

      // Supabase returns identities: [] if email is already registered when confirmation is enabled
      if (data?.user?.identities && data.user.identities.length === 0) {
        throw new Error("This email is already registered. Please sign in or use another email.");
      }

      supabaseUser = data.user;
      if (supabaseUser && !supabaseUser.confirmed_at && !supabaseUser.email_confirmed_at && !data?.session) {
        requiresEmailConfirmation = true;
      }
    } catch (err) {
      console.warn("Supabase signup notice:", err.message);
      if (
        err.message?.toLowerCase().includes("already registered") ||
        err.message?.toLowerCase().includes("already exists") ||
        err.message?.toLowerCase().includes("duplicate")
      ) {
        throw new Error("This email is already registered. Please sign in or use another email.", { cause: err });
      }
      throw err;
    }
  }

  // Also cache locally for immediate demoing / offline access
  const newUser = {
    id: supabaseUser?.id || `user-${Date.now()}`,
    name: fullName,
    email: normalizedEmail,
    password: userData.password,
    role: normalizedRole,
    displayRole: displayRole,
    organization: userData.organization || (normalizedRole === "hospital" ? "Apollo Hospitals" : "Blood Bank Partner"),
    phone: userData.phone || "+91 98765 43210",
    requiresEmailConfirmation,
    createdAt: new Date().toISOString(),
  };

  try {
    const stored = safeGetStorage(REGISTERED_USERS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    list.push(newUser);
    safeSetStorage(REGISTERED_USERS_KEY, JSON.stringify(list));
    safeSetStorage("bloodchain_last_registered_email", newUser.email);
  } catch (e) {
    console.error("Failed to save registered user to storage:", e);
  }

  return newUser;
}

/**
 * Authenticate user with email and password
 * First checks if it's one of the pre-configured demo users.
 * If Supabase is connected, calls supabase.auth.signInWithPassword.
 * Otherwise authenticates against localStorage.
 */
export async function loginUser(email, password) {
  const normalizedEmail = (email || "").trim().toLowerCase();

  // 1. Instant access for pre-seeded demo users
  const demoMatch = DEFAULT_DEMO_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (demoMatch) {
    const role = normalizeRole(demoMatch.role);
    const sessionUser = {
      id: demoMatch.id,
      name: demoMatch.name,
      email: demoMatch.email,
      role: role,
      displayRole: demoMatch.displayRole || getRoleLabel(role),
      organization: demoMatch.organization,
      phone: demoMatch.phone,
      authenticatedAt: new Date().toISOString(),
      provider: "demo",
    };
    saveLocalSession(sessionUser);
    return sessionUser;
  }

  // 2. Real Supabase Authentication (if configured)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Query user's profile from the public.profiles table
        let profile = null;
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          profile = profileData;
        } catch {
          // fallback to user metadata
        }

        const meta = data.user.user_metadata || {};
        const rawRole = profile?.role || meta.role || "hospital";
        const role = normalizeRole(rawRole);
        const sessionUser = {
          id: data.user.id,
          name: profile?.name || meta.name || data.user.email.split("@")[0],
          email: data.user.email,
          role: role,
          displayRole: getRoleLabel(role),
          organization: profile?.organization || meta.organization || "Health Network",
          phone: profile?.phone || meta.phone || "",
          authenticatedAt: new Date().toISOString(),
          provider: "supabase",
        };

        saveLocalSession(sessionUser);
        return sessionUser;
      }
    } catch (err) {
      console.warn("Supabase login failed, checking local credentials:", err.message);
      // If error was invalid credentials, let it fall through to local check
    }
  }

  // 3. Fallback: Authenticate against local registered users
  const users = getRegisteredUsers();
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!found) {
    throw new Error("No account found with this email. Please check your credentials or register.");
  }

  if (found.password && found.password !== password) {
    throw new Error("Incorrect password. Please verify your password and try again.");
  }

  const rawRole = found.role;
  const role = normalizeRole(rawRole);
  const sessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: role,
    displayRole: found.displayRole || getRoleLabel(role),
    organization: found.organization,
    phone: found.phone,
    authenticatedAt: new Date().toISOString(),
    provider: "local",
  };

  saveLocalSession(sessionUser);
  return sessionUser;
}

function saveLocalSession(sessionUser) {
  try {
    safeSetStorage(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
  } catch (e) {
    console.error("Failed to save auth session to storage:", e);
  }
}

/**
 * Retrieve current active session
 */
export function getCurrentSession() {
  try {
    const stored = safeGetStorage(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed) {
        parsed.role = normalizeRole(parsed.role);
        parsed.displayRole = parsed.displayRole || getRoleLabel(parsed.role);
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to read current session from storage:", e);
  }
  return null;
}

/**
 * Clear session and log out
 */
export async function logoutUser() {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out error:", e);
    }
  }
  try {
    safeRemoveStorage(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear auth session from storage:", e);
  }
}
