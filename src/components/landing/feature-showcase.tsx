'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

/* ── Framer Motion Variants (local copies) ──── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

/* ── Feature Tabs Data ─────────────────────── */

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

/* ── Preview: AI Chat ──────────────────────── */

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

/* ── Preview: Site Scanning ────────────────── */

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

/* ── Preview: 3 Channels ──────────────────── */

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

/* ── Preview: Analytics ───────────────────── */

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

/* ── Feature Showcase Component ────────────── */

export function FeatureShowcase() {
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
