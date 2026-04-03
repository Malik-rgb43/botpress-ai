import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS — only use in server-side cron/webhook endpoints
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    // Fallback to anon key if service role not set
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      throw new Error('Supabase not configured')
    }
    return createClient(url, anonKey)
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
