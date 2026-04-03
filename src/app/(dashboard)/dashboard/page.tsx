'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, HelpCircle, UserX, TrendingUp, Loader2, TestTube, Plus, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

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
    if (bizLoading) return
    if (!business) {
      setLoading(false)
      return
    }
    async function load() {
      try {
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
      } catch {
        // Supabase not connected — use defaults
      }
      setLoading(false)
    }
    load()
  }, [business, bizLoading])

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{business?.name ? `שלום, ${business.name}` : 'שלום'} 👋</h1>
        <p className="text-gray-500 mt-1">הנה סקירה מהירה של הפעילות</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'שיחות', value: stats.totalConversations, icon: MessageSquare, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
          { label: 'שאלות נפוצות', value: stats.totalFaqs, icon: HelpCircle, gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50' },
          { label: 'העברות לנציג', value: stats.totalEscalations, icon: UserX, gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
          { label: 'הודעות', value: stats.totalMessages, icon: TrendingUp, gradient: 'from-blue-600 to-indigo-500', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-blue-100/60 shadow-none hover:shadow-md hover:shadow-blue-500/5 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold gradient-text">{loading ? '...' : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/playground">
          <Card className="border-blue-100/60 shadow-none hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TestTube className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">נסה את הבוט</p>
                <p className="text-xs text-gray-400">בדוק איך הבוט עונה</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-300 mr-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/faq">
          <Card className="border-blue-100/60 shadow-none hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">הוסף שאלות</p>
                <p className="text-xs text-gray-400">הוסף FAQ לבוט</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-300 mr-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/analytics">
          <Card className="border-blue-100/60 shadow-none hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">צפה באנליטיקס</p>
                <p className="text-xs text-gray-400">נתונים ותובנות</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-300 mr-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Getting Started */}
      {stats.totalFaqs === 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-violet-50 shadow-none">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2 gradient-text">מתחילים!</h3>
            <p className="text-gray-600 text-sm mb-4">
              כדי שהבוט שלך יתחיל לענות על שאלות, הוסף שאלות נפוצות ומדיניות. ככל שתוסיף יותר מידע, הבוט יענה טוב יותר.
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard/faq">
                <Button size="sm" className="gradient-primary border-0 shadow-md shadow-blue-500/25">
                  <Plus className="h-4 w-4 ml-1" />
                  הוסף שאלות נפוצות
                </Button>
              </Link>
              <Link href="/dashboard/policies">
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  הוסף מדיניות
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
