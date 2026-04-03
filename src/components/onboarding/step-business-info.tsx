'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepBusinessInfo({ data, updateData }: Props) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle>פרטי העסק</CardTitle>
        <CardDescription>ספר לנו על העסק שלך כדי שהבוט ידע להציג אותו נכון</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">שם העסק *</Label>
          <Input
            id="businessName"
            placeholder="למשל: חנות הפרחים של דנה"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPhone">טלפון</Label>
            <Input
              id="contactPhone"
              placeholder="050-1234567"
              value={data.contactPhone}
              onChange={(e) => updateData({ contactPhone: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">אימייל</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="info@business.com"
              value={data.contactEmail}
              onChange={(e) => updateData({ contactEmail: e.target.value })}
              dir="ltr"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactAddress">כתובת</Label>
          <Input
            id="contactAddress"
            placeholder="רחוב, עיר"
            value={data.contactAddress}
            onChange={(e) => updateData({ contactAddress: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactWebsite">אתר אינטרנט</Label>
          <Input
            id="contactWebsite"
            placeholder="https://www.example.com"
            value={data.contactWebsite}
            onChange={(e) => updateData({ contactWebsite: e.target.value })}
            dir="ltr"
          />
        </div>
      </CardContent>
    </Card>
  )
}
