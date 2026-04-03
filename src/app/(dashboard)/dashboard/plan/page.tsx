'use client'

import { useBusiness } from '@/hooks/use-business'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Check, CreditCard, Zap } from 'lucide-react'

const PLANS = [
  {
    tier: 'free',
    name: 'ניסיון',
    price: 1,
    limit: 100,
    trial: true,
    features: ['7 ימי ניסיון מלא', '100 הודעות', 'כל הערוצים', 'FAQ + AI מלא'],
  },
  {
    tier: 'basic',
    name: 'בסיסי',
    price: 99,
    limit: 1000,
    features: ['1,000 הודעות/חודש', 'כל הערוצים', 'AI מתקדם + זיכרון', 'אנליטיקס מלא', 'סיכומים אוטומטיים'],
    popular: true,
  },
  {
    tier: 'premium',
    name: 'פרימיום',
    price: 299,
    limit: -1,
    features: ['הודעות ללא הגבלה', 'כל הערוצים', 'AI מתקדם + זיכרון', 'אנליטיקס מלא', 'סיכומים אוטומטיים', 'White Label', 'תמיכה מועדפת'],
  },
]

export default function PlanPage() {
  const { business, loading: bizLoading } = useBusiness()

  // Mock current usage
  const currentPlan = 'free'
  const messagesUsed = 42
  const messageLimit = 100
  const usagePercent = (messagesUsed / messageLimit) * 100

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          תוכנית ושימוש
        </h1>
        <p className="text-gray-500 text-sm mt-1">נהל את התוכנית שלך ועקוב אחרי השימוש</p>
      </div>

      {/* Usage Card */}
      <Card className="border-gray-100 shadow-none mb-8">
        <CardHeader>
          <CardTitle className="text-lg">שימוש נוכחי</CardTitle>
          <CardDescription>תוכנית {PLANS.find(p => p.tier === currentPlan)?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{messagesUsed} / {messageLimit} הודעות</span>
            <span className="text-sm font-medium">{Math.round(usagePercent)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          {usagePercent >= 80 && (
            <p className="text-sm text-orange-500 mt-2 flex items-center gap-1">
              <Zap className="h-4 w-4" />
              אתה מתקרב למגבלה! שדרג כדי להמשיך ללא הפסקה
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.tier}
            className={`shadow-none relative overflow-visible ${
              plan.popular ? 'border-blue-500 border-2 shadow-lg shadow-blue-500/10' : 'border-blue-100/60'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-4 z-10">
                <Badge className="gradient-animated text-white border-0 shadow-lg shadow-blue-500/30 px-4 py-1">🔥 הכי פופולרי</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">
                  {plan.trial ? '₪1' : `₪${plan.price}`}
                </span>
                {plan.trial ? <span className="text-blue-500 text-sm font-medium">/7 ימי ניסיון</span> : <span className="text-gray-400 text-sm">/חודש</span>}
              </div>
            </CardHeader>
            <CardContent>
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
                {currentPlan === plan.tier ? 'התוכנית הנוכחית' : plan.trial ? 'התחל ניסיון' : 'שדרג'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
