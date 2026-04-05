'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { OnboardingData, FAQItem } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

export default function StepFAQ({ data, updateData }: Props) {
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [newCat, setNewCat] = useState('')

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

  return (
    <div className="bg-white rounded-xl border border-gray-200/60">
      <div className="p-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">שאלות נפוצות (FAQ)</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {data.faqs.length > 0
            ? `${data.faqs.length} שאלות נוספו — ערוך, מחק או הוסף עוד`
            : 'הוסף שאלות ותשובות שהלקוחות שלך שואלים הכי הרבה'
          }
        </p>
      </div>
      <div className="p-4 space-y-6">
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
