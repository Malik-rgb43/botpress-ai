'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepBusinessInfo({ data, updateData }: Props) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)

  async function scanWebsite() {
    const url = data.contactWebsite.trim()
    if (!url) {
      toast.error('הכנס כתובת אתר קודם')
      return
    }

    let scanUrl = url
    if (!scanUrl.startsWith('http')) scanUrl = 'https://' + scanUrl

    setIsScanning(true)
    try {
      const res = await fetch('/api/ai/scan-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scanUrl,
          businessName: data.businessName,
          language: 'he',
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error('לא מצאנו מידע רלוונטי באתר')
        setIsScanning(false)
        return
      }

      // Fill everything the AI found
      const updates: Partial<OnboardingData> = {}

      if (result.story) updates.story = result.story
      if (result.phone && !data.contactPhone) updates.contactPhone = result.phone
      if (result.email && !data.contactEmail) updates.contactEmail = result.email
      if (result.address && !data.contactAddress) updates.contactAddress = result.address

      if (result.faqs?.length) {
        updates.faqs = result.faqs.map((f: any) => ({
          question: f.question,
          answer: f.answer,
          category: f.category || '',
        }))
      }

      if (result.policies?.length) {
        updates.policies = result.policies.map((p: any) => ({
          type: p.type || 'custom',
          title: p.title,
          content: p.content,
        }))
      }

      updateData(updates)
      setScanDone(true)

      // Count what was found
      const parts = []
      if (result.story) parts.push('סיפור העסק')
      if (result.faqs?.length) parts.push(`${result.faqs.length} שאלות`)
      if (result.policies?.length) parts.push(`${result.policies.length} מדיניות`)
      if (result.phone || result.email || result.address) parts.push('פרטי קשר')

      toast.success(`נמצא: ${parts.join(', ')}`)
    } catch {
      toast.error('שגיאה בסריקת האתר')
    }
    setIsScanning(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
      <div className="p-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">פרטי העסק</h2>
        <p className="text-sm text-gray-400 mt-0.5">ספר לנו על העסק שלך כדי שהבוט ידע להציג אותו נכון</p>
      </div>
      <div className="p-4 space-y-4">
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
          <div className="flex gap-2">
            <Input
              id="contactWebsite"
              placeholder="https://www.example.com"
              value={data.contactWebsite}
              onChange={(e) => { updateData({ contactWebsite: e.target.value }); setScanDone(false) }}
              dir="ltr"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={scanWebsite}
              disabled={isScanning || !data.contactWebsite.trim()}
              className={`shrink-0 px-4 border-0 rounded-lg shadow-sm ${
                scanDone
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              } text-white`}
            >
              {isScanning ? (
                <><Loader2 className="h-4 w-4 animate-spin ml-1.5" />סורק...</>
              ) : scanDone ? (
                <><Check className="h-4 w-4 ml-1.5" />נסרק!</>
              ) : (
                <><Sparkles className="h-4 w-4 ml-1.5" />סרוק את האתר</>
              )}
            </Button>
          </div>
          {!scanDone && data.contactWebsite.trim() && (
            <p className="text-xs text-purple-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              לחץ "סרוק את האתר" כדי למלא אוטומטית FAQ, מדיניות וסיפור העסק
            </p>
          )}
          {scanDone && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              המידע מהאתר נטען — המשך לשלבים הבאים לצפות ולערוך
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
