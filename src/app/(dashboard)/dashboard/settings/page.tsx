'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/provider'
import type { Language } from '@/i18n'

function adjustColorSimple(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

export default function SettingsPage() {
  const { business, loading: bizLoading } = useBusiness()
  const { t, lang, setLanguage } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [story, setStory] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [summaryEnabled, setSummaryEnabled] = useState(false)
  const [summaryFreq, setSummaryFreq] = useState('weekly')
  const [summaryEmail, setSummaryEmail] = useState('')
  const [brandColor, setBrandColor] = useState('#2563eb')
  const [emailFooter, setEmailFooter] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [agentEnabled, setAgentEnabled] = useState(false)
  const [agentSchedule, setAgentSchedule] = useState({
    sunday: { active: true, start: '09:00', end: '18:00' },
    monday: { active: true, start: '09:00', end: '18:00' },
    tuesday: { active: true, start: '09:00', end: '18:00' },
    wednesday: { active: true, start: '09:00', end: '18:00' },
    thursday: { active: true, start: '09:00', end: '18:00' },
    friday: { active: true, start: '09:00', end: '13:00' },
    saturday: { active: false, start: '00:00', end: '00:00' },
  })
  const [offlineMessage, setOfflineMessage] = useState('אנחנו לא זמינים כרגע. נחזור אליך בשעות הפעילות.')
  const [appLanguage, setAppLanguage] = useState('he')
  const [botLanguage, setBotLanguage] = useState('he')

  // 24-hour time options for Israeli format
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2)
    const m = i % 2 === 0 ? '00' : '30'
    const value = `${String(h).padStart(2, '0')}:${m}`
    return { value, label: value }
  })

  useEffect(() => {
    if (!business) return
    setName(business.name)
    setStory(business.story || '')
    setPhone(business.contact_info?.phone || '')
    setEmail(business.contact_info?.email || '')
    setAddress(business.contact_info?.address || '')
    setWebsite(business.contact_info?.website || '')
    setBrandColor(business.contact_info?.brand_color || '#2563eb')
    setEmailFooter(business.contact_info?.email_footer || '')
    setSelectedTemplate((business.contact_info as Record<string, unknown>)?.email_template as string || 'modern')
    // Load agent availability
    const avail = (business as unknown as Record<string, unknown>).agent_availability as Record<string, unknown> | null
    if (avail) {
      setAgentEnabled(!!(avail.enabled))
      if (avail.schedule) setAgentSchedule(avail.schedule as typeof agentSchedule)
      if (avail.offline_message) setOfflineMessage(avail.offline_message as string)
    }
    // Load language settings
    const ci = business.contact_info as Record<string, unknown> | null
    if (ci?.app_language) setAppLanguage(ci.app_language as string)
    if (ci?.bot_language) setBotLanguage(ci.bot_language as string)
    loadSummarySettings()
  }, [business])

  async function loadSummarySettings() {
    const supabase = createClient()
    const { data } = await supabase.from('summary_settings').select('*').eq('business_id', business!.id).single()
    if (data) {
      setSummaryEnabled(data.enabled)
      setSummaryFreq(data.frequency)
      setSummaryEmail(data.email)
    }
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('businesses').update({
      name,
      story,
      contact_info: { ...business?.contact_info, phone, email, address, website, brand_color: brandColor, email_footer: emailFooter, app_language: appLanguage, bot_language: botLanguage },
      agent_availability: {
        enabled: agentEnabled,
        timezone: 'Asia/Jerusalem',
        schedule: agentSchedule,
        offline_message: offlineMessage,
      },
    }).eq('id', business!.id)
    await supabase.from('summary_settings').update({
      enabled: summaryEnabled,
      frequency: summaryFreq,
      email: summaryEmail,
    }).eq('business_id', business!.id)
    toast.success(t.settings.saved)
    setSaving(false)
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Save className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1"><a href="/onboarding" className="text-blue-500 hover:underline">{t.common.go_to_setup}</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-balance">{t.settings.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{t.settings.subtitle}</p>
        </div>
        <Button onClick={save} disabled={saving} className="bg-[#2e90fa] border-0 shadow-md shadow-[#2e90fa]/25 rounded-xl hover:shadow-lg transition-all w-fit">
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
          {t.common.save}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.settings.business_title}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>{t.settings.business_name}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.settings.business_story}</Label>
              <Textarea value={story} onChange={e => setStory(e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.settings.phone}</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>{t.settings.email}</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.settings.address}</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.settings.website}</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} dir="ltr" />
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.settings.language_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.settings.language_desc}</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>{t.settings.app_language}</Label>
              <p className="text-xs text-gray-400">{t.settings.app_language_desc}</p>
              <div className="flex gap-2">
                {[
                  { value: 'he', label: 'עברית', flag: '🇮🇱' },
                  { value: 'en', label: 'English', flag: '🇺🇸' },
                  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
                ].map(appLang => (
                  <button key={appLang.value} type="button" onClick={() => { setAppLanguage(appLang.value); setLanguage(appLang.value as Language) }}
                    className={`px-4 py-2.5 rounded-xl text-sm border transition-all flex items-center gap-2 ${
                      appLanguage === appLang.value
                        ? 'border-[#2e90fa] bg-[#2e90fa]/5 text-[#2e90fa] font-medium shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:border-[#2e90fa]/30'
                    }`}
                  >
                    <span className="text-lg">{appLang.flag}</span>
                    {appLang.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.settings.bot_language}</Label>
              <p className="text-xs text-gray-400">{t.settings.bot_language_desc}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'auto', label: 'אוטומטי', desc: 'לפי שפת הלקוח', flag: '🌐' },
                  { value: 'he', label: 'עברית', flag: '🇮🇱' },
                  { value: 'en', label: 'English', flag: '🇺🇸' },
                  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
                  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
                  { value: 'fr', label: 'Français', flag: '🇫🇷' },
                ].map(botLang => (
                  <button key={botLang.value} type="button" onClick={() => setBotLanguage(botLang.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm border transition-all flex items-center gap-2 ${
                      botLanguage === botLang.value
                        ? 'border-[#2e90fa] bg-[#2e90fa]/5 text-[#2e90fa] font-medium shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:border-[#2e90fa]/30'
                    }`}
                  >
                    <span className="text-lg">{botLang.flag}</span>
                    <span>{botLang.label}</span>
                    {'desc' in botLang && <span className="text-[10px] text-gray-400">({botLang.desc})</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.settings.summaries_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.settings.summaries_desc}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t.settings.summaries_enable}</Label>
              <Switch checked={summaryEnabled} onCheckedChange={setSummaryEnabled} />
            </div>
            {summaryEnabled && (
              <>
                <div className="space-y-2">
                  <Label>{t.settings.frequency}</Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'daily', label: t.settings.daily },
                      { value: 'weekly', label: t.settings.weekly },
                      { value: 'monthly', label: t.settings.monthly },
                    ].map(f => (
                      <button key={f.value} type="button" onClick={() => setSummaryFreq(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                          summaryFreq === f.value
                            ? 'border-[#2e90fa] bg-[#2e90fa]/5 text-[#2e90fa] font-medium shadow-sm'
                            : 'border-gray-200 text-gray-500 hover:border-[#2e90fa]/30'
                        }`}
                      >{f.label}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.settings.summary_email}</Label>
                  <Input value={summaryEmail} onChange={e => setSummaryEmail(e.target.value)} dir="ltr" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={async () => {
                    if (!summaryEmail) { toast.error('הכנס אימייל קודם'); return }
                    toast.loading('שולח סיכום לדוגמה...')
                    try {
                      const res = await fetch('/api/summary/demo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ businessId: business!.id, email: summaryEmail }),
                      })
                      const data = await res.json()
                      toast.dismiss()
                      if (data.success) toast.success(t.settings.demo_sent)
                      else toast.error(data.error || t.common.error)
                    } catch { toast.dismiss(); toast.error(t.common.error) }
                  }}
                >
                  📊 {t.settings.send_demo}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Agent Availability */}
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.settings.agent_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.settings.agent_desc}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t.settings.agent_enable}</Label>
              <Switch checked={agentEnabled} onCheckedChange={setAgentEnabled} />
            </div>
            {agentEnabled && (
              <>
                <div className="space-y-2">
                  {[
                    { key: 'sunday', label: t.settings.day_sunday },
                    { key: 'monday', label: t.settings.day_monday },
                    { key: 'tuesday', label: t.settings.day_tuesday },
                    { key: 'wednesday', label: t.settings.day_wednesday },
                    { key: 'thursday', label: t.settings.day_thursday },
                    { key: 'friday', label: t.settings.day_friday },
                    { key: 'saturday', label: t.settings.day_saturday },
                  ].map(day => {
                    const sched = agentSchedule[day.key as keyof typeof agentSchedule]
                    return (
                      <div key={day.key} className="flex flex-wrap items-center gap-2 md:gap-3 py-1">
                        <Switch
                          checked={sched.active}
                          onCheckedChange={(v) => setAgentSchedule(prev => ({ ...prev, [day.key]: { ...prev[day.key as keyof typeof prev], active: v } }))}
                        />
                        <span className="w-14 text-sm font-medium">{day.label}</span>
                        {sched.active ? (
                          <div className="flex items-center gap-2" dir="ltr">
                            <Select
                              value={sched.start}
                              onValueChange={(v) => setAgentSchedule(prev => ({ ...prev, [day.key]: { ...prev[day.key as keyof typeof prev], start: v } }))}
                            >
                              <SelectTrigger className="w-24 h-9 rounded-xl text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-56">
                                {timeOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-gray-400 text-sm">—</span>
                            <Select
                              value={sched.end}
                              onValueChange={(v) => setAgentSchedule(prev => ({ ...prev, [day.key]: { ...prev[day.key as keyof typeof prev], end: v } }))}
                            >
                              <SelectTrigger className="w-24 h-9 rounded-xl text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-56">
                                {timeOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-sm text-red-400/70">{t.settings.closed}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-2">
                  <Label>{t.settings.offline_message}</Label>
                  <Textarea
                    value={offlineMessage}
                    onChange={(e) => setOfflineMessage(e.target.value)}
                    rows={2}
                    className="rounded-xl"
                    placeholder="למשל: אנחנו לא זמינים כרגע. נחזור אליך בשעות הפעילות."
                  />
                  <p className="text-xs text-gray-400">ההודעה שהבוט ישלח כשלקוח מבקש נציג מחוץ לשעות הפעילות</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.settings.email_design_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.settings.email_design_desc}</p>
          </div>
          <div className="p-6 space-y-5">
            {/* Template Picker */}
            <div className="space-y-2">
              <Label>{t.settings.template_label}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'modern' as const, label: t.settings.template_modern, desc: 'כותרת gradient, צללים, לוגו', icon: '✨', preview: 'gradient' },
                  { id: 'classic' as const, label: t.settings.template_classic, desc: 'פס צד צבעוני, נקי ומקצועי', icon: '📋', preview: 'accent' },
                  { id: 'minimal' as const, label: t.settings.template_minimal, desc: 'טקסט בלבד, בלי עיצוב', icon: '📝', preview: 'text' },
                  { id: 'none' as const, label: t.settings.template_none, desc: 'טקסט פשוט כמו Gmail רגיל', icon: '📨', preview: 'plain' },
                ].map(tpl => {
                  const isSelected = selectedTemplate === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl.id)
                        const info = business?.contact_info || {}
                        const supabase = createClient()
                        supabase.from('businesses').update({
                          contact_info: { ...info, email_template: tpl.id }
                        }).eq('id', business!.id).then(() => toast.success(`תבנית "${tpl.label}" נבחרה`))
                      }}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10 scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                    >
                      {/* Mini preview */}
                      <div className="w-full h-16 rounded-lg mb-2 overflow-hidden border border-gray-100">
                        {tpl.preview === 'gradient' && (
                          <div className="h-full flex flex-col">
                            <div style={{ background: `linear-gradient(135deg, ${brandColor}, ${adjustColorSimple(brandColor, -30)})` }} className="h-6 flex items-center justify-center">
                              <div className="w-3 h-3 rounded bg-white/30" />
                            </div>
                            <div className="flex-1 bg-white p-1.5">
                              <div className="w-full h-1 bg-gray-200 rounded mb-1" />
                              <div className="w-3/4 h-1 bg-gray-100 rounded" />
                            </div>
                          </div>
                        )}
                        {tpl.preview === 'accent' && (
                          <div className="h-full flex">
                            <div style={{ backgroundColor: brandColor }} className="w-1 shrink-0" />
                            <div className="flex-1 bg-white p-1.5 flex flex-col justify-center">
                              <div className="w-2/3 h-1.5 bg-gray-300 rounded mb-1.5" />
                              <div className="w-full h-1 bg-gray-200 rounded mb-1" />
                              <div className="w-3/4 h-1 bg-gray-100 rounded" />
                            </div>
                          </div>
                        )}
                        {tpl.preview === 'text' && (
                          <div className="h-full bg-white p-2 flex flex-col justify-center">
                            <div className="w-1/3 h-1.5 rounded mb-2" style={{ backgroundColor: brandColor }} />
                            <div className="w-full h-1 bg-gray-200 rounded mb-1" />
                            <div className="w-4/5 h-1 bg-gray-100 rounded mb-1" />
                            <div className="w-2/3 h-1 bg-gray-100 rounded" />
                          </div>
                        )}
                        {tpl.preview === 'plain' && (
                          <div className="h-full bg-white p-2 flex flex-col justify-center">
                            <div className="w-full h-1 bg-gray-200 rounded mb-1" />
                            <div className="w-4/5 h-1 bg-gray-200 rounded mb-1" />
                            <div className="w-3/5 h-1 bg-gray-200 rounded" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-medium">{tpl.label}</div>
                      <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{tpl.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>{t.settings.primary_color}</Label>
              <div className="flex gap-2">
                <Input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                <Input value={brandColor} onChange={e => setBrandColor(e.target.value)} dir="ltr" className="flex-1" />
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <Label>{t.settings.footer_text}</Label>
              <Input value={emailFooter} onChange={e => setEmailFooter(e.target.value)} placeholder="למשל: טלפון: 050-1234567 | כתובת: רחוב הרצל 1" />
            </div>

            {/* White Label */}
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.settings.no_branding}</Label>
                <p className="text-xs text-gray-400">{t.settings.no_branding_desc}</p>
              </div>
              <Switch checked={false} disabled />
            </div>

            {/* Email Preview — Full Example */}
            <div>
              <Label className="mb-3 block text-base font-semibold">{t.settings.email_preview}</Label>
              <div className="bg-gray-100 rounded-xl p-4 md:p-8">
                {/* Email client chrome */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-lg mx-auto">
                  {/* Email header bar */}
                  <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                    </div>
                    <span className="flex-1 text-center">מ: {name || 'שם העסק'} &lt;{business?.contact_info?.email || 'info@business.com'}&gt;</span>
                  </div>

                  {/* Subject line */}
                  <div className="px-5 py-3 border-b border-gray-50" dir="rtl">
                    <p className="text-sm font-semibold text-gray-800">Re: מה שעות הפעילות?</p>
                    <p className="text-xs text-gray-400 mt-0.5">אל: sarah@gmail.com</p>
                  </div>

                  {/* Email body — matches selected template */}
                  {selectedTemplate === 'modern' && (
                    <>
                      <div style={{ background: `linear-gradient(135deg, ${brandColor}, ${adjustColorSimple(brandColor, -30)})` }} className="p-6 text-center">
                        {business?.logo_url && <img src={business.logo_url} alt="" className="w-12 h-12 rounded-xl mx-auto mb-3 border-2 border-white/25" />}
                        <p className="text-white font-bold text-lg">{name || 'שם העסק'}</p>
                      </div>
                      <div className="p-6" dir="rtl">
                        <p className="text-[15px] text-gray-700 leading-[1.8]">שלום שרה! אנחנו פתוחים א׳-ה׳ 8:00-20:00, שישי 8:00-14:00. בשבת סגור.</p>
                        <p className="text-[15px] text-gray-700 leading-[1.8] mt-2">יש עוד משהו שאני יכול לעזור בו?</p>
                      </div>
                    </>
                  )}
                  {selectedTemplate === 'classic' && (
                    <div className="flex" dir="rtl">
                      <div style={{ backgroundColor: brandColor }} className="w-1 shrink-0" />
                      <div className="p-6 flex-1">
                        <p className="font-bold text-gray-800 mb-3">{name || 'שם העסק'}</p>
                        <p className="text-[15px] text-gray-600 leading-[1.8]">שלום שרה! אנחנו פתוחים א׳-ה׳ 8:00-20:00, שישי 8:00-14:00. בשבת סגור.</p>
                        <p className="text-[15px] text-gray-600 leading-[1.8] mt-2">יש עוד משהו שאני יכול לעזור בו?</p>
                      </div>
                    </div>
                  )}
                  {selectedTemplate === 'minimal' && (
                    <div className="p-6" dir="rtl">
                      <p className="font-bold text-sm mb-3" style={{ color: brandColor }}>{name || 'שם העסק'}</p>
                      <p className="text-[15px] text-gray-600 leading-[1.8]">שלום שרה! אנחנו פתוחים א׳-ה׳ 8:00-20:00, שישי 8:00-14:00. בשבת סגור.</p>
                      <p className="text-[15px] text-gray-600 leading-[1.8] mt-2">יש עוד משהו שאני יכול לעזור בו?</p>
                    </div>
                  )}
                  {selectedTemplate === 'none' && (
                    <div className="p-6" dir="rtl">
                      <p className="text-[15px] text-gray-600 leading-[1.8]">שלום שרה! אנחנו פתוחים א׳-ה׳ 8:00-20:00, שישי 8:00-14:00. בשבת סגור.</p>
                      <p className="text-[15px] text-gray-600 leading-[1.8] mt-2">יש עוד משהו שאני יכול לעזור בו?</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50 text-center" dir="rtl">
                    {emailFooter && <p className="text-xs text-gray-500 mb-1">{emailFooter}</p>}
                    <p className="text-[10px] text-gray-400">הודעה אוטומטית מ-{name || 'העסק'}</p>
                  </div>
                </div>

                {/* Label */}
                <p className="text-center text-xs text-gray-400 mt-4">ככה הלקוח יראה את המייל ב-Gmail</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.settings.channels_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.settings.channels_desc}</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Email */}
            <div className={`border ${business?.contact_info?.gmail_connected ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'} rounded-lg p-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg">📧</span>
                  <span className="font-medium text-sm">{t.common.channel_email}</span>
                  {business?.contact_info?.gmail_connected ? (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t.settings.connected} {business.contact_info.email}</span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{t.settings.not_connected}</span>
                  )}
                </div>
                {business?.contact_info?.gmail_connected ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-600 hover:bg-green-50 text-xs"
                      onClick={async () => {
                        const testEmail = business?.contact_info?.email
                        if (!testEmail) { toast.error('אין אימייל מחובר'); return }
                        toast.loading('שולח אימייל בדיקה...')
                        try {
                          const res = await fetch('/api/email/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ to: testEmail, businessName: business?.name }),
                          })
                          const data = await res.json()
                          toast.dismiss()
                          if (data.success) toast.success('אימייל בדיקה נשלח!')
                          else toast.error(data.error || 'שגיאה')
                        } catch { toast.dismiss(); toast.error('שגיאה בחיבור') }
                      }}
                    >
                      {t.settings.send_test}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-500 hover:bg-red-50 text-xs"
                      onClick={async () => {
                        if (!confirm('בטוח שאתה רוצה לנתק את ה-Gmail?')) return
                        const supabase = createClient()
                        await supabase.from('businesses').update({
                          contact_info: {
                            ...business.contact_info,
                            gmail_connected: false,
                            gmail_refresh_token: null,
                            gmail_access_token: null,
                            gmail_token_expiry: null,
                          }
                        }).eq('id', business.id)
                        toast.success('Gmail נותק')
                        window.location.reload()
                      }}
                    >
                      {t.settings.disconnect}
                    </Button>
                  </div>
                ) : (
                  <a href="/api/auth/gmail">
                    <Button size="sm" className="bg-[#2e90fa] border-0 text-xs shadow-sm rounded-xl">
                      {t.settings.connect_gmail}
                    </Button>
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {business?.contact_info?.gmail_connected
                  ? `הבוט עונה מ-${business.contact_info.email} · לנתק ולחבר אימייל אחר? לחץ "נתק" ואז "חבר Gmail"`
                  : 'חבר את ה-Gmail שלך כדי שהבוט יענה ללקוחות מהאימייל של העסק'}
              </p>
            </div>

            {/* WhatsApp */}
            <div className="border border-gray-200 bg-gray-50/50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <span className="font-medium text-sm">{t.common.channel_whatsapp}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">{t.settings.coming_soon}</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs" disabled>
                  {t.settings.connect_whatsapp}
                </Button>
              </div>
              <p className="text-xs text-gray-400">חיבור WhatsApp Business API דרך Meta — הבוט יענה ללקוחות ישירות מהמספר של העסק</p>
            </div>

            {/* Widget */}
            <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌐</span>
                  <span className="font-medium text-sm">{t.common.channel_widget}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{t.settings.widget_ready}</span>
                </div>
                <a href="/dashboard/widget">
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs">
                    {t.settings.title}
                  </Button>
                </a>
              </div>
              <p className="text-xs text-blue-600">הטמע צ׳אט בוט באתר שלך עם שורת קוד אחת</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}