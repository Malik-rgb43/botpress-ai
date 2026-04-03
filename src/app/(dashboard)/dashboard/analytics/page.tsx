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

// Demo data for a professional-looking dashboard
const DEMO_STATS = {
  today: { conversations: 24, messages: 156, escalations: 3, satisfaction: 4.6, prevConversations: 18, prevMessages: 130, prevEscalations: 5, prevSatisfaction: 4.3 },
  week: { conversations: 167, messages: 1089, escalations: 21, satisfaction: 4.5, prevConversations: 143, prevMessages: 980, prevEscalations: 28, prevSatisfaction: 4.2 },
  month: { conversations: 682, messages: 4231, escalations: 78, satisfaction: 4.4, prevConversations: 590, prevMessages: 3800, prevEscalations: 95, prevSatisfaction: 4.1 },
}

const DEMO_TOP_QUESTIONS = [
  { question: 'מה שעות הפעילות?', count: 89 },
  { question: 'כמה עולה משלוח?', count: 67 },
  { question: 'מה מדיניות ההחזרות?', count: 54 },
  { question: 'איך עוקבים אחרי הזמנה?', count: 43 },
  { question: 'האם יש הנחה לרכישה שנייה?', count: 38 },
  { question: 'מתי המוצר יחזור למלאי?', count: 31 },
  { question: 'איך יוצרים קשר עם נציג?', count: 28 },
]

const DEMO_UNANSWERED = [
  { id: '1', question: 'האם אתם עושים התקנה בבית?', times_asked: 12 },
  { id: '2', question: 'יש לכם שירות VIP?', times_asked: 8 },
  { id: '3', question: 'מתי תהיה מבצע בלק פריידי?', times_asked: 6 },
  { id: '4', question: 'האם אפשר לשלם בתשלומים?', times_asked: 5 },
]

const DEMO_SENTIMENT = { positive: 58, neutral: 28, negative: 10, angry: 4 }

const DEMO_CHANNELS = { widget: 45, whatsapp: 35, email: 20 }

type Period = 'today' | 'week' | 'month'

export default function AnalyticsPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [period, setPeriod] = useState<Period>('week')

  const stats = DEMO_STATS[period]

  function pctChange(current: number, prev: number): { value: number; up: boolean } {
    if (prev === 0) return { value: 0, up: true }
    const change = ((current - prev) / prev) * 100
    return { value: Math.abs(Math.round(change)), up: change >= 0 }
  }

  async function addToFAQ(question: string) {
    toast.success(`"${question}" נוסף ל-FAQ`)
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
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
            <div className="space-y-3">
              {DEMO_TOP_QUESTIONS.map((q, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm truncate">{q.question}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{q.count}</Badge>
                </div>
              ))}
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
            <div className="space-y-3">
              {DEMO_UNANSWERED.map((q) => (
                <div key={q.id} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{q.question}</p>
                    <p className="text-xs text-gray-400">נשאל {q.times_asked} פעמים</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addToFAQ(q.question)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Plus className="h-3 w-3 ml-1" />
                    הוסף ל-FAQ
                  </Button>
                </div>
              ))}
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
                { label: 'חיובי', value: DEMO_SENTIMENT.positive, color: 'bg-green-400' },
                { label: 'ניטרלי', value: DEMO_SENTIMENT.neutral, color: 'bg-gray-300' },
                { label: 'שלילי', value: DEMO_SENTIMENT.negative, color: 'bg-orange-400' },
                { label: 'כועס', value: DEMO_SENTIMENT.angry, color: 'bg-red-400' },
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
                { label: 'וידג׳ט באתר', value: DEMO_CHANNELS.widget, color: 'bg-blue-400' },
                { label: 'וואטסאפ', value: DEMO_CHANNELS.whatsapp, color: 'bg-green-500' },
                { label: 'אימייל', value: DEMO_CHANNELS.email, color: 'bg-purple-400' },
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
