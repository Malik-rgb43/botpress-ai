'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import type { OnboardingData, FAQItem } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepFAQ({ data, updateData }: Props) {
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [newCat, setNewCat] = useState('')
  const [aiUrl, setAiUrl] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  function addFAQ() {
    if (!newQ.trim() || !newA.trim()) return
    const item: FAQItem = { question: newQ, answer: newA, category: newCat }
    updateData({ faqs: [...data.faqs, item] })
    setNewQ('')
    setNewA('')
    setNewCat('')
  }

  function removeFAQ(index: number) {
    updateData({ faqs: data.faqs.filter((_, i) => i !== index) })
  }

  async function generateFromUrl() {
    if (!aiUrl.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: aiUrl, businessName: data.businessName }),
      })
      if (!res.ok) throw new Error('שגיאה ביצירת שאלות')
      const { faqs: generated } = await res.json()
      if (Array.isArray(generated)) {
        updateData({ faqs: [...data.faqs, ...generated] })
      }
    } catch {
      // silently fail for now
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/60">
      <div className="p-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">שאלות נפוצות (FAQ)</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          הוסף שאלות ותשובות שהלקוחות שלך שואלים הכי הרבה.
          הבוט יחפש כאן קודם כל לפני שמפעיל AI.
        </p>
      </div>
      <div className="p-4 space-y-6">
        {/* AI Generation */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100/60 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>יצירת שאלות אוטומטית עם AI</span>
          </div>
          <p className="text-xs text-gray-500">הדבק קישור לאתר שלך וה-AI ייצר שאלות נפוצות באופן אוטומטי</p>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.your-site.com"
              value={aiUrl}
              onChange={(e) => setAiUrl(e.target.value)}
              dir="ltr"
              className="flex-1"
            />
            <Button onClick={generateFromUrl} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'צור שאלות'}
            </Button>
          </div>
        </div>

        {/* Manual add */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>קטגוריה (אופציונלי)</Label>
            <Input
              placeholder="למשל: משלוחים, החזרות, כללי"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>שאלה *</Label>
            <Input
              placeholder="למשל: כמה זמן לוקח משלוח?"
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>תשובה *</Label>
            <Textarea
              placeholder="למשל: משלוחים מגיעים תוך 2-3 ימי עסקים..."
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={addFAQ} variant="outline" size="sm">
            <Plus className="h-4 w-4 ml-1" />
            הוסף שאלה
          </Button>
        </div>

        {/* FAQ List */}
        {data.faqs.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">{data.faqs.length} שאלות נוספו</p>
            {data.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200/60 p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {faq.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1 inline-block">
                      {faq.category}
                    </span>
                  )}
                  <p className="font-medium text-sm">{faq.question}</p>
                  <p className="text-sm text-gray-500 mt-1">{faq.answer}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFAQ(i)}>
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
