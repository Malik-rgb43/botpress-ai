'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/i18n/provider'
import { Bot, Loader2, Mail, RefreshCw, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandedPanel } from '@/components/auth/branded-panel'
import { toast } from 'sonner'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export default function LoginPage() {
  const { signIn, resendConfirmation, loading, error, needsConfirmation, confirmationEmail } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resendSent, setResendSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResendSent(false)
    await signIn(email, password)
  }

  async function handleResend() {
    const ok = await resendConfirmation(email || confirmationEmail)
    if (ok) {
      setResendSent(true)
      toast.success('נשלח! בדוק את תיבת המייל שלך')
    }
  }

  return (
    <div className="min-h-screen flex flex-row-reverse">
      <BrandedPanel />

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
              {error && !needsConfirmation && (
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

            {/* Email confirmation needed */}
            <AnimatePresence>
              {needsConfirmation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800 mb-1">צריך לאשר את האימייל</p>
                      <p className="text-xs text-amber-600 mb-3">
                        שלחנו לך מייל אישור ל-<span className="font-medium" dir="ltr">{confirmationEmail || email}</span>. לחץ על הקישור במייל כדי להתחבר.
                      </p>
                      {resendSent ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          נשלח בהצלחה!
                        </div>
                      ) : (
                        <button
                          onClick={handleResend}
                          disabled={loading}
                          className="flex items-center gap-1.5 text-xs text-amber-700 font-medium hover:text-amber-900 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                          שלח שוב
                        </button>
                      )}
                    </div>
                  </div>
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
