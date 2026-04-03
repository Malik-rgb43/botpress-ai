'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
}

const TONE_LABELS: Record<string, string> = {
  formal: 'רשמי',
  friendly: 'ידידותי',
  professional: 'מקצועי',
  casual: 'קז׳ואל',
  custom: 'מותאם אישית',
}

export default function StepSummary({ data }: Props) {
  return (
    <Card className="border-blue-100/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          סיכום
        </CardTitle>
        <CardDescription>בדוק שהכל נכון לפני שמתחילים</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">פרטי עסק</h4>
          <p className="font-medium">{data.businessName || '(לא הוזן)'}</p>
          {data.contactEmail && <p className="text-sm text-gray-500">{data.contactEmail}</p>}
          {data.contactPhone && <p className="text-sm text-gray-500">{data.contactPhone}</p>}
        </div>

        {data.story && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">סיפור העסק</h4>
            <p className="text-sm text-gray-700 line-clamp-3">{data.story}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">שאלות נפוצות</h4>
          <Badge variant="secondary">{data.faqs.length} שאלות</Badge>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">מדיניות</h4>
          <Badge variant="secondary">{data.policies.length} פריטים</Badge>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">טון דיבור</h4>
          <Badge>{TONE_LABELS[data.tone] || data.tone}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
