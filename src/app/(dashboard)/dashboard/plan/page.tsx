'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { useTranslation } from '@/i18n/provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Check, Zap } from 'lucide-react'

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
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!business) { setStatsLoading(false); return }
    async function loadUsage() {
      const supabase = createClient()
      // Count messages from this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
      setMessagesUsed(count || 0)
      setStatsLoading(false)
    }
    loadUsage()
  }, [business])

  const currentPlan = 'free'
  const messageLimit = 100
  const usagePercent = messageLimit > 0 ? Math.min((messagesUsed / messageLimit) * 100, 100) : 0

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {t.plan.title}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{t.plan.subtitle}</p>
      </div>

      {/* Usage Card */}
      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm mb-8">
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{t.plan.current_usage}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{t.plan.plan_label} {PLANS.find(p => p.tier === currentPlan)?.name}</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{messagesUsed} / {messageLimit} {t.common.messages}</span>
            <span className="text-sm font-medium">{Math.round(usagePercent)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          {usagePercent >= 80 && (
            <p className="text-sm text-orange-500 mt-2 flex items-center gap-1">
              <Zap className="h-4 w-4" />
              {t.plan.approaching_limit}
            </p>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`bg-white rounded-xl relative overflow-visible ${
              plan.popular ? 'border-blue-500 border-2 shadow-lg shadow-blue-500/10' : 'border border-gray-200/60 shadow-none'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-4 z-10">
                <Badge className="bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] text-white border-0 shadow-lg shadow-blue-500/30 px-4 py-1">{t.plan.most_popular}</Badge>
              </div>
            )}
            <div className="p-6 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-3xl md:text-4xl font-bold">
                  {plan.trial ? '₪1' : `₪${plan.price}`}
                </span>
                {plan.trial ? <span className="text-blue-500 text-sm font-medium">{t.plan.trial_period}</span> : <span className="text-gray-400 text-sm">{t.plan.per_month}</span>}
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={currentPlan === plan.tier ? 'outline' : plan.popular ? 'default' : 'outline'}
                disabled={currentPlan === plan.tier}
              >
                {currentPlan === plan.tier ? t.plan.current_plan : plan.trial ? t.plan.start_trial : t.plan.upgrade}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
