'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
// Using button chips instead of Select for Hebrew support
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import type { OnboardingData, PolicyItem } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

const POLICY_TYPES = [
  { value: 'returns', label: 'החזרות והחלפות' },
  { value: 'shipping', label: 'משלוחים' },
  { value: 'hours', label: 'שעות פעילות' },
  { value: 'payment', label: 'אמצעי תשלום' },
  { value: 'custom', label: 'אחר' },
]

export default function StepPolicies({ data, updateData }: Props) {
  const [type, setType] = useState('returns')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function addPolicy() {
    if (!title.trim() || !content.trim()) return
    const item: PolicyItem = { type, title, content }
    updateData({ policies: [...data.policies, item] })
    setTitle('')
    setContent('')
  }

  function removePolicy(index: number) {
    updateData({ policies: data.policies.filter((_, i) => i !== index) })
  }

  return (
    <Card className="border-blue-100/60 shadow-sm">
      <CardHeader>
        <CardTitle>מדיניות העסק</CardTitle>
        <CardDescription>
          הגדר את מדיניות העסק — החזרות, משלוחים, שעות פעילות ועוד.
          הבוט ישתמש במידע הזה כדי לענות על שאלות שקשורות למדיניות.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>סוג מדיניות</Label>
          <div className="flex flex-wrap gap-2">
            {POLICY_TYPES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setType(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  type === p.value
                    ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>כותרת *</Label>
          <Input
            placeholder="למשל: מדיניות החזרות"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>תוכן *</Label>
          <Textarea
            placeholder="למשל: ניתן להחזיר מוצרים תוך 14 יום מיום הרכישה..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>
        <Button onClick={addPolicy} variant="outline" size="sm">
          <Plus className="h-4 w-4 ml-1" />
          הוסף מדיניות
        </Button>

        {data.policies.length > 0 && (
          <div className="space-y-3 mt-4">
            {data.policies.map((p, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-lg p-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1 inline-block">
                    {POLICY_TYPES.find(pt => pt.value === p.type)?.label || p.type}
                  </span>
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.content}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removePolicy(i)}>
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
