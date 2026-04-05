'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepBusinessStory({ data, updateData }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60">
      <div className="p-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">סיפור העסק</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          ספר על העסק שלך — מה אתם עושים, מה הייחוד שלכם, ומה חשוב ללקוחות לדעת.
          ה-AI ישתמש במידע הזה כדי לענות בצורה אישית ומדויקת.
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="story">סיפור העסק</Label>
          <Textarea
            id="story"
            placeholder="למשל: אנחנו חנות פרחים משפחתית שפועלת כבר 15 שנה בתל אביב. מתמחים בסידורי פרחים לאירועים ומשלוחים באזור גוש דן..."
            value={data.story}
            onChange={(e) => updateData({ story: e.target.value })}
            rows={8}
            className="resize-none"
          />
          <p className="text-xs text-gray-400">
            ככל שתכתוב יותר מידע, הבוט ידע לענות טוב יותר
          </p>
        </div>
      </div>
    </div>
  )
}
