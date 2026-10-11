import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  getCurrentSession,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";
import {
  ROLES,
  normalizeRole,
  getRoleLabel,
  hasPermission,
  ROUTE_PERMISSIONS,
} from "../utils/rbac";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentSession());

  useEffect(() => {
    // 1. Synchronize session state across tabs
    const handleStorageChange = (e) => {
      if (e.key === "bloodchain_auth_user") {
        setUser(getCurrentSession());
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 2. Listen to Supabase auth state change if configured
    let authListener = null;
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
        } else if (event === "SIGNED_IN" && session?.user) {
          // If not demo user, refresh session user
          const current = getCurrentSession();
          if (current?.provider !== "demo") {
            setUser(current);
          }
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const sessionUser = await loginUser(email, password);
    setUser(sessionUser);
    return sessionUser;
  };

  const register = async (userData) => {
    return await registerUser(userData);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Normalized Role & Capabilities
  const role = useMemo(() => normalizeRole(user?.role), [user?.role]);
  const displayRole = useMemo(() => getRoleLabel(role), [role]);

  const isDonor = role === ROLES.DONOR;
  const isHospital = role === ROLES.HOSPITAL;
  const isBloodBank = role === ROLES.BLOODBANK;

  const checkPermission = (permissionKey) => hasPermission(role, permissionKey);

  const canAccessRoute = (path) => {
    const allowed = ROUTE_PERMISSIONS[path];
    if (!allowed) return true; // public or unmapped
    return allowed.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        displayRole,
        isDonor,
        isHospital,
        isBloodBank,
        hasPermission: checkPermission,
        canAccessRoute,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
