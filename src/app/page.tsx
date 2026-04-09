'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, X, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useRef, useEffect, useState } from "react"
import { motion, useInView, type Variants } from 'framer-motion'
import HeroChat from "@/components/landing/hero-chat"
import RotatingText from "@/components/landing/rotating-text"

/* ── Framer Motion Variants ──────────────────── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
}

/* ── Step Animations (vibecheck-inspired) ───── */

function StepUrlTyping() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'done' | 'clearing'>('typing')
  const fullText = 'https://my-business.co.il'

  useEffect(() => {
    let i = 0
    let timeout: ReturnType<typeof setTimeout>
    function typeChar() {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i))
        i++
        timeout = setTimeout(typeChar, 70 + Math.random() * 40)
      } else {
        setPhase('done')
        timeout = setTimeout(() => {
          setPhase('clearing')
          let j = fullText.length
          function clearChar() {
            if (j >= 0) {
              setText(fullText.slice(0, j))
              j--
              timeout = setTimeout(clearChar, 30)
            } else {
              setPhase('typing')
              i = 0
              timeout = setTimeout(typeChar, 500)
            }
          }
          clearChar()
        }, 2000)
      }
    }
    typeChar()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center gap-3 overflow-hidden relative group">
      <div className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300" style={{ boxShadow: phase === 'typing' ? '0 0 15px rgba(37,99,235,0.08), inset 0 0 15px rgba(37,99,235,0.03)' : 'none', opacity: phase === 'typing' ? 1 : 0 }} />
      <svg className="w-4 h-4 shrink-0 transition-colors duration-300" style={{ color: phase === 'typing' ? '#2563eb' : '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <div className="relative flex-1 min-h-[18px]" dir="ltr">
        <span className="font-mono text-xs text-blue-500 tracking-wide">{text}</span>
        <span className="inline-block w-[2px] h-[14px] bg-blue-500 rounded-full align-middle ms-[1px]" style={{ animation: phase === 'done' ? 'pulse 1s ease-in-out infinite' : 'none', opacity: phase === 'clearing' ? 0.5 : 1 }} />
      </div>
      {phase === 'done' && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
    </div>
  )
}

function StepBotLearning() {
  const [activeItem, setActiveItem] = useState(0)
  const items = [
    { label: 'שאלות נפוצות', icon: '❓', color: '#2563eb' },
    { label: 'מדיניות', icon: '📋', color: '#7c3aed' },
    { label: 'שעות פעילות', icon: '🕐', color: '#10b981' },
    { label: 'טון דיבור', icon: '🎯', color: '#f59e0b' },
    { label: 'פרטי קשר', icon: '📞', color: '#2563eb' },
    { label: 'מוצרים', icon: '🛍️', color: '#7c3aed' },
  ]

  useEffect(() => {
    const timer = setInterval(() => setActiveItem(prev => (prev + 1) % items.length), 1200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isActive = i === activeItem
        const isDone = i < activeItem
        return (
          <div key={item.label} className="flex items-center gap-2.5 transition-all duration-300" style={{ opacity: isActive ? 1 : isDone ? 0.7 : 0.4 }}>
            <span className="text-xs">{item.icon}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: isDone ? '100%' : isActive ? '60%' : '0%', backgroundColor: item.color, boxShadow: isActive ? `0 0 8px ${item.color}40` : 'none' }} />
            </div>
            <span className="text-[10px] text-gray-400 w-16 text-left font-medium">{item.label}</span>
            {isDone && <Check className="w-3 h-3 text-emerald-500" />}
          </div>
        )
      })}
    </div>
  )
}

