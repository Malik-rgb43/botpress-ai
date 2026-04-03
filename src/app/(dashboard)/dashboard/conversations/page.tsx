'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Conversation } from '@/types/database'

export default function ConversationsPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', business!.id)
        .order('started_at', { ascending: false })
        .limit(50)
      setConversations(data || [])
      setLoading(false)
    }
    load()
  }, [business])

  if (bizLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">שיחות</h1>
        <p className="text-gray-500 text-sm mt-1">צפה בהיסטוריית השיחות של הבוט</p>
      </div>

      {conversations.length === 0 ? (
        <Card className="border-gray-100 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500">עדיין אין שיחות</p>
            <p className="text-gray-400 text-sm">שיחות יופיעו כאן כשלקוחות ידברו עם הבוט</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link key={conv.id} href={`/dashboard/conversations/${conv.id}`}>
              <Card className="border-gray-100 shadow-none hover:border-gray-200 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{conv.customer_identifier}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(conv.started_at).toLocaleDateString('he-IL')} {new Date(conv.started_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{conv.channel}</Badge>
                    {conv.satisfaction_rating && (
                      <Badge variant="secondary" className="text-xs">
                        {'★'.repeat(conv.satisfaction_rating)}
                      </Badge>
                    )}
                    <ArrowLeft className="h-4 w-4 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
