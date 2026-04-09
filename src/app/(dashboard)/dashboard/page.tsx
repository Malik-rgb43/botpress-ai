'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n/provider'
import { useBusiness } from '@/hooks/use-business'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare, TrendingUp, TrendingDown, UserX, Star,
  ArrowUp, ArrowDown, Plus, Loader2, BarChart3, RefreshCw,
  AlertTriangle, CheckCircle2, ExternalLink, Clock, Bell, BellRing,
  Hash, Send, Mail, Smartphone, Globe
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useEscalationContext } from '@/components/providers/escalation-provider'
import { motion, AnimatePresence } from 'framer-motion'
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

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const listItem = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

const emptyState = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

export default function AnalyticsPage() {
  const { t, lang } = useTranslation()
  const locale = lang === 'he' ? 'he-IL' : lang === 'ar' ? 'ar-SA' : 'en-US'
  const { business, loading: bizLoading } = useBusiness()
  const { newConversationSignal, newMessageSignal, pendingCount, notificationsEnabled, enableNotifications } = useEscalationContext()
  const [period, setPeriod] = useState<Period>('week')
  const [stats, setStats] = useState<PeriodStats>(EMPTY_STATS)
  const [sentiment, setSentiment] = useState<SentimentDist>({ positive: 0, neutral: 0, negative: 0, angry: 0 })
  const [channels, setChannels] = useState<ChannelDist>({ widget: 0, whatsapp: 0, email: 0 })
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([])
  const [recentConversations, setRecentConversations] = useState<(Conversation & { messages: Message[] })[]>([])
  const [openEscalations, setOpenEscalations] = useState<(Escalation & { conversation?: Conversation })[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const loadData = useCallback(async (silent = false) => {
    if (!business) return
    if (!silent) setDataLoading(true)
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
        if (!silent) toast.error(t.common.error_loading)
        if (!silent) setDataLoading(false)
        return
      }

      const analytics = data as any

      setStats({
        conversations: analytics.conversations || 0,
        prevConversations: analytics.prev_conversations || 0,
        messages: analytics.messages || 0,
        prevMessages: analytics.prev_messages || 0,
        escalations: analytics.escalations || 0,
        prevEscalations: analytics.prev_escalations || 0,
        satisfaction: 0,
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
      toast.error(t.common.error_loading)
    }
    setDataLoading(false)
  }, [business, period])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh every 30 seconds as fallback (silent — no loading spinner)
  useEffect(() => {
    if (!business) return
    const interval = setInterval(() => {
      loadData(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [business, period, loadData])

  // REALTIME: Instant refresh when new conversation or message arrives via Supabase Realtime
  useEffect(() => {
    if (!business) return
    if (newConversationSignal > 0 || newMessageSignal > 0) {
      loadData(true)
    }
  }, [newConversationSignal, newMessageSignal, business, loadData])

  function pctChange(current: number, prev: number): { value: number; up: boolean } {
    if (prev === 0) return { value: 0, up: true }
    const change = ((current - prev) / prev) * 100
    return { value: Math.abs(Math.round(change)), up: change >= 0 }
  }

  async function addToFAQ(question: string) {
    toast.success(t.analytics.added_to_faq)
  }

  async function resolveEscalation(escalationId: string) {
    const supabase = createClient()
    const { error } = await supabase.rpc('resolve_escalation', { p_escalation_id: escalationId })
    if (error) {
      toast.error(t.common.error_loading)
      return
    }
    toast.success(t.analytics.marked_resolved)
    setOpenEscalations(prev => prev.filter(e => e.id !== escalationId))
  }

  if (bizLoading || (dataLoading && !lastRefresh)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
      </div>
    )
  }

  if (!business) {
    return (
      <motion.div
        variants={emptyState}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center h-64 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <BarChart3 className="h-7 w-7 text-[#3b82f6]" />
        </div>
        <p className="text-gray-900 font-semibold text-lg">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1">
          <a href="/onboarding" className="text-[#3b82f6] hover:underline">{t.common.go_to_setup}</a>
        </p>
      </motion.div>
    )
  }

  const convChange = pctChange(stats.conversations, stats.prevConversations)
  const msgChange = pctChange(stats.messages, stats.prevMessages)
  const escChange = pctChange(stats.escalations, stats.prevEscalations)
  const satChange = pctChange(stats.satisfaction, stats.prevSatisfaction)

  const kpis = [
    {
      label: t.analytics.kpi_conversations,
      value: stats.conversations,
      change: convChange,
      icon: MessageSquare,
      iconBg: 'bg-blue-50',
      iconColor: 'text-[#3b82f6]',
    },
    {
      label: t.analytics.kpi_messages,
      value: stats.messages,
      change: msgChange,
      icon: Send,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-[#10b981]',
    },
    {
      label: t.analytics.kpi_escalations,
      value: stats.escalations,
      change: escChange,
      icon: UserX,
      iconBg: 'bg-amber-50',
      iconColor: 'text-[#f59e0b]',
      invertColor: true,
    },
    {
      label: t.analytics.kpi_satisfaction,
      value: stats.satisfaction.toFixed(1),
      change: satChange,
      icon: Star,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
  ]

  const sentimentBars = [
    { label: t.analytics.sentiment_positive, value: sentiment.positive, color: 'bg-[#10b981]' },
    { label: t.analytics.sentiment_neutral, value: sentiment.neutral, color: 'bg-gray-300' },
    { label: t.analytics.sentiment_negative, value: sentiment.negative, color: 'bg-[#f59e0b]' },
    { label: t.analytics.sentiment_angry, value: sentiment.angry, color: 'bg-[#ef4444]' },
  ]

  const channelBars = [
    { label: t.analytics.channel_widget, value: channels.widget, color: 'bg-[#3b82f6]' },
    { label: t.analytics.channel_whatsapp, value: channels.whatsapp, color: 'bg-[#10b981]' },
    { label: t.analytics.channel_email, value: channels.email, color: 'bg-purple-500' },
  ]

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* ───── Header Row ───── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.analytics.title}</h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-gray-400">
            <span className="hidden md:inline">{t.analytics.subtitle}</span>
            {lastRefresh && (
              <span className="text-gray-400 text-xs">
                {t.analytics.updated_at} {lastRefresh.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#10b981] bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
              {t.analytics.realtime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="bg-white border border-gray-200/60 shadow-sm relative">
              <TabsTrigger value="today">{t.analytics.today}</TabsTrigger>
              <TabsTrigger value="week">{t.analytics.week}</TabsTrigger>
              <TabsTrigger value="month">{t.analytics.month}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            disabled={dataLoading}
            className="gap-1.5 border-gray-200/60 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
            {t.analytics.refresh}
          </Button>
        </div>
      </div>

      {/* ───── Escalation Alert ───── */}
      <AnimatePresence>
        {openEscalations.length > 0 && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="bg-white border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="border-l-4 border-transparent p-6" style={{ borderImage: 'linear-gradient(to bottom, #ef4444, #f87171) 1' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
                  </div>
                  <span className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-[#ef4444] rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {openEscalations.length} {t.analytics.pending_human}
                  </h3>
                  <p className="text-sm text-gray-400">{t.analytics.bot_escalated}</p>
                </div>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {openEscalations.map(esc => (
                  <motion.div
                    key={esc.id}
                    variants={listItem}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/80 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {esc.conversation?.customer_identifier || t.analytics.customer}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{esc.reason}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(esc.created_at).toLocaleDateString(locale)}{' '}
                          {new Date(esc.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/dashboard/conversations/${esc.conversation_id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl border-gray-200/60">
                          <ExternalLink className="h-3 w-3" />
                          {t.analytics.go_to_conversation}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl"
                        onClick={() => resolveEscalation(esc.id)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {t.analytics.mark_resolved}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── KPI Grid ───── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 hover:shadow-md hover:border-gray-300/80 hover:scale-[1.01] transition-all duration-300 cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
            <motion.p
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
            >
              {kpi.value}
            </motion.p>
            <div className="flex items-center gap-1.5 text-xs">
              {kpi.change.up ? (
                <span className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-md ${kpi.invertColor ? 'bg-red-50 text-[#ef4444]' : 'bg-emerald-50 text-[#10b981]'}`}>
                  <ArrowUp className="h-3 w-3" />
                  {kpi.change.value}%
                </span>
              ) : (
                <span className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-md ${kpi.invertColor ? 'bg-emerald-50 text-[#10b981]' : 'bg-red-50 text-[#ef4444]'}`}>
                  <ArrowDown className="h-3 w-3" />
                  {kpi.change.value}%
                </span>
              )}
              <span className="text-gray-400">{t.analytics.from_previous}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ───── Top Questions + Recent Conversations ───── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Questions */}
        <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200/60 bg-white shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-[#3b82f6]" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">{t.analytics.top_questions}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">{t.analytics.top_questions_sub}</p>
          </div>
          <div className="p-6">
            {topQuestions.length === 0 ? (
              <motion.div
                variants={emptyState}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-[#3b82f6]/40" />
                </div>
                <p className="text-sm text-gray-500 font-medium">{t.common.no_data}</p>
                <p className="text-xs text-gray-400 mt-1">{t.analytics.questions_appear}</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-1"
              >
                {topQuestions.slice(0, 5).map((q, i) => (
                  <motion.div key={i} variants={listItem} className="flex items-center gap-2.5 py-1.5">
                    <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-400 shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 truncate flex-1">{q.question}</p>
                    <span className="text-[11px] text-gray-400 shrink-0">{q.count}x</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Recent Conversations */}
        <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200/60 bg-white shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 text-[#10b981]" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">{t.analytics.recent_conversations}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">{t.analytics.recent_conversations_sub}</p>
          </div>
          <div className="p-6">
            {recentConversations.length === 0 ? (
              <motion.div
                variants={emptyState}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6 text-[#3b82f6]/40" />
                </div>
                <p className="text-sm text-gray-500 font-medium">{t.analytics.no_conversations}</p>
                <p className="text-xs text-gray-400 mt-1">{t.analytics.conversations_appear}</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-0.5"
              >
                {recentConversations.slice(0, 5).map(conv => (
                  <motion.div key={conv.id} variants={listItem}>
                    <Link href={`/dashboard/conversations/${conv.id}`} className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800 truncate">{conv.customer_identifier}</p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(conv.started_at).toLocaleDateString(locale)} · {conv.messages?.length || 0} {t.analytics.kpi_messages}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {conv.channel === 'email' ? t.analytics.channel_email : conv.channel === 'whatsapp' ? t.analytics.channel_whatsapp : t.common.channel_widget}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ───── Sentiment + Channels ───── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Sentiment Analysis */}
        <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200/60 bg-white shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Star className="h-3.5 w-3.5 text-[#f59e0b]" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">{t.analytics.sentiment_title}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">{t.analytics.sentiment_sub}</p>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {sentimentBars.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-900 font-medium">{s.label}</span>
                    <span className="text-gray-500 font-medium">{s.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`${s.color} h-2.5 rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Channel Distribution */}
        <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200/60 bg-white shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">{t.analytics.channels_title}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">{t.analytics.channels_sub}</p>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {channelBars.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-900 font-medium">{c.label}</span>
                    <span className="text-gray-500 font-medium">{c.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`${c.color} h-2.5 rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
