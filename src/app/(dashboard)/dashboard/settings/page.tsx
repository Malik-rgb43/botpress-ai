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

  useEffect(() => {
    if (!business) return
    setName(business.name)
    setStory(business.story || '')
    setPhone(business.contact_info?.phone || '')
    setEmail(business.contact_info?.email || '')
    setAddress(business.contact_info?.address || '')
    setWebsite(business.contact_info?.website || '')
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
      contact_info: { phone, email, address, website },
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
            <CardTitle className="text-lg">ערוצים</CardTitle>
            <CardDescription>חבר את הבוט לערוצי תקשורת</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-sm">חיבור WhatsApp ו-Email יהיה זמין בקרוב</p>
              <p className="text-gray-400 text-xs mt-1">בינתיים, אתה יכול לבדוק את הבוט דרך הסימולטור</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}