import { createClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../../services/supabaseClient.js";

export function createBrowserClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase, isSupabaseConfigured };
export default supabase;
