const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "public-anon-key-placeholder";

export { supabaseUrl, supabaseAnonKey };

export function getSupabaseEnv() {
  return { supabaseUrl, supabaseAnonKey };
}