function StepChannelConnect() {
  const [connected, setConnected] = useState(0)
  const channels = [
    { name: 'WhatsApp', icon: 'W', color: '#25D366', bg: 'bg-[#25D366]' },
    { name: 'Email', icon: '@', color: '#2563eb', bg: 'bg-blue-500' },
    { name: 'Widget', icon: '</>', color: '#7c3aed', bg: 'bg-purple-500' },
  ]

  useEffect(() => {
    const timers = channels.map((_, i) =>
      setTimeout(() => setConnected(prev => Math.max(prev, i + 1)), 800 + i * 1200)
    )
    const resetTimer = setTimeout(() => setConnected(0), 800 + channels.length * 1200 + 2000)
    return () => { timers.forEach(clearTimeout); clearTimeout(resetTimer) }
  }, [connected === 0])

  return (
    <div className="space-y-2.5">
      {channels.map((ch, i) => {
        const isConnected = i < connected
        const isConnecting = i === connected - 1
        return (
          <div key={ch.name} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-500 ${isConnected ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className={`w-8 h-8 ${ch.bg} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform duration-300 ${isConnecting ? 'scale-110' : ''}`}>{ch.icon}</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-800">{ch.name}</div>
              <div className="text-[10px] text-gray-400">{isConnected ? 'מחובר ✓' : 'מחכה לחיבור...'}</div>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-gray-200'}`} style={{ animation: isConnecting ? 'pulse 1s ease-in-out infinite' : 'none' }} />
          </div>
        )
      })}
    </div>
  )
}

/* ── Animated Counter ────────────────────────── */

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, amount: 0.3 })
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const duration = 1500
    const steps = 40
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── FAQ Item ─────────────────────────────────── */

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.05 }}
    >
      <details className="group rounded-2xl border border-gray-200/60 bg-white overflow-hidden hover:border-gray-300/80 hover:shadow-md transition-all duration-300">
        <summary className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-blue-50/30 transition-colors">
          <span className="font-semibold text-gray-900 text-[15px]">{q}</span>
          <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform duration-300 shrink-0 mr-3" />
        </summary>
        <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-gray-500 leading-relaxed">{a}</div>
      </details>
    </motion.div>
  )
}

/* ── Floating Orb (framer-motion animated) ───── */

