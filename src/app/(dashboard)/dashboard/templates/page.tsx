'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/provider'

export default function TemplatesPage() {
  const { t } = useTranslation()

  const TONES = [
    { value: 'formal', label: t.templates.tone_formal, emoji: '👔' },
    { value: 'friendly', label: t.templates.tone_friendly, emoji: '😊' },
    { value: 'professional', label: t.templates.tone_professional, emoji: '💼' },
    { value: 'casual', label: t.templates.tone_casual, emoji: '🤙' },
    { value: 'custom', label: t.templates.tone_custom, emoji: '✏️' },
  ]
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
    toast.success(t.templates.saved)
    setSaving(false)
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader2 className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1"><a href="/onboarding" className="text-blue-500 hover:underline">{t.common.go_to_setup}</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-balance">{t.templates.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{t.templates.subtitle}</p>
        </div>
        <Button onClick={save} disabled={saving} className="bg-[#2e90fa] border-0 shadow-md shadow-[#2e90fa]/25 rounded-xl hover:shadow-lg transition-all w-fit">
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
          {t.templates.save}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.templates.tone_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.templates.tone_subtitle}</p>
          </div>
          <div className="p-6">
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
              <Textarea className="mt-4" placeholder={t.templates.tone_custom_placeholder} value={toneCustom} onChange={e => setToneCustom(e.target.value)} rows={3} />
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.templates.responses_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.templates.responses_subtitle}</p>
          </div>
          <div className="p-6 space-y-4">
            {[
              { key: 'greeting' as const, label: t.templates.greeting_label, desc: t.templates.greeting_desc },
              { key: 'no_answer' as const, label: t.templates.no_answer_label, desc: t.templates.no_answer_desc },
              { key: 'transfer' as const, label: t.templates.transfer_label, desc: t.templates.transfer_desc },
              { key: 'goodbye' as const, label: t.templates.goodbye_label, desc: t.templates.goodbye_desc },
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
          </div>
        </div>
      </div>
    </div>
  )
}