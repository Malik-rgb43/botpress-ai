'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  MessageSquare, Mail, BarChart3, Zap, Users, Bot, ArrowLeft,
  Check, Sparkles, ChevronDown, Star, Clock, Globe, Play,
  X, Bell, Smartphone, Code, UserCheck, Menu, Shield, Languages, FileText
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useRef, useEffect, useState } from "react"
import HeroChat from "@/components/landing/hero-chat"
import RotatingText from "@/components/landing/rotating-text"
import InteractiveDemo from "@/components/landing/interactive-demo"

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
        <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform duration-300 shrink-0 mr-3" />
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
      {/* HEADER                                          */}
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
      {/* HERO                                            */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-10 md:pt-28 md:pb-16 bg-white">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-white to-white" />

        {/* Soft gradient orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />

        {/* Floating decorative elements */}
        <div className="absolute top-[20%] right-[8%] w-3 h-3 rounded-full bg-blue-400/20 animate-float hidden md:block" />
        <div className="absolute top-[30%] left-[12%] w-2 h-2 rounded-full bg-purple-400/15 animate-float-delay hidden md:block" />
        <div className="absolute bottom-[25%] right-[15%] w-4 h-4 rounded-full bg-blue-300/15 animate-float-slow hidden md:block" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center md:text-right order-1">
              {/* Badge */}
              <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 mb-8 badge-shine">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm text-blue-700 font-medium">הפלטפורמה #1 לבוטים חכמים</span>
              </div>

              {/* Headline */}
              <h1 className="animate-slide-up-delay text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                <span className="text-gray-900">הבוט שמחליף</span>
                <br />
                <span className="gradient-text">
                  <RotatingText />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="animate-slide-up-delay-2 text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl md:max-w-none mb-10">
                בוט AI שסורק את האתר שלך, לומד את העסק, ועונה ללקוחות בוואטסאפ, אימייל ובאתר — 24/7, בלי נציגים
              </p>

              {/* CTA Buttons */}
              <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 mb-12">
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
                    className="rounded-xl px-8 py-6 text-base border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium"
                  >
                    <Play className="h-4 w-4 ml-2" />
                    צפה בהדגמה
                  </Button>
                </a>
              </div>

              {/* Stats row */}
              <div className="animate-slide-up-delay-3 grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0">
                {[
                  { value: 500, suffix: '+', label: 'עסקים פעילים' },
                  { value: 50, suffix: 'K+', label: 'הודעות נשלחו' },
                  { value: 98, suffix: '%', label: 'שביעות רצון' },
                ].map((stat, i) => (
                  <div key={i} className="text-center md:text-right">
                    <div className="text-2xl md:text-3xl font-extrabold gradient-text">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: HeroChat (desktop) / InteractiveDemo (mobile) */}
            <div className="order-2">
              {/* Desktop: HeroChat */}
              <div className="hidden md:block animate-slide-up-delay">
                <div className="relative rounded-2xl border border-gray-200 bg-white p-1 shadow-2xl shadow-blue-500/10">
                  <div className="rounded-xl bg-white overflow-hidden border border-gray-100">
                    {/* Chat header */}
                    <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }} className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-semibold">BotPress AI</div>
                          <div className="text-white/70 text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                            אונליין
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-0">
                      <HeroChat />
                    </div>
                  </div>
                </div>

                {/* Floating channel badges */}
                <div className="absolute -top-3 -right-6 animate-float">
                  <div className="bg-[#25D366] text-white px-4 py-2 rounded-2xl rounded-tr-sm shadow-lg shadow-emerald-500/20 text-sm font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    WhatsApp
                  </div>
                </div>
                <div className="absolute top-1/3 -left-8 animate-float-delay">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-2xl rounded-tl-sm shadow-lg shadow-blue-500/20 text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/4 animate-float-slow">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-purple-500/20 text-sm font-medium flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Widget
                  </div>
                </div>
              </div>

              {/* Mobile: InteractiveDemo */}
              <div className="md:hidden animate-slide-up-delay">
                <InteractiveDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* STATS BAR                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative -mt-8 z-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-100" style={{ direction: 'rtl' }}>
              {[
                { value: '+50,000', label: 'הודעות נשלחו החודש' },
                { value: '+500', label: 'עסקים פעילים' },
                { value: '2.3s', label: 'זמן תגובה ממוצע' },
                { value: '98%', label: 'דיוק תשובות' },
              ].map((s, i) => (
                <FadeIn key={i} delay={i} className="text-center px-4">
                  <div className="text-3xl md:text-4xl font-black gradient-text mb-1">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* CHANNELS                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">ערוצי תקשורת</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">ערוץ אחד? <span className="gradient-text">שלושה ערוצים</span></h2>
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
                borderHover: 'hover:border-emerald-200',
                mockBg: '#075E54',
                mockMessages: [
                  { side: 'right', text: 'היי, רציתי לשאול על המוצר', time: '14:23' },
                  { side: 'left', text: 'היי! בשמחה, איזה מוצר מעניין אותך? 😊', time: '14:23' },
                  { side: 'right', text: 'המנוי החודשי', time: '14:24' },
                  { side: 'left', text: 'המנוי שלנו מתחיל מ-₪250/חודש. רוצה שאשלח לינק להרשמה?', time: '14:24' },
                ],
              },
              {
                icon: Mail,
                title: 'אימייל',
                desc: 'מענה אוטומטי לכל אימייל שנכנס — מקצועי, מהיר ומדויק',
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                borderHover: 'hover:border-blue-200',
                mockBg: '#1a73e8',
                mockMessages: [
                  { side: 'header', text: 'RE: שאלה על המנוי השנתי' },
                  { side: 'left', text: 'שלום רב,\nתודה על פנייתך! המנוי השנתי שלנו כולל 3 ערוצים, 2,000 הודעות/חודש, ואנליטיקס מתקדם.\nנשמח לעזור בכל שאלה נוספת.' },
                ],
              },
              {
                icon: Code,
                title: 'וידג׳ט באתר',
                desc: 'צ׳אט חכם שמוטמע ישירות באתר שלך — שורה אחת של קוד',
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-50',
                borderHover: 'hover:border-purple-200',
                mockBg: '#7c3aed',
                mockMessages: [
                  { side: 'left', text: 'היי! איך אפשר לעזור? 👋', time: '' },
                  { side: 'right', text: 'איך אני מזמין?', time: '' },
                  { side: 'left', text: 'אפשר להזמין ישירות דרך האתר! הנה הלינק 🔗', time: '' },
                ],
              },
            ].map((channel, i) => (
              <FadeIn key={i} delay={i + 1}>
                <div className={`rounded-2xl border border-gray-200/60 overflow-hidden card-hover group ${channel.borderHover} h-full flex flex-col`}>
                  {/* Colored gradient header */}
                  <div className={`bg-gradient-to-r ${channel.color} px-6 py-4 flex items-center gap-3`}>
                    <channel.icon className="h-5 w-5 text-white/90" />
                    <h3 className="text-lg font-bold text-white">{channel.title}</h3>
                  </div>

                  {/* Mock messages — main visual */}
                  <div className={`${channel.bgColor} px-4 py-5 flex-1`}>
                    {channel.title === 'אימייל' ? (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                          <div className="text-[12px] font-semibold text-gray-700 mb-2">{channel.mockMessages[0].text}</div>
                          <div className="text-[11px] text-gray-500 whitespace-pre-line leading-relaxed">{channel.mockMessages[1].text}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {channel.mockMessages.map((msg, j) => (
                          <div key={j} className={`flex ${msg.side === 'right' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`px-3.5 py-2 rounded-xl text-[12px] max-w-[85%] ${
                              msg.side === 'right'
                                ? `bg-gradient-to-r ${channel.color} text-white rounded-tr-sm shadow-sm`
                                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm shadow-sm'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="bg-white px-6 py-4 border-t border-gray-100">
                    <p className="text-gray-500 text-sm leading-relaxed">{channel.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="how" className="py-24 bg-gray-50/50">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-full mb-4">איך זה עובד</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">ארבעה צעדים. <span className="gradient-text">זהו.</span></h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">מהרישום ועד בוט פעיל — תוך דקות</p>
          </FadeIn>

          <div className="max-w-2xl mx-auto relative">
            {/* Vertical gradient line */}
            <div className="absolute top-0 bottom-0 right-[19px] md:right-[19px] w-[2px] bg-gradient-to-b from-blue-200 via-purple-200 to-amber-200" />

            <div className="space-y-6">
              {[
                { step: '1', title: 'הירשם', desc: 'צור חשבון תוך שניות — בלי כרטיס אשראי', icon: UserCheck, color: 'from-blue-500 to-blue-600', borderColor: 'border-r-blue-400' },
                { step: '2', title: 'הדבק את כתובת האתר', desc: 'ה-AI סורק את כל התוכן באתר שלך אוטומטית', icon: Globe, color: 'from-purple-500 to-purple-600', borderColor: 'border-r-purple-400' },
                { step: '3', title: 'חבר ערוצים', desc: 'וואטסאפ, אימייל, וידג׳ט — חיבור בלחיצה', icon: Zap, color: 'from-emerald-500 to-emerald-600', borderColor: 'border-r-emerald-400' },
                { step: '4', title: 'הבוט עובד', desc: 'הבוט מתחיל לענות ללקוחות מיידית, 24/7', icon: Bot, color: 'from-amber-500 to-amber-600', borderColor: 'border-r-amber-400' },
              ].map((item, i) => (
                <FadeIn key={i} delay={i + 1}>
                  <div className="flex items-start gap-5">
                    {/* Step number badge */}
                    <div className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg`}>
                      <span className="text-white text-sm font-bold">{item.step}</span>
                    </div>
                    {/* Content card */}
                    <div className={`flex-1 bg-white rounded-2xl border border-gray-200/60 border-r-4 ${item.borderColor} p-5 card-hover group`}>
                      <div className="flex items-center gap-3 mb-2">
                        <item.icon className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* WHY US — COMPARISON                             */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">השוואה</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">למה <span className="gradient-text">BotPress AI</span>?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">ההבדל ברור</p>
          </FadeIn>

          <FadeIn delay={1}>
            <div className="max-w-3xl mx-auto overflow-x-auto">
              <div className="rounded-2xl border border-gray-200/60 overflow-hidden bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-right py-4 px-5 font-semibold text-gray-900 bg-gray-50/80 border-b border-gray-200">תכונה</th>
                      <th className="text-center py-4 px-5 font-semibold text-white border-b border-blue-400"
                        style={{ background: 'linear-gradient(135deg, #2e90fa 0%, #7c3aed 100%)' }}>
                        <div className="flex items-center justify-center gap-2">
                          <Bot className="h-4 w-4" />
                          BotPress AI
                        </div>
                      </th>
                      <th className="text-center py-4 px-5 font-semibold text-gray-500 bg-gray-50/80 border-b border-gray-200">מתחרים</th>
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
                      <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/20 transition-colors`}>
                        <td className="py-3.5 px-5 text-gray-700 font-medium">{row.feature}</td>
                        <td className="py-3.5 px-5 text-center bg-blue-50/20">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          {row.them ? (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                              <Check className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                              <X className="h-3.5 w-3.5 text-red-400" />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURES — Bento Grid                           */}
      {/* ═══════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURES — Bento Grid                           */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="features" className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">הכל כלול. <span className="gradient-text">בלי הפתעות.</span></h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">כל מה שצריך כדי לתת שירות מושלם — אוטומטית</p>
          </FadeIn>

          {/* Bento Grid — 2 big + 3 small */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Big card 1 — AI Chat */}
            <FadeIn delay={0} className="md:col-span-2">
              <div className="relative h-full rounded-2xl border border-gray-200/60 bg-gradient-to-br from-blue-50/80 to-white p-8 overflow-hidden group card-hover">
                <div className="relative z-10">
                  <div className="text-sm font-bold text-blue-600 mb-2">AI שעובד בשבילך</div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3">צ׳אט חכם שלומד את העסק</h3>
                  <p className="text-gray-500 max-w-md leading-relaxed">3 שכבות תשובה: FAQ מהיר → מדיניות → AI מתקדם. עונה על כל שאלה בפחות מ-2 שניות.</p>
                </div>
                {/* Mini chat mockup */}
                <div className="absolute bottom-4 left-4 w-64 opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="space-y-2">
                    <div className="bg-blue-500 rounded-xl rounded-bl-sm p-2.5 text-white text-xs w-fit ml-auto">מה שעות הפעילות?</div>
                    <div className="bg-white border rounded-xl rounded-br-sm p-2.5 text-gray-600 text-xs w-fit">א׳-ה׳ 8:00-20:00, שישי 8:00-14:00</div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Small card — Website Scanner */}
            <FadeIn delay={1}>
              <div className="h-full rounded-2xl border border-gray-200/60 bg-gradient-to-br from-emerald-50/80 to-white p-6 card-hover group">
                <div className="text-sm font-bold text-emerald-600 mb-2">סריקה אוטומטית</div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">הדבק URL — הבוט לומד הכל</h3>
                <p className="text-gray-500 text-sm leading-relaxed">AI סורק את האתר שלך ומייצר FAQ, מדיניות וסיפור העסק אוטומטית</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 bg-emerald-400 rounded-full w-full animate-shimmer" />
                </div>
              </div>
            </FadeIn>

            {/* Small card — Analytics */}
            <FadeIn delay={2}>
              <div className="h-full rounded-2xl border border-gray-200/60 bg-gradient-to-br from-purple-50/80 to-white p-6 card-hover group">
                <div className="text-sm font-bold text-purple-600 mb-2">נתונים בזמן אמת</div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">אנליטיקס מתקדם</h3>
                <p className="text-gray-500 text-sm leading-relaxed">שיחות, שביעות רצון, נושאים חמים — הכל בדשבורד אחד</p>
                {/* Mini chart */}
                <div className="mt-4 flex items-end gap-1 h-8">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-purple-200 group-hover:bg-purple-400 rounded-t transition-all duration-500" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Big card 2 — Escalation + Languages */}
            <FadeIn delay={3} className="md:col-span-2">
              <div className="h-full rounded-2xl border border-gray-200/60 bg-gradient-to-br from-amber-50/60 to-white p-8 card-hover">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-sm font-bold text-amber-600 mb-2">העברה חכמה</div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">נציג אנושי כשצריך</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">כשהבוט לא בטוח — מעביר לנציג בלחיצה. עם כל ההיסטוריה של השיחה.</p>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-pink-600 mb-2">3 שפות</div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">עברית · English · العربية</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">הבוט מזהה את שפת הלקוח אוטומטית ועונה בשפה שלו. כולל RTL מלא.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Demo section removed — chat is already in hero */}

      {/* ═══════════════════════════════════════════════ */}
      {/* PRICING                                         */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 bg-gray-50/50">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-full mb-4">תוכניות ומחירים</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">תוכנית <span className="gradient-text">לכל עסק</span></h2>
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
                    ? 'border-transparent shadow-xl scale-[1.02]'
                    : 'border-gray-200/60 hover:shadow-lg'
                }`}
                  style={plan.popular ? {
                    backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2e90fa, #7c3aed)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    border: '2px solid transparent',
                  } : undefined}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 text-white text-xs font-semibold rounded-full"
                      style={{ background: 'linear-gradient(135deg, #2e90fa 0%, #7c3aed 100%)' }}>
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
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-emerald-500" />
                        </div>
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
      {/* FAQ                                             */}
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
      {/* FINAL CTA                                       */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#0a0a1a' }}>
        {/* Background effects */}
        <div className="hero-grid absolute inset-0 opacity-20" />
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(46,144,250,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

        {/* Floating decorative dots */}
        <div className="absolute top-[20%] right-[10%] w-2 h-2 rounded-full bg-blue-400/30 animate-float hidden md:block" />
        <div className="absolute bottom-[25%] left-[15%] w-3 h-3 rounded-full bg-purple-400/20 animate-float-delay hidden md:block" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-sm text-gray-300 font-medium">הצטרף ל-500+ עסקים שכבר חוסכים שעות ביום</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              מוכן <span className="gradient-text">להפוך את השירות</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
              התחל עם תקופת ניסיון ב-₪1 בלבד. בלי התחייבות, בלי סיכון.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-xl px-10 py-6 text-base border-0 text-white font-semibold animate-shimmer"
                  style={{
                    background: 'linear-gradient(135deg, #2e90fa 0%, #7c3aed 50%, #2e90fa 100%)',
                    backgroundSize: '200% auto',
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
                  className="rounded-xl px-8 py-6 text-base border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60 font-medium backdrop-blur-sm"
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
      {/* FOOTER                                          */}
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
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} BotPress AI. כל הזכויות שמורות.
            </p>
            <p className="text-xs text-gray-500">
              נבנה באהבה בישראל
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
