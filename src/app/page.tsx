'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, X, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useRef, useEffect, useState } from "react"
import HeroChat from "@/components/landing/hero-chat"
import RotatingText from "@/components/landing/rotating-text"

/* ── Scroll Animation Wrapper ─────────────────── */

function FadeIn({ children, className = '', delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
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
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${delay * 0.15}s, transform 0.5s ease ${delay * 0.15}s`,
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
    <div className="min-h-screen relative" dir="rtl">
      {/* Global gradient blur background */}
      <div className="fixed inset-0 -z-10 bg-white">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute top-[30%] left-[-5%] w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

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
                  className="px-4 py-2 text-sm text-gray-500 hover:text-[#2563eb] transition-colors rounded-xl hover:bg-blue-50/50 font-medium"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex text-gray-500 hover:text-[#2563eb] font-medium">
                  התחברות
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="hidden md:inline-flex rounded-xl px-6 border-0 text-white font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #5a7af7 100%)',
                    boxShadow: '0 4px 14px rgba(46,144,250,0.35)',
                  }}
                >
                  נסה ב-₪1
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger className="md:hidden p-2 text-gray-500 hover:text-[#2563eb]" aria-label="תפריט ניווט">
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
                        <a key={l.href} href={l.href} className="px-4 py-3 text-[15px] font-medium text-gray-700 hover:text-[#2563eb] hover:bg-blue-50/50 rounded-xl transition-colors">
                          {l.label}
                        </a>
                      ))}
                    </nav>
                    <div className="mt-auto px-4 pb-6 space-y-3 border-t border-gray-100 pt-4">
                      <Link href="/login"><Button variant="outline" className="w-full rounded-xl">התחברות</Button></Link>
                      <Link href="/signup">
                        <Button className="w-full border-0 text-white rounded-xl" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #5a7af7 100%)' }}>
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
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="relative z-10 max-w-[900px] mx-auto px-4 text-center">
          {/* Badge */}
          <div className="animate-slide-up inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-blue-200 bg-blue-50 mb-8 badge-shine">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-700 font-semibold">הפלטפורמה #1 לשירות לקוחות AI בישראל</span>
          </div>

          {/* Headline — big, centered, simple */}
          <h1 className="animate-slide-up-delay text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] mb-6 tracking-tight">
            <span className="text-gray-900">הלקוחות שלך מחכים.</span>
            <br />
            <span className="gradient-text">הבוט שלך עונה.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-slide-up-delay-2 text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            בוט AI שסורק את האתר שלך, לומד את העסק, ועונה ללקוחות בוואטסאפ, אימייל ובאתר — <span className="text-gray-700 font-medium">24/7, בלי נציגים.</span>
          </p>

          {/* CTA */}
          <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-2xl px-10 py-7 text-lg border-0 text-white font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 8px 30px rgba(37,99,235,0.35)',
                }}
              >
                התחל בחינם
              </Button>
            </Link>
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-10 py-7 text-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium"
              >
                ראה איך זה עובד
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="animate-slide-up-delay-3 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" />₪1 לחודש ניסיון</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" />התקנה ב-5 דקות</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" />ללא התחייבות</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-16">
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm p-6 md:p-8 shadow-lg shadow-gray-100/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
              {[
                { value: 500, suffix: '+', label: 'עסקים פעילים' },
                { value: 50, suffix: 'K+', label: 'הודעות נשלחו' },
                { value: 2.3, suffix: 's', label: 'זמן תגובה ממוצע' },
                { value: 98, suffix: '%', label: 'דיוק תשובות' },
              ].map((stat, i) => (
                <div key={i} className={`text-center px-4 ${i > 0 ? 'md:border-r md:border-gray-100' : ''}`}>
                  <div className="text-2xl md:text-3xl font-extrabold gradient-text">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SOCIAL PROOF STRIP                              */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-8 bg-gray-50/80 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <span className="text-sm text-gray-400 font-medium ml-2">עסקים שכבר משתמשים:</span>
            {['מסעדות', 'קליניקות', 'חנויות אונליין', 'משרדי עו״ד', 'סטודיואים', 'סוכנויות'].map((type) => (
              <span key={type} className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURES — BENTO GRID                           */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              הכל כלול. בלי הפתעות.
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">כל מה שצריך כדי לתת שירות מעולה — בלי לשבור את הראש</p>
          </FadeIn>

          <div className="grid md:grid-cols-5 gap-5">
            {/* AI Chat (spans 3 cols) */}
            <FadeIn delay={0} className="md:col-span-3">
              <div className="card-hover rounded-2xl border border-gray-200/60 bg-white p-7 h-full overflow-hidden relative group">
                <h3 className="text-lg font-bold text-gray-900 mb-1">AI שעונה על הכל</h3>
                <p className="text-sm text-gray-500 mb-5">3 שכבות: FAQ → מדיניות → AI מתקדם. עונה בפחות מ-2 שניות.</p>
                {/* Animated chat mockup */}
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-100 p-4 space-y-3">
                  <div className="flex gap-2 justify-end animate-slide-up">
                    <div className="bg-blue-500 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                      מה שעות הפתיחה שלכם?
                    </div>
                  </div>
                  <div className="flex gap-2.5 animate-slide-up-delay">
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
                  </div>
                  <div className="flex gap-2 justify-end animate-slide-up-delay-2">
                    <div className="bg-blue-500 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                      כן, מחר בבוקר
                    </div>
                  </div>
                  <div className="flex gap-2.5 animate-slide-up-delay-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[11px] shrink-0 shadow-sm">🤖</div>
                    <div className="bg-white text-gray-700 text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm border border-gray-100 shadow-sm max-w-[280px]">
                      מצוין! מחר יש לנו פנוי ב-10:00 וב-11:30. מה מתאים לך?
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Site Scanning (spans 2 cols) */}
            <FadeIn delay={1} className="md:col-span-2">
              <div className="card-hover rounded-2xl border border-gray-200/60 bg-white p-7 h-full group">
                <h3 className="text-lg font-bold text-gray-900 mb-1">סריקה אוטומטית</h3>
                <p className="text-sm text-gray-500 mb-5">הדבק URL — הבוט לומד הכל בשניות</p>
                <div className="space-y-4">
                  {[
                    { label: 'שאלות נפוצות', pct: 100, delay: '0s' },
                    { label: 'מדיניות החזרות', pct: 100, delay: '0.3s' },
                    { label: 'שעות פעילות', pct: 100, delay: '0.6s' },
                    { label: 'פרטי קשר', pct: 85, delay: '0.9s' },
                  ].map((item) => (
                    <div key={item.label} style={{ animationDelay: item.delay }} className="animate-slide-up opacity-0" >
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">{item.label}</span>
                        <span className={item.pct === 100 ? 'text-emerald-500 font-semibold' : 'text-blue-500 font-semibold'}>{item.pct === 100 ? '✓' : `${item.pct}%`}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${item.pct === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-500 animate-pulse'}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* 3 Channels (spans 2 cols) */}
            <FadeIn delay={2} className="md:col-span-2">
              <div className="card-hover rounded-2xl border border-gray-200/60 bg-white p-7 h-full group">
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
            </FadeIn>

            {/* Analytics (spans 3 cols) */}
            <FadeIn delay={3} className="md:col-span-3">
              <div className="card-hover rounded-2xl border border-gray-200/60 bg-white p-7 h-full group">
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
                {/* Dashboard mockup */}
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
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-700"
                      style={{ height: `${h}%`, transitionDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* COMMAND CENTER — All messages in one place        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              כל ההודעות. <span className="gradient-text">מכל הערוצים.</span> במקום אחד.
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">בלי לקפוץ בין אפליקציות. דשבורד אחד שמרכז את כל השיחות — וואטסאפ, אימייל וצ׳אט.</p>
          </FadeIn>

          <FadeIn delay={1}>
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
                {/* Live indicator */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900">שיחות פעילות</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    זמן אמת
                  </div>
                </div>

                {/* Message rows with staggered animations */}
                {[
                  { name: 'שרה כהן', channel: 'WhatsApp', channelColor: 'bg-[#25D366]', msg: 'היי, רציתי לדעת מתי המשלוח מגיע', time: 'עכשיו', isNew: true, delay: '0s' },
                  { name: 'david@gmail.com', channel: 'Email', channelColor: 'bg-blue-500', msg: 'RE: שאלה על המנוי השנתי — תודה על המידע', time: '2 דק׳', isNew: true, delay: '0.15s' },
                  { name: 'אורח #4821', channel: 'Widget', channelColor: 'bg-purple-500', msg: 'איך אני יכול להזמין אונליין?', time: '5 דק׳', isNew: false, delay: '0.3s' },
                  { name: 'יוסי לוי', channel: 'WhatsApp', channelColor: 'bg-[#25D366]', msg: 'מה מדיניות ההחזרות שלכם?', time: '12 דק׳', isNew: false, delay: '0.45s' },
                  { name: 'info@company.co.il', channel: 'Email', channelColor: 'bg-blue-500', msg: 'בקשת הצעת מחיר למנוי עסקי', time: '1 שעה', isNew: false, delay: '0.6s' },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 md:gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer animate-slide-up opacity-0"
                    style={{ animationDelay: row.delay, animationFillMode: 'forwards' }}
                  >
                    {/* Channel badge */}
                    <div className={`w-8 h-8 ${row.channelColor} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                      {row.channel === 'WhatsApp' ? 'W' : row.channel === 'Email' ? '@' : '</>'}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900 truncate">{row.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${row.channelColor} text-white`}>{row.channel}</span>
                        {row.isNew && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{row.msg}</p>
                    </div>
                    {/* Time */}
                    <span className="text-[11px] text-gray-400 shrink-0">{row.time}</span>
                  </div>
                ))}

                {/* Typing indicator at bottom */}
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
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="how" className="py-20 md:py-28 bg-gray-50/80">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              מוכן תוך 3 דקות
            </h2>
            <p className="text-gray-500 text-base">שלושה צעדים פשוטים והבוט שלך אונליין</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'הכנס את כתובת האתר',
                desc: 'הבוט סורק את כל העמודים ולומד את המידע אוטומטית.',
              },
              {
                num: '02',
                title: 'התאם את הבוט',
                desc: 'בחר טון דיבור, שם, צבעים — התאמה מלאה לזהות העסק שלך.',
              },
              {
                num: '03',
                title: 'שלב ותתחיל לקבל לקוחות',
                desc: 'חבר וואטסאפ, אימייל או הטמע ווידג\'ט — הבוט עובד תוך דקות.',
              },
            ].map((step, i) => (
              <FadeIn key={i} delay={i}>
                <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-7 text-center md:text-right h-full">
                  <div className="text-4xl md:text-5xl font-black gradient-text mb-4 leading-none">{step.num}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* PRICING                                          */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1000px] mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              תוכניות
            </h2>
            <p className="text-gray-500 text-base">בחר את התוכנית שמתאימה לעסק שלך</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Basic */}
            <FadeIn delay={0}>
              <div className="card-hover rounded-2xl border border-gray-200/60 bg-white p-7 flex flex-col h-full">
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
                  <Button variant="outline" className="w-full rounded-xl py-5 font-semibold border-gray-200 hover:border-blue-300 hover:bg-blue-50/50">
                    התחל עכשיו
                  </Button>
                </Link>
              </div>
            </FadeIn>

            {/* Premium — Popular */}
            <FadeIn delay={1}>
              <div className="rounded-2xl p-7 flex flex-col h-full relative plan-popular bg-white card-hover"
                style={{ transform: 'scale(1.03)' }}>
                {/* Popular badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg badge-shine">
                    הכי פופולרי
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">פרימיום</h3>
                  <p className="text-sm text-gray-500 mb-4">לעסקים שרוצים הכל</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black gradient-text">₪500</span>
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
                    className="w-full rounded-xl py-5 font-semibold border-0 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 20px rgba(46,144,250,0.35)',
                    }}
                  >
                    התחל עכשיו
                  </Button>
                </Link>
              </div>
            </FadeIn>

            {/* Business */}
            <FadeIn delay={2}>
              <div className="card-hover rounded-2xl border border-gray-200/60 bg-white p-7 flex flex-col h-full">
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
                  <Button variant="outline" className="w-full rounded-xl py-5 font-semibold border-gray-200 hover:border-blue-300 hover:bg-blue-50/50">
                    צור קשר
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              מה אומרים <span className="gradient-text">הלקוחות שלנו</span>
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">עסקים אמיתיים שכבר חוסכים שעות ביום</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
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
              <FadeIn key={i} delay={i}>
                <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-6 h-full flex flex-col">
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FAQ                                              */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="faq" className="py-20 md:py-28 bg-gray-50/80">
        <div className="max-w-[700px] mx-auto px-4">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              שאלות נפוצות
            </h2>
          </FadeIn>

          <FadeIn delay={1}>
            <div className="space-y-3">
              <FAQItem
                q="כמה זמן לוקח להקים בוט?"
                a="פחות מ-3 דקות. מזינים את כתובת האתר, הבוט סורק את התוכן, ואפשר להתחיל מיד. בלי קוד, בלי מפתחים."
              />
              <FAQItem
                q="האם הבוט עונה גם בוואטסאפ?"
                a="כן! הבוט עובד בוואטסאפ, אימייל, ובצ׳אט ווידג׳ט באתר. הכל מנוהל ממקום אחד."
              />
              <FAQItem
                q="מה קורה אם הבוט לא יודע את התשובה?"
                a="הבוט מעביר את השיחה לנציג אנושי, או מתעד את השאלה כדי שתוכל לעדכן את מאגר הידע."
              />
              <FAQItem
                q="האם המידע שלי מאובטח?"
                a="לחלוטין. כל המידע מוצפן, שמור בשרתים מאובטחים, ולא משותף עם צדדים שלישיים."
              />
              <FAQItem
                q="אפשר לבטל בכל רגע?"
                a="כן. אין התחייבות, אין חוזה. מבטלים מתי שרוצים ישירות מלוח הבקרה."
              />
              <FAQItem
                q="מה ההבדל בין התוכניות?"
                a="ההבדל העיקרי הוא בכמות ההודעות, מספר הערוצים, ורמת האנליטיקס. תוכנית הפרימיום כוללת את כל הערוצים וכלי האנליטיקס."
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FINAL CTA                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #080810 0%, #0f172a 100%)' }}>
        {/* Orbs */}
        <div className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[-20%] left-[10%] w-[400px] h-[400px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />

        <div className="relative z-10 max-w-[600px] mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              מוכן להתחיל?
            </h2>
            <p className="text-gray-400 text-base mb-8">תנו לבוט לעבוד בשבילכם — 24/7, בלי הפסקה.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-xl px-8 py-6 text-base border-0 text-white font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #2563eb 100%)',
                    backgroundSize: '200% auto',
                    boxShadow: '0 4px 24px rgba(46,144,250,0.4)',
                  }}
                >
                  התחל בחינם
                </Button>
              </Link>
              <a href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 py-6 text-base border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30 font-medium"
                >
                  צפה בתוכניות
                </Button>
              </a>
            </div>
            <p className="text-sm text-gray-500">₪1 לחודש ראשון · ללא התחייבות · ביטול בכל רגע</p>
          </FadeIn>
        </div>
      </section>

      </main>

      {/* ═══════════════════════════════════════════════ */}
      {/* FOOTER                                           */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="py-12 border-t border-white/[0.06]" style={{ background: '#080810' }}>
        <div className="max-w-[1200px] mx-auto px-4">
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
      </footer>
    </div>
  )
}
