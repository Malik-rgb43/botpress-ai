'use client'

import { useEffect, useState } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save, Copy, Code } from 'lucide-react'
import { toast } from 'sonner'

export default function WidgetPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [saving, setSaving] = useState(false)
  const [position, setPosition] = useState('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [whiteLabel, setWhiteLabel] = useState(false)

  useEffect(() => {
    if (!business) return
    loadSettings()
  }, [business])

  async function loadSettings() {
    const supabase = createClient()
    const { data } = await supabase.from('widget_settings').select('*').eq('business_id', business!.id).single()
    if (data) {
      setPosition(data.position)
      setPrimaryColor(data.primary_color)
      setWelcomeMessage(data.welcome_message)
      setWhiteLabel(data.white_label)
    }
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('widget_settings').update({
      position,
      primary_color: primaryColor,
      welcome_message: welcomeMessage,
      white_label: whiteLabel,
    }).eq('business_id', business!.id)
    toast.success('הגדרות הוידג׳ט נשמרו')
    setSaving(false)
  }

  function copyEmbed() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://botpress-ai.vercel.app'
    const code = `<script src="${origin}/widget.js" data-business-id="${business?.id}" data-color="${primaryColor}" data-position="${position === 'bottom-left' ? 'left' : 'right'}"></script>`
    navigator.clipboard.writeText(code)
    toast.success('הקוד הועתק!')
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Code className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1">עבור ל<a href="/onboarding" className="text-blue-500 hover:underline">הגדרת העסק</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-balance flex items-center gap-2">
            <Code className="h-6 w-6" />
            וידג׳ט צ׳אט
          </h1>
          <p className="text-gray-500 text-sm mt-1">הוסף צ׳אט באתר שלך</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
          שמור
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-lg">הגדרות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>מיקום</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'bottom-right', label: 'ימין למטה' },
                    { value: 'bottom-left', label: 'שמאל למטה' },
                  ].map(p => (
                    <button key={p.value} type="button" onClick={() => setPosition(p.value)}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm border transition-all ${
                        position === p.value
                          ? 'border-[#2e90fa] bg-[#2e90fa]/5 text-[#2e90fa] font-medium shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-[#2e90fa]/30'
                      }`}
                    >{p.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>צבע ראשי</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    dir="ltr"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>הודעת פתיחה</Label>
                <Input value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>White Label</Label>
                  <p className="text-xs text-gray-400">הסתר את הלוגו של BotPress AI</p>
                </div>
                <Switch checked={whiteLabel} onCheckedChange={setWhiteLabel} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-lg">קוד להטמעה</CardTitle>
              <CardDescription>העתק את הקוד והדבק אותו לפני תג {'</body>'} באתר שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-950 text-green-400 rounded-xl p-5 text-sm font-mono text-left direction-ltr overflow-x-auto border border-gray-800">
                <pre className="whitespace-pre-wrap break-all">{`<script\n  src="${typeof window !== 'undefined' ? window.location.origin : 'https://botpress-ai.vercel.app'}/widget.js"\n  data-business-id="${business?.id || 'YOUR_ID'}"\n  data-color="${primaryColor}"\n  data-position="${position === 'bottom-left' ? 'left' : 'right'}">\n</script>`}</pre>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={copyEmbed} className="rounded-xl">
                  <Copy className="h-4 w-4 ml-1" />
                  העתק קוד
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">הדבק את הקוד לפני תג {'</body>'} באתר שלך</p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-lg">תצוגה מקדימה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-50 rounded-lg h-[400px] flex items-end p-4" style={{ justifyContent: position === 'bottom-right' ? 'flex-start' : 'flex-end' }}>
              <div className="w-80 bg-white rounded-2xl shadow-lg border overflow-hidden">
                <div className="p-4 text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                  {business?.name || 'העסק שלך'}
                  {!whiteLabel && <span className="block text-xs opacity-70 mt-0.5">by BotPress AI</span>}
                </div>
                <div className="p-4 h-48 flex items-center justify-center text-gray-300 text-sm">
                  תצוגת צ׳אט
                </div>
                <div className="border-t p-3">
                  <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400">
                    {welcomeMessage || 'כתוב הודעה...'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
