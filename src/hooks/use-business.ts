'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types/database'

export function useBusiness() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Strip sensitive OAuth tokens from contact_info before exposing to client
      if (data?.contact_info) {
        const info = { ...data.contact_info } as Record<string, unknown>
        delete info.gmail_refresh_token
        delete info.gmail_access_token
        delete info.gmail_token_expiry
        data.contact_info = info
      }

      setBusiness(data)
      setLoading(false)
    }
    load()
  }, [])

  return { business, loading }
}
