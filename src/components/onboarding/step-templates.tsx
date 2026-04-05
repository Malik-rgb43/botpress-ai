'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepTemplates({ data, updateData }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60">
      <div className="p-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">תבניות תשובה</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          הגדר הודעות ברירת מחדל שהבוט ישתמש בהן. אפשר לשנות מתי שרוצים.
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>הודעת פתיחה</Label>
          <Textarea
            value={data.templateGreeting}
            onChange={(e) => updateData({ templateGreeting: e.target.value })}
            rows={2}
          />
          <p className="text-xs text-gray-400">ההודעה הראשונה שהלקוח מקבל</p>
        </div>
        <div className="space-y-2">
          <Label>לא נמצאה תשובה</Label>
          <Textarea
            value={data.templateNoAnswer}
            onChange={(e) => updateData({ templateNoAnswer: e.target.value })}
            rows={2}
          />
          <p className="text-xs text-gray-400">כשהבוט לא מצליח למצוא תשובה</p>
        </div>
        <div className="space-y-2">
          <Label>העברה לנציג</Label>
          <Textarea
            value={data.templateTransfer}
            onChange={(e) => updateData({ templateTransfer: e.target.value })}
            rows={2}
          />
          <p className="text-xs text-gray-400">כשהשיחה מועברת לנציג אנושי</p>
        </div>
        <div className="space-y-2">
          <Label>הודעת סיום</Label>
          <Textarea
            value={data.templateGoodbye}
            onChange={(e) => updateData({ templateGoodbye: e.target.value })}
            rows={2}
          />
          <p className="text-xs text-gray-400">הודעת סיום שיחה</p>
        </div>
      </div>
    </div>
  )
}