function FloatingOrb({ className, color, size, blur }: { className?: string; color: string; size: number; blur: number }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

/* ── Page ────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen relative" dir="rtl">

      {/* ═══════════════════════════════════════════════ */}
      {/* HEADER                                          */}
      {/* ═══════════════════════════════════════════════ */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-7xl mt-4 px-6">
          <div
            className="rounded-2xl px-6 py-3.5 flex items-center justify-between border"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderColor: 'rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="BotPress AI" width={34} height={34} className="rounded-xl" />
              <span className="text-lg font-bold tracking-tight text-gray-900">BotPress AI</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "#features", label: "פיצ׳רים" },
                { href: "#how", label: "איך זה עובד" },
                { href: "#pricing", label: "תוכניות" },
                { href: "#faq", label: "שאלות" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50/50 font-medium"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex text-gray-500 hover:text-blue-600 font-medium">
                  התחברות
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="hidden md:inline-flex rounded-xl px-6 border-0 text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
                >
                  נסה ב-₪1
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger className="md:hidden p-2 text-gray-500 hover:text-blue-600" aria-label="תפריט ניווט">
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0" showCloseButton={false}>
                  <div className="flex flex-col h-full" dir="rtl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <Image src="/images/logo.png" alt="BotPress AI" width={28} height={28} className="rounded-lg" />
                        <span className="font-bold text-gray-900 text-[15px]">BotPress AI</span>
                      </div>
                      <SheetClose className="p-1.5 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5" />
                      </SheetClose>
                    </div>
                    <nav className="flex flex-col gap-1 px-3 py-4">
                      {[
                        { href: "#features", label: "פיצ׳רים" },
                        { href: "#how", label: "איך זה עובד" },
                        { href: "#pricing", label: "תוכניות" },
                        { href: "#faq", label: "שאלות" },
                      ].map((l) => (
                        <a key={l.href} href={l.href} className="px-4 py-3 text-[15px] font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors">
                          {l.label}
                        </a>
                      ))}
                    </nav>
                    <div className="mt-auto px-4 pb-6 space-y-3 border-t border-gray-100 pt-4">
                      <Link href="/login"><Button variant="outline" className="w-full rounded-xl">התחברות</Button></Link>
                      <Link href="/signup">
                        <Button className="w-full border-0 text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                          נסה ב-₪1
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      <main id="main-content">

      {/* ═══════════════════════════════════════════════ */}
      {/* HERO                                            */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        {/* Dot pattern background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        </div>

        {/* Gradient orbs */}
        <FloatingOrb className="top-[-10%] right-[-5%]" color="rgba(37,99,235,0.07)" size={600} blur={100} />
        <FloatingOrb className="top-[30%] left-[-5%]" color="rgba(124,58,237,0.05)" size={500} blur={90} />

        <motion.div
          className="relative z-10 max-w-[900px] mx-auto px-6 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-blue-200 bg-blue-50 mb-8 relative overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-700 font-semibold">הפלטפורמה #1 לשירות לקוחות AI בישראל</span>
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ translateX: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] mb-6 tracking-tight">
            <span className="text-gray-900">הלקוחות שלך מחכים.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">הבוט שלך עונה.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            בוט AI שסורק את האתר שלך, לומד את העסק, ועונה ללקוחות בוואטסאפ, אימייל ובאתר — <span className="text-gray-700 font-medium">24/7, בלי נציגים.</span>
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-2xl px-10 py-7 text-lg border-0 text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                התחל בחינם
              </Button>
            </Link>
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-10 py-7 text-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
              >
                ראה איך זה עובד
              </Button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" />₪1 לחודש ניסיון</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" />התקנה ב-5 דקות</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" />ללא התחייבות</span>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6 mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scaleIn}
        >
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm p-6 md:p-8 shadow-lg shadow-gray-100/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
              {[
                { value: 500, suffix: '+', label: 'עסקים פעילים' },
                { value: 50, suffix: 'K+', label: 'הודעות נשלחו' },
                { value: 2.3, suffix: 's', label: 'זמן תגובה ממוצע' },
                { value: 98, suffix: '%', label: 'דיוק תשובות' },
              ].map((stat, i) => (
                <div key={i} className={`text-center px-4 ${i > 0 ? 'md:border-r md:border-gray-100' : ''}`}>
                  <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SOCIAL PROOF STRIP                              */}
      {/* ═══════════════════════════════════════════════ */}
      <motion.section
        className="py-8 bg-gray-50/50 border-b border-gray-100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <span className="text-sm text-gray-400 font-medium ml-2">עסקים שכבר משתמשים:</span>
            {['מסעדות', 'קליניקות', 'חנויות אונליין', 'משרדי עו״ד', 'סטודיואים', 'סוכנויות'].map((type) => (
              <span key={type} className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                {type}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURES — BENTO GRID                           */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="features" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              הכל כלול. בלי הפתעות.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-base max-w-md mx-auto">כל מה שצריך כדי לתת שירות מעולה — בלי לשבור את הראש</motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-5 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* AI Chat (spans 3 cols) */}
            <motion.div variants={fadeInUp} className="md:col-span-3">
              <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300 p-7 h-full overflow-hidden relative group">
                <h3 className="text-lg font-bold text-gray-900 mb-1">AI שעונה על הכל</h3>
                <p className="text-sm text-gray-500 mb-5">3 שכבות: FAQ &rarr; מדיניות &rarr; AI מתקדם. עונה בפחות מ-2 שניות.</p>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-100 p-4 space-y-3">
                  <motion.div
                    className="flex gap-2 justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="bg-blue-500 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                      מה שעות הפתיחה שלכם?
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex gap-2.5"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[11px] shrink-0 shadow-sm">🤖</div>
                    <div className="space-y-1">
                      <div className="bg-white text-gray-700 text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm border border-gray-100 shadow-sm max-w-[280px]">
                        אנחנו פתוחים א׳-ה׳ 9:00-18:00 וביום ו׳ 9:00-13:00. רוצה לקבוע פגישה? 😊
                      </div>
                      <div className="flex gap-1.5 mr-1">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">FAQ</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">0.8s</span>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex gap-2 justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <div className="bg-blue-500 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                      כן, מחר בבוקר
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex gap-2.5"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[11px] shrink-0 shadow-sm">🤖</div>
                    <div className="bg-white text-gray-700 text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm border border-gray-100 shadow-sm max-w-[280px]">
                      מצוין! מחר יש לנו פנוי ב-10:00 וב-11:30. מה מתאים לך?
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Site Scanning (spans 2 cols) */}
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300 p-7 h-full group">
                <h3 className="text-lg font-bold text-gray-900 mb-1">סריקה אוטומטית</h3>
                <p className="text-sm text-gray-500 mb-5">הדבק URL — הבוט לומד הכל בשניות</p>
                <div className="space-y-4">
                  {[
                    { label: 'שאלות נפוצות', pct: 100, delay: 0 },
                    { label: 'מדיניות החזרות', pct: 100, delay: 0.15 },
                    { label: 'שעות פעילות', pct: 100, delay: 0.3 },
                    { label: 'פרטי קשר', pct: 85, delay: 0.45 },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: item.delay }}
                    >
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">{item.label}</span>
                        <span className={item.pct === 100 ? 'text-emerald-500 font-semibold' : 'text-blue-500 font-semibold'}>{item.pct === 100 ? '✓' : `${item.pct}%`}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${item.pct === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: item.delay + 0.2, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 3 Channels (spans 2 cols) */}
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300 p-7 h-full group">
                <h3 className="text-lg font-bold text-gray-900 mb-1">3 ערוצים, מערכת אחת</h3>
                <p className="text-sm text-gray-500 mb-5">וואטסאפ, אימייל וצ׳אט — ממקום אחד.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#25D366]/5 border border-[#25D366]/15 group-hover:border-[#25D366]/30 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-[#25D366] flex items-center justify-center text-white text-sm shadow-sm">W</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">WhatsApp</div>
                      <div className="text-[10px] text-gray-400">מענה אוטומטי מהמספר שלך</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 group-hover:border-blue-500/30 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm shadow-sm">@</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">Email</div>
                      <div className="text-[10px] text-gray-400">תשובות מהGmail שלך</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 group-hover:border-purple-500/30 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm shadow-sm">&lt;/&gt;</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">וידג׳ט באתר</div>
                      <div className="text-[10px] text-gray-400">שורת קוד אחת</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analytics (spans 3 cols) */}
            <motion.div variants={fadeInUp} className="md:col-span-3">
              <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300 p-7 h-full group">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">אנליטיקס בזמן אמת</h3>
                    <p className="text-sm text-gray-500">כל הנתונים על פעילות הבוט — בדשבורד אחד</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'שיחות היום', value: '47', change: '+12%', up: true },
                    { label: 'זמן תגובה', value: '2.3s', change: '-18%', up: false },
                    { label: 'שביעות רצון', value: '96%', change: '+5%', up: true },
                    { label: 'חסכון יומי', value: '₪840', change: '+23%', up: true },
                  ].map((kpi, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 p-3 text-center group-hover:bg-blue-50/50 transition-colors">
                      <div className="text-lg font-bold text-gray-900">{kpi.value}</div>
                      <div className="text-[10px] text-gray-400 mb-1">{kpi.label}</div>
                      <div className={`text-[10px] font-semibold ${kpi.up ? 'text-emerald-500' : 'text-blue-500'}`}>{kpi.change}</div>
                    </div>
                  ))}
                </div>
                {/* Mini chart */}
                <div className="flex items-end gap-1.5 h-16">
                  {[30, 45, 35, 55, 40, 65, 50, 75, 60, 85, 70, 90].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-purple-500 transition-colors duration-700"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* COMMAND CENTER — All messages in one place        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-gray-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              כל ההודעות. <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">מכל הערוצים.</span> במקום אחד.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-base max-w-lg mx-auto">בלי לקפוץ בין אפליקציות. דשבורד אחד שמרכז את כל השיחות — וואטסאפ, אימייל וצ׳אט.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleIn}
          >
            {/* Dashboard mockup */}
            <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white rounded-lg px-4 py-1 text-xs text-gray-400 border border-gray-200 w-64 text-center">botpress-ai.vercel.app/dashboard</div>
                </div>
              </div>

              {/* Inbox mockup */}
              <div className="p-4 md:p-6 space-y-3" dir="rtl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900">שיחות פעילות</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    זמן אמת
                  </div>
                </div>

                {[
                  { name: 'שרה כהן', channel: 'WhatsApp', channelColor: 'bg-[#25D366]', msg: 'היי, רציתי לדעת מתי המשלוח מגיע', time: 'עכשיו', isNew: true, delay: 0 },
                  { name: 'david@gmail.com', channel: 'Email', channelColor: 'bg-blue-500', msg: 'RE: שאלה על המנוי השנתי — תודה על המידע', time: '2 דק׳', isNew: true, delay: 0.1 },
                  { name: 'אורח #4821', channel: 'Widget', channelColor: 'bg-purple-500', msg: 'איך אני יכול להזמין אונליין?', time: '5 דק׳', isNew: false, delay: 0.2 },
                  { name: 'יוסי לוי', channel: 'WhatsApp', channelColor: 'bg-[#25D366]', msg: 'מה מדיניות ההחזרות שלכם?', time: '12 דק׳', isNew: false, delay: 0.3 },
                  { name: 'info@company.co.il', channel: 'Email', channelColor: 'bg-blue-500', msg: 'בקשת הצעת מחיר למנוי עסקי', time: '1 שעה', isNew: false, delay: 0.4 },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 md:gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: row.delay }}
                  >
                    <div className={`w-8 h-8 ${row.channelColor} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                      {row.channel === 'WhatsApp' ? 'W' : row.channel === 'Email' ? '@' : '</>'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900 truncate">{row.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${row.channelColor} text-white`}>{row.channel}</span>
                        {row.isNew && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{row.msg}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{row.time}</span>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-6 h-6 bg-[#25D366] rounded-lg flex items-center justify-center text-white text-[9px] font-bold">W</div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  <span className="text-[10px] text-gray-400">הבוט עונה...</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="how" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              מוכן תוך 3 דקות
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-base">שלושה צעדים פשוטים והבוט שלך אונליין</motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Step 01 — URL Typing Animation */}
            <motion.div variants={fadeInUp}>
              <div className="group rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-blue-200/80 transition-all duration-300 p-7 h-full relative overflow-hidden">
                {/* Background number */}
                <span className="absolute -top-2 -left-1 text-[120px] font-black text-gray-50 select-none leading-none transition-all duration-500 group-hover:text-blue-50">01</span>
                {/* Accent top border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <span className="font-mono text-xs font-bold tracking-wider text-blue-500">STEP 01</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">הכנס את כתובת האתר</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">הבוט סורק את כל העמודים ולומד את המידע אוטומטית.</p>
                  </div>
                  {/* Live URL typing animation */}
                  <div className="pt-2">
                    <StepUrlTyping />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 02 — Bot Learning Animation */}
            <motion.div variants={fadeInUp}>
              <div className="group rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-purple-200/80 transition-all duration-300 p-7 h-full relative overflow-hidden">
                <span className="absolute -top-2 -left-1 text-[120px] font-black text-gray-50 select-none leading-none transition-all duration-500 group-hover:text-purple-50">02</span>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <span className="font-mono text-xs font-bold tracking-wider text-purple-500">STEP 02</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">התאם את הבוט</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">בחר טון דיבור, שם, צבעים — התאמה מלאה לזהות העסק שלך.</p>
                  </div>
                  {/* Bot learning scanning animation */}
                  <div className="pt-2">
                    <StepBotLearning />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 03 — Channels Connect Animation */}
            <motion.div variants={fadeInUp}>
              <div className="group rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-emerald-200/80 transition-all duration-300 p-7 h-full relative overflow-hidden">
                <span className="absolute -top-2 -left-1 text-[120px] font-black text-gray-50 select-none leading-none transition-all duration-500 group-hover:text-emerald-50">03</span>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <span className="font-mono text-xs font-bold tracking-wider text-emerald-500">STEP 03</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">שלב ותתחיל לקבל לקוחות</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{'חבר וואטסאפ, אימייל או הטמע ווידג\'ט — הבוט עובד תוך דקות.'}</p>
                  </div>
                  {/* Channel connection animation */}
                  <div className="pt-2">
                    <StepChannelConnect />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* PRICING                                          */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-[1000px] mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              תוכניות
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-base">בחר את התוכנית שמתאימה לעסק שלך</motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Basic */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300 p-7 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">בסיסי</h3>
                  <p className="text-sm text-gray-500 mb-4">לעסקים קטנים שמתחילים</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">₪250</span>
                    <span className="text-sm text-gray-500">/חודש</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['1,000 הודעות בחודש', 'ערוץ אחד (צ׳אט באתר)', 'סריקת אתר בסיסית', 'לוח בקרה', 'תמיכה במייל'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button variant="outline" className="w-full rounded-xl py-5 font-semibold border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                    התחל עכשיו
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Premium — Popular */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="rounded-2xl p-7 flex flex-col h-full relative bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                style={{
                  transform: 'scale(1.03)',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb, #7c3aed, #2563eb)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                {/* Popular badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/25">
                    הכי פופולרי
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">פרימיום</h3>
                  <p className="text-sm text-gray-500 mb-4">לעסקים שרוצים הכל</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">₪500</span>
                    <span className="text-sm text-gray-500">/חודש</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['10,000 הודעות בחודש', 'וואטסאפ + אימייל + צ׳אט', 'סריקת אתר מתקדמת', 'אנליטיקס מלא', 'התאמה מלאה של הבוט', 'תמיכה בעברית ובאנגלית', 'תמיכה בצ׳אט'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    className="w-full rounded-xl py-5 font-semibold border-0 text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                  >
                    התחל עכשיו
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Business */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300 p-7 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">עסקי</h3>
                  <p className="text-sm text-gray-500 mb-4">לארגונים ורשתות</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">₪2,000</span>
                    <span className="text-sm text-gray-500">/חודש</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['הודעות ללא הגבלה', 'כל הערוצים + API', 'סריקה רציפה + עדכון אוטומטי', 'אנליטיקס מתקדם + דוחות', 'מספר בוטים', 'אינטגרציות מותאמות', 'מנהל חשבון ייעודי'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button variant="outline" className="w-full rounded-xl py-5 font-semibold border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                    צור קשר
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              מה אומרים <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">הלקוחות שלנו</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-base max-w-md mx-auto">עסקים אמיתיים שכבר חוסכים שעות ביום</motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                name: 'דנה כהן',
                role: 'בעלת חנות פרחים',
                text: 'מאז שהתחלנו להשתמש בבוט, 80% מהשאלות נענות אוטומטית. הלקוחות מרוצים ואני חוסכת שעות ביום.',
                rating: 5,
              },
              {
                name: 'יוסי לוי',
                role: 'מנהל מסעדה',
                text: 'ההגדרה הייתה פשוטה מטורף. תוך 10 דקות היה לי בוט שעונה על כל שאלה — שעות פעילות, תפריט, הזמנות.',
                rating: 5,
              },
              {
                name: 'מיכל אברהם',
                role: 'חנות אונליין',
                text: 'הסריקה האוטומטית של האתר חסכה לי ימים של עבודה. הבוט למד הכל לבד ועונה מדויק.',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300 p-6 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <span key={j} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">&ldquo;{testimonial.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FAQ                                              */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="faq" className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-[700px] mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              שאלות נפוצות
            </motion.h2>
          </motion.div>

          <div className="space-y-3">
            <FAQItem
              index={0}
              q="כמה זמן לוקח להקים בוט?"
              a="פחות מ-3 דקות. מזינים את כתובת האתר, הבוט סורק את התוכן, ואפשר להתחיל מיד. בלי קוד, בלי מפתחים."
            />
            <FAQItem
              index={1}
              q="האם הבוט עונה גם בוואטסאפ?"
              a="כן! הבוט עובד בוואטסאפ, אימייל, ובצ׳אט ווידג׳ט באתר. הכל מנוהל ממקום אחד."
            />
            <FAQItem
              index={2}
              q="מה קורה אם הבוט לא יודע את התשובה?"
              a="הבוט מעביר את השיחה לנציג אנושי, או מתעד את השאלה כדי שתוכל לעדכן את מאגר הידע."
            />
            <FAQItem
              index={3}
              q="האם המידע שלי מאובטח?"
              a="לחלוטין. כל המידע מוצפן, שמור בשרתים מאובטחים, ולא משותף עם צדדים שלישיים."
            />
            <FAQItem
              index={4}
              q="אפשר לבטל בכל רגע?"
              a="כן. אין התחייבות, אין חוזה. מבטלים מתי שרוצים ישירות מלוח הבקרה."
            />
            <FAQItem
              index={5}
              q="מה ההבדל בין התוכניות?"
              a="ההבדל העיקרי הוא בכמות ההודעות, מספר הערוצים, ורמת האנליטיקס. תוכנית הפרימיום כוללת את כל הערוצים וכלי האנליטיקס."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FINAL CTA                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #080810 0%, #0f172a 100%)' }}>
        {/* Animated gradient orbs with framer-motion */}
        <FloatingOrb className="top-[-20%] right-[10%]" color="rgba(37,99,235,0.15)" size={500} blur={100} />
        <FloatingOrb className="bottom-[-20%] left-[10%]" color="rgba(124,58,237,0.12)" size={400} blur={80} />

        <motion.div
          className="relative z-10 max-w-[600px] mx-auto px-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            מוכן להתחיל?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-base mb-8">תנו לבוט לעבוד בשבילכם — 24/7, בלי הפסקה.</motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-xl px-8 py-6 text-base border-0 text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                התחל בחינם
              </Button>
            </Link>
            <a href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 py-6 text-base border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30 font-medium transition-all"
              >
                צפה בתוכניות
              </Button>
            </a>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-sm text-gray-500">₪1 לחודש ראשון · ללא התחייבות · ביטול בכל רגע</motion.p>
        </motion.div>
      </section>

      </main>

      {/* ═══════════════════════════════════════════════ */}
      {/* FOOTER                                           */}
      {/* ═══════════════════════════════════════════════ */}
      <motion.footer
        className="py-12 border-t border-white/[0.06]"
        style={{ background: '#080810' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/images/logo.png" alt="BotPress AI" width={28} height={28} className="rounded-lg" />
                <span className="font-bold text-white text-[15px]">BotPress AI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">הפלטפורמה החכמה ביותר לשירות לקוחות אוטומטי.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">מוצר</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '#features', label: 'פיצ׳רים' },
                  { href: '#pricing', label: 'תוכניות' },
                  { href: '#how', label: 'איך זה עובד' },
                  { href: '#faq', label: 'שאלות נפוצות' },
                ].map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">חברה</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/about', label: 'אודות' },
                  { href: '/blog', label: 'בלוג' },
                  { href: '/terms', label: 'תנאי שימוש' },
                  { href: '/privacy', label: 'מדיניות פרטיות' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">צור קשר</h4>
              <ul className="space-y-2.5">
                <li><a href="mailto:support@botpress.co.il" className="text-sm text-gray-500 hover:text-white transition-colors">support@botpress.co.il</a></li>
                <li><a href="https://wa.me/972500000000" className="text-sm text-gray-500 hover:text-white transition-colors">וואטסאפ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6 text-center">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} BotPress AI. כל הזכויות שמורות.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
