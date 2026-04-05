'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { useTranslation } from '@/i18n/provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare, ArrowLeft, Trash2, AlertTriangle, CheckCircle2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useEscalationContext } from '@/components/providers/escalation-provider'
import { toast } from 'sonner'
import type { Conversation } from '@/types/database'

type TimeFilter = 'all' | 'today' | 'week' | 'month'
type StatusFilter = 'all' | 'needs_agent' | 'resolved'
type ChannelFilter = 'all' | 'email' | 'whatsapp' | 'widget'

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        active
          ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function ChannelBadge({ channel }: { channel: string }) {
  const { t } = useTranslation()
  const config: Record<string, { bg: string; text: string; label: string }> = {
    email: { bg: 'bg-blue-100', text: 'text-blue-700', label: t.common.channel_email },
    whatsapp: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: t.common.channel_whatsapp },
    widget: { bg: 'bg-purple-100', text: 'text-purple-700', label: t.common.channel_widget },
  }
  const c = config[channel] || { bg: 'bg-gray-100', text: 'text-gray-600', label: channel }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export default function ConversationsPage() {
  const { business, loading: bizLoading } = useBusiness()
  const { t, lang } = useTranslation()
  const { newConversationSignal, newMessageSignal } = useEscalationContext()
  const locale = lang === 'he' ? 'he-IL' : lang === 'ar' ? 'ar-SA' : 'en-US'
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all')
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set())
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    if (!business) return
    setLoading(true)
    const supabase = createClient()

    const now = new Date()
    let startDate: string | null = null
    if (timeFilter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    } else if (timeFilter === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (timeFilter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
    }

    const { data, error } = await supabase.rpc('get_conversations_list', {
      p_business_id: business.id,
      p_start_date: startDate,
      p_channel: channelFilter === 'all' ? null : channelFilter,
      p_status: statusFilter === 'all' ? null : statusFilter,
      p_limit: 50,
    })

    if (error) {
      console.error('Conversations list RPC error:', error)
      setLoading(false)
      return
    }

    const result = data as any
    const convs: Conversation[] = result.conversations || []
    setConversations(convs)

    const escalatedSet = new Set<string>(result.escalated_ids || [])
    setEscalatedIds(escalatedSet)
    setResolvedIds(new Set<string>(result.resolved_ids || []))

    setLoading(false)
  }, [business, timeFilter, statusFilter, channelFilter])

  useEffect(() => {
    if (!business) return
    loadConversations()
  }, [business, loadConversations])

  // REALTIME: Auto-refresh when new conversation or message arrives
  useEffect(() => {
    if (!business) return
    if (newConversationSignal > 0 || newMessageSignal > 0) {
      const silentRefresh = async () => {
        const supabase = createClient()
        const now = new Date()
        let startDate: string | null = null
        if (timeFilter === 'today') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        else if (timeFilter === 'week') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        else if (timeFilter === 'month') startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()

        const { data } = await supabase.rpc('get_conversations_list', {
          p_business_id: business!.id,
          p_start_date: startDate,
          p_channel: channelFilter === 'all' ? null : channelFilter,
          p_status: statusFilter === 'all' ? null : statusFilter,
          p_limit: 50,
        })
        if (data) {
          const result = data as any
          setConversations(result.conversations || [])
          setEscalatedIds(new Set<string>(result.escalated_ids || []))
          setResolvedIds(new Set<string>(result.resolved_ids || []))
        }
      }
      silentRefresh()
    }
  }, [newConversationSignal, newMessageSignal, business, timeFilter, channelFilter, statusFilter])

  // Read URL params for initial status filter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const status = params.get('status')
      if (status === 'needs_agent') setStatusFilter('needs_agent')
    }
  }, [])

  async function handleResolve(conversationId: string) {
    setResolvingId(conversationId)
    const supabase = createClient()
    const { data: escData } = await supabase
      .from('escalations')
      .select('id')
      .eq('conversation_id', conversationId)
      .in('status', ['open', 'in_progress'])
      .limit(1)
      .single()

    if (escData) {
      const { error } = await supabase.rpc('resolve_escalation', { p_escalation_id: escData.id })
      if (error) {
        toast.error(t.common.error_updating)
      } else {
        toast.success(t.conversations.marked_resolved)
        setEscalatedIds(prev => {
          const next = new Set(prev)
          next.delete(conversationId)
          return next
        })
        setResolvedIds(prev => new Set([...prev, conversationId]))
      }
    }
    setResolvingId(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.rpc('delete_conversation', { p_conversation_id: id })
    if (error) {
      console.error('Delete conversation RPC error:', error)
    }
    setConversations(prev => prev.filter(c => c.id !== id))
    setDeletingId(null)
  }

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <MessageSquare className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-gray-700 font-medium text-base">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1.5">
          <a href="/onboarding" className="text-blue-500 hover:underline font-medium">{t.common.go_to_setup}</a>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.conversations.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{t.conversations.subtitle}</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-xl border border-gray-200/60">
        {/* Time filter */}
        {([
          { value: 'all' as const, label: t.conversations.filter_all },
          { value: 'today' as const, label: t.conversations.filter_today },
          { value: 'week' as const, label: t.conversations.filter_week },
          { value: 'month' as const, label: t.conversations.filter_month },
        ]).map(f => (
          <FilterChip key={f.value} active={timeFilter === f.value} onClick={() => setTimeFilter(f.value)}>
            {f.label}
          </FilterChip>
        ))}

        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1 self-center" />

        {/* Channel filter */}
        {([
          { value: 'all' as const, label: t.conversations.filter_all_channels },
          { value: 'email' as const, label: t.common.channel_email },
          { value: 'whatsapp' as const, label: t.common.channel_whatsapp },
          { value: 'widget' as const, label: t.common.channel_widget },
        ]).map(f => (
          <FilterChip key={f.value} active={channelFilter === f.value} onClick={() => setChannelFilter(f.value)}>
            {f.label}
          </FilterChip>
        ))}

        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1 self-center" />

        {/* Status filter */}
        {([
          { value: 'all' as const, label: t.conversations.filter_all },
          { value: 'needs_agent' as const, label: t.conversations.filter_needs_agent },
          { value: 'resolved' as const, label: t.conversations.filter_resolved },
        ]).map(f => (
          <FilterChip key={f.value} active={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}>
            {f.label}
          </FilterChip>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200/60">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">{t.conversations.no_conversations}</p>
          <p className="text-gray-400 text-sm mt-1">{t.conversations.will_appear}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => {
            const isEscalated = escalatedIds.has(conv.id)
            const isResolved = resolvedIds.has(conv.id)

            return (
              <div
                key={conv.id}
                className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
                  isEscalated
                    ? 'border-gray-200/60 border-r-4 border-r-orange-400 bg-orange-50/30'
                    : isResolved
                    ? 'border-gray-200/60 border-r-4 border-r-emerald-400'
                    : 'border-gray-200/60'
                }`}
              >
                <div className="p-3 md:p-4 flex items-center justify-between gap-2 md:gap-4">
                  {/* Main clickable area */}
                  <Link
                    href={`/dashboard/conversations/${conv.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {conv.customer_identifier}
                        </span>

                        {/* Status badge */}
                        {isEscalated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            {t.conversations.status_awaiting}
                          </span>
                        )}
                        {isResolved && !isEscalated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {t.conversations.status_resolved}
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-gray-400">
                        {new Date(conv.started_at).toLocaleDateString(locale, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        {new Date(conv.started_at).toLocaleTimeString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </Link>

                  {/* Actions area */}
                  <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
                    <span className="hidden sm:inline-flex"><ChannelBadge channel={conv.channel} /></span>

                    {conv.satisfaction_rating && (
                      <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                        {'★'.repeat(conv.satisfaction_rating)}
                      </Badge>
                    )}

                    {/* Resolve button -- only for escalated */}
                    {isEscalated && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 rounded-lg shadow-sm"
                        onClick={async (e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          await handleResolve(conv.id)
                        }}
                        disabled={resolvingId === conv.id}
                      >
                        {resolvingId === conv.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {t.common.resolved}
                      </Button>
                    )}

                    {/* Delete button */}
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={async (e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (!confirm(t.conversations.confirm_delete)) return
                        await handleDelete(conv.id)
                      }}
                      disabled={deletingId === conv.id}
                    >
                      {deletingId === conv.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Arrow link */}
                    <Link
                      href={`/dashboard/conversations/${conv.id}`}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
