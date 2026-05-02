'use client'

import { useEffect, useState } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { useTranslation } from '@/i18n/provider'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, Copy, Code, Check, RefreshCw, Eye, EyeOff, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const cardItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function WidgetPage() {
  const { business, loading: bizLoading } = useBusiness()
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [position, setPosition] = useState('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [whiteLabel, setWhiteLabel] = useState(false)
  const [copied, setCopied] = useState(false)
  const [widgetToken, setWidgetToken] = useState<string | null>(null)
  const [tokenVisible, setTokenVisible] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    if (!business) return
    loadSettings()
  }, [business])

  async function loadSettings() {
    const supabase = createClient()
    const [settingsRes, bizRes] = await Promise.all([
      supabase.from('widget_settings').select('*').eq('business_id', business!.id).single(),
      supabase.from('businesses').select('widget_token').eq('id', business!.id).single(),
    ])
    if (settingsRes.data) {
      setPosition(settingsRes.data.position)
      setPrimaryColor(settingsRes.data.primary_color)
      setWelcomeMessage(settingsRes.data.welcome_message)
      setWhiteLabel(settingsRes.data.white_label)
    }
    if (bizRes.data) {
      setWidgetToken(bizRes.data.widget_token)
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
    toast.success(t.widget.saved)
    setSaving(false)
  }

  function copyEmbed() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://botpress-ai.vercel.app'
    const code = `<script src="${origin}/widget.js" data-business-id="${business?.id}" data-widget-token="${widgetToken || ''}" data-color="${primaryColor}" data-position="${position === 'bottom-left' ? 'left' : 'right'}"></script>`
    navigator.clipboard.writeText(code)
    toast.success(t.widget.copied)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyToken() {
    if (!widgetToken) return
    navigator.clipboard.writeText(widgetToken)
    toast.success(t.widget.token_copied)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  async function regenerateToken() {
    if (!confirm(t.widget.regenerate_confirm)) return
    setRegenerating(true)
    try {
      const supabase = createClient()
      // Generate a new token client-side (48 char hex)
      const array = new Uint8Array(24)
      crypto.getRandomValues(array)
      const newToken = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')

      await supabase
        .from('businesses')
        .update({ widget_token: newToken })
        .eq('id', business!.id)

      setWidgetToken(newToken)
      toast.success(t.widget.token_regenerated)
    } catch {
      toast.error('Failed to regenerate token')
    }
    setRegenerating(false)
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
      <motion.div {...fadeIn} className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-4">
          <Code className="h-8 w-8 text-blue-400" />
        </div>
        <p className="text-gray-600 font-semibold">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1.5">
          <a href="/onboarding" className="text-blue-500 hover:text-blue-600 hover:underline transition-colors">{t.common.go_to_setup}</a>
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        {...fadeIn}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {t.widget.title}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t.widget.subtitle}</p>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md shadow-blue-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
          {t.common.save}
        </Button>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Left column — Settings + Embed */}
        <div className="space-y-4">
          {/* Settings Card */}
          <motion.div
            variants={cardItem}
            className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{t.widget.settings_title}</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Position selector */}
              <div className="space-y-2">
                <Label>{t.widget.position_label}</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'bottom-right', label: t.widget.position_right },
                    { value: 'bottom-left', label: t.widget.position_left },
                  ].map(p => (
                    <button key={p.value} type="button" onClick={() => setPosition(p.value)}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm border transition-all duration-200 ${
                        position === p.value
                          ? 'border-blue-500 bg-blue-50/80 text-blue-600 font-medium shadow-sm shadow-blue-500/10'
                          : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >{p.label}</button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <Label>{t.widget.color_label}</Label>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer rounded-xl border-gray-200"
                    />
                  </div>
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    dir="ltr"
                    className="flex-1 rounded-xl"
                  />
                </div>
              </div>

              {/* Welcome message */}
              <div className="space-y-2">
                <Label>{t.widget.welcome_label}</Label>
                <Input
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* White label toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <div>
                  <Label>{t.widget.white_label}</Label>
                  <p className="text-xs text-gray-400">{t.widget.white_label_desc}</p>
                </div>
                <Switch checked={whiteLabel} onCheckedChange={setWhiteLabel} />
              </div>
            </div>
          </motion.div>

          {/* Embed Code Card */}
          <motion.div
            variants={cardItem}
            className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{t.widget.embed_title}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{t.widget.embed_desc}</p>
            </div>
            <div className="p-4">
              <div className="relative group">
                <div className="rounded-xl bg-gray-900 text-green-400 p-4 font-mono text-sm text-left direction-ltr overflow-x-auto border border-gray-800/50">
                  <pre className="whitespace-pre-wrap break-all leading-relaxed">{`<script\n  src="${typeof window !== 'undefined' ? window.location.origin : 'https://botpress-ai.vercel.app'}/widget.js"\n  data-business-id="${business?.id || 'YOUR_ID'}"\n  data-widget-token="${widgetToken || 'YOUR_TOKEN'}"\n  data-color="${primaryColor}"\n  data-position="${position === 'bottom-left' ? 'left' : 'right'}">\n</script>`}</pre>
                </div>
                {/* Floating copy button */}
                <button
                  onClick={copyEmbed}
                  className="absolute top-3 left-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEmbed}
                  className="rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                >
                  {copied ? <Check className="h-4 w-4 ml-1 text-green-500" /> : <Copy className="h-4 w-4 ml-1" />}
                  {t.widget.copy_code}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">{t.widget.embed_desc}</p>
            </div>
          </motion.div>

          {/* API Token Card */}
          <motion.div
            variants={cardItem}
            className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <h2 className="text-base font-semibold text-gray-900">{t.widget.api_token_title}</h2>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{t.widget.api_token_desc}</p>
            </div>
            <div className="p-4 space-y-3">
              {widgetToken ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 font-mono text-sm text-gray-600 border border-gray-200 overflow-hidden" dir="ltr">
                      {tokenVisible ? widgetToken : widgetToken.slice(0, 6) + '••••••••••••••••••••••••••••••••••••••••••' .slice(0, widgetToken.length - 6)}
                    </div>
                    <button
                      onClick={() => setTokenVisible(!tokenVisible)}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                    >
                      {tokenVisible ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                    <button
                      onClick={copyToken}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                    >
                      {tokenCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateToken}
                    disabled={regenerating}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    {regenerating ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <RefreshCw className="h-4 w-4 ml-1" />}
                    {t.widget.regenerate_token}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-400">{t.widget.no_token}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Live Preview */}
        <motion.div
          variants={cardItem}
          className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="p-4 pb-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.widget.preview_title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{t.widget.preview_footer}</p>
          </div>
          <div className="p-4">
            {/* Fake website preview */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-inner" style={{ height: '460px' }}>
              {/* Browser chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white rounded-lg px-4 py-1 text-xs text-gray-400 border border-gray-200 w-72 text-center">
                    www.your-website.co.il
                  </div>
                </div>
              </div>

              {/* Fake website content */}
              <div className="p-8 h-full bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" dir="rtl">
                <div className="max-w-md">
                  <div className="h-8 w-32 bg-gray-200 rounded-lg mb-6" />
                  <div className="h-6 w-full bg-gray-100 rounded mb-3" />
                  <div className="h-6 w-3/4 bg-gray-100 rounded mb-3" />
                  <div className="h-6 w-1/2 bg-gray-100 rounded mb-8" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-gray-100 rounded-xl" />
                    <div className="h-24 bg-gray-100 rounded-xl" />
                    <div className="h-24 bg-gray-100 rounded-xl" />
                  </div>
                </div>

                {/* Widget FAB */}
                <div className="absolute" style={{
                  bottom: '24px',
                  [position === 'bottom-left' ? 'left' : 'right']: '24px',
                }}>
                  {/* Chat window (always open in preview) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className="mb-3 w-[280px] md:w-[320px] rounded-2xl bg-white shadow-2xl border border-[rgba(0,0,0,0.06)] overflow-hidden"
                    style={{ direction: 'rtl' }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center gap-3 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}, #7c3aed)` }}>
                      <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full bg-white/10" />
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.27A7 7 0 0112 22a7 7 0 01-7.73-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2 2 0 0112 2zm-2 13a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{business?.name || 'שירות לקוחות'}</p>
                        <p className="text-[10px] text-white/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> מקוון
                        </p>
                      </div>
                    </div>
                    {/* Messages */}
                    <div className="p-3 bg-[#fafbfe] space-y-2" style={{ minHeight: '160px' }}>
                      <div className="flex justify-end">
                        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl rounded-tl-lg px-3 py-2 text-xs text-gray-700 shadow-sm max-w-[80%]">
                          שלום! איך אפשר לעזור? 👋
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="rounded-2xl rounded-tr-lg px-3 py-2 text-xs text-white max-w-[80%]" style={{ background: primaryColor }}>
                          מה שעות הפעילות?
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl rounded-tl-lg px-3 py-2 text-xs text-gray-700 shadow-sm max-w-[80%]">
                          אנחנו פתוחים א׳-ה׳ 8:00-20:00, שישי 8:00-14:00.
                        </div>
                      </div>
                    </div>
                    {/* Input */}
                    <div className="border-t border-[rgba(0,0,0,0.04)] p-2.5 flex gap-2 bg-white" dir="rtl">
                      <div className="flex-1 bg-[#fafbfe] rounded-xl px-3 py-2 text-xs text-gray-400 border border-[rgba(0,0,0,0.06)]">שאל אותי משהו...</div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: primaryColor }}>
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      </div>
                    </div>
                    {!whiteLabel && (
                      <div className="text-center py-1.5 text-[9px] text-gray-400 border-t border-[rgba(0,0,0,0.03)]">Powered by BotPress AI</div>
                    )}
                  </motion.div>

                  {/* FAB bubble */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
                    style={{ background: primaryColor, marginRight: position === 'bottom-left' ? 'auto' : '0', marginLeft: position === 'bottom-left' ? '0' : 'auto' }}
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
                  </motion.div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">{t.widget.preview_footer}</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
