/**
 * EventPilot AI - Supabase Client Architecture Stub
 * Complete database models & queries will be activated in Phase 2.
 */

export interface SupabaseConfig {
  url: string | undefined;
  anonKey: string | undefined;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith("https://")),
  };
}
