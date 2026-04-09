'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/provider'
import { Bot, ChevronRight, ChevronLeft, Loader2, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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

const STEP_ICONS = ['🏢', '📝', '❓', '📋', '🎯', '💬', '✅']

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

// Confetti particle component for completion
function ConfettiParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 300 - 150,
    y: Math.random() * -200 - 50,
    rotate: Math.random() * 720 - 360,
    scale: Math.random() * 0.5 + 0.5,
    color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i % 6],
    delay: Math.random() * 0.3,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotate,
            scale: p.scale,
            opacity: 0,
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const STEPS = [
    { label: t.onboarding.step_business, icon: STEP_ICONS[0] },
    { label: t.onboarding.step_story, icon: STEP_ICONS[1] },
    { label: t.onboarding.step_faq, icon: STEP_ICONS[2] },
    { label: t.onboarding.step_policies, icon: STEP_ICONS[3] },
    { label: t.onboarding.step_tone, icon: STEP_ICONS[4] },
    { label: t.onboarding.step_templates, icon: STEP_ICONS[5] },
    { label: t.onboarding.step_summary, icon: STEP_ICONS[6] },
  ]
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [direction, setDirection] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
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

  function goToStep(newStep: number) {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  function goNext() {
    if (step === 6) {
      // Arriving at summary (step 7) — trigger confetti
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1500)
    }
    setDirection(1)
    setStep(s => s + 1)
  }

  function goPrev() {
    setDirection(-1)
    setStep(s => s - 1)
  }

  async function handleFinish() {
    // Validate required fields
    if (!data.businessName.trim()) {
      toast.error(t.onboarding.missing_name)
      goToStep(1)
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t.onboarding.not_logged_in)

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
          throw new Error(t.onboarding.create_error)
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

        toast.success(t.onboarding.updated_success)
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
        throw new Error(t.onboarding.create_error + ' — ' + (bizErr.message || ''))
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

      toast.success(t.onboarding.created_success)
      router.push('/dashboard')
    } catch (err: unknown) {
      console.error('Onboarding error:', err)
      const message = err instanceof Error ? err.message : t.onboarding.save_error
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const progress = (step / 7) * 100

  function renderStepContent() {
    switch (step) {
      case 1: return <StepBusinessInfo data={data} updateData={updateData} />
      case 2: return <StepBusinessStory data={data} updateData={updateData} />
      case 3: return <StepFAQ data={data} updateData={updateData} />
      case 4: return <StepPolicies data={data} updateData={updateData} />
      case 5: return <StepTone data={data} updateData={updateData} />
      case 6: return <StepTemplates data={data} updateData={updateData} />
      case 7: return <StepSummary data={data} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200/60"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="BotPress AI" width={32} height={32} className="rounded-lg" />
            <span className="text-[17px] font-bold text-gray-900 tracking-tight">BotPress AI</span>
          </div>
          <span className="text-sm text-gray-400">{t.onboarding.step_of.replace('{step}', String(step)).replace('{total}', '7')}</span>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile: simple progress bar + step count */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{STEPS[step - 1].label}</span>
              <span className="text-xs text-gray-400">{step}/7</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                  <motion.button
                    key={i}
                    onClick={() => stepNum <= step && goToStep(stepNum)}
                    whileHover={stepNum <= step ? { scale: 1.05 } : {}}
                    whileTap={stepNum <= step ? { scale: 0.95 } : {}}
                    className={`flex flex-col items-center gap-1.5 transition-all ${
                      stepNum <= step ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1 : 1,
                        backgroundColor: isDone
                          ? '#10b981'
                          : isCurrent
                          ? '#3b82f6'
                          : '#f3f4f6',
                      }}
                      transition={{ duration: 0.3 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
                        isDone
                          ? 'text-white'
                          : isCurrent
                          ? 'text-white shadow-md shadow-blue-500/30'
                          : 'text-gray-400'
                      }`}
                    >
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      ) : stepNum}
                    </motion.div>
                    <span className={`text-[11px] font-medium transition-colors duration-300 ${
                      isCurrent ? 'text-blue-600' : isDone ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="relative">
          {/* Confetti on reaching summary */}
          {showConfetti && <ConfettiParticles />}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step card wrapper for step 7 (summary) with celebration */}
              {step === 7 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="relative">
                    {/* Celebration header */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center mb-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.4 }}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25"
                      >
                        <Sparkles className="h-8 w-8 text-white" />
                      </motion.div>
                    </motion.div>
                    {renderStepContent()}
                  </div>
                </motion.div>
              ) : (
                renderStepContent()
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between mt-8"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={step === 1}
              className="rounded-xl border-gray-200 h-11 px-5 hover:bg-gray-50 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              {t.onboarding.prev}
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            {step < 7 ? (
              <Button
                onClick={goNext}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-105 text-white border-0 rounded-xl h-11 px-6 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200"
              >
                {t.onboarding.next}
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-105 text-white border-0 rounded-xl h-11 px-6 shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/25 transition-all duration-200"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin ml-1.5" />{t.onboarding.saving}</>
                ) : (
                  <><Check className="h-4 w-4 ml-1.5" />{t.onboarding.finish}</>
                )}
              </Button>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
