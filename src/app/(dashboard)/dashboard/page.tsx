'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare, TrendingUp, TrendingDown, UserX, Star,
  ArrowUp, ArrowDown, Plus, Loader2, BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import type { Conversation, Message } from '@/types/database'

type Period = 'today' | 'week' | 'month'

interface PeriodStats {
  conversations: number
  messages: number
  escalations: number
  satisfaction: number
  prevConversations: number
  prevMessages: number
  prevEscalations: number
  prevSatisfaction: number
}

interface SentimentDist {
  positive: number
  neutral: number
  negative: number
  angry: number
}

interface ChannelDist {
  widget: number
  whatsapp: number
  email: number
}

interface TopQuestion {
  question: string
  count: number
}

const EMPTY_STATS: PeriodStats = { conversations: 0, messages: 0, escalations: 0, satisfaction: 0, prevConversations: 0, prevMessages: 0, prevEscalations: 0, prevSatisfaction: 0 }

function getDateRange(period: Period): { start: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  const start = new Date(now)
  const prevStart = new Date(now)
  const prevEnd = new Date(now)

  if (period === 'today') {
    start.setHours(0, 0, 0, 0)
    prevEnd.setHours(0, 0, 0, 0)
    prevStart.setDate(prevStart.getDate() - 1)
    prevStart.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    start.setDate(start.getDate() - 7)
    prevEnd.setDate(prevEnd.getDate() - 7)
    prevStart.setDate(prevStart.getDate() - 14)
  } else {
    start.setDate(start.getDate() - 30)
    prevEnd.setDate(prevEnd.getDate() - 30)
    prevStart.setDate(prevStart.getDate() - 60)
  }

  return { start, prevStart, prevEnd }
}

