import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { normalizeRole } from "../utils/rbac.js";

/**
 * ====================================================================
 * BLOODCHAIN AI - PHASE 8: OPERATIONAL NOTIFICATION SERVICE
 * ====================================================================
 * 
 * Provides production-ready notification query, mutation, and duplicate
 * protection (idempotency key) for operational workflow events.
 * 
 * STRICT BOUNDARIES:
 * - Notifications are strictly informational.
 * - ZERO automated decisions, ZERO inventory mutations, ZERO transfer approvals.
 * ====================================================================
 */

const STORAGE_KEY = "bloodchain_notifications";

// Verified baseline operational notifications (advisory only)
const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-001",
    event_key: "recommendation_accepted:rec-1",
    role: "Hospital Admin",
    type: "recommendation_accepted",
    title: "AI Recommendation Accepted",
    message: "Allocation for Request BRQ001 (A+, 4 units) was authorized for dispatch from Apollo Hospitals Trichy to Trichy GH.",
    related_request_id: "BRQ001",
    related_recommendation_id: "rec-1",
    related_transfer_id: "TRF-198493-73C",
    priority: "Critical",
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "notif-002",
    event_key: "transfer_created:TRF-198493-73C",
    role: "Hospital Admin",
    type: "transfer_created",
    title: "New Blood Transfer Created",
    message: "Logistics Transfer TRF-198493-73C (4 units of A+) created: Apollo Hospitals Trichy -> Trichy GH.",
    related_request_id: "BRQ001",
    related_recommendation_id: "rec-1",
    related_transfer_id: "TRF-198493-73C",
    priority: "High",
    is_read: false,
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
  },
  {
    id: "notif-003",
    event_key: "shortage_alert:kauvery:B+:2026-10",
    role: "Hospital Admin",
    type: "shortage_alert",
    title: "Critical Blood Shortage Risk",
    message: "Kauvery Hospital reported critical shortage of B+ blood (28 units available vs 33 required reserve).",
    related_request_id: null,
    related_recommendation_id: null,
    related_transfer_id: null,
    priority: "High",
    is_read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "notif-004",
    event_key: "expiry_alert:gov_hosp:A-:2026-09-28",
    role: "Blood Bank",
    type: "expiry_alert",
    title: "Critical Expiry Alert",
    message: "Government Hospital has 10 units of A- blood expiring within 24 hours. Immediate reallocation recommended.",
    related_request_id: null,
    related_recommendation_id: null,
    related_transfer_id: null,
    priority: "Critical",
    is_read: false,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "notif-005",
    event_key: "transfer_completed:TRF005",
    role: "Blood Bank",
    type: "transfer_completed",
    title: "Blood Transfer Completed",
    message: "Transfer TRF005 (12 units of O-) safely delivered from Kauvery Hospital to MGM Hospital.",
    related_request_id: null,
    related_recommendation_id: null,
    related_transfer_id: "TRF005",
    priority: "Medium",
    is_read: true,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
];

let _notifMemoryStore = null;

function getLocalStore() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } else if (_notifMemoryStore) {
      return JSON.parse(JSON.stringify(_notifMemoryStore));
    }
  } catch (e) {
    console.error("Failed to read notifications from localStorage:", e);
  }
  return [...INITIAL_NOTIFICATIONS];
}

function setLocalStore(data) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      _notifMemoryStore = JSON.parse(JSON.stringify(data));
    }
  } catch (e) {
    console.error("Failed to save notifications to localStorage:", e);
  }
}

/**
 * Fetch notifications tailored to user and operational role.
 */
export async function getNotifications({ userId = null, role = null } = {}) {
  const normRole = role && role !== "All" ? normalizeRole(role) : null;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (normRole) {
        query = query.or(`role.eq.${normRole},role.eq.All,user_id.eq.${userId || '00000000-0000-0000-0000-000000000000'}`);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("Falling back to local notification store:", err);
    }
  }

  // Local fallback
  const stored = getLocalStore();
  if (!normRole) return stored;

  return stored.filter((n) => {
    if (n.role === "All") return true;
    if (normRole && normalizeRole(n.role) === normRole) return true;
    if (userId && n.user_id === userId) return true;
    return false;
  });
}

/**
 * Get count of unread notifications.
 */
export async function getUnreadNotificationCount({ userId = null, role = null } = {}) {
  const all = await getNotifications({ userId, role });
  return all.filter((n) => !n.is_read).length;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return { success: false, error: "Missing notification ID." };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .select();

      if (!error) {
        // sync local store
        const current = getLocalStore().map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        setLocalStore(current);
        return { success: true, data: data?.[0] };
      }
    } catch (err) {
      console.warn("Supabase markNotificationAsRead error, updating local:", err);
    }
  }

  const current = getLocalStore().map((n) =>
    n.id === notificationId ? { ...n, is_read: true } : n
  );
  setLocalStore(current);
  return { success: true };
}

/**
 * Mark all notifications as read for current user/role context.
 */
export async function markAllNotificationsAsRead({ userId = null, role = null } = {}) {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
      if (userId) query = query.eq("user_id", userId);
      const { error } = await query;
      if (!error) {
        const current = getLocalStore().map((n) => ({ ...n, is_read: true }));
        setLocalStore(current);
        return { success: true };
      }
    } catch (err) {
      console.warn("Supabase markAllNotificationsAsRead error:", err);
    }
  }

  const current = getLocalStore().map((n) => ({ ...n, is_read: true }));
  setLocalStore(current);
  return { success: true };
}

/**
 * Create a new operational notification with idempotency duplicate protection.
 */
export async function createNotification(notif) {
  if (!notif.type || !notif.title || !notif.message) {
    return { success: false, error: "Missing required notification fields (type, title, message)." };
  }

  // Idempotency check: prevent duplicate alerts for the same operational event
  const eventKey = notif.event_key || `${notif.type}:${notif.related_transfer_id || notif.related_request_id || notif.related_recommendation_id || Date.now()}`;
  
  const currentStore = getLocalStore();
  const alreadyExists = currentStore.some((n) => n.event_key === eventKey);
  if (alreadyExists) {
    return { success: true, duplicateIgnored: true, message: "Notification already exists for this event." };
  }

  const newRecord = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    event_key: eventKey,
    user_id: notif.user_id || null,
    role: notif.role || "Hospital Admin",
    type: notif.type,
    title: notif.title,
    message: notif.message,
    related_request_id: notif.related_request_id || null,
    related_recommendation_id: notif.related_recommendation_id || null,
    related_transfer_id: notif.related_transfer_id || null,
    priority: notif.priority || "Medium",
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert(newRecord)
        .select();

      if (!error && data && data.length > 0) {
        setLocalStore([data[0], ...currentStore]);
        return { success: true, data: data[0] };
      }
    } catch (err) {
      console.warn("Supabase insert notification error, storing locally:", err);
    }
  }

  // Local sync
  setLocalStore([newRecord, ...currentStore]);
  return { success: true, data: newRecord };
}
