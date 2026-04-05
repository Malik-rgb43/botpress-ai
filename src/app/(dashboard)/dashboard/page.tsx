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
  ArrowUp, ArrowDown, Plus, Loader2, BarChart3, RefreshCw,
  AlertTriangle, CheckCircle2, ExternalLink, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Conversation, Message, Escalation } from '@/types/database'

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
  const [openEscalations, setOpenEscalations] = useState<(Escalation & { conversation?: Conversation })[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const loadData = useCallback(async () => {
    if (!business) return
    setDataLoading(true)
    try {
      const supabase = createClient()
      const { start, prevStart, prevEnd } = getDateRange(period)

      const { data, error } = await supabase.rpc('get_business_analytics', {
        p_business_id: business.id,
        p_start_date: start.toISOString(),
        p_prev_start: prevStart.toISOString(),
        p_prev_end: prevEnd.toISOString(),
      })

      if (error) {
        console.error('Analytics RPC error:', error)
        toast.error('שגיאה בטעינת הנתונים')
        setDataLoading(false)
        return
      }

      // data is already a JSON object with everything we need
      const analytics = data as any

      setStats({
        conversations: analytics.conversations || 0,
        prevConversations: analytics.prev_conversations || 0,
        messages: analytics.messages || 0,
        prevMessages: analytics.prev_messages || 0,
        escalations: analytics.escalations || 0,
        prevEscalations: analytics.prev_escalations || 0,
        satisfaction: 0, // TODO: calculate from ratings
        prevSatisfaction: 0,
      })

      setSentiment(analytics.sentiment || { positive: 0, neutral: 0, negative: 0, angry: 0 })
      setChannels(analytics.channels || { email: 0, whatsapp: 0, widget: 0 })
      setTopQuestions(analytics.top_questions || [])
      setRecentConversations(analytics.recent_conversations || [])
      setOpenEscalations(analytics.open_escalations || [])
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Analytics load error:', err)
      toast.error('שגיאה בטעינת הנתונים — נסה שוב')
    }
    setDataLoading(false)
  }, [business, period])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  function pctChange(current: number, prev: number): { value: number; up: boolean } {
    if (prev === 0) return { value: 0, up: true }
    const change = ((current - prev) / prev) * 100
    return { value: Math.abs(Math.round(change)), up: change >= 0 }
  }

  async function addToFAQ(question: string) {
    toast.success(`"${question}" נוסף ל-FAQ`)
  }

  async function resolveEscalation(escalationId: string) {
    const supabase = createClient()
    const { error } = await supabase.rpc('resolve_escalation', { p_escalation_id: escalationId })
    if (error) {
      toast.error('שגיאה בעדכון')
      return
    }
    toast.success('השיחה סומנה כטופלה')
    setOpenEscalations(prev => prev.filter(e => e.id !== escalationId))
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
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <span>נתונים ותובנות על פעילות הבוט</span>
            {lastRefresh && (
              <span className="text-gray-400 text-xs">· עודכן {lastRefresh.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            disabled={dataLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
            רענון
          </Button>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              <TabsTrigger value="today">היום</TabsTrigger>
              <TabsTrigger value="week">שבוע</TabsTrigger>
              <TabsTrigger value="month">חודש</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Open Escalations Alert */}
      {openEscalations.length > 0 && (
        <Card className="bg-orange-50 border-orange-200 rounded-2xl shadow-md mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {openEscalations.length} שיחות ממתינות למענה אנושי
            </CardTitle>
            <CardDescription className="text-orange-600">שיחות שהבוט העביר לנציג וטרם טופלו</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openEscalations.map(esc => (
                <div key={esc.id} className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-orange-100">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{esc.conversation?.customer_identifier || 'לקוח'}</p>
                      <p className="text-xs text-gray-500 truncate">{esc.reason}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(esc.created_at).toLocaleDateString('he-IL')} {new Date(esc.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dashboard/conversations/${esc.conversation_id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <ExternalLink className="h-3 w-3" />
                        לשיחה
                      </Button>
                    </Link>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1 text-xs bg-green-600 hover:bg-green-700"
                      onClick={() => resolveEscalation(esc.id)}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      סמן כטופל
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'שיחות', value: stats.conversations, change: convChange, icon: MessageSquare, color: 'text-blue-500' },
          { label: 'הודעות', value: stats.messages, change: msgChange, icon: TrendingUp, color: 'text-green-500' },
          { label: 'העברות לנציג', value: stats.escalations, change: escChange, icon: UserX, color: 'text-orange-500', invertColor: true },
          { label: 'שביעות רצון', value: stats.satisfaction.toFixed(1), change: satChange, icon: Star, color: 'text-yellow-500' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{kpi.label}</span>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{kpi.value}</div>
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
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
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
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
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
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
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
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
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
