import { createClient } from "@supabase/supabase-js";

const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof globalThis !== "undefined" && globalThis.process?.env
    ? globalThis.process.env
    : {};

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim() !== "" &&
    !supabaseUrl.includes("your-project-id") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.trim() !== "" &&
    !supabaseAnonKey.includes("your-supabase-anon-key")
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured()) {
  console.info(
    "%c[BloodChain AI]%c Running in LocalStorage / Demo Mode. To connect real PostgreSQL & Supabase Auth, add your project credentials to .env",
    "color: #ed1c2c; font-weight: bold;",
    "color: #4b5563;"
  );
}
