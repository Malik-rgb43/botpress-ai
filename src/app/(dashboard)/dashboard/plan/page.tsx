'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { useTranslation } from '@/i18n/provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Check, Zap, Crown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const cardItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function PlanPage() {
  const { business, loading: bizLoading } = useBusiness()
  const { t } = useTranslation()

  const PLANS = [
    {
      tier: 'free',
      name: t.plan.tier_trial,
      price: 1,
      limit: 100,
      trial: true,
      features: ['7 ימי ניסיון מלא', '100 הודעות', 'כל הערוצים', 'FAQ + AI מלא'],
    },
    {
      tier: 'basic',
      name: t.plan.tier_basic,
      price: 99,
      limit: 1000,
      features: ['1,000 הודעות/חודש', 'כל הערוצים', 'AI מתקדם + זיכרון', 'אנליטיקס מלא', 'סיכומים אוטומטיים'],
      popular: true,
    },
    {
      tier: 'premium',
      name: t.plan.tier_premium,
      price: 299,
      limit: -1,
      features: ['הודעות ללא הגבלה', 'כל הערוצים', 'AI מתקדם + זיכרון', 'אנליטיקס מלא', 'סיכומים אוטומטיים', 'White Label', 'תמיכה מועדפת'],
    },
  ]
  const [messagesUsed, setMessagesUsed] = useState(0)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [messageLimit, setMessageLimit] = useState(100)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!business) { setStatsLoading(false); return }
    async function loadUsage() {
      const supabase = createClient()

      // Fetch subscription with plan details
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('business_id', business!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (sub) {
        setCurrentPlan(sub.plans?.name?.toLowerCase() || 'free')
        setMessageLimit(sub.plans?.message_limit ?? 100)
        if (sub.messages_used != null) {
          setMessagesUsed(sub.messages_used)
          setStatsLoading(false)
          return
        }
      }

      // Fallback: count messages for this business from conversations
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: convIds } = await supabase
        .from('conversations')
        .select('id')
        .eq('business_id', business!.id)

      const conversationIds = (convIds || []).map(c => c.id)
      const { count } = conversationIds.length > 0
        ? await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .gte('created_at', startOfMonth.toISOString())
        : { count: 0 }
      setMessagesUsed(count || 0)
      setStatsLoading(false)
    }
    loadUsage()
  }, [business])
  const usagePercent = messageLimit > 0 ? Math.min((messagesUsed / messageLimit) * 100, 100) : 0

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div {...fadeIn} className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.plan.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{t.plan.subtitle}</p>
      </motion.div>

      {/* Usage Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-gray-200/60 bg-white shadow-sm mb-6"
      >
        <div className="p-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{t.plan.current_usage}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{t.plan.plan_label} {PLANS.find(p => p.tier === currentPlan)?.name}</p>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{messagesUsed} / {messageLimit} {t.common.messages}</span>
            <span className="text-sm font-medium">{Math.round(usagePercent)}%</span>
          </div>
          {/* Animated progress bar */}
          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${
                usagePercent >= 80
                  ? 'bg-gradient-to-r from-orange-400 to-red-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
            />
          </div>
          {usagePercent >= 80 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-orange-500 mt-2.5 flex items-center gap-1 font-medium"
            >
              <Zap className="h-4 w-4" />
              {t.plan.approaching_limit}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.tier}
            variants={cardItem}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`rounded-2xl relative overflow-visible transition-shadow duration-300 ${
              plan.popular
                ? 'bg-white shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/15'
                : 'bg-white shadow-sm border border-gray-200/60 hover:shadow-md'
            }`}
            style={plan.popular ? {
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2e90fa, #7c3aed)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            } : undefined}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-4 z-10">
                <Badge className="bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] text-white border-0 shadow-lg shadow-blue-500/30 px-4 py-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {t.plan.most_popular}
                </Badge>
              </div>
            )}
            <div className="p-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {plan.trial ? '₪1' : `₪${plan.price}`}
                </span>
                {plan.trial
                  ? <span className="text-blue-500 text-sm font-medium mr-1">{t.plan.trial_period}</span>
                  : <span className="text-gray-400 text-sm mr-1">{t.plan.per_month}</span>
                }
              </div>
            </div>
            <div className="p-4">
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      plan.popular ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-green-500'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              {currentPlan === plan.tier ? (
                <Button
                  className="w-full rounded-xl border-2 border-gray-200 text-gray-400 cursor-default"
                  variant="outline"
                  disabled
                >
                  {t.plan.current_plan}
                </Button>
              ) : plan.popular ? (
                <Button
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                  onClick={() => toast.info('מערכת התשלומים תהיה זמינה בקרוב')}
                >
                  {plan.trial ? t.plan.start_trial : t.plan.upgrade}
                </Button>
              ) : (
                <Button
                  className="w-full rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                  variant="outline"
                  onClick={() => toast.info('מערכת התשלומים תהיה זמינה בקרוב')}
                >
                  {plan.trial ? t.plan.start_trial : t.plan.upgrade}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
