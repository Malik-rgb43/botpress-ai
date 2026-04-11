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

export default function SignupPage() {
  const { signUp, resendConfirmation, loading, error, needsConfirmation, confirmationEmail } = useAuth()
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [resendSent, setResendSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    setResendSent(false)
    if (password !== confirmPassword) {
      setLocalError(t.auth.passwords_mismatch)
      return
    }
    if (password.length < 6) {
      setLocalError(t.auth.password_min)
      return
    }
    await signUp(email, password, fullName)
  }

  async function handleResend() {
    const ok = await resendConfirmation(email || confirmationEmail)
    if (ok) {
      setResendSent(true)
      toast.success('נשלח! בדוק את תיבת המייל שלך')
    }
  }

  // Show confirmation screen after signup
  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex flex-row-reverse">
        <BrandedPanel />
        <main className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">בדוק את תיבת המייל</h1>
            <p className="text-gray-500 text-sm mb-2">
              שלחנו מייל אישור ל:
            </p>
            <p className="text-blue-600 font-medium text-sm mb-6" dir="ltr">{confirmationEmail || email}</p>
            <p className="text-gray-400 text-xs mb-8">
              לחץ על הקישור במייל כדי לאשר את החשבון ולהתחבר
            </p>

            {resendSent ? (
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium mb-4">
                <CheckCircle2 className="h-4 w-4" />
                נשלח בהצלחה!
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={loading}
                className="flex items-center justify-center gap-2 mx-auto text-sm text-blue-500 font-medium hover:text-blue-600 transition-colors disabled:opacity-50 mb-4"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                לא קיבלת? שלח שוב
              </button>
            )}

            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              חזרה להתחברות
            </Link>
          </motion.div>
        </main>
      </div>
    )
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
              {t.auth.signup_title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-gray-400 text-sm mt-1.5"
            >
              {t.auth.signup_subtitle}
            </motion.p>
          </motion.div>

          <motion.form
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.div variants={fadeUp} custom={3} className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                {t.auth.full_name}
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="ישראל ישראלי"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="space-y-1.5">
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

            <motion.div variants={fadeUp} custom={5} className="space-y-1.5">
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

            <motion.div variants={fadeUp} custom={6} className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t.auth.confirm_password}
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                dir="ltr"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </motion.div>

            <AnimatePresence>
              {(error || localError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 overflow-hidden"
                >
                  <p className="text-sm text-red-600 text-center">{localError || error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp} custom={7}>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 hover:brightness-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t.auth.signup_button}
              </button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={8}
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
            custom={9}
            className="text-center text-sm text-gray-400"
          >
            {t.auth.has_account}{' '}
            <Link
              href="/login"
              className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              {t.auth.login_link}
            </Link>
          </motion.p>
        </div>
      </main>
    </div>
  )
}
