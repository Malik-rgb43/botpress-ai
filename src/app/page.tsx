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
import { AnimateOnScroll, AnimateCounter } from "@/components/ui/animate-on-scroll"
import LiveChatDemo from "@/components/landing/live-chat-demo"
import RotatingText from "@/components/landing/rotating-text"
import InteractiveDemo from "@/components/landing/interactive-demo"
import HeroChat from "@/components/landing/hero-chat"
import { TestimonialsColumn } from "@/components/ui/testimonials-columns"
import { HandWrittenTitle } from "@/components/ui/hand-writing-text"
import { AnimatedFeatures } from "@/components/landing/animated-features"
import { HeroStatsCard } from "@/components/landing/hero-stats-card"

/* ── Testimonials Data ──────────────────────────────── */

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

/* ── Mini Mockups ────────────────────────────────────── */

function ChatMockup() {
  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-[11px]" dir="rtl">
      <div className="flex justify-start"><div className="gradient-primary text-white px-3 py-1.5 rounded-xl rounded-tr-sm max-w-[80%]">מה שעות הפעילות שלכם?</div></div>
      <div className="flex justify-end"><div className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl rounded-tl-sm max-w-[80%]">אנחנו פתוחים א׳-ה׳ 9:00-18:00 ✨</div></div>
      <div className="flex justify-start"><div className="gradient-primary text-white px-3 py-1.5 rounded-xl rounded-tr-sm max-w-[80%]">ומשלוחים?</div></div>
      <div className="flex justify-end"><div className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl rounded-tl-sm max-w-[80%]">משלוח חינם מעל 200₪, 2-3 ימי עסקים 🚚</div></div>
    </div>
  )
}

function AnalyticsMockup() {
  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2" dir="rtl">
      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
        <span className="font-medium">שיחות השבוע</span>
        <span className="text-green-500 font-medium">+23%</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {[35, 52, 41, 68, 55, 73, 89].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm gradient-primary opacity-70" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-400">
        <span>א׳</span><span>ב׳</span><span>ג׳</span><span>ד׳</span><span>ה׳</span><span>ו׳</span><span>ש׳</span>
      </div>
    </div>
  )
}

