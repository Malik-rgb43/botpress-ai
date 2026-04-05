'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
}

const TONES = [
  { value: 'formal', label: 'רשמי', description: 'שפה מקצועית ומכובדת', emoji: '👔' },
  { value: 'friendly', label: 'ידידותי', description: 'חם ונגיש, כמו חבר טוב', emoji: '😊' },
  { value: 'professional', label: 'מקצועי', description: 'מדויק וענייני', emoji: '💼' },
  { value: 'casual', label: 'קז׳ואל', description: 'לא רשמי, קליל ומזמין', emoji: '🤙' },
  { value: 'custom', label: 'מותאם אישית', description: 'תאר בעצמך איך הבוט ידבר', emoji: '✏️' },
]

export default function StepTone({ data, updateData }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60">
      <div className="p-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">טון דיבור</h2>
        <p className="text-sm text-gray-400 mt-0.5">בחר איך הבוט ידבר עם הלקוחות שלך</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TONES.map(tone => (
            <button
              key={tone.value}
              onClick={() => updateData({ tone: tone.value })}
              className={`text-right p-4 rounded-lg border transition-colors ${
                data.tone === tone.value
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{tone.emoji}</span>
                <span className="font-medium text-sm">{tone.label}</span>
              </div>
              <p className="text-xs text-gray-500">{tone.description}</p>
            </button>
          ))}
        </div>
        {data.tone === 'custom' && (
          <div className="space-y-2">
            <Label>תאר את הטון הרצוי</Label>
            <Textarea
              placeholder="למשל: דבר כמו מוכר בשוק — חם, אנרגטי, עם הומור קל..."
              value={data.toneCustom}
              onChange={(e) => updateData({ toneCustom: e.target.value })}
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  )
}
