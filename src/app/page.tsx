'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, X, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useRef, useEffect, useState } from "react"
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import HeroChat from "@/components/landing/hero-chat"
import RotatingText from "@/components/landing/rotating-text"
import { LandingChatWidget } from "@/components/landing/chat-widget"

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
      transition={{ delay: index * 0.06 }}
    >
      <details className="group rounded-xl bg-white border border-gray-100 overflow-hidden hover:border-blue-200/60 hover:shadow-lg hover:shadow-blue-500/[0.03] transition-all duration-300">
        <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer select-none">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100/60 flex items-center justify-center shrink-0 group-open:from-blue-500 group-open:to-purple-500 group-open:border-transparent transition-all duration-300">
              <span className="text-blue-500 text-xs font-bold group-open:text-white transition-colors duration-300">?</span>
            </div>
            <span className="font-semibold text-gray-900 text-[15px] leading-snug">{q}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-blue-50 group-open:bg-blue-500 flex items-center justify-center shrink-0 transition-all duration-300">
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-open:text-white group-open:rotate-180 transition-all duration-300" />
          </div>
        </summary>
        <div className="px-5 md:px-6 pb-5 md:pb-6 pr-[60px] text-sm text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>
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

/* ── Feature Showcase Data & Component ──────── */

const featureTabs = [
  {
    title: 'AI שעונה על הכל',
    description: '3 שכבות: FAQ, מדיניות ו-AI מתקדם. עונה בפחות מ-2 שניות.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    title: 'סריקה אוטומטית',
    description: 'הדבק URL — הבוט לומד הכל בשניות',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: '3 ערוצים, מערכת אחת',
    description: 'וואטסאפ, אימייל וצ׳אט — ממקום אחד.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    title: 'אנליטיקס בזמן אמת',
    description: 'כל הנתונים על פעילות הבוט — בדשבורד אחד',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

/* Preview: AI Chat */
function PreviewAIChat() {
  return (
    <div className="p-5 space-y-3">
      <motion.div className="flex gap-2 justify-end" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-blue-500 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">מה שעות הפתיחה שלכם?</div>
      </motion.div>
      <motion.div className="flex gap-2.5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[11px] shrink-0 shadow-sm">&#x1F916;</div>
        <div className="space-y-1">
          <div className="bg-gray-50 text-gray-700 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm max-w-[300px]">
            אנחנו פתוחים א׳-ה׳ 9:00-18:00 וביום ו׳ 9:00-13:00. רוצה לקבוע פגישה? 😊
          </div>
          <div className="flex gap-1.5 mr-1">
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">FAQ</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">0.8s</span>
          </div>
        </div>
      </motion.div>
      <motion.div className="flex gap-2 justify-end" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
        <div className="bg-blue-500 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">כן, מחר בבוקר</div>
      </motion.div>
      <motion.div className="flex gap-2.5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[11px] shrink-0 shadow-sm">&#x1F916;</div>
        <div className="bg-gray-50 text-gray-700 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm max-w-[300px]">
          מצוין! מחר יש לנו פנוי ב-10:00 וב-11:30. מה מתאים לך?
        </div>
      </motion.div>
    </div>
  )
}

/* Preview: Site Scanning */
function PreviewScanning() {
  const items = [
    { label: 'שאלות נפוצות', pct: 100, delay: 0 },
    { label: 'מדיניות החזרות', pct: 100, delay: 0.15 },
    { label: 'שעות פעילות', pct: 100, delay: 0.3 },
    { label: 'פרטי קשר', pct: 85, delay: 0.45 },
  ]
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-gray-500 font-medium" dir="ltr">https://my-business.co.il</span>
      </div>
      {items.map((item) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: item.delay }}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">{item.label}</span>
            <span className={item.pct === 100 ? 'text-emerald-500 font-semibold' : 'text-blue-500 font-semibold'}>{item.pct === 100 ? '✓' : `${item.pct}%`}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${item.pct === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${item.pct}%` }}
              transition={{ duration: 1, delay: item.delay + 0.2, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* Preview: 3 Channels */
function PreviewChannels() {
  const channels = [
    { name: 'WhatsApp', sub: 'מענה אוטומטי מהמספר שלך', color: '#25D366', icon: 'W', delay: 0 },
    { name: 'Email', sub: 'תשובות מהGmail שלך', color: '#3B82F6', icon: '@', delay: 0.15 },
    { name: 'וידג׳ט באתר', sub: 'שורת קוד אחת', color: '#8B5CF6', icon: '</>', delay: 0.3 },
  ]
  return (
    <div className="p-5 space-y-3">
      {channels.map((ch) => (
        <motion.div
          key={ch.name}
          className="flex items-center gap-3 p-3 rounded-xl border transition-all"
          style={{ backgroundColor: `${ch.color}08`, borderColor: `${ch.color}20` }}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: ch.delay }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm shadow-sm" style={{ backgroundColor: ch.color }}>{ch.icon}</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800">{ch.name}</div>
            <div className="text-[10px] text-gray-400">{ch.sub}</div>
          </div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ch.color }} />
        </motion.div>
      ))}
    </div>
  )
}

/* Preview: Analytics */
function PreviewAnalytics() {
  const kpis = [
    { label: 'שיחות היום', value: '47', change: '+12%', up: true },
    { label: 'זמן תגובה', value: '2.3s', change: '-18%', up: false },
    { label: 'שביעות רצון', value: '96%', change: '+5%', up: true },
    { label: 'חסכון יומי', value: '₪840', change: '+23%', up: true },
  ]
  const bars = [30, 45, 35, 55, 40, 65, 50, 75, 60, 85, 70, 90]
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 font-medium">סקירה יומית</span>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} className="rounded-xl bg-gray-50 p-2.5 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.08 }}>
            <div className="text-base font-bold text-gray-900">{kpi.value}</div>
            <div className="text-[10px] text-gray-400 mb-0.5">{kpi.label}</div>
            <div className={`text-[10px] font-semibold ${kpi.up ? 'text-emerald-500' : 'text-blue-500'}`}>{kpi.change}</div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-blue-400 to-blue-500"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
          />
        ))}
      </div>
    </div>
  )
}

const featurePreviews = [PreviewAIChat, PreviewScanning, PreviewChannels, PreviewAnalytics]

function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0)
  const [userClicked, setUserClicked] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-rotate every 4s, pause on manual click
  useEffect(() => {
    if (userClicked) {
      // Resume auto-rotate after 8s of inactivity
      const resume = setTimeout(() => setUserClicked(false), 8000)
      return () => clearTimeout(resume)
    }
    timerRef.current = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % featureTabs.length)
    }, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [userClicked])

  const handleTabClick = (i: number) => {
    setActiveTab(i)
    setUserClicked(true)
  }

  const ActivePreview = featurePreviews[activeTab]

  return (
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
          className="grid md:grid-cols-5 gap-8 items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {/* Preview area — 3 cols */}
          <motion.div variants={fadeInUp} className="md:col-span-3 order-2 md:order-1">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-300" />
                  <div className="w-3 h-3 rounded-full bg-yellow-300" />
                  <div className="w-3 h-3 rounded-full bg-green-300" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-400 font-mono" dir="ltr">
                    app.botpress.ai/dashboard
                  </div>
                </div>
              </div>
              {/* Preview content */}
              <div className="min-h-[320px] bg-gradient-to-br from-gray-50/50 to-blue-50/30 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <ActivePreview />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Feature tabs — 2 cols */}
          <motion.div variants={fadeInUp} className="md:col-span-2 space-y-3 order-1 md:order-2">
            {featureTabs.map((tab, i) => (
              <motion.button
                key={i}
                onClick={() => handleTabClick(i)}
                className={`w-full text-right rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                  activeTab === i
                    ? 'bg-blue-50/50 border-r-2 border-blue-500 border-l border-t border-b border-l-gray-100 border-t-gray-100 border-b-gray-100 shadow-sm'
                    : 'bg-white hover:bg-gray-50 border border-gray-100'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg transition-colors ${activeTab === i ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    {tab.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold mb-1 transition-colors ${activeTab === i ? 'text-gray-900' : 'text-gray-600'}`}>{tab.title}</h4>
                    <p className={`text-xs leading-relaxed transition-colors ${activeTab === i ? 'text-gray-500' : 'text-gray-400'}`}>{tab.description}</p>
                  </div>
                  {activeTab === i && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    />
                  )}
                </div>
                {/* Progress bar for auto-rotate */}
                {activeTab === i && !userClicked && (
                  <div className="mt-3 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4, ease: 'linear' }}
                    />
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
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
