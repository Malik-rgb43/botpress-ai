'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MessageSquare, Mail, BarChart3, Shield, Zap, Users, Bot, ArrowLeft,
  Check, Sparkles, ChevronDown, Star, Clock, Globe, Play, Quote,
  X, TestTube, Send, TrendingUp, Bell, Smartphone, Code, UserCheck, Menu
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import LiveChatDemo from "@/components/landing/live-chat-demo"
import RotatingText from "@/components/landing/rotating-text"
import InteractiveDemo from "@/components/landing/interactive-demo"
import HeroChat from "@/components/landing/hero-chat"
import { TestimonialsColumn } from "@/components/ui/testimonials-columns"
import { HandWrittenTitle } from "@/components/ui/hand-writing-text"

/* ── Scroll Animation Wrapper ─────────────────── */

function FadeIn({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: directions[direction].y, x: directions[direction].x }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Testimonials Data ──────────────────────────── */

const testimonials = [
  { text: "הבוט חסך לי שעות ביום. לקוחות מקבלים תשובות מיידיות ואני סוף סוף יכולה להתמקד בעבודה.", image: "https://randomuser.me/api/portraits/women/1.jpg", name: "דנה כהן", role: "חנות פרחים" },
  { text: "מאז שחיברנו את הבוט, 80% מהשאלות נענות אוטומטית. צמצמנו את הצורך בנציג.", image: "https://randomuser.me/api/portraits/men/2.jpg", name: "יוסי לוי", role: "מסעדה" },
  { text: "ההגדרה הייתה פשוטה מטורף. תוך 10 דקות היה לי בוט שעונה על כל שאלה.", image: "https://randomuser.me/api/portraits/women/3.jpg", name: "מיכל אברהם", role: "חנות אונליין" },
  { text: "הבוט עונה בדיוק כמו שאני הייתי עונה. לקוחות חושבים שזה נציג אמיתי.", image: "https://randomuser.me/api/portraits/men/4.jpg", name: "אבי מזרחי", role: "סטודיו כושר" },
  { text: "חסכנו 3 שעות ביום של עבודה ידנית ושביעות הרצון של הלקוחות עלתה.", image: "https://randomuser.me/api/portraits/women/5.jpg", name: "שירה גולן", role: "קליניקה" },
  { text: "הבוט מטפל ב-150 שיחות בחודש בשבילי. ממליצה לכל בעל עסק.", image: "https://randomuser.me/api/portraits/women/6.jpg", name: "נועה ברק", role: "חנות בגדים" },
  { text: "השירות הכי טוב שהוספתי לעסק שלי השנה. לקוחות מקבלים מענה 24/7.", image: "https://randomuser.me/api/portraits/men/7.jpg", name: "עידן שמש", role: "סוכנות ביטוח" },
  { text: "קל להגדרה, קל לשימוש, והתוצאות מדהימות. תוך יום הבוט עבד מושלם.", image: "https://randomuser.me/api/portraits/women/8.jpg", name: "רותם פרידמן", role: "משרד עורכי דין" },
  { text: "הלקוחות שלנו אוהבים שהם מקבלים תשובה תוך שניות, בכל שעה.", image: "https://randomuser.me/api/portraits/men/9.jpg", name: "דוד אלון", role: "חברת הייטק" },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

/* ── Mini Mockups ────────────────────────────────── */

function ChatMockup() {
  return (
    <div className="bg-gray-50/80 rounded-2xl p-4 space-y-2.5 text-[11px]" dir="rtl">
      <div className="flex justify-start">
        <div className="bg-gradient-to-r from-[#2e90fa] to-[#5a7af7] text-white px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
          מה שעות הפעילות שלכם?
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-white border border-gray-100 px-3.5 py-2 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
          אנחנו פתוחים א׳-ה׳ 9:00-18:00
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-gradient-to-r from-[#2e90fa] to-[#5a7af7] text-white px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
          ומשלוחים?
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-white border border-gray-100 px-3.5 py-2 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
          משלוח חינם מעל 200₪, 2-3 ימי עסקים
        </div>
      </div>
    </div>
  )
}

function AnalyticsMockup() {
  return (
    <div className="bg-gray-50/80 rounded-2xl p-4 space-y-2" dir="rtl">
      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
        <span className="font-semibold text-gray-700">שיחות השבוע</span>
        <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">+23%</span>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {[35, 52, 41, 68, 55, 73, 89].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
            className="flex-1 rounded-md bg-gradient-to-t from-[#2e90fa] to-[#7c3aed] opacity-80"
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 font-medium">
        <span>א׳</span><span>ב׳</span><span>ג׳</span><span>ד׳</span><span>ה׳</span><span>ו׳</span><span>ש׳</span>
      </div>
    </div>
  )
}

function NotificationMockup() {
  return (
    <div className="space-y-2" dir="rtl">
      {[
        { icon: Bell, text: "לקוח חדש שאל על החזרות", time: "עכשיו", color: "bg-blue-50/80 border-blue-100" },
        { icon: Check, text: 'הבוט ענה ל-12 שאלות היום', time: "לפני שעה", color: "bg-emerald-50/80 border-emerald-100" },
        { icon: UserCheck, text: "בקשה לנציג — מועברת אליך", time: "לפני 2 שעות", color: "bg-amber-50/80 border-amber-100" },
      ].map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.15 }}
          className={`${n.color} border rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-[11px]`}
        >
          <n.icon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
          <span className="flex-1 font-medium text-gray-700">{n.text}</span>
          <span className="text-gray-400 text-[9px] shrink-0">{n.time}</span>
        </motion.div>
      ))}
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-100 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#2e90fa]/20 transition-all duration-300">
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

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-8%] w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(46,144,250,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-8%] w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-[45%] left-[25%] w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(46,144,250,0.05) 0%, transparent 70%)' }} />
      </div>

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
                <SheetContent side="right" className="w-72">
                  <nav className="flex flex-col gap-4 mt-8">
                    <a href="#features" className="text-lg text-gray-700 hover:text-[#2e90fa]">פיצ׳רים</a>
                    <a href="#how" className="text-lg text-gray-700 hover:text-[#2e90fa]">איך זה עובד</a>
                    <a href="#pricing" className="text-lg text-gray-700 hover:text-[#2e90fa]">תוכניות</a>
                    <a href="#faq" className="text-lg text-gray-700 hover:text-[#2e90fa]">שאלות</a>
                    <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                      <Link href="/login"><Button variant="outline" className="w-full">התחברות</Button></Link>
                      <Link href="/signup">
                        <Button className="w-full border-0 text-white" style={{ background: 'linear-gradient(135deg, #2e90fa 0%, #5a7af7 100%)' }}>
                          נסה ב-₪1
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════ */}
      {/* 2. HERO                                         */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28">
        {/* Hero glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[800px] -z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(46,144,250,0.07) 0%, transparent 65%)' }} />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <div className="lg:col-span-7 text-center lg:text-right">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-sm mb-8 font-medium"
                  style={{
                    background: 'rgba(46,144,250,0.06)',
                    border: '1px solid rgba(46,144,250,0.12)',
                    color: '#2e90fa',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  הפלטפורמה #1 לבוטים חכמים לעסקים
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[2.75rem] md:text-[3.5rem] lg:text-[4.25rem] font-extrabold text-gray-900 mb-6 leading-[1.08]"
                style={{ letterSpacing: '-0.03em' }}
              >
                בוט AI שעונה ב
                <br />
                <RotatingText />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-lg md:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0"
              >
                בוט AI שמכיר את העסק שלך, עונה ללקוחות בוואטסאפ ובאימייל,
                ומעביר לנציג כשצריך. בלי קוד, בלי מתכנתים.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-base px-10 py-7 text-white text-lg rounded-2xl border-0 font-semibold transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #2e90fa 0%, #5a7af7 100%)',
                      boxShadow: '0 8px 30px rgba(46,144,250,0.35)',
                    }}
                  >
                    נסה ב-₪1
                    <ArrowLeft className="h-5 w-5 mr-2" />
                  </Button>
                </Link>
                <Link href="#how">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 py-7 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 gap-2 rounded-2xl transition-all duration-300"
                  >
                    <Play className="h-4 w-4" /> ראה איך עובד
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-5 md:gap-7 text-sm text-gray-500"
              >
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#2e90fa]" />7 ימי ניסיון ב-₪1</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#2e90fa]" />התקנה ב-5 דקות</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#2e90fa]" />תמיכה בעברית</span>
              </motion.div>
            </div>

            {/* Interactive Chat Demo */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:col-span-5 hidden lg:block"
            >
              <HeroChat />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo — mobile only */}
      <section className="max-w-3xl mx-auto px-6 pb-20 lg:hidden">
        <InteractiveDemo />
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 3. SOCIAL PROOF STATS                           */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-16 border-y" style={{ borderColor: 'rgba(0,0,0,0.04)', background: 'linear-gradient(180deg, rgba(249,250,251,0.5) 0%, white 100%)' }}>
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {[
              { value: "500+", label: "עסקים משתמשים", icon: Users },
              { value: "50K+", label: "הודעות בחודש", icon: MessageSquare },
              { value: "4.9/5", label: "שביעות רצון", icon: Star },
              { value: "<2 דק׳", label: "זמן תגובה ממוצע", icon: Clock },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.1} className="text-center">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3"
                  style={{ background: 'rgba(46,144,250,0.06)' }}
                >
                  <s.icon className="h-5 w-5 text-[#2e90fa]" />
                </div>
                <div
                  className="text-3xl md:text-4xl font-extrabold mb-1"
                  style={{ background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}
                >
                  {s.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">{s.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 4. FEATURES                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 py-28">
        <FadeIn className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm mb-5 font-medium"
            style={{ background: 'rgba(46,144,250,0.06)', border: '1px solid rgba(46,144,250,0.1)', color: '#2e90fa' }}
          >
            <Sparkles className="h-4 w-4" /> פיצ׳רים
          </div>
          <h2
            className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5"
            style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
          >
            הכל מה שהעסק שלך צריך{" "}
            <span style={{ background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              במקום אחד
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">מערכת אחת שמנהלת את כל התקשורת עם הלקוחות</p>
        </FadeIn>

        {/* 2 Big Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <FadeIn delay={0.1}>
            <div
              className="rounded-2xl overflow-hidden p-6 md:p-8 h-full"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #2e90fa, #5a7af7)', boxShadow: '0 4px 12px rgba(46,144,250,0.25)' }}
                >
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-[#2e90fa] bg-blue-50 px-2.5 py-1 rounded-full">הכי פופולרי</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>בוט שעונה כמוך</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                הבוט לומד את הטון, המדיניות והשאלות הנפוצות. כשלקוח שואל — הבוט עונה בדיוק כמוך.
              </p>
              <ChatMockup />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div
              className="rounded-2xl overflow-hidden p-6 md:p-8 h-full"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}
                >
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>אנליטיקס בזמן אמת</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                ראה מה שואלים, כמה שיחות, ניתוח רגש, ושביעות רצון — הכל בדשבורד אחד.
              </p>
              <AnalyticsMockup />
            </div>
          </FadeIn>
        </div>

        {/* 3 Small Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Bell,
              gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              shadow: 'rgba(245,158,11,0.25)',
              title: "התראות חכמות",
              desc: "קבל התראות בזמן אמת כשלקוח מבקש נציג או כשיש שאלה חדשה.",
              mockup: <NotificationMockup />,
            },
            {
              icon: Zap,
              gradient: 'linear-gradient(135deg, #2e90fa, #7c3aed)',
              shadow: 'rgba(46,144,250,0.25)',
              title: "AI ב-3 שכבות",
              desc: "חיפוש FAQ, תשובה AI, העברה לנציג. הבוט תמיד יודע מה לעשות.",
              mockup: (
                <div className="space-y-2.5 mt-1">
                  {[
                    { layer: "FAQ Match", pct: "60%", from: "#2e90fa", to: "#5a7af7" },
                    { layer: "AI Response", pct: "30%", from: "#7c3aed", to: "#a855f7" },
                    { layer: "Agent Transfer", pct: "10%", from: "#ec4899", to: "#f472b6" },
                  ].map((l, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] text-gray-500 mb-0.5 font-medium"><span>{l.layer}</span><span>{l.pct}</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: l.pct }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                          className="h-2 rounded-full"
                          style={{ background: `linear-gradient(90deg, ${l.from}, ${l.to})` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              icon: Globe,
              gradient: 'linear-gradient(135deg, #10b981, #059669)',
              shadow: 'rgba(16,185,129,0.25)',
              title: "רב-שפתי",
              desc: "הבוט מזהה שפה אוטומטית ועונה בעברית, אנגלית וערבית.",
              mockup: (
                <div className="space-y-2 mt-1">
                  {[
                    { lang: "עברית", ex: "שלום! איך אפשר לעזור?", flag: "🇮🇱" },
                    { lang: "English", ex: "Hi! How can I help?", flag: "🇬🇧" },
                    { lang: "العربية", ex: "!مرحبا! كيف يمكنني المساعدة", flag: "🇸🇦" },
                  ].map((l, i) => (
                    <div key={i} className="bg-gray-50/80 rounded-xl px-3.5 py-2 text-[11px] flex items-center gap-2">
                      <span className="text-base">{l.flag}</span>
                      <span className="font-semibold text-gray-600">{l.lang}:</span>
                      <span className="text-gray-400">{l.ex}</span>
                    </div>
                  ))}
                </div>
              ),
            },
          ].map((card, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.1}>
              <div
                className="rounded-2xl p-6 md:p-7 h-full"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: card.gradient, boxShadow: `0 4px 12px ${card.shadow}` }}
                >
                  <card.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.015em' }}>{card.title}</h3>
                <p className="text-gray-500 text-sm mb-3 leading-relaxed">{card.desc}</p>
                {card.mockup}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 5. WHATSAPP PHONE DEMO                          */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-6 pb-28">
        <FadeIn>
          <div
            className="rounded-3xl p-8 md:p-14 grid md:grid-cols-2 gap-10 items-center"
            style={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <div className="order-2 md:order-1 flex justify-center">
              <LiveChatDemo />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#059669' }}
              >
                <Smartphone className="h-3.5 w-3.5" /> WhatsApp Ready
              </div>
              <h3
                className="text-2xl md:text-3xl font-extrabold text-gray-900"
                style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
              >
                בוט שמדבר כמוך בוואטסאפ
              </h3>
              <p className="text-gray-500 leading-relaxed text-base">
                כשלקוח שולח הודעה בוואטסאפ, הבוט עונה מיד עם תשובה מותאמת אישית — על בסיס ה-FAQ, המדיניות, והטון שלך.
              </p>
              <ul className="space-y-3">
                {["תשובות מותאמות אישית לעסק", "זיכרון שיחות ללקוחות חוזרים", "העברה לנציג בלחיצה", "ניתוח רגש בזמן אמת"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(46,144,250,0.08)' }}
                    >
                      <Check className="h-3.5 w-3.5 text-[#2e90fa]" />
                    </div>
                    <span className="text-gray-600 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 6. HOW IT WORKS                                 */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="how" className="py-28" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, white 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <h2
              className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5"
              style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
            >
              איך זה עובד?
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">3 צעדים פשוטים ויש לך בוט חכם שעובד בשבילך</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "הירשם והגדר", desc: "מלא פרטי עסק, FAQ ומדיניות דרך אשף פשוט. ה-AI גם יכול ליצור FAQ אוטומטית מהאתר שלך.", icon: Code, gradient: 'linear-gradient(135deg, #2e90fa, #5a7af7)', shadow: 'rgba(46,144,250,0.3)' },
              { step: "02", title: "הבוט לומד", desc: "ה-AI לומד את העסק שלך — הטון, המדיניות, והתשובות. תוך דקות הוא מוכן.", icon: Bot, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', shadow: 'rgba(124,58,237,0.3)' },
              { step: "03", title: "חבר ותתחיל", desc: "חבר וואטסאפ, אימייל, או צ׳אט באתר. הבוט מתחיל לעבוד 24/7.", icon: Zap, gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16,185,129,0.3)' },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div
                  className="relative rounded-2xl p-8 md:p-10 h-full"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="absolute -top-5 right-8 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: s.gradient, boxShadow: `0 6px 16px ${s.shadow}` }}
                  >
                    {s.step}
                  </div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mt-2"
                    style={{ background: `${s.gradient.replace('linear-gradient', 'linear-gradient').replace(')', ', 0.08)')}`.replace(/linear-gradient\(135deg, (#\w+), (#\w+), 0\.08\)/, 'rgba(46,144,250,0.06)') }}
                  >
                    <s.icon className="h-6 w-6" style={{ color: s.gradient.includes('2e90fa') ? '#2e90fa' : s.gradient.includes('7c3aed') ? '#7c3aed' : '#10b981' }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.015em' }}>{s.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 7. COMPARISON TABLE                             */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="max-w-[900px] mx-auto px-6 py-28">
        <FadeIn className="text-center mb-14">
          <h2
            className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5"
            style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
          >
            למה BotPress AI מנצח{" "}
            <span style={{ background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              כל מתחרה
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div
              className="grid grid-cols-3 text-center text-xs md:text-sm font-semibold border-b"
              style={{ borderColor: 'rgba(0,0,0,0.04)', background: 'rgba(249,250,251,0.8)' }}
            >
              <div className="p-4 md:p-5 text-gray-500">פיצ׳ר</div>
              <div
                className="p-4 md:p-5 font-bold"
                style={{ background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                BotPress AI
              </div>
              <div className="p-4 md:p-5 text-gray-400">אחרים</div>
            </div>
            {[
              { feature: "הקמה ב-5 דקות", us: true, them: false },
              { feature: "AI ב-3 שכבות", us: true, them: false },
              { feature: "תמיכה בעברית", us: true, them: false },
              { feature: "זיכרון שיחות", us: true, them: false },
              { feature: "ניתוח רגש", us: true, them: false },
              { feature: "White Label", us: true, them: true },
              { feature: "תוכנית ניסיון ב-₪1", us: true, them: false },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 text-center text-sm border-b last:border-0"
                style={{ borderColor: 'rgba(0,0,0,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(249,250,251,0.4)' }}
              >
                <div className="p-3 md:p-4 text-gray-600 text-right pr-4 md:pr-6 text-xs md:text-sm font-medium">{row.feature}</div>
                <div className="p-3 md:p-4 flex items-center justify-center">
                  {row.us ? (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(46,144,250,0.1)' }}>
                      <Check className="h-3.5 w-3.5 text-[#2e90fa]" />
                    </div>
                  ) : (
                    <X className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                <div className="p-3 md:p-4 flex items-center justify-center">
                  {row.them ? <Check className="h-4 w-4 text-gray-300" /> : <X className="h-4 w-4 text-gray-300" />}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 8. TESTIMONIALS                                 */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, white 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm mb-5 font-medium"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', color: '#d97706' }}
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> ביקורות
            </div>
            <h2
              className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5"
              style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
            >
              עסקים אמיתיים,{" "}
              <span style={{ background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                תוצאות אמיתיות
              </span>
            </h2>
          </FadeIn>

          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[600px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 9. PRICING                                      */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-6 py-28">
        <FadeIn className="text-center mb-20">
          <h2
            className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5"
            style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
          >
            תוכניות ומחירים
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">נסה 7 ימים ב-₪1 בלבד, בחר תוכנית כשמתאים לך</p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 pt-4 max-w-[1000px] mx-auto">
          {[
            { name: "ניסיון", price: "1", trial: true, popular: false, features: ["7 ימי ניסיון מלא", "100 הודעות", "כל הערוצים", "FAQ + AI מלא"] },
            { name: "בסיסי", price: "99", trial: false, popular: true, features: ["1,000 הודעות/חודש", "כל הערוצים", "AI מתקדם + זיכרון", "אנליטיקס מלא", "סיכומים אוטומטיים"] },
            { name: "פרימיום", price: "299", trial: false, popular: false, features: ["הודעות ללא הגבלה", "כל הערוצים", "White Label", "תמיכה מועדפת", "AI מתקדם + זיכרון"] },
          ].map((plan, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative rounded-2xl p-7 md:p-8 h-full ${plan.popular ? 'ring-2 ring-[#2e90fa]' : ''}`}
                style={{
                  background: plan.popular ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                  border: plan.popular ? undefined : '1px solid rgba(0,0,0,0.04)',
                  boxShadow: plan.popular ? '0 20px 50px rgba(46,144,250,0.12), 0 4px 12px rgba(46,144,250,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 right-6 z-10">
                    <span
                      className="text-white text-xs px-5 py-1.5 rounded-full font-semibold"
                      style={{ background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', boxShadow: '0 4px 14px rgba(46,144,250,0.35)' }}
                    >
                      הכי פופולרי
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-5">
                  <span
                    className="text-4xl font-extrabold"
                    style={plan.popular ? { background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#111827' }}
                  >
                    {plan.trial ? "₪1" : `₪${plan.price}`}
                  </span>
                  {plan.trial
                    ? <span className="text-[#2e90fa] text-sm font-semibold mr-1">/7 ימי ניסיון</span>
                    : <span className="text-gray-400 text-sm mr-1">/חודש</span>
                  }
                </div>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(46,144,250,0.08)' }}
                      >
                        <Check className="h-3 w-3 text-[#2e90fa]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    className={`w-full rounded-xl py-6 font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'text-white border-0 hover:scale-[1.02]'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#2e90fa] hover:text-[#2e90fa]'
                    }`}
                    style={plan.popular ? {
                      background: 'linear-gradient(135deg, #2e90fa 0%, #5a7af7 100%)',
                      boxShadow: '0 6px 20px rgba(46,144,250,0.3)',
                    } : undefined}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.trial ? "התחל ניסיון ב-₪1" : "בחר תוכנית"}
                  </Button>
                </Link>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 10. FAQ                                         */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="faq" className="py-28" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, white 100%)' }}>
        <div className="max-w-[700px] mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2
              className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5"
              style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
            >
              שאלות{" "}
              <span style={{ background: 'linear-gradient(135deg, #2e90fa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                נפוצות
              </span>
            </h2>
          </FadeIn>

          <div className="space-y-3">
            {[
              { q: "האם צריך ידע טכני?", a: "בכלל לא! אשף ההגדרה מנחה אותך צעד אחרי צעד, ותוך 5 דקות הבוט מוכן." },
              { q: "איך הבוט יודע לענות?", a: "3 שכבות: קודם FAQ, אחר כך AI עם כל המידע על העסק, ואם לא מצליח — מעביר לנציג." },
              { q: "אפשר לבדוק לפני שמחברים?", a: "יש סימולטור מובנה — שלח הודעות וראה איך הבוט עונה, כולל מאיזו שכבה." },
              { q: "כמה עולה?", a: "יש תוכנית ניסיון ב-₪1 ל-7 ימים עם 100 הודעות. תוכניות משודרגות מ-99₪/חודש." },
              { q: "באילו שפות הבוט תומך?", a: "עברית, אנגלית וערבית — הבוט מזהה אוטומטית ועונה באותה שפה." },
              { q: "מה כשהבוט לא יודע?", a: "מעביר לנציג ומודיע לך בזמן אמת. אתה עונה ישירות מהדשבורד." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <FAQItem q={item.q} a={item.a} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 11. CTA                                         */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="max-w-[1100px] mx-auto px-6 pb-28">
        <FadeIn>
          <div
            className="rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #2e90fa 0%, #5a7af7 40%, #7c3aed 100%)',
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full opacity-10 bg-white blur-[60px]" />
            <div className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] rounded-full opacity-10 bg-white blur-[50px]" />

            <div className="relative z-10">
              <h2
                className="text-3xl md:text-[2.75rem] font-extrabold text-white mb-5"
                style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
              >
                מוכן לשדרג את השירות?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto">
                הצטרף ל-500+ עסקים שכבר חוסכים שעות כל יום עם בוט AI חכם
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-base px-12 py-7 text-lg rounded-2xl border-0 font-semibold transition-all duration-300 hover:scale-[1.03]"
                  style={{
                    background: 'white',
                    color: '#2e90fa',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  התחל ניסיון ב-₪1
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Button>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/70">
                <span className="flex items-center gap-2"><Check className="h-4 w-4" />ללא התחייבות</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4" />ביטול בכל עת</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4" />התקנה ב-5 דקות</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 12. FOOTER                                      */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="border-t py-14" style={{ borderColor: 'rgba(0,0,0,0.04)', background: 'rgba(249,250,251,0.5)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/images/logo.png" alt="BotPress AI" width={30} height={30} className="rounded-lg" />
                <span className="font-bold text-gray-900">BotPress AI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                בוטים חכמים מבוססי AI לעסקים.
                <br />תשובות מיידיות, 24/7.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">מוצר</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-[#2e90fa] transition-colors">פיצ׳רים</a></li>
                <li><a href="#pricing" className="hover:text-[#2e90fa] transition-colors">מחירים</a></li>
                <li><a href="#faq" className="hover:text-[#2e90fa] transition-colors">שאלות נפוצות</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">חברה</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><span className="cursor-pointer hover:text-[#2e90fa] transition-colors">אודות</span></li>
                <li><span className="cursor-pointer hover:text-[#2e90fa] transition-colors">בלוג</span></li>
                <li><span className="cursor-pointer hover:text-[#2e90fa] transition-colors">צור קשר</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">משפטי</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><Link href="/terms" className="hover:text-[#2e90fa] transition-colors">תנאי שימוש</Link></li>
                <li><Link href="/privacy" className="hover:text-[#2e90fa] transition-colors">מדיניות פרטיות</Link></li>
              </ul>
            </div>
          </div>
          <div
            className="border-t pt-7 text-center text-sm text-gray-400"
            style={{ borderColor: 'rgba(0,0,0,0.04)' }}
          >
            &copy; 2026 BotPress AI. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  )
}
