'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Save, MessageSquareText } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/provider'
import { motion, AnimatePresence } from 'framer-motion'

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
      await supabase.from('response_templates').upsert({ business_id: business!.id, type, content }).eq('business_id', business!.id).eq('type', type)
    }
    toast.success(t.templates.saved)
    setSaving(false)
  }

  if (bizLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!business) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-64 text-center"
      >
        <MessageSquareText className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1">
          <a href="/onboarding" className="text-blue-500 hover:underline">{t.common.go_to_setup}</a>
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.templates.title}</h1>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 h-9 px-4 text-sm transition-all duration-200"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
            {t.templates.save}
          </Button>
        </div>
        <p className="text-gray-400 text-sm mt-1">{t.templates.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Tone Selection */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl border border-gray-200/60 bg-white shadow-sm"
        >
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.templates.tone_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.templates.tone_subtitle}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TONES.map((item, i) => (
                <motion.button
                  key={item.value}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.08 + i * 0.04 }}
                  onClick={() => setTone(item.value)}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                    tone === item.value
                      ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-500/10 scale-[1.02]'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="text-lg mb-1">{item.emoji}</div>
                  <div className="text-xs font-medium">{item.label}</div>
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {tone === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Textarea
                    className="mt-4 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    placeholder={t.templates.tone_custom_placeholder}
                    value={toneCustom}
                    onChange={e => setToneCustom(e.target.value)}
                    rows={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Response Templates */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="rounded-2xl border border-gray-200/60 bg-white shadow-sm"
        >
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.templates.responses_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.templates.responses_subtitle}</p>
          </div>
          <div className="p-6 space-y-5">
            {[
              { key: 'greeting' as const, label: t.templates.greeting_label, desc: t.templates.greeting_desc },
              { key: 'no_answer' as const, label: t.templates.no_answer_label, desc: t.templates.no_answer_desc },
              { key: 'transfer' as const, label: t.templates.transfer_label, desc: t.templates.transfer_desc },
              { key: 'goodbye' as const, label: t.templates.goodbye_label, desc: t.templates.goodbye_desc },
            ].map((tmpl, i) => (
              <motion.div
                key={tmpl.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 + i * 0.05 }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium text-gray-700">{tmpl.label}</Label>
                <Textarea
                  value={templates[tmpl.key]}
                  onChange={e => setTemplates(prev => ({ ...prev, [tmpl.key]: e.target.value }))}
                  rows={2}
                  className="rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
                <p className="text-xs text-gray-400">{tmpl.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