export default function AnalyticsPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [period, setPeriod] = useState<Period>('week')
  const [stats, setStats] = useState<PeriodStats>(EMPTY_STATS)
  const [sentiment, setSentiment] = useState<SentimentDist>({ positive: 0, neutral: 0, negative: 0, angry: 0 })
  const [channels, setChannels] = useState<ChannelDist>({ widget: 0, whatsapp: 0, email: 0 })
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([])
  const [recentConversations, setRecentConversations] = useState<(Conversation & { messages: Message[] })[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!business) return
    setDataLoading(true)
    try {
      const supabase = createClient()
      const { start, prevStart, prevEnd } = getDateRange(period)

      // Current period counts
      const [convRes, prevConvRes, escRes, prevEscRes] = await Promise.all([
        supabase.from('conversations').select('id', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('started_at', start.toISOString()),
        supabase.from('conversations').select('id', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('started_at', prevStart.toISOString())
          .lt('started_at', prevEnd.toISOString()),
        supabase.from('escalations').select('id', { count: 'exact', head: true })
          .gte('created_at', start.toISOString()),
        supabase.from('escalations').select('id', { count: 'exact', head: true })
          .gte('created_at', prevStart.toISOString())
          .lt('created_at', prevEnd.toISOString()),
      ])

      // Fetch conversations with messages for the current period (for messages count, sentiment, top questions)
      const { data: convWithMsgs } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('business_id', business.id)
        .gte('started_at', start.toISOString())
        .order('started_at', { ascending: false })

      const allConvs = convWithMsgs || []
      const allMessages: Message[] = allConvs.flatMap((c: any) => c.messages || [])
      const customerMessages = allMessages.filter(m => m.role === 'customer')

      // Previous period messages count
      const { data: prevConvWithMsgs } = await supabase
        .from('conversations')
        .select('id, messages(id)')
        .eq('business_id', business.id)
        .gte('started_at', prevStart.toISOString())
        .lt('started_at', prevEnd.toISOString())
      const prevMsgCount = (prevConvWithMsgs || []).reduce((sum: number, c: any) => sum + (c.messages?.length || 0), 0)

      // Satisfaction average
      const ratedConvs = allConvs.filter((c: any) => c.satisfaction_rating != null)
      const avgSat = ratedConvs.length > 0
        ? ratedConvs.reduce((sum: number, c: any) => sum + c.satisfaction_rating, 0) / ratedConvs.length
        : 0

      const prevRatedConvs = (prevConvWithMsgs || [] as any[]).filter((c: any) => c.satisfaction_rating != null)
      const prevAvgSat = prevRatedConvs.length > 0
        ? prevRatedConvs.reduce((sum: number, c: any) => sum + c.satisfaction_rating, 0) / prevRatedConvs.length
        : 0

      setStats({
        conversations: convRes.count || 0,
        messages: allMessages.length,
        escalations: escRes.count || 0,
        satisfaction: parseFloat(avgSat.toFixed(1)),
        prevConversations: prevConvRes.count || 0,
        prevMessages: prevMsgCount,
        prevEscalations: prevEscRes.count || 0,
        prevSatisfaction: parseFloat(prevAvgSat.toFixed(1)),
      })

      // Sentiment distribution
      const sentimentCounts: Record<string, number> = { positive: 0, neutral: 0, negative: 0, angry: 0 }
      customerMessages.forEach(m => {
        if (m.sentiment && sentimentCounts[m.sentiment] !== undefined) {
          sentimentCounts[m.sentiment]++
        }
      })
      const totalSentiment = Object.values(sentimentCounts).reduce((a, b) => a + b, 0)
      if (totalSentiment > 0) {
        setSentiment({
          positive: Math.round((sentimentCounts.positive / totalSentiment) * 100),
          neutral: Math.round((sentimentCounts.neutral / totalSentiment) * 100),
          negative: Math.round((sentimentCounts.negative / totalSentiment) * 100),
          angry: Math.round((sentimentCounts.angry / totalSentiment) * 100),
        })
      } else {
        setSentiment({ positive: 0, neutral: 0, negative: 0, angry: 0 })
      }

      // Channel distribution
      const channelCounts: Record<string, number> = { widget: 0, whatsapp: 0, email: 0 }
      allConvs.forEach((c: any) => {
        if (c.channel && channelCounts[c.channel] !== undefined) {
          channelCounts[c.channel]++
        }
      })
      const totalChannels = Object.values(channelCounts).reduce((a, b) => a + b, 0)
      if (totalChannels > 0) {
        setChannels({
          widget: Math.round((channelCounts.widget / totalChannels) * 100),
          whatsapp: Math.round((channelCounts.whatsapp / totalChannels) * 100),
          email: Math.round((channelCounts.email / totalChannels) * 100),
        })
      } else {
        setChannels({ widget: 0, whatsapp: 0, email: 0 })
      }

      // Top questions — group customer messages by content (trimmed)
      const questionMap = new Map<string, number>()
      customerMessages.forEach(m => {
        const q = m.content.trim().slice(0, 120)
        if (q.length > 0) {
          questionMap.set(q, (questionMap.get(q) || 0) + 1)
        }
      })
      const sorted = Array.from(questionMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([question, count]) => ({ question, count }))
      setTopQuestions(sorted)

      // Recent conversations (last 10)
      setRecentConversations(allConvs.slice(0, 10) as any)
    } catch (err) {
      console.error('Analytics load error:', err)
    }
    setDataLoading(false)
  }, [business, period])

  useEffect(() => {
    loadData()
  }, [loadData])

  function pctChange(current: number, prev: number): { value: number; up: boolean } {
    if (prev === 0) return { value: 0, up: true }
    const change = ((current - prev) / prev) * 100
    return { value: Math.abs(Math.round(change)), up: change >= 0 }
  }

  async function addToFAQ(question: string) {
    toast.success(`"${question}" נוסף ל-FAQ`)
  }

  if (bizLoading || dataLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1">עבור ל<a href="/onboarding" className="text-blue-500 hover:underline">הגדרת העסק</a></p>
      </div>
    )
  }

  const convChange = pctChange(stats.conversations, stats.prevConversations)
  const msgChange = pctChange(stats.messages, stats.prevMessages)
  const escChange = pctChange(stats.escalations, stats.prevEscalations)
  const satChange = pctChange(stats.satisfaction, stats.prevSatisfaction)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-balance flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            אנליטיקס
          </h1>
          <p className="text-gray-500 text-sm mt-1">נתונים ותובנות על פעילות הבוט</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="today">היום</TabsTrigger>
            <TabsTrigger value="week">שבוע</TabsTrigger>
            <TabsTrigger value="month">חודש</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'שיחות', value: stats.conversations, change: convChange, icon: MessageSquare, color: 'text-blue-500' },
          { label: 'הודעות', value: stats.messages, change: msgChange, icon: TrendingUp, color: 'text-green-500' },
          { label: 'העברות לנציג', value: stats.escalations, change: escChange, icon: UserX, color: 'text-orange-500', invertColor: true },
          { label: 'שביעות רצון', value: stats.satisfaction.toFixed(1), change: satChange, icon: Star, color: 'text-yellow-500' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{kpi.label}</span>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div className="text-3xl font-bold mb-1">{kpi.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {kpi.change.up ? (
                  <ArrowUp className={`h-3 w-3 ${kpi.invertColor ? 'text-red-500' : 'text-green-500'}`} />
                ) : (
                  <ArrowDown className={`h-3 w-3 ${kpi.invertColor ? 'text-green-500' : 'text-red-500'}`} />
                )}
                <span className={kpi.change.up ? (kpi.invertColor ? 'text-red-500' : 'text-green-500') : (kpi.invertColor ? 'text-green-500' : 'text-red-500')}>
                  {kpi.change.value}%
                </span>
                <span className="text-gray-400">מהתקופה הקודמת</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Questions */}
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">שאלות נפוצות ביותר</CardTitle>
            <CardDescription>מה הלקוחות שואלים הכי הרבה</CardDescription>
          </CardHeader>
          <CardContent>
            {topQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <BarChart3 className="h-8 w-8 text-blue-200 mb-2" />
                <p className="text-sm">עדיין אין נתונים</p>
                <p className="text-xs">שאלות נפוצות יופיעו כאן כשהבוט יתחיל לעבוד</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topQuestions.map((q, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <p className="text-sm truncate flex-1">{q.question}</p>
                    <Badge variant="secondary" className="text-xs shrink-0">{q.count} פעמים</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">שיחות אחרונות</CardTitle>
            <CardDescription>השיחות האחרונות עם לקוחות</CardDescription>
          </CardHeader>
          <CardContent>
            {recentConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <MessageSquare className="h-8 w-8 text-blue-200 mb-2" />
                <p className="text-sm">עדיין אין שיחות</p>
                <p className="text-xs">שיחות יופיעו כאן כשלקוחות ידברו עם הבוט</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversations.map(conv => (
                  <div key={conv.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{conv.customer_identifier}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(conv.started_at).toLocaleDateString('he-IL')} · {conv.messages?.length || 0} הודעות
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{conv.channel}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentiment */}
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">ניתוח רגש</CardTitle>
            <CardDescription>איך הלקוחות מרגישים בשיחות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'חיובי', value: sentiment.positive, color: 'bg-green-400' },
                { label: 'ניטרלי', value: sentiment.neutral, color: 'bg-gray-300' },
                { label: 'שלילי', value: sentiment.negative, color: 'bg-orange-400' },
                { label: 'כועס', value: sentiment.angry, color: 'bg-red-400' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{s.label}</span>
                    <span className="text-gray-500">{s.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${s.color} h-2 rounded-full transition-all`} style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">חלוקה לפי ערוצים</CardTitle>
            <CardDescription>מאיפה מגיעות השיחות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'וידג׳ט באתר', value: channels.widget, color: 'bg-blue-400' },
                { label: 'וואטסאפ', value: channels.whatsapp, color: 'bg-green-500' },
                { label: 'אימייל', value: channels.email, color: 'bg-purple-400' },
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{c.label}</span>
                    <span className="text-gray-500">{c.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${c.color} h-2 rounded-full transition-all`} style={{ width: `${c.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
