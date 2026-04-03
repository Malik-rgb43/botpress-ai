'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, HelpCircle, UserX, TrendingUp, Loader2 } from 'lucide-react'

interface Stats {
  totalConversations: number
  totalFaqs: number
  totalEscalations: number
  totalMessages: number
}

export default function DashboardOverview() {
  const { business, loading: bizLoading } = useBusiness()
  const [stats, setStats] = useState<Stats>({ totalConversations: 0, totalFaqs: 0, totalEscalations: 0, totalMessages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    async function load() {
      const supabase = createClient()
      const [convRes, faqRes, escRes, msgRes] = await Promise.all([
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('business_id', business!.id),
        supabase.from('faqs').select('id', { count: 'exact', head: true }).eq('business_id', business!.id),
        supabase.from('escalations').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        totalConversations: convRes.count || 0,
        totalFaqs: faqRes.count || 0,
        totalEscalations: escRes.count || 0,
        totalMessages: msgRes.count || 0,
      })
      setLoading(false)
    }
    load()
  }, [business])

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">שלום, {business?.name || 'העסק שלך'} 👋</h1>
        <p className="text-gray-500 mt-1">הנה סקירה מהירה של הפעילות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">שיחות</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalConversations}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">שאלות נפוצות</CardTitle>
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalFaqs}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">העברות לנציג</CardTitle>
            <UserX className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalEscalations}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">הודעות</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalMessages}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
