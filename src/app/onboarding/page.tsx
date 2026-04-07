'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bot, ChevronRight, ChevronLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
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
  { label: 'פרטי עסק', icon: '🏢' },
  { label: 'סיפור', icon: '📝' },
  { label: 'FAQ', icon: '❓' },
  { label: 'מדיניות', icon: '📋' },
  { label: 'טון', icon: '🎯' },
  { label: 'תבניות', icon: '💬' },
  { label: 'סיכום', icon: '✅' },
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
    // Validate required fields
    if (!data.businessName.trim()) {
      toast.error('חסר שם העסק — חזור לשלב 1')
      setStep(1)
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('לא מחובר — התחבר מחדש')

      // Check if business already exists for this user
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (existing) {
        // Update existing business instead of creating new one
        const { error: updateErr } = await supabase
          .from('businesses')
          .update({
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
          .eq('id', existing.id)

        if (updateErr) {
          console.error('Update business error:', updateErr)
          throw new Error('שגיאה בעדכון פרטי העסק')
        }

        // Delete old FAQs/policies and re-insert
        await supabase.from('faqs').delete().eq('business_id', existing.id)
        await supabase.from('policies').delete().eq('business_id', existing.id)
        await supabase.from('response_templates').delete().eq('business_id', existing.id)

        const businessId = existing.id

        if (data.faqs.length > 0) {
          await supabase.from('faqs').insert(
            data.faqs.map((f, i) => ({
              business_id: businessId,
              category: f.category || null,
              question: f.question,
              answer: f.answer,
              order: i,
            }))
          )
        }

        if (data.policies.length > 0) {
          await supabase.from('policies').insert(
            data.policies.map(p => ({
              business_id: businessId,
              type: p.type,
              title: p.title,
              content: p.content,
            }))
          )
        }

        await supabase.from('response_templates').insert(
          [
            { type: 'greeting', content: data.templateGreeting },
            { type: 'no_answer', content: data.templateNoAnswer },
            { type: 'transfer', content: data.templateTransfer },
            { type: 'goodbye', content: data.templateGoodbye },
          ].map(t => ({ business_id: businessId, ...t }))
        )

        toast.success('העסק עודכן בהצלחה!')
        router.push('/dashboard')
        return
      }

      // Create new business
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

      if (bizErr) {
        console.error('Create business error:', bizErr)
        throw new Error('שגיאה ביצירת העסק — ' + (bizErr.message || ''))
      }

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
        if (faqErr) console.error('FAQ insert error:', faqErr)
      }

      if (data.policies.length > 0) {
        const { error: polErr } = await supabase.from('policies').insert(
          data.policies.map(p => ({
            business_id: business.id,
            type: p.type,
            title: p.title,
            content: p.content,
          }))
        )
        if (polErr) console.error('Policy insert error:', polErr)
      }

      await supabase.from('response_templates').insert(
        [
          { type: 'greeting', content: data.templateGreeting },
          { type: 'no_answer', content: data.templateNoAnswer },
          { type: 'transfer', content: data.templateTransfer },
          { type: 'goodbye', content: data.templateGoodbye },
        ].map(t => ({ business_id: business.id, ...t }))
      )

      await supabase.from('summary_settings').insert({
        business_id: business.id,
        frequency: 'weekly',
        email: data.contactEmail,
        enabled: false,
      })

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
      console.error('Onboarding error:', err)
      const message = err instanceof Error ? err.message : 'שגיאה בשמירה — נסה שוב'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const progress = (step / 7) * 100

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="BotPress AI" width={32} height={32} className="rounded-lg" />
            <span className="text-[17px] font-bold text-gray-900 tracking-tight">BotPress AI</span>
          </div>
          <span className="text-sm text-gray-400">שלב {step} מתוך 7</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile: simple progress bar + step count */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{STEPS[step - 1].label}</span>
              <span className="text-xs text-gray-400">{step}/7</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Desktop: step indicators */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => {
                const stepNum = i + 1
                const isDone = step > stepNum
                const isCurrent = step === stepNum
                return (
                  <button
                    key={i}
                    onClick={() => stepNum <= step && setStep(stepNum)}
                    className={`flex flex-col items-center gap-1.5 transition-all ${
                      stepNum <= step ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : stepNum}
                    </div>
                    <span className={`text-[11px] font-medium ${
                      isCurrent ? 'text-blue-600' : isDone ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            className="rounded-lg border-gray-200 h-10 px-5"
          >
            <ChevronRight className="h-4 w-4 ml-1" />
            הקודם
          </Button>
          {step < 7 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-lg h-10 px-6 shadow-sm"
            >
              הבא
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-lg h-10 px-6 shadow-sm"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin ml-1.5" />שומר...</>
              ) : (
                <><Check className="h-4 w-4 ml-1.5" />סיים והתחל</>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
