'use client'

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
    <div className="bg-white rounded-xl border border-gray-200/60">
      <div className="p-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          סיכום
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">בדוק שהכל נכון לפני שמתחילים</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-gray-50/80 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-500 mb-2">פרטי עסק</h4>
          <p className="font-medium">{data.businessName || '(לא הוזן)'}</p>
          {data.contactEmail && <p className="text-sm text-gray-500">{data.contactEmail}</p>}
          {data.contactPhone && <p className="text-sm text-gray-500">{data.contactPhone}</p>}
          {data.contactWebsite && <p className="text-sm text-gray-500">{data.contactWebsite}</p>}
        </div>

        {data.story && (
          <div className="bg-gray-50/80 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-500 mb-2">סיפור העסק</h4>
            <p className="text-sm text-gray-700 line-clamp-3">{data.story}</p>
          </div>
        )}

        <div className="bg-gray-50/80 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-500 mb-2">שאלות נפוצות</h4>
          <Badge variant="secondary">{data.faqs.length} שאלות</Badge>
        </div>

        <div className="bg-gray-50/80 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-500 mb-2">מדיניות</h4>
          <Badge variant="secondary">{data.policies.length} פריטים</Badge>
        </div>

        <div className="bg-gray-50/80 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-500 mb-2">טון דיבור</h4>
          <Badge>{TONE_LABELS[data.tone] || data.tone}</Badge>
        </div>
      </div>
    </div>
  )
}
