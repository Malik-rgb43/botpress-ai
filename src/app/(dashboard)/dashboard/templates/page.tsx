'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const TONES = [
  { value: 'formal', label: 'רשמי', emoji: '👔' },
  { value: 'friendly', label: 'ידידותי', emoji: '😊' },
  { value: 'professional', label: 'מקצועי', emoji: '💼' },
  { value: 'casual', label: 'קז׳ואל', emoji: '🤙' },
  { value: 'custom', label: 'מותאם', emoji: '✏️' },
]

export default function TemplatesPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [tone, setTone] = useState('friendly')
  const [toneCustom, setToneCustom] = useState('')
  const [templates, setTemplates] = useState({ greeting: '', no_answer: '', transfer: '', goodbye: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!business) return
    setTone(business.tone)
    setToneCustom(business.tone_custom || '')
    loadTemplates()
  }, [business])

  async function loadTemplates() {
    const supabase = createClient()
    const { data } = await supabase.from('response_templates').select('*').eq('business_id', business!.id)
    if (data) {
      const map: Record<string, string> = {}
      data.forEach(t => { map[t.type] = t.content })
      setTemplates({
        greeting: map.greeting || '',
        no_answer: map.no_answer || '',
        transfer: map.transfer || '',
        goodbye: map.goodbye || '',
      })
    }
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('businesses').update({ tone, tone_custom: toneCustom || null }).eq('id', business!.id)
    for (const [type, content] of Object.entries(templates)) {
      await supabase.from('response_templates').update({ content }).eq('business_id', business!.id).eq('type', type)
    }
    toast.success('נשמר בהצלחה')
    setSaving(false)
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader2 className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1">עבור ל<a href="/onboarding" className="text-blue-500 hover:underline">הגדרת העסק</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">טון דיבור ותבניות</h1>
          <p className="text-gray-500 text-sm mt-1">התאם את הטון והתבניות של הבוט</p>
        </div>
        <Button onClick={save} disabled={saving} className="bg-[#2e90fa] border-0 shadow-md shadow-[#2e90fa]/25 rounded-xl hover:shadow-lg transition-all">
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
          שמור שינויים
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-lg">טון דיבור</CardTitle>
            <CardDescription>בחר איך הבוט ידבר עם הלקוחות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TONES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    tone === t.value ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">{t.emoji}</div>
                  <div className="text-xs font-medium">{t.label}</div>
                </button>
              ))}
            </div>
            {tone === 'custom' && (
              <Textarea className="mt-4" placeholder="תאר את הטון..." value={toneCustom} onChange={e => setToneCustom(e.target.value)} rows={3} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-lg">תבניות תשובה</CardTitle>
            <CardDescription>הודעות ברירת מחדל שהבוט משתמש בהן</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'greeting' as const, label: 'הודעת פתיחה', desc: 'ההודעה הראשונה שהלקוח מקבל' },
              { key: 'no_answer' as const, label: 'לא נמצאה תשובה', desc: 'כשהבוט לא מוצא תשובה' },
              { key: 'transfer' as const, label: 'העברה לנציג', desc: 'כשמעבירים לנציג אנושי' },
              { key: 'goodbye' as const, label: 'סיום', desc: 'הודעת סיום שיחה' },
            ].map(tmpl => (
              <div key={tmpl.key} className="space-y-2">
                <Label>{tmpl.label}</Label>
                <Textarea
                  value={templates[tmpl.key]}
                  onChange={e => setTemplates(prev => ({ ...prev, [tmpl.key]: e.target.value }))}
                  rows={2}
                />
                <p className="text-xs text-gray-400">{tmpl.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}