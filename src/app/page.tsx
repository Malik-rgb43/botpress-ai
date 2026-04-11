'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, X, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { motion, type Variants } from 'framer-motion'
import HeroChat from "@/components/landing/hero-chat"
import RotatingText from "@/components/landing/rotating-text"
import { LandingChatWidget } from "@/components/landing/chat-widget"
import { StepUrlTyping, StepBotLearning, StepChannelConnect } from "@/components/landing/step-animations"
import { FeatureShowcase } from "@/components/landing/feature-showcase"
import { AnimatedCounter, FAQItem, FloatingOrb } from "@/components/landing/shared"

/* ── Framer Motion Variants ──────────────────── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
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
      <section className="py-10 bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-100 overflow-hidden">
        <style>{`
          @keyframes scroll-rtl {
            0% { transform: translateX(0); }
            100% { transform: translateX(50%); }
          }
        `}</style>
        <motion.p
          className="text-center text-sm text-gray-400 font-medium mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          עסקים מכל התחומים כבר משתמשים בפלטפורמה
        </motion.p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-transparent to-white z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-transparent to-white z-10 pointer-events-none" />
          <div
            className="flex gap-5 w-max"
            style={{ animation: 'scroll-rtl 30s linear infinite' }}
          >
            {[...Array(3)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-5">
                {[
                  { name: 'מסעדות', icon: '🍽️', count: '84' },
                  { name: 'קליניקות', icon: '🏥', count: '62' },
                  { name: 'חנויות אונליין', icon: '🛍️', count: '120' },
                  { name: 'משרדי עו״ד', icon: '⚖️', count: '45' },
                  { name: 'סטודיואים', icon: '🎨', count: '38' },
                  { name: 'סוכנויות', icon: '🏢', count: '55' },
                  { name: 'מכוני כושר', icon: '💪', count: '29' },
                  { name: 'יועצים', icon: '💼', count: '41' },
                  { name: 'חינוך', icon: '📚', count: '33' },
                  { name: 'נדל״ן', icon: '🏠', count: '27' },
                ].map((biz) => (
                  <div
                    key={`${setIdx}-${biz.name}`}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm shrink-0 cursor-default min-w-[160px]"
                  >
                    <span className="text-xl">{biz.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{biz.name}</span>
                      <span className="text-[11px] text-gray-400 block">{biz.count} עסקים</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURES — INTERACTIVE SHOWCASE                  */}
      {/* ═══════════════════════════════════════════════ */}
      <FeatureShowcase />

      {/* ═══════════════════════════════════════════════ */}
      {/* MORE CAPABILITIES — Icon grid                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              וזה רק ההתחלה
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-base max-w-md mx-auto">עוד יכולות שעושות את ההבדל בין בוט בסיסי למערכת שירות מלאה</motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {[
              { icon: '🧑‍💼', title: 'מעבר לנציג', desc: 'העברה חלקה לנציג אנושי כשצריך' },
              { icon: '🧠', title: 'זיכרון שיחות', desc: 'הבוט זוכר לקוחות חוזרים' },
              { icon: '🎮', title: 'סימולטור בוט', desc: 'בדוק את הבוט לפני שהוא יוצא לאוויר' },
              { icon: '🌍', title: 'רב-שפתי', desc: 'עברית, אנגלית וערבית אוטומטית' },
              { icon: '📊', title: 'דוחות אוטומטיים', desc: 'סיכום יומי/שבועי/חודשי במייל' },
              { icon: '⚡', title: 'תשובות מהירות', desc: 'כפתורי בחירה שמקצרים שיחות' },
            ].map((cap, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group text-center p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{cap.icon}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{cap.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="how" className="py-24 md:py-32 bg-gray-50/50">
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
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <div className="relative">
              {/* Connecting line across all 3 steps (desktop only) — RTL: right-to-left flow */}
              <div className="hidden md:block absolute top-6 right-[16.67%] left-[16.67%] h-[2px]">
                <div className="w-full h-full bg-gradient-to-l from-blue-200 via-purple-200 to-emerald-200" />
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                {([
                  {
                    num: '1',
                    title: 'הכנס את כתובת האתר',
                    desc: 'הבוט סורק את כל העמודים ולומד את המידע אוטומטית.',
                    Visual: StepUrlTyping,
                    gradient: 'from-blue-500 to-blue-600',
                    shadow: 'shadow-blue-500/25',
                  },
                  {
                    num: '2',
                    title: 'התאם את הבוט',
                    desc: 'בחר טון דיבור, שם, צבעים — התאמה מלאה לזהות העסק שלך.',
                    Visual: StepBotLearning,
                    gradient: 'from-purple-500 to-purple-600',
                    shadow: 'shadow-purple-500/25',
                  },
                  {
                    num: '3',
                    title: 'שלב ותתחיל לקבל לקוחות',
                    desc: 'חבר וואטסאפ, אימייל או הטמע ווידג\'ט — הבוט עובד תוך דקות.',
                    Visual: StepChannelConnect,
                    gradient: 'from-emerald-500 to-emerald-600',
                    shadow: 'shadow-emerald-500/25',
                  },
                ] as const).map((step, i) => (
                  <motion.div key={i} variants={fadeInUp} className="text-center relative">
                    {/* Step number circle */}
                    <div className={`relative z-10 mx-auto w-12 h-12 rounded-full bg-gradient-to-br ${step.gradient} text-white font-bold text-lg flex items-center justify-center shadow-lg ${step.shadow} mb-6`}>
                      {step.num}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mb-6 max-w-[280px] mx-auto leading-relaxed">{step.desc}</p>

                    {/* Animation in a subtle container */}
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 mx-auto max-w-[280px]">
                      <step.Visual />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
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
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Subtle background accents */}
        <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[10%] right-[-5%] w-[350px] h-[350px] rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', filter: 'blur(70px)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50/50 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-sm text-purple-700 font-semibold">לקוחות מרוצים</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              מה אומרים <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">הלקוחות שלנו</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-lg max-w-lg mx-auto">עסקים אמיתיים שכבר חוסכים שעות ביום עם הבוט החכם</motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
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
                stat: '80%',
                statLabel: 'מענה אוטומטי',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                name: 'יוסי לוי',
                role: 'מנהל מסעדה',
                text: 'ההגדרה הייתה פשוטה מטורף. תוך 10 דקות היה לי בוט שעונה על כל שאלה — שעות פעילות, תפריט, הזמנות.',
                rating: 5,
                stat: '10 דק׳',
                statLabel: 'זמן הקמה',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                name: 'מיכל אברהם',
                role: 'חנות אונליין',
                text: 'הסריקה האוטומטית של האתר חסכה לי ימים של עבודה. הבוט למד הכל לבד ועונה מדויק.',
                rating: 5,
                stat: '100%',
                statLabel: 'דיוק תשובות',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((testimonial, i) => (
              <motion.div key={i} variants={fadeInUp} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <div className="group rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-500 p-7 h-full flex flex-col relative overflow-hidden">
                  {/* Hover glow accent */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l ${testimonial.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Key stat highlight */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, j) => (
                        <motion.span
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + j * 0.08 }}
                          className="text-amber-400 text-sm"
                        >★</motion.span>
                      ))}
                    </div>
                    <div className="text-left">
                      <div className={`text-lg font-black bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent leading-none`}>{testimonial.stat}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{testimonial.statLabel}</div>
                    </div>
                  </div>

                  {/* Quote icon */}
                  <div className="mb-3">
                    <svg className="w-8 h-8 text-gray-100 group-hover:text-blue-100 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  </div>

                  {/* Quote text */}
                  <p className="text-gray-600 text-[15px] leading-relaxed flex-1 mb-6">{testimonial.text}</p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${testimonial.gradient} p-[2px] group-hover:scale-105 transition-transform duration-300`}>
                      <div className={`w-full h-full rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust bar */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {['D', 'Y', 'M', 'A', 'R'].map((letter, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">{letter}</div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">מצטרפים כל יום</span>
              </div>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">★★★★★</span>
                <span className="text-sm text-gray-600 font-medium">דירוג 4.9/5</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FAQ                                              */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="faq" className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Subtle accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* Left side — sticky heading */}
            <motion.div
              className="md:col-span-2 md:sticky md:top-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50/50 mb-5">
                <span className="text-sm text-blue-700 font-semibold">שאלות נפוצות</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                יש לך שאלה?{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">יש לנו תשובה.</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-gray-500 leading-relaxed mb-6">
                לא מצאת תשובה? אנחנו כאן בשבילך.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link href="/signup">
                  <Button className="rounded-xl px-6 py-5 font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                    דברו איתנו →
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side — FAQ items */}
            <div className="md:col-span-3 space-y-3">
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
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FINAL CTA                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #080810 0%, #0f172a 100%)' }}>
        {/* Animated gradient orbs */}
        <FloatingOrb className="top-[-20%] right-[10%]" color="rgba(37,99,235,0.15)" size={500} blur={100} />
        <FloatingOrb className="bottom-[-20%] left-[10%]" color="rgba(124,58,237,0.12)" size={400} blur={80} />
        <FloatingOrb className="top-[30%] left-[50%]" color="rgba(16,185,129,0.06)" size={300} blur={90} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div
          className="relative z-10 max-w-[700px] mx-auto px-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {/* Floating badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-gray-300 font-medium">עסקים חדשים מצטרפים כל יום</span>
          </motion.div>

          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
            מוכן <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">להתחיל?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-lg mb-10 max-w-md mx-auto">תנו לבוט לעבוד בשבילכם — 24/7, בלי הפסקה. התחילו היום ותראו תוצאות מחר.</motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="rounded-2xl px-10 py-7 text-lg border-0 text-white font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 shadow-[0_8px_32px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.5)] transition-shadow"
                  style={{ backgroundSize: '200% auto' }}
                >
                  התחל בחינם — ₪1 בלבד
                </Button>
              </motion.div>
            </Link>
            <a href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-8 py-7 text-lg border-white/15 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/25 font-medium transition-all"
              >
                צפה בתוכניות
              </Button>
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />ללא התחייבות</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />ביטול בכל רגע</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />התקנה ב-3 דקות</span>
          </motion.div>
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

      {/* Floating Chat Widget — knows everything about BotPress AI */}
      <LandingChatWidget />
    </div>
  )
}
