'use client'

import { useState } from 'react'
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

// Empty stats — real data will come from Supabase queries
const EMPTY_STATS = {
  today: { conversations: 0, messages: 0, escalations: 0, satisfaction: 0, prevConversations: 0, prevMessages: 0, prevEscalations: 0, prevSatisfaction: 0 },
  week: { conversations: 0, messages: 0, escalations: 0, satisfaction: 0, prevConversations: 0, prevMessages: 0, prevEscalations: 0, prevSatisfaction: 0 },
  month: { conversations: 0, messages: 0, escalations: 0, satisfaction: 0, prevConversations: 0, prevMessages: 0, prevEscalations: 0, prevSatisfaction: 0 },
}

const EMPTY_SENTIMENT = { positive: 0, neutral: 0, negative: 0, angry: 0 }

const EMPTY_CHANNELS = { widget: 0, whatsapp: 0, email: 0 }

type Period = 'today' | 'week' | 'month'

export default function AnalyticsPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [period, setPeriod] = useState<Period>('week')

  const stats = EMPTY_STATS[period]

  function pctChange(current: number, prev: number): { value: number; up: boolean } {
    if (prev === 0) return { value: 0, up: true }
    const change = ((current - prev) / prev) * 100
    return { value: Math.abs(Math.round(change)), up: change >= 0 }
  }

  async function addToFAQ(question: string) {
    toast.success(`"${question}" נוסף ל-FAQ`)
  }

  if (bizLoading) {
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            ניתוח ואנליטיקס
          </h1>
          <p className="text-gray-500 text-sm mt-1">סקירת פעילות הבוט ונתונים מרכזיים</p>
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
          <Card key={i} className="border-blue-100/60 shadow-none">
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
        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">שאלות נפוצות ביותר</CardTitle>
            <CardDescription>מה הלקוחות שואלים הכי הרבה</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <BarChart3 className="h-8 w-8 text-blue-200 mb-2" />
              <p className="text-sm">עדיין אין נתונים</p>
              <p className="text-xs">שאלות נפוצות יופיעו כאן כשהבוט יתחיל לעבוד</p>
            </div>
          </CardContent>
        </Card>

        {/* Unanswered Questions */}
        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">שאלות ללא מענה</CardTitle>
            <CardDescription>שאלות שהבוט לא ידע לענות עליהן — הוסף ל-FAQ בלחיצה</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <MessageSquare className="h-8 w-8 text-blue-200 mb-2" />
              <p className="text-sm">עדיין אין שאלות ללא מענה</p>
              <p className="text-xs">שאלות שהבוט לא ידע לענות יופיעו כאן</p>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment */}
        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">ניתוח רגש</CardTitle>
            <CardDescription>איך הלקוחות מרגישים בשיחות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'חיובי', value: EMPTY_SENTIMENT.positive, color: 'bg-green-400' },
                { label: 'ניטרלי', value: EMPTY_SENTIMENT.neutral, color: 'bg-gray-300' },
                { label: 'שלילי', value: EMPTY_SENTIMENT.negative, color: 'bg-orange-400' },
                { label: 'כועס', value: EMPTY_SENTIMENT.angry, color: 'bg-red-400' },
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
        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">חלוקה לפי ערוצים</CardTitle>
            <CardDescription>מאיפה מגיעות השיחות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'וידג׳ט באתר', value: EMPTY_CHANNELS.widget, color: 'bg-blue-400' },
                { label: 'וואטסאפ', value: EMPTY_CHANNELS.whatsapp, color: 'bg-green-500' },
                { label: 'אימייל', value: EMPTY_CHANNELS.email, color: 'bg-purple-400' },
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