function NotificationMockup() {
  return (
    <div className="space-y-2" dir="rtl">
      {[
        { icon: "🔔", text: "לקוח חדש שאל על החזרות", time: "עכשיו", color: "bg-blue-50 border-blue-200" },
        { icon: "✅", text: 'הבוט ענה ל-12 שאלות היום', time: "לפני שעה", color: "bg-green-50 border-green-200" },
        { icon: "👤", text: "בקשה לנציג — מועברת אליך", time: "לפני 2 שעות", color: "bg-orange-50 border-orange-200" },
      ].map((n, i) => (
        <div key={i} className={`${n.color} border rounded-lg px-3 py-2 flex items-center gap-2 text-[11px]`}>
          <span>{n.icon}</span>
          <span className="flex-1 font-medium text-gray-700">{n.text}</span>
          <span className="text-gray-400 text-[9px] shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-blue-100/60 rounded-xl overflow-hidden bg-white shadow-sm hover:border-blue-200 transition-colors">
      <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-blue-50/30 transition-colors">
        <span className="font-medium text-gray-900">{q}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 mr-3" />
      </summary>
      <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{a}</div>
    </details>
  )
}

/* ── Page ────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4ff] via-[#f8fafd] to-white relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[120px] animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-200/15 rounded-full blur-[100px] animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-indigo-200/10 rounded-full blur-[80px] animate-[float_30s_ease-in-out_infinite]" />
      </div>
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="BotPress AI" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">BotPress AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "#features", label: "פיצ׳רים" },
              { href: "#how", label: "איך זה עובד" },
              { href: "#pricing", label: "תוכניות" },
              { href: "#faq", label: "שאלות" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="px-3.5 py-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50/50">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login"><Button variant="ghost" size="sm" className="hidden md:inline-flex text-gray-500 hover:text-blue-600">התחברות</Button></Link>
            <Link href="/signup"><Button size="sm" className="hidden md:inline-flex rounded-xl px-5 gradient-primary border-0 shadow-md shadow-blue-500/20">נסה ב-₪1</Button></Link>
            <Sheet>
              <SheetTrigger className="md:hidden p-2 text-gray-500 hover:text-blue-600" aria-label="תפריט ניווט">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-4 mt-8">
                  <a href="#features" className="text-lg text-gray-700 hover:text-blue-600">פיצ׳רים</a>
                  <a href="#how" className="text-lg text-gray-700 hover:text-blue-600">איך זה עובד</a>
                  <a href="#pricing" className="text-lg text-gray-700 hover:text-blue-600">תוכניות</a>
                  <a href="#faq" className="text-lg text-gray-700 hover:text-blue-600">שאלות</a>
                  <div className="border-t border-blue-100 pt-4 mt-2 space-y-3">
                    <Link href="/login"><Button variant="outline" className="w-full">התחברות</Button></Link>
                    <Link href="/signup"><Button className="w-full gradient-primary border-0">נסה ב-₪1</Button></Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ───── Hero ───── */}
      <section id="main-content" className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text side */}
            <div className="lg:col-span-7 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-600 mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>הפלטפורמה לבוטים חכמים לעסקים</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance text-gray-900 mb-6 leading-[1.1]">
                בוט AI שעונה ב
                <br />
                <RotatingText />
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
                בוט AI שמכיר את העסק שלך, עונה ללקוחות בוואטסאפ ובאימייל,
                ומעביר לנציג כשצריך. בלי קוד, בלי מתכנתים.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
                <Link href="/signup">
                  <Button size="lg" className="text-base px-10 py-7 btn-premium text-white text-lg rounded-2xl">
                    נסה ב-₪1
                    <ArrowLeft className="h-5 w-5 mr-2" />
                  </Button>
                </Link>
                <Link href="#how">
                  <Button variant="outline" size="lg" className="text-base px-8 py-7 border-blue-200 text-blue-600 hover:bg-blue-50 gap-2 rounded-2xl transition-all duration-200">
                    <Play className="h-4 w-4" /> ראה איך עובד
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />7 ימי ניסיון ב-₪1</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />התקנה ב-5 דקות</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-500" />תמיכה בעברית</span>
              </div>
            </div>
            {/* Phone chat demo */}
            <div className="lg:col-span-5 hidden lg:block">
              <HeroChat />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo — mobile only (desktop shows in hero) */}
      <section className="max-w-3xl mx-auto px-6 pb-20 lg:hidden">
        <InteractiveDemo />
      </section>

      {/* Social Proof */}
      <section className="py-14 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/40 border-y border-blue-100/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            {[
              { value: "500+", label: "עסקים משתמשים", icon: Users },
              { value: "50K+", label: "הודעות בחודש", icon: MessageSquare },
              { value: "4.9/5", label: "שביעות רצון", icon: Star },
              { value: "<2 דק׳", label: "זמן תגובה", icon: Clock },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <s.icon className="h-5 w-5 text-blue-400 mb-2" />
                <div className="text-3xl font-extrabold gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Features (Rich Cards with Mockups) ───── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-600 mb-4 shadow-sm">
            <Sparkles className="h-4 w-4" /> פיצ׳רים
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-balance text-gray-900 mb-4">
            הכל מה שהעסק שלך צריך
            <span className="gradient-text"> ✦ במקום אחד</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">מערכת אחת שמנהלת את כל התקשורת עם הלקוחות</p>
        </div>

        {/* Feature cards with mockups */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="glass-card rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">הכי פופולרי</span>
              </div>
              <h3 className="text-xl font-bold text-balance text-gray-900 mb-2">בוט שעונה כמוך</h3>
              <p className="text-gray-500 text-sm mb-4">הבוט לומד את הטון, המדיניות והשאלות הנפוצות. כשלקוח שואל — הבוט עונה בדיוק כמוך.</p>
              <ChatMockup />
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-balance text-gray-900 mb-2">אנליטיקס בזמן אמת</h3>
              <p className="text-gray-500 text-sm mb-4">ראה מה שואלים, כמה שיחות, ניתוח רגש, ושביעות רצון — הכל בדשבורד אחד.</p>
              <AnalyticsMockup />
            </CardContent>
          </Card>
        </div>

        {/* Feature Row 2: 3 cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="glass-card rounded-2xl">
            <CardContent className="p-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-3">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-balance text-gray-900 mb-2">התראות חכמות</h3>
              <p className="text-gray-500 text-sm mb-3">קבל התראות בזמן אמת כשלקוח מבקש נציג או כשיש שאלה חדשה.</p>
              <NotificationMockup />
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl">
            <CardContent className="p-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center mb-3">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-balance text-gray-900 mb-2">AI ב-3 שכבות</h3>
              <p className="text-gray-500 text-sm mb-3">חיפוש FAQ → תשובה AI → העברה לנציג. הבוט תמיד יודע מה לעשות.</p>
              <div className="space-y-2">
                {[
                  { layer: "FAQ Match", pct: "60%", color: "bg-blue-400" },
                  { layer: "AI Response", pct: "30%", color: "bg-indigo-400" },
                  { layer: "Agent Transfer", pct: "10%", color: "bg-violet-400" },
                ].map((l, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>{l.layer}</span><span>{l.pct}</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`${l.color} h-1.5 rounded-full`} style={{ width: l.pct }} /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl">
            <CardContent className="p-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-3">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-balance text-gray-900 mb-2">רב-שפתי</h3>
              <p className="text-gray-500 text-sm mb-3">הבוט מזהה שפה אוטומטית ועונה בעברית, אנגלית וערבית.</p>
              <div className="space-y-1.5">
                {[
                  { lang: "🇮🇱 עברית", ex: "שלום! איך אפשר לעזור?" },
                  { lang: "🇬🇧 English", ex: "Hi! How can I help?" },
                  { lang: "🇸🇦 العربية", ex: "!مرحبا! كيف يمكنني المساعدة" },
                ].map((l, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-1.5 text-[11px]">
                    <span className="font-medium text-gray-600">{l.lang}: </span>
                    <span className="text-gray-400">{l.ex}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Row 3: Full width with phone image */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl border border-blue-100/60 p-8 md:p-12">
          <div className="order-2 md:order-1 flex justify-center">
            <LiveChatDemo />
          </div>
          <div className="order-1 md:order-2 space-y-5" dir="rtl">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-600">
              <Smartphone className="h-3 w-3" /> WhatsApp Ready
            </div>
            <h3 className="text-2xl font-bold text-balance text-gray-900">בוט שמדבר כמוך בוואטסאפ</h3>
            <p className="text-gray-500 leading-relaxed">כשלקוח שולח הודעה בוואטסאפ, הבוט עונה מיד עם תשובה מותאמת אישית — על בסיס ה-FAQ, המדיניות, והטון שלך.</p>
            <ul className="space-y-2.5">
              {["תשובות מותאמות אישית לעסק", "זיכרון שיחות ללקוחות חוזרים", "העברה לנציג בלחיצה", "ניתוח רגש בזמן אמת"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-blue-600" /></div>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── How It Works (Numbered Steps) ───── */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-balance text-gray-900 mb-4">איך זה עובד?</h2>
            <p className="text-gray-500 text-lg">3 צעדים פשוטים ויש לך בוט חכם שעובד בשבילך</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "הירשם והגדר", desc: "מלא פרטי עסק, FAQ ומדיניות דרך אשף פשוט. ה-AI גם יכול ליצור FAQ אוטומטית מהאתר שלך.", icon: "📝", color: "from-blue-500 to-blue-600" },
              { step: "02", title: "הבוט לומד", desc: "ה-AI לומד את העסק שלך — הטון, המדיניות, והתשובות. תוך דקות הוא מוכן.", icon: "🤖", color: "from-indigo-500 to-indigo-600" },
              { step: "03", title: "חבר ותתחיל", desc: "חבר וואטסאפ, אימייל, או צ׳אט באתר. הבוט מתחיל לעבוד 24/7.", icon: "🚀", color: "from-violet-500 to-violet-600" },
            ].map((s, i) => (
              <div key={i} className="relative bg-[#f8fafd] rounded-2xl p-8 border border-blue-100/60">
                <div className={`absolute -top-5 right-6 w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg shadow-blue-500/20`}>
                  <span className="text-sm font-bold text-white">{s.step}</span>
                </div>
                <div className="text-3xl mb-4 mt-2">{s.icon}</div>
                <h3 className="text-xl font-bold text-balance text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Comparison Table ───── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance text-gray-900 mb-4">
            למה BotPress AI מנצח
            <span className="gradient-text"> ✦ כל מתחרה</span>
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100/60 overflow-hidden">
          <div className="grid grid-cols-3 text-center text-xs md:text-sm font-medium border-b border-blue-100 bg-gradient-to-l from-blue-50 via-indigo-50/50 to-blue-50">
            <div className="p-4 text-gray-500">פיצ׳ר</div>
            <div className="p-4 gradient-text font-bold">BotPress AI</div>
            <div className="p-4 text-gray-400">אחרים</div>
          </div>
          {[
            { feature: "הקמה ב-5 דקות", us: true, them: false },
            { feature: "AI ב-3 שכבות", us: true, them: false },
            { feature: "תמיכה בעברית", us: true, them: false },
            { feature: "זיכרון שיחות", us: true, them: false },
            { feature: "ניתוח רגש", us: true, them: false },
            { feature: "White Label", us: true, them: true },
            { feature: "תוכנית חינם", us: true, them: false },
          ].map((row, i) => (
            <div key={i} className={`grid grid-cols-3 text-center text-sm border-b border-blue-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-blue-50/20"}`}>
              <div className="p-2.5 md:p-3.5 text-gray-600 text-right pr-3 md:pr-6 text-xs md:text-sm">{row.feature}</div>
              <div className="p-3.5"><Check className={`h-5 w-5 mx-auto ${row.us ? "text-blue-500" : "text-gray-300"}`} /></div>
              <div className="p-3.5">{row.them ? <Check className="h-5 w-5 mx-auto text-gray-300" /> : <X className="h-5 w-5 mx-auto text-gray-300" />}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Testimonials ───── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-600 mb-4 shadow-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> ביקורות
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance text-gray-900 mb-4">
              עסקים אמיתיים, <span className="gradient-text">תוצאות אמיתיות</span>
            </h2>
          </div>
          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[600px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>

      {/* ───── Pricing ───── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance text-gray-900 mb-4">תוכניות ומחירים</h2>
          <p className="text-gray-500 text-lg">נסה 7 ימים ב-₪1 בלבד, בחר תוכנית כשמתאים לך</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          {[
            { name: "ניסיון", price: "1", trial: true, features: ["7 ימי ניסיון מלא", "100 הודעות", "כל הערוצים", "FAQ + AI מלא"] },
            { name: "בסיסי", price: "99", popular: true, features: ["1,000 הודעות/חודש", "כל הערוצים", "AI מתקדם + זיכרון", "אנליטיקס מלא", "סיכומים אוטומטיים"] },
            { name: "פרימיום", price: "299", features: ["הודעות ללא הגבלה", "כל הערוצים", "White Label", "תמיכה מועדפת", "AI מתקדם + זיכרון"] },
          ].map((plan, i) => (
            <Card key={i} className={`shadow-none relative bg-white overflow-visible transition-all duration-300 hover:shadow-lg ${plan.popular ? "border-2 border-blue-500 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 scale-[1.02]" : "border-blue-100/60 hover:border-blue-200"}`}>
              {plan.popular && <div className="absolute -top-4 right-4 z-10"><span className="gradient-animated text-white text-xs px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 font-medium">🔥 הכי פופולרי</span></div>}
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className={`text-4xl font-extrabold ${plan.popular ? "gradient-text" : ""}`}>{plan.trial ? "₪1" : `₪${plan.price}`}</span>
                  {plan.trial ? <span className="text-blue-500 text-sm font-medium">/7 ימי ניסיון</span> : <span className="text-gray-400 text-sm">/חודש</span>}
                </div>
                <ul className="space-y-2.5 mb-6">{plan.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-4 w-4 text-blue-500 shrink-0" />{f}</li>)}</ul>
                <Link href="/signup"><Button className={`w-full ${plan.popular ? "gradient-primary border-0 shadow-md shadow-blue-500/25" : ""}`} variant={plan.popular ? "default" : "outline"}>{plan.trial ? "התחל ניסיון ב-₪1" : "בחר תוכנית"}</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-balance text-gray-900 mb-4">
              שאלות <span className="gradient-text">✦ נפוצות</span>
            </h2>
          </div>
          <div className="space-y-3">
            <FAQItem q="האם צריך ידע טכני?" a="בכלל לא! אשף ההגדרה מנחה אותך צעד אחרי צעד, ותוך 5 דקות הבוט מוכן." />
            <FAQItem q="איך הבוט יודע לענות?" a="3 שכבות: קודם FAQ, אחר כך AI עם כל המידע על העסק, ואם לא מצליח — מעביר לנציג." />
            <FAQItem q="אפשר לבדוק לפני שמחברים?" a="יש סימולטור מובנה — שלח הודעות וראה איך הבוט עונה, כולל מאיזו שכבה." />
            <FAQItem q="כמה עולה?" a="יש תוכנית חינם עם 100 הודעות. תוכניות משודרגות מ-99₪/חודש." />
            <FAQItem q="באילו שפות הבוט תומך?" a="עברית, אנגלית וערבית — הבוט מזהה אוטומטית ועונה באותה שפה." />
            <FAQItem q="מה כשהבוט לא יודע?" a="מעביר לנציג ומודיע לך בזמן אמת. אתה עונה ישירות מהדשבורד." />
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <HandWrittenTitle
          title="מוכן לשדרג את השירות?"
          subtitle="הצטרף ל-500+ עסקים שכבר חוסכים שעות כל יום"
        />
        <div className="text-center -mt-8 mb-16">
          <Link href="/signup">
            <Button size="lg" className="text-base px-10 py-7 btn-premium text-white text-lg rounded-2xl">
              התחל ניסיון ב-₪1 <ArrowLeft className="h-5 w-5 mr-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-blue-50 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/images/logo.png" alt="BotPress AI" width={28} height={28} className="rounded-md" />
                <span className="font-bold">BotPress AI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">בוטים חכמים מבוססי AI לעסקים. תשובות מיידיות, 24/7.</p>
            </div>
            <div><h4 className="font-medium text-sm mb-3">מוצר</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#features" className="hover:text-blue-500">פיצ׳רים</a></li><li><a href="#pricing" className="hover:text-blue-500">מחירים</a></li><li><a href="#faq" className="hover:text-blue-500">שאלות נפוצות</a></li></ul></div>
            <div><h4 className="font-medium text-sm mb-3">חברה</h4><ul className="space-y-2 text-sm text-gray-500"><li><span className="cursor-pointer hover:text-blue-500">אודות</span></li><li><span className="cursor-pointer hover:text-blue-500">בלוג</span></li><li><span className="cursor-pointer hover:text-blue-500">צור קשר</span></li></ul></div>
            <div><h4 className="font-medium text-sm mb-3">משפטי</h4><ul className="space-y-2 text-sm text-gray-500"><li><Link href="/terms" className="hover:text-blue-500">תנאי שימוש</Link></li><li><Link href="/privacy" className="hover:text-blue-500">מדיניות פרטיות</Link></li></ul></div>
          </div>
          <div className="border-t border-blue-50 pt-6 text-center text-sm text-gray-500">© 2026 BotPress AI. כל הזכויות שמורות.</div>
        </div>
      </footer>
    </div>
  )
}
