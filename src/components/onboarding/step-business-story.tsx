'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepBusinessStory({ data, updateData }: Props) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle>סיפור העסק</CardTitle>
        <CardDescription>
          ספר על העסק שלך — מה אתם עושים, מה הייחוד שלכם, ומה חשוב ללקוחות לדעת.
          ה-AI ישתמש במידע הזה כדי לענות בצורה אישית ומדויקת.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
