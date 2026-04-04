'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StepBusinessInfo from '@/components/onboarding/step-business-info'
import StepBusinessStory from '@/components/onboarding/step-business-story'
import StepFAQ from '@/components/onboarding/step-faq'
import StepPolicies from '@/components/onboarding/step-policies'
import StepTone from '@/components/onboarding/step-tone'
import StepTemplates from '@/components/onboarding/step-templates'
import StepSummary from '@/components/onboarding/step-summary'

export interface FAQItem {
  question: string
  answer: string
  category: string
}

export interface PolicyItem {
  type: string
  title: string
  content: string
}

export interface OnboardingData {
  businessName: string
  logoUrl: string | null
  contactPhone: string
  contactEmail: string
  contactAddress: string
  contactWebsite: string
  story: string
  faqs: FAQItem[]
  policies: PolicyItem[]
  tone: string
  toneCustom: string
  templateGreeting: string
  templateNoAnswer: string
  templateTransfer: string
  templateGoodbye: string
}

const STEPS = [
  { label: 'פרטי עסק', number: 1 },
  { label: 'סיפור העסק', number: 2 },
  { label: 'שאלות נפוצות', number: 3 },
  { label: 'מדיניות', number: 4 },
  { label: 'טון דיבור', number: 5 },
  { label: 'תבניות תשובה', number: 6 },
  { label: 'סיכום', number: 7 },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    logoUrl: null,
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    contactWebsite: '',
    story: '',
    faqs: [],
    policies: [],
    tone: 'friendly',
    toneCustom: '',
    templateGreeting: 'שלום! איך אפשר לעזור לך?',
    templateNoAnswer: 'מצטער, לא מצאתי תשובה לשאלה שלך. אעביר אותך לנציג.',
    templateTransfer: 'מעביר אותך לנציג שירות. אנא המתן.',
    templateGoodbye: 'תודה שפנית אלינו! יום נפלא.',
  })

  function updateData(partial: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...partial }))
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('לא מחובר')

      // Create business
      const { data: business, error: bizErr } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: data.businessName,
          logo_url: data.logoUrl,
          contact_info: {
            phone: data.contactPhone,
            email: data.contactEmail,
            address: data.contactAddress,
            website: data.contactWebsite,
          },
          story: data.story,
          tone: data.tone,
          tone_custom: data.toneCustom || null,
        })
        .select()
        .single()

      if (bizErr) throw bizErr

      // Insert FAQs
      if (data.faqs.length > 0) {
        const { error: faqErr } = await supabase.from('faqs').insert(
          data.faqs.map((f, i) => ({
            business_id: business.id,
            category: f.category || null,
            question: f.question,
            answer: f.answer,
            order: i,
          }))
        )
        if (faqErr) throw faqErr
      }

      // Insert policies
      if (data.policies.length > 0) {
        const { error: polErr } = await supabase.from('policies').insert(
          data.policies.map(p => ({
            business_id: business.id,
            type: p.type,
            title: p.title,
            content: p.content,
          }))
        )
        if (polErr) throw polErr
      }

      // Insert templates
      const templates = [
        { type: 'greeting', content: data.templateGreeting },
        { type: 'no_answer', content: data.templateNoAnswer },
        { type: 'transfer', content: data.templateTransfer },
        { type: 'goodbye', content: data.templateGoodbye },
      ]
      const { error: tmpErr } = await supabase.from('response_templates').insert(
        templates.map(t => ({ business_id: business.id, ...t }))
      )
      if (tmpErr) throw tmpErr

      // Insert default summary settings
      await supabase.from('summary_settings').insert({
        business_id: business.id,
        frequency: 'weekly',
        email: data.contactEmail,
        enabled: false,
      })

      // Insert default widget settings
      await supabase.from('widget_settings').insert({
        business_id: business.id,
        position: 'bottom-right',
        primary_color: '#000000',
        welcome_message: data.templateGreeting,
        white_label: false,
      })

      toast.success('העסק נוצר בהצלחה!')
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה בשמירה'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold">BotPress AI</span>
          <span className="text-gray-300 mx-2">|</span>
          <span className="text-gray-500 text-sm">הגדרת העסק שלך</span>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s) => (
            <div key={s.number} className="flex flex-col items-center gap-1">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s.number
                    ? 'bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {s.number}
              </div>
              <span className={`text-sm font-medium ${step >= s.number ? 'text-black' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] h-2 rounded-full transition-all"
            style={{ width: `${((step) / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {step === 1 && <StepBusinessInfo data={data} updateData={updateData} />}
        {step === 2 && <StepBusinessStory data={data} updateData={updateData} />}
        {step === 3 && <StepFAQ data={data} updateData={updateData} />}
        {step === 4 && <StepPolicies data={data} updateData={updateData} />}
        {step === 5 && <StepTone data={data} updateData={updateData} />}
        {step === 6 && <StepTemplates data={data} updateData={updateData} />}
        {step === 7 && <StepSummary data={data} />}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            הקודם
          </Button>
          {step < 7 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-[#2e90fa] border-0 shadow-lg shadow-[#2e90fa]/30 rounded-xl hover:shadow-xl hover:shadow-[#2e90fa]/40 transition-all">
              הבא
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="bg-[#2e90fa] border-0 shadow-lg shadow-[#2e90fa]/30 rounded-xl hover:shadow-xl hover:shadow-[#2e90fa]/40 transition-all">
              {saving ? 'שומר...' : 'סיים והתחל'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
