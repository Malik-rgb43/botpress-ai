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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { business, loading: bizLoading } = useBusiness()
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
      contact_info: { ...business?.contact_info, phone, email, address, website, brand_color: brandColor, email_footer: emailFooter },
    }).eq('id', business!.id)
    await supabase.from('summary_settings').update({
      enabled: summaryEnabled,
      frequency: summaryFreq,
      email: summaryEmail,
    }).eq('business_id', business!.id)
    toast.success('ההגדרות נשמרו')
    setSaving(false)
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Save className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1">עבור ל<a href="/onboarding" className="text-blue-500 hover:underline">הגדרת העסק</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <Button onClick={save} disabled={saving} className="gradient-primary border-0 shadow-md shadow-blue-500/25">
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
          שמור
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">פרטי העסק</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>שם העסק</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>סיפור העסק</Label>
              <Textarea value={story} onChange={e => setStory(e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>כתובת</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>אתר</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} dir="ltr" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">סיכומים אוטומטיים</CardTitle>
            <CardDescription>קבל סיכומים תקופתיים על פעילות הבוט במייל</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>הפעל סיכומים</Label>
              <Switch checked={summaryEnabled} onCheckedChange={setSummaryEnabled} />
            </div>
            {summaryEnabled && (
              <>
                <div className="space-y-2">
                  <Label>תדירות</Label>
                  <Select value={summaryFreq} onValueChange={(v) => v && setSummaryFreq(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">יומי</SelectItem>
                      <SelectItem value="weekly">שבועי</SelectItem>
                      <SelectItem value="monthly">חודשי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>אימייל לסיכומים</Label>
                  <Input value={summaryEmail} onChange={e => setSummaryEmail(e.target.value)} dir="ltr" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">עיצוב אימייל</CardTitle>
            <CardDescription>התאם את המראה של המיילים שהבוט שולח ללקוחות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Template Picker */}
            <div className="space-y-2">
              <Label>בחר תבנית</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'modern' as const, label: 'מודרני', desc: 'גרדיאנט + צל', emoji: '✨' },
                  { id: 'classic' as const, label: 'קלאסי', desc: 'נקי + פס צד', emoji: '📋' },
                  { id: 'minimal' as const, label: 'מינימלי', desc: 'טקסט בלבד', emoji: '📝' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      const info = business?.contact_info || {}
                      const supabase = createClient()
                      supabase.from('businesses').update({
                        contact_info: { ...info, email_template: t.id }
                      }).eq('id', business!.id).then(() => {})
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      (business?.contact_info as Record<string, unknown>)?.email_template === t.id || (!((business?.contact_info as Record<string, unknown>)?.email_template) && t.id === 'modern')
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{t.emoji}</div>
                    <div className="text-xs font-medium">{t.label}</div>
                    <div className="text-[10px] text-gray-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>צבע ראשי</Label>
              <div className="flex gap-2">
                <Input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                <Input value={brandColor} onChange={e => setBrandColor(e.target.value)} dir="ltr" className="flex-1" />
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <Label>טקסט תחתון</Label>
              <Input value={emailFooter} onChange={e => setEmailFooter(e.target.value)} placeholder="למשל: טלפון: 050-1234567 | כתובת: רחוב הרצל 1" />
            </div>

            {/* White Label */}
            <div className="flex items-center justify-between">
              <div>
                <Label>White Label</Label>
                <p className="text-xs text-gray-400">הסתר Powered by BotPress AI</p>
              </div>
              <Switch checked={false} disabled />
            </div>

            {/* Preview */}
            <div>
              <Label className="mb-2 block">תצוגה מקדימה</Label>
              <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                <div style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` }} className="p-5 text-center">
                  {business?.logo_url && <img src={business.logo_url} alt="" className="w-11 h-11 rounded-xl mx-auto mb-2 border-2 border-white/30" />}
                  <p className="text-white font-bold">{name || 'שם העסק'}</p>
                </div>
                <div className="p-5 bg-white">
                  <p className="text-sm text-gray-700 leading-relaxed">שלום! אנחנו פתוחים א׳-ה׳ 9:00-18:00, שישי 9:00-13:00. יש עוד משהו שאני יכול לעזור בו?</p>
                </div>
                <div className="border-t border-gray-100 p-3 bg-gray-50 text-center">
                  {emailFooter && <p className="text-xs text-gray-500 mb-1">{emailFooter}</p>}
                  <p className="text-[10px] text-gray-400">הודעה אוטומטית מ-{name || 'העסק'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">ערוצים</CardTitle>
            <CardDescription>חבר את הבוט לערוצי תקשורת</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className={`border ${business?.contact_info?.gmail_connected ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📧</span>
                  <span className="font-medium text-sm">אימייל</span>
                  {business?.contact_info?.gmail_connected ? (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">מחובר ✓ {business.contact_info.email}</span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">לא מחובר</span>
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
                      שלח בדיקה
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
                      נתק
                    </Button>
                  </div>
                ) : (
                  <a href="/api/auth/gmail">
                    <Button size="sm" className="gradient-primary border-0 text-xs shadow-sm">
                      חבר Gmail
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <span className="font-medium text-sm">וואטסאפ</span>
                  <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">בקרוב</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs" disabled>
                  חבר WhatsApp Business
                </Button>
              </div>
              <p className="text-xs text-gray-400">חיבור WhatsApp Business API דרך Meta — הבוט יענה ללקוחות ישירות מהמספר של העסק</p>
            </div>

            {/* Widget */}
            <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌐</span>
                  <span className="font-medium text-sm">וידג׳ט באתר</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">מוכן ✓</span>
                </div>
                <a href="/dashboard/widget">
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs">
                    הגדרות
                  </Button>
                </a>
              </div>
              <p className="text-xs text-blue-600">הטמע צ׳אט בוט באתר שלך עם שורת קוד אחת</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}