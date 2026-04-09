'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/i18n/provider'
import { Bot, Loader2, Star, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

const floatAnimation = {
  y: [-8, 8, -8],
  transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
}

export default function LoginPage() {
  const { signIn, loading, error } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right side (RTL) — Gradient branded panel */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden items-center justify-center p-12">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-[15%] right-[20%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ ...floatAnimation, y: [8, -8, 8] }}
          className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-purple-300/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ ...floatAnimation, y: [-5, 12, -5] }}
          className="absolute top-[50%] left-[40%] w-[250px] h-[250px] bg-blue-300/10 rounded-full blur-[80px]"
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md w-full"
        >
          {/* Brand logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="w-14 h-14 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-white text-2xl font-bold mt-4">BotPress AI</h2>
            <p className="text-white/60 text-sm mt-1">הבוט החכם לעסק שלך</p>
          </motion.div>

          {/* Glass card testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-white/90 text-base leading-relaxed mb-5">
              &ldquo;הבוט חסך לנו שעות ביום. 80% מהשאלות נענות אוטומטית ושביעות הרצון עלתה משמעותית.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-lg shadow-lg">
                🍕
              </div>
              <div>
                <p className="text-white font-semibold text-sm">יוסי לוי</p>
                <p className="text-white/40 text-xs">בעלים, מסעדת הגג — תל אביב</p>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Users, color: 'text-blue-300', value: '500+', label: 'עסקים', delay: 0.5 },
              { icon: TrendingUp, color: 'text-purple-300', value: '4.9', label: 'דירוג', delay: 0.6 },
              { icon: MessageSquare, color: 'text-indigo-300', value: '50K+', label: 'הודעות', delay: 0.7 },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: stat.delay }}
                className="backdrop-blur-xl bg-white/[0.06] border border-white/[0.1] rounded-xl p-4 text-center hover:bg-white/[0.1] transition-colors duration-300"
              >
                <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
                <div className="text-white text-xl font-bold">{stat.value}</div>
                <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Left side (RTL) — White form */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50/50">
        <div className="w-full max-w-sm">
          {/* Logo icon */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20"
            >
              <Bot className="h-7 w-7 text-white" />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-2xl font-bold tracking-tight text-gray-900"
            >
              {t.auth.login_title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-gray-400 text-sm mt-1.5"
            >
              {t.auth.login_subtitle}
            </motion.p>
          </motion.div>

          <motion.form
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.div variants={fadeUp} custom={3} className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.auth.password}
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 overflow-hidden"
                >
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp} custom={5}>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 hover:brightness-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t.auth.login_button}
              </button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={6}
            className="flex items-center gap-3 my-8"
          >
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">או</span>
            <div className="flex-1 h-px bg-gray-200" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={7}
            className="text-center text-sm text-gray-400"
          >
            {t.auth.no_account}{' '}
            <Link
              href="/signup"
              className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              {t.auth.register_link}
            </Link>
          </motion.p>
        </div>
      </main>
    </div>
  )
}
