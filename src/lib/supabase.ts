import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Reused across invocations within the same serverless runtime instance
// (and across hot-reloads in dev) instead of creating a new client per
// request.
declare global {
  var __aegisSupabase: SupabaseClient | undefined;
}

// Service-role client — bypasses Row Level Security. Server-side only
// (API routes), never expose this key to the browser. All auth logic
// (signup/login) runs on the server, so RLS policies on `users` are
// irrelevant to this client.
export function getSupabaseAdmin(): SupabaseClient {
  if (!globalThis.__aegisSupabase) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars must be set (see .env.example).',
      );
    }

    globalThis.__aegisSupabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return globalThis.__aegisSupabase;
}
