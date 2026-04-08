'use client'

import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import {
  MessageSquare, Mail, BarChart3, Zap, Users, Bot, ArrowLeft,
  Check, Sparkles, ChevronDown, Star, Clock, Globe, Play,
  X, Bell, Smartphone, Code, UserCheck, Menu
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useRef, useEffect, useState } from "react"
import HeroChat from "@/components/landing/hero-chat"
import RotatingText from "@/components/landing/rotating-text"

/* ── Scroll Animation Wrapper ─────────────────── */

function FadeIn({ children, className = '', delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.4s ease ${delay * 0.15}s, transform 0.4s ease ${delay * 0.15}s`,
      }}
    >
      {children}
    </div>
  )
}

/* ── Animated Counter ─────────────────────────── */

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
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
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── FAQ Item ─────────────────────────────────── */

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-200/60 rounded-2xl overflow-hidden bg-white hover:border-blue-200 transition-all duration-300">
      <summary className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-blue-50/30 transition-colors">
        <span className="font-semibold text-gray-900 text-[15px]">{q}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform duration-300 shrink-0 mr-3" />
      </summary>
      <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-gray-500 leading-relaxed">{a}</div>
    </details>
  )
}

/* ── Page ────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white relative" dir="rtl">

      {/* ═══════════════════════════════════════════════ */}
      {/* 1. HEADER                                       */}
      {/* ═══════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-[1200px] mt-4 px-4">
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
                  className="px-4 py-2 text-sm text-gray-500 hover:text-[#2e90fa] transition-colors rounded-xl hover:bg-blue-50/50 font-medium"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex text-gray-500 hover:text-[#2e90fa] font-medium">
                  התחברות
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="hidden md:inline-flex rounded-xl px-6 border-0 text-white font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #2e90fa 0%, #5a7af7 100%)',
                    boxShadow: '0 4px 14px rgba(46,144,250,0.35)',
                  }}
                >
                  נסה ב-₪1
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger className="md:hidden p-2 text-gray-500 hover:text-[#2e90fa]" aria-label="תפריט ניווט">
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
                        <a key={l.href} href={l.href} className="px-4 py-3 text-[15px] font-medium text-gray-700 hover:text-[#2e90fa] hover:bg-blue-50/50 rounded-xl transition-colors">
                          {l.label}
                        </a>
                      ))}
                    </nav>
                    <div className="mt-auto px-4 pb-6 space-y-3 border-t border-gray-100 pt-4">
                      <Link href="/login"><Button variant="outline" className="w-full rounded-xl">התחברות</Button></Link>
                      <Link href="/signup">
                        <Button className="w-full border-0 text-white rounded-xl" style={{ background: 'linear-gradient(135deg, #2e90fa 0%, #5a7af7 100%)' }}>
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
      </header>

      <main id="main-content">

      {/* ═══════════════════════════════════════════════ */}
      {/* 2. HERO — Dark Section                          */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32" style={{ background: '#0a0a1a' }}>
        {/* Grid pattern */}
        <div className="hero-grid absolute inset-0 opacity-30" />

        {/* Gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(46,144,250,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(46,144,250,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span className="text-sm text-gray-300 font-medium">הפלטפורמה #1 לבוטים חכמים</span>
            </div>

            {/* Headline */}
            <h1 className="animate-slide-up-delay text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="gradient-text">הבוט שמחליף</span>
              <br />
              <span className="text-white">צוות שלם</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-slide-up-delay-2 text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto mb-10">
              בוט AI שסורק את האתר שלך, לומד את העסק, ועונה ללקוחות בוואטסאפ, אימייל ובאתר — 24/7, בלי נציגים
            </p>

            {/* CTA Buttons */}
            <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-xl px-8 py-6 text-base border-0 text-white font-semibold animate-shimmer"
                  style={{
                    background: 'linear-gradient(135deg, #2e90fa 0%, #7c3aed 50%, #2e90fa 100%)',
                    backgroundSize: '200% auto',
                    boxShadow: '0 4px 20px rgba(46,144,250,0.4)',
                  }}
                >
                  <Sparkles className="h-4 w-4 ml-2" />
                  התחל בחינם
                </Button>
              </Link>
              <a href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 py-6 text-base border-white/20 text-white hover:bg-white/5 hover:border-white/30 font-medium"
                >
                  <Play className="h-4 w-4 ml-2" />
                  צפה בהדגמה
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Visual — Dashboard Mock + Floating Bubbles */}
          <div className="relative max-w-3xl mx-auto">
            {/* Dashboard mock */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-1 shadow-2xl shadow-blue-500/10">
              <div className="rounded-xl bg-[#111127] p-4 md:p-6">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">לוח בקרה</div>
                      <div className="text-gray-500 text-xs">הבוט פעיל</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 text-xs font-medium">אונליין</span>
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'שיחות היום', value: '47', change: '+12%' },
                    { label: 'זמן תגובה', value: '2.3s', change: '-18%' },
                    { label: 'שביעות רצון', value: '96%', change: '+5%' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="text-gray-500 text-[10px] mb-1">{s.label}</div>
                      <div className="text-white text-lg font-bold">{s.value}</div>
                      <div className="text-emerald-400 text-[10px] font-medium">{s.change}</div>
                    </div>
                  ))}
                </div>
                {/* Chat preview */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2">
                  <div className="flex justify-start">
                    <div className="bg-blue-500/20 text-blue-200 px-3 py-1.5 rounded-xl rounded-tr-sm text-xs max-w-[70%]">
                      מה שעות הפעילות שלכם?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-white/10 text-gray-200 px-3 py-1.5 rounded-xl rounded-tl-sm text-xs max-w-[70%]">
                      אנחנו פתוחים א׳-ה׳ 9:00-18:00 ✨
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chat bubbles */}
            <div className="absolute -top-4 -right-4 md:-right-12 animate-float">
              <div className="bg-[#25D366] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-lg shadow-emerald-500/20 text-sm font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                WhatsApp
              </div>
            </div>
            <div className="absolute top-1/3 -left-4 md:-left-14 animate-float-delay">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-lg shadow-blue-500/20 text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/4 animate-float-slow">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-purple-500/20 text-sm font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                Widget
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mt-16">
            {[
              { value: '500+', label: 'עסקים', icon: Users },
              { value: '4.9/5', label: 'שביעות רצון', icon: Star },
              { value: '+50K', label: 'הודעות', icon: MessageSquare },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <t.icon className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{t.value}</div>
                  <div className="text-gray-500 text-xs">{t.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 3. SOCIAL PROOF STATS                           */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: MessageSquare, value: 50000, suffix: '+', label: 'הודעות נשלחו', color: 'text-blue-500 bg-blue-50' },
                { icon: Users, value: 500, suffix: '+', label: 'עסקים פעילים', color: 'text-purple-500 bg-purple-50' },
                { icon: Clock, value: 2, suffix: 's', label: 'זמן תגובה ממוצע', color: 'text-emerald-500 bg-emerald-50' },
                { icon: Star, value: 98, suffix: '%', label: 'שביעות רצון', color: 'text-amber-500 bg-amber-50' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mx-auto mb-4`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 4. THREE CHANNELS                               */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">ערוצי תקשורת</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">ערוץ אחד? שלושה ערוצים</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">הבוט עובד בכל מקום שהלקוחות שלך נמצאים</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: 'WhatsApp',
                desc: 'הלקוחות שולחים הודעה בוואטסאפ ומקבלים תשובה מיידית — 24 שעות ביממה',
                color: 'from-emerald-500 to-emerald-600',
                bgColor: 'bg-emerald-50',
                mockMessages: [
                  { side: 'right', text: 'היי, רציתי לשאול על המוצר' },
                  { side: 'left', text: 'היי! בשמחה, איזה מוצר מעניין אותך?' },
                ],
              },
              {
                icon: Mail,
                title: 'אימייל',
                desc: 'מענה אוטומטי לכל אימייל שנכנס — מקצועי, מהיר ומדויק',
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                mockMessages: [
                  { side: 'right', text: 'מה המחיר למנוי שנתי?' },
                  { side: 'left', text: 'המנוי השנתי שלנו מתחיל ב-₪250/חודש...' },
                ],
              },
              {
                icon: Code,
                title: 'וידג׳ט באתר',
                desc: 'צ׳אט חכם שמוטמע ישירות באתר שלך — שורה אחת של קוד',
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-50',
                mockMessages: [
                  { side: 'right', text: 'איך אני מזמין?' },
                  { side: 'left', text: 'אפשר להזמין ישירות דרך האתר! הנה הלינק...' },
                ],
              },
            ].map((channel, i) => (
              <FadeIn key={i} delay={i + 1}>
                <div className="bg-white rounded-2xl border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${channel.color} flex items-center justify-center mb-5`}>
                    <channel.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{channel.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{channel.desc}</p>
                  {/* Mini chat mock */}
                  <div className={`${channel.bgColor} rounded-xl p-3 space-y-2 mt-auto`}>
                    {channel.mockMessages.map((msg, j) => (
                      <div key={j} className={`flex ${msg.side === 'right' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`px-3 py-1.5 rounded-xl text-[11px] max-w-[80%] ${
                          msg.side === 'right'
                            ? `bg-gradient-to-r ${channel.color} text-white rounded-tr-sm`
                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 5. HOW IT WORKS                                 */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="how" className="py-24 bg-gray-50/50">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-full mb-4">איך זה עובד</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">שלושה צעדים. זהו.</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">מהרישום ועד בוט פעיל — תוך דקות</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 right-[16.67%] left-[16.67%] h-[2px] bg-gradient-to-l from-blue-200 via-purple-200 to-blue-200" />

            {[
              { step: '1', title: 'הירשם וסרוק את האתר', desc: 'הכנס את כתובת האתר שלך — הבוט סורק את כל התוכן אוטומטית', icon: Globe },
              { step: '2', title: 'הבוט לומד את העסק', desc: 'AI מתקדם מנתח את המידע ובונה בסיס ידע מותאם לעסק שלך', icon: Sparkles },
              { step: '3', title: 'עונה אוטומטית', desc: 'הבוט מתחיל לענות ללקוחות בכל הערוצים — מיידית, מדויק, 24/7', icon: Zap },
            ].map((item, i) => (
              <FadeIn key={i} delay={i + 1} className="relative">
                <div className="text-center">
                  {/* Step number */}
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                    <span className="text-white text-xl font-bold">{item.step}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 6. KEY FEATURES                                 */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="features" className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">פיצ׳רים</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">הכל כלול. בלי הפתעות.</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">כל מה שצריך כדי לתת שירות מושלם — אוטומטית</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'סריקת אתר AI', desc: 'הבוט לומד את העסק שלך אוטומטית מהאתר — בלי הגדרה ידנית', color: 'from-blue-500 to-blue-600' },
              { icon: MessageSquare, title: 'שיחות בזמן אמת', desc: 'ניהול כל השיחות במקום אחד — וואטסאפ, אימייל ווידג׳ט', color: 'from-emerald-500 to-emerald-600' },
              { icon: UserCheck, title: 'העברה לנציג', desc: 'כשהבוט לא יודע, מעביר לנציג אנושי — חלק ובלי חיכוך', color: 'from-amber-500 to-amber-600' },
              { icon: BarChart3, title: 'אנליטיקס מתקדם', desc: 'נתונים ותובנות על פעילות הבוט — כמה שיחות, שביעות רצון, נושאים', color: 'from-purple-500 to-purple-600' },
              { icon: Globe, title: 'תמיכה ב-3 שפות', desc: 'עברית, אנגלית, ערבית — הבוט מזהה את השפה ועונה בהתאם', color: 'from-pink-500 to-pink-600' },
              { icon: Bell, title: 'סיכומים אוטומטיים', desc: 'מקבל סיכום יומי/שבועי על פעילות הבוט — ישירות למייל', color: 'from-cyan-500 to-cyan-600' },
            ].map((f, i) => (
              <FadeIn key={i} delay={i}>
                <div className="bg-white rounded-2xl border border-gray-200/60 p-6 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group h-full">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 7. LIVE DEMO                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="demo" className="py-24 bg-gray-50/50">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full mb-4">הדגמה חיה</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">נסה את הבוט עכשיו</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">שאל כל שאלה ותראה איך הבוט עונה בזמן אמת</p>
          </FadeIn>

          <FadeIn delay={1}>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Demo header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">BotPress AI Demo</div>
                      <div className="text-white/70 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                        אונליין
                      </div>
                    </div>
                  </div>
                </div>
                {/* Chat component */}
                <div className="p-0">
                  <HeroChat />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 8. COMPARISON TABLE                             */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">השוואה</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">למה BotPress AI?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">ההבדל ברור</p>
          </FadeIn>

          <FadeIn delay={1}>
            <div className="max-w-3xl mx-auto overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-right py-4 px-5 font-semibold text-gray-900 border-b-2 border-gray-200">תכונה</th>
                    <th className="text-center py-4 px-5 font-semibold text-white border-b-2 border-blue-400 rounded-t-xl bg-gradient-to-r from-blue-500 to-purple-500">BotPress AI</th>
                    <th className="text-center py-4 px-5 font-semibold text-gray-500 border-b-2 border-gray-200">מתחרים</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'סריקת אתר אוטומטית', us: true, them: false },
                    { feature: 'הגדרה ב-5 דקות', us: true, them: false },
                    { feature: 'וואטסאפ + אימייל + וידג׳ט', us: true, them: false },
                    { feature: 'עברית מלאה', us: true, them: false },
                    { feature: 'העברה לנציג חכמה', us: true, them: true },
                    { feature: 'אנליטיקס מתקדם', us: true, them: true },
                    { feature: 'תמחור בשקלים', us: true, them: false },
                    { feature: 'סיכום יומי אוטומטי', us: true, them: false },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                      <td className="py-3.5 px-5 text-gray-700 font-medium">{row.feature}</td>
                      <td className="py-3.5 px-5 text-center">
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {row.them ? (
                          <Check className="h-5 w-5 text-gray-300 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 9. PRICING                                      */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 bg-gray-50/50">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-full mb-4">תוכניות ומחירים</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">תוכנית לכל עסק</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">בלי התחייבות, בלי הפתעות. משלם רק על מה שצריך</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'בסיסי',
                price: '250',
                desc: 'לעסקים קטנים שרוצים להתחיל',
                features: ['ערוץ אחד', '500 הודעות/חודש', 'סריקת אתר', 'דשבורד בסיסי', 'תמיכה באימייל'],
                cta: 'התחל עכשיו',
                popular: false,
              },
              {
                name: 'פרימיום',
                price: '500',
                desc: 'לעסקים שרוצים את המקסימום',
                features: ['3 ערוצים', '2,000 הודעות/חודש', 'סריקת אתר AI', 'אנליטיקס מתקדם', 'העברה לנציג', 'סיכום יומי', 'תמיכה בצ׳אט'],
                cta: 'הכי פופולרי',
                popular: true,
              },
              {
                name: 'עסקי',
                price: '2,000',
                desc: 'לארגונים עם צרכים מורכבים',
                features: ['ערוצים ללא הגבלה', 'הודעות ללא הגבלה', 'API מתקדם', 'מנהל חשבון ייעודי', 'SLA מובטח', 'התאמה אישית', 'אינטגרציות מותאמות'],
                cta: 'דברו איתנו',
                popular: false,
              },
            ].map((plan, i) => (
              <FadeIn key={i} delay={i + 1}>
                <div className={`relative bg-white rounded-2xl border p-6 flex flex-col h-full transition-all duration-300 ${
                  plan.popular
                    ? 'border-blue-300 shadow-xl shadow-blue-100/50 scale-[1.02]'
                    : 'border-gray-200/60 hover:shadow-lg'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
                      הכי פופולרי
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">₪{plan.price}</span>
                      <span className="text-gray-500 text-sm">/חודש</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup">
                    <Button
                      className={`w-full rounded-xl py-5 font-semibold ${
                        plan.popular
                          ? 'border-0 text-white'
                          : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                      }`}
                      style={plan.popular ? {
                        background: 'linear-gradient(135deg, #2e90fa 0%, #7c3aed 100%)',
                        boxShadow: '0 4px 14px rgba(46,144,250,0.35)',
                      } : undefined}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 10. FAQ                                         */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="faq" className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">שאלות נפוצות</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">שאלות ותשובות</h2>
          </FadeIn>

          <div className="max-w-2xl mx-auto space-y-3">
            <FadeIn delay={0}><FAQItem q="כמה זמן לוקח להקים בוט?" a="פחות מ-5 דקות. מכניסים את כתובת האתר, הבוט סורק את התוכן, ואפשר להתחיל מיד. בלי ידע טכני, בלי קוד." /></FadeIn>
            <FadeIn delay={1}><FAQItem q="האם הבוט תומך בעברית?" a="כן, הבוט תומך בעברית, אנגלית וערבית. הוא מזהה את השפה אוטומטית ועונה בהתאם." /></FadeIn>
            <FadeIn delay={2}><FAQItem q="מה קורה כשהבוט לא יודע לענות?" a="הבוט מעביר את השיחה לנציג אנושי בצורה חלקה. הלקוח לא מרגיש את המעבר, ואתה מקבל התראה מיידית." /></FadeIn>
            <FadeIn delay={3}><FAQItem q="אפשר לבטל בכל עת?" a="כמובן. בלי התחייבות, בלי קנסות. מבטלים בלחיצה אחת מהדשבורד." /></FadeIn>
            <FadeIn delay={4}><FAQItem q="איך הבוט לומד את העסק שלי?" a="הבוט סורק את האתר שלך באמצעות AI מתקדם — מנתח דפים, מוצרים, שירותים ושאלות נפוצות. אפשר גם להוסיף מידע ידנית." /></FadeIn>
            <FadeIn delay={5}><FAQItem q="האם אפשר להתחבר ל-CRM שלי?" a="כן, אנחנו תומכים באינטגרציות עם CRMs מובילים, Google Sheets, ועוד. בתוכנית העסקית ניתן לבנות אינטגרציות מותאמות." /></FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 11. FINAL CTA                                   */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#0a0a1a' }}>
        {/* Background effects */}
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(46,144,250,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              מוכן להפוך את השירות?
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
              הצטרף ל-500+ עסקים שכבר חוסכים שעות ביום עם BotPress AI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-xl px-10 py-6 text-base border-0 text-white font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #2e90fa 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 20px rgba(46,144,250,0.4)',
                  }}
                >
                  <Sparkles className="h-4 w-4 ml-2" />
                  התחל בחינם — ₪1 לחודש ראשון
                </Button>
              </Link>
              <a href="https://wa.me/972547798498" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 py-6 text-base border-white/20 text-white hover:bg-white/5 hover:border-white/30 font-medium"
                >
                  דברו איתנו בוואטסאפ
                </Button>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      </main>

      {/* ═══════════════════════════════════════════════ */}
      {/* 12. FOOTER                                      */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/images/logo.png" alt="BotPress AI" width={32} height={32} className="rounded-xl" />
                <span className="text-lg font-bold text-gray-900">BotPress AI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                הפלטפורמה המובילה לבוטים חכמים לעסקים בישראל
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">מוצר</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '#features', label: 'פיצ׳רים' },
                  { href: '#pricing', label: 'תוכניות' },
                  { href: '#demo', label: 'הדגמה' },
                  { href: '#how', label: 'איך זה עובד' },
                ].map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-gray-500 hover:text-blue-500 transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">חברה</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/terms', label: 'תנאי שימוש' },
                  { href: '/privacy', label: 'מדיניות פרטיות' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-blue-500 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">צור קשר</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="mailto:support@botpress.co.il" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">support@botpress.co.il</a>
                </li>
                <li>
                  <a href="https://wa.me/972547798498" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">WhatsApp</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} BotPress AI. כל הזכויות שמורות.
            </p>
            <p className="text-xs text-gray-400">
              נבנה באהבה בישראל 🇮🇱
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
