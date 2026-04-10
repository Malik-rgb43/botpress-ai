'use client'

import { useState, useEffect } from 'react'
import { Bot, Star, MessageSquare, TrendingUp, Users, Zap, Shield, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const floatAnimation = {
  y: [-8, 8, -8],
  transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
}

const testimonials = [
  {
    name: 'דנה כהן',
    role: 'בעלת חנות פרחים — רמת גן',
    text: 'מאז שהתחלנו להשתמש בבוט, 80% מהשאלות נענות אוטומטית. הלקוחות מרוצים ואני חוסכת שעות ביום.',
    emoji: '💐',
    stat: '80%',
    statLabel: 'מענה אוטומטי',
  },
  {
    name: 'יוסי לוי',
    role: 'בעלים, מסעדת הגג — תל אביב',
    text: 'ההגדרה הייתה פשוטה מטורף. תוך 10 דקות היה לי בוט שעונה על כל שאלה — שעות, תפריט, הזמנות.',
    emoji: '🍕',
    stat: '10 דק׳',
    statLabel: 'זמן הקמה',
  },
  {
    name: 'מיכל אברהם',
    role: 'חנות אונליין — הרצליה',
    text: 'הסריקה האוטומטית של האתר חסכה לי ימים של עבודה. הבוט למד הכל לבד ועונה מדויק.',
    emoji: '🛍️',
    stat: '100%',
    statLabel: 'דיוק תשובות',
  },
]

const features = [
  { icon: Zap, text: 'מענה אוטומטי ב-2 שניות' },
  { icon: Shield, text: 'מידע מאובטח ומוצפן' },
  { icon: Clock, text: 'שירות 24/7 ללא הפסקה' },
]

export function BrandedPanel() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const t = testimonials[activeTestimonial]

  return (
    <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden items-center justify-center p-12">
      {/* Base — dark gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 40%, #1a1a2e 70%, #0f172a 100%)' }} />

      {/* Colored accent orbs — subtle, not dominant */}
      <motion.div
        animate={floatAnimation}
        className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ ...floatAnimation, y: [10, -10, 10] }}
        className="absolute bottom-[10%] left-[0%] w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ ...floatAnimation, y: [-6, 14, -6] }}
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)' }}
      />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-[420px] w-full"
      >
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 text-center"
        >
          <div className="w-16 h-16 bg-white/[0.12] backdrop-blur-xl border border-white/[0.18] rounded-2xl flex items-center justify-center mx-auto shadow-2xl mb-4">
            <Image src="/images/logo.png" alt="BotPress AI" width={36} height={36} className="rounded-lg" />
          </div>
          <h2 className="text-white text-3xl font-bold tracking-tight">BotPress AI</h2>
          <p className="text-white/50 text-sm mt-1.5">הבוט החכם לעסק שלך</p>
        </motion.div>

        {/* Rotating testimonial card */}
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="backdrop-blur-xl bg-white/[0.06] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/20"
            >
              {/* Stars + stat */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-lg font-black text-white leading-none">{t.stat}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{t.statLabel}</div>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-white/90 text-[15px] leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-xl shadow-lg">
                  {t.emoji}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeTestimonial ? 'w-6 bg-white/60' : 'w-1.5 bg-white/20 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-2 px-3.5 py-2 backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-full"
            >
              <f.icon className="h-3.5 w-3.5 text-white/60" />
              <span className="text-xs text-white/70 font-medium">{f.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3.5 mt-6">
          {[
            { icon: MessageSquare, value: '+50K', label: 'הודעות', delay: 0.6 },
            { icon: TrendingUp, value: '4.9', label: 'דירוג', delay: 0.7 },
            { icon: Users, value: '+500', label: 'עסקים', delay: 0.8 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: stat.delay }}
              className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.07] rounded-xl p-3.5 text-center hover:bg-white/[0.08] transition-colors duration-300 group"
            >
              <stat.icon className="h-4.5 w-4.5 text-white/30 mx-auto mb-1.5 group-hover:text-white/50 transition-colors" />
              <div className="text-white text-xl font-bold leading-none">{stat.value}</div>
              <div className="text-white/35 text-[11px] mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
