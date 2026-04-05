import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS — only use in server-side cron/webhook endpoints
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    // SECURITY: Never fall back to anon key — that would silently bypass RLS
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. ' +
      'Admin client requires the service role key for server-side operations.'
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
