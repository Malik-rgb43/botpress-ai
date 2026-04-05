'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Check, Globe, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepBusinessInfo({ data, updateData }: Props) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [scanStats, setScanStats] = useState<string[]>([])

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

      const updates: Partial<OnboardingData> = {}
      const parts: string[] = []

      if (result.story) { updates.story = result.story; parts.push('סיפור העסק') }
      if (result.phone) { updates.contactPhone = result.phone; parts.push('טלפון') }
      if (result.email) { updates.contactEmail = result.email; parts.push('אימייל') }
      if (result.address) { updates.contactAddress = result.address; parts.push('כתובת') }

      if (result.faqs?.length) {
        updates.faqs = result.faqs.map((f: any) => ({
          question: f.question, answer: f.answer, category: f.category || '',
        }))
        parts.push(`${result.faqs.length} שאלות נפוצות`)
      }

      if (result.policies?.length) {
        updates.policies = result.policies.map((p: any) => ({
          type: p.type || 'custom', title: p.title, content: p.content,
        }))
        parts.push(`${result.policies.length} מדיניות`)
      }

      updateData(updates)
      setScanDone(true)
      setScanStats(parts)
      toast.success(`נמצאו ${parts.length} פריטים מהאתר`)
    } catch {
      toast.error('שגיאה בסריקת האתר')
    }
    setIsScanning(false)
  }

  return (
    <div className="space-y-4">
      {/* AI Scan — Primary CTA */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50/50 to-blue-50 rounded-xl border border-blue-200/60 p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">מילוי אוטומטי מהאתר שלך</h3>
            <p className="text-xs text-gray-500">הדבק את כתובת האתר ונמלא הכל בשבילך</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 relative">
            <Globe className="absolute top-1/2 -translate-y-1/2 right-3 h-4 w-4 text-gray-300 pointer-events-none" />
            <Input
              type="url"
              dir="ltr"
              placeholder="https://www.your-website.com"
              value={data.contactWebsite}
              onChange={(e) => { updateData({ contactWebsite: e.target.value }); setScanDone(false) }}
              className="h-11 pr-10 rounded-lg border-blue-200/60 bg-white text-sm"
              onKeyDown={(e) => e.key === 'Enter' && scanWebsite()}
            />
          </div>
          <Button
            type="button"
            onClick={scanWebsite}
            disabled={isScanning || !data.contactWebsite.trim()}
            className={`shrink-0 h-11 px-5 border-0 rounded-lg shadow-sm text-sm ${
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

        {/* Scan results summary */}
        {scanDone && scanStats.length > 0 && (
          <div className="mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-200/60">
            <div className="flex items-center gap-2 mb-1.5">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">המידע נטען בהצלחה!</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {scanStats.map((stat, i) => (
                <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {stat}
                </span>
              ))}
            </div>
            <p className="text-xs text-emerald-600 mt-2">המשך לשלבים הבאים לצפות ולערוך את המידע שנמצא</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">או מלא ידנית</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Manual form */}
      <div className="bg-white rounded-xl border border-gray-200/60">
        <div className="p-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">פרטי העסק</h2>
          <p className="text-sm text-gray-400 mt-0.5">מלא את הפרטים של העסק שלך</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">שם העסק *</Label>
            <Input
              id="businessName"
              placeholder="למשל: חנות הפרחים של דנה"
              value={data.businessName}
              onChange={(e) => updateData({ businessName: e.target.value })}
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  )
}
