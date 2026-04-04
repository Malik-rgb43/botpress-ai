'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// AlertDialog removed — using confirm() for delete
import { Loader2, MessageSquare, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { Conversation } from '@/types/database'

type TimeFilter = 'all' | 'today' | 'week' | 'month'
type StatusFilter = 'all' | 'needs_agent' | 'resolved'
type ChannelFilter = 'all' | 'email' | 'whatsapp' | 'widget'

export default function ConversationsPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all')
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    if (!business) return
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('conversations')
      .select('*')
      .eq('business_id', business.id)
      .order('started_at', { ascending: false })
      .limit(50)

    // Time filter
    const now = new Date()
    if (timeFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      query = query.gte('started_at', today)
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('started_at', weekAgo)
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
      query = query.gte('started_at', monthAgo)
    }

    // Channel filter
    if (channelFilter !== 'all') {
      query = query.eq('channel', channelFilter)
    }

    const { data } = await query
    const convs = data || []
    setConversations(convs)

    // Check which conversations have escalations (needs agent / resolved)
    if (convs.length > 0) {
      const convIds = convs.map(c => c.id)
      const { data: escalations } = await supabase
        .from('escalations')
        .select('conversation_id, status')
        .in('conversation_id', convIds)

      const escalatedSet = new Set<string>()
      const resolvedSet = new Set<string>()
      if (escalations) {
        for (const esc of escalations) {
          if (esc.status === 'resolved') {
            resolvedSet.add(esc.conversation_id)
          } else {
            escalatedSet.add(esc.conversation_id)
          }
        }
      }
      setEscalatedIds(escalatedSet)

      // Apply status filter client-side
      if (statusFilter === 'needs_agent') {
        setConversations(convs.filter(c => escalatedSet.has(c.id)))
      } else if (statusFilter === 'resolved') {
        setConversations(convs.filter(c => resolvedSet.has(c.id)))
      }
    }

    setLoading(false)
  }, [business, timeFilter, statusFilter, channelFilter])

  useEffect(() => {
    if (!business) return
    loadConversations()
  }, [business, loadConversations])

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('conversations').delete().eq('id', id)
    setConversations(prev => prev.filter(c => c.id !== id))
    setDeletingId(null)
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageSquare className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1">עבור ל<a href="/onboarding" className="text-blue-500 hover:underline">הגדרת העסק</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">שיחות</h1>
        <p className="text-gray-500 text-sm mt-1">כל השיחות עם הלקוחות</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <SelectTrigger className="w-[140px] border-blue-100/60 bg-white/60 backdrop-blur-sm">
            <SelectValue placeholder="זמן" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="today">היום</SelectItem>
            <SelectItem value="week">השבוע</SelectItem>
            <SelectItem value="month">החודש</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[160px] border-blue-100/60 bg-white/60 backdrop-blur-sm">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="needs_agent">דורש נציג</SelectItem>
            <SelectItem value="resolved">טופל</SelectItem>
          </SelectContent>
        </Select>

        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelFilter)}>
          <SelectTrigger className="w-[140px] border-blue-100/60 bg-white/60 backdrop-blur-sm">
            <SelectValue placeholder="ערוץ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="email">אימייל</SelectItem>
            <SelectItem value="whatsapp">וואטסאפ</SelectItem>
            <SelectItem value="widget">וידג׳ט</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        </div>
      ) : conversations.length === 0 ? (
        <Card className="border-blue-100/60 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-blue-300 mb-3" />
            <p className="text-gray-500">עדיין אין שיחות</p>
            <p className="text-gray-400 text-sm">שיחות יופיעו כאן כשלקוחות ידברו עם הבוט</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Card key={conv.id} className="border-blue-100/60 shadow-none hover:shadow-md hover:shadow-blue-500/5 hover:border-blue-200 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <Link href={`/dashboard/conversations/${conv.id}`} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <MessageSquare className="h-5 w-5 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{conv.customer_identifier}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(conv.started_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(conv.started_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-xs ${
                    conv.channel === 'email' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                    conv.channel === 'whatsapp' ? 'border-green-200 bg-green-50 text-green-700' :
                    conv.channel === 'widget' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                    'border-gray-200 bg-gray-50 text-gray-600'
                  }`}>{conv.channel}</Badge>
                  {escalatedIds.has(conv.id) && (
                    <Badge variant="outline" className="text-xs border-orange-200 bg-orange-50 text-orange-700">
                      <AlertTriangle className="h-3 w-3 ml-1" />
                      דורש נציג
                    </Badge>
                  )}
                  {conv.satisfaction_rating && (
                    <Badge variant="secondary" className="text-xs">
                      {'★'.repeat(conv.satisfaction_rating)}
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={async (e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      if (!confirm('למחוק את השיחה? פעולה זו לא ניתנת לביטול.')) return
                      await handleDelete(conv.id)
                    }}
                    disabled={deletingId === conv.id}
                  >
                    {deletingId === conv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>

                  <Link href={`/dashboard/conversations/${conv.id}`}>
                    <ArrowLeft className="h-4 w-4 text-gray-300" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
