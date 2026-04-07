'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/i18n/provider'
import { Bot, Loader2, Star, MessageSquare, TrendingUp, Users } from 'lucide-react'

export default function SignupPage() {
  const { signUp, loading, error } = useAuth()
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
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

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right side (RTL) — Dark branded panel */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden items-center justify-center p-12">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b]" />

        {/* Animated gradient orbs */}
        <div className="absolute top-[15%] right-[20%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-indigo-500/15 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[50%] left-[40%] w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse [animation-delay:4s]" />

        <div className="relative z-10 max-w-md w-full">
          {/* Brand logo */}
          <div className="mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-white text-2xl font-bold mt-4">BotPress AI</h2>
            <p className="text-white/50 text-sm mt-1">הבוט החכם לעסק שלך</p>
          </div>

          {/* Glass card testimonial */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/[0.1] rounded-2xl p-6 shadow-2xl">
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
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 text-center">
              <Users className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <div className="text-white text-xl font-bold">500+</div>
              <div className="text-white/40 text-xs mt-0.5">עסקים</div>
            </div>
            <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 text-center">
              <TrendingUp className="h-5 w-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-white text-xl font-bold">4.9</div>
              <div className="text-white/40 text-xs mt-0.5">דירוג</div>
            </div>
            <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 text-center">
              <MessageSquare className="h-5 w-5 text-purple-400 mx-auto mb-2" />
              <div className="text-white text-xl font-bold">50K+</div>
              <div className="text-white/40 text-xs mt-0.5">הודעות</div>
            </div>
          </div>
        </div>
      </div>

      {/* Left side (RTL) — White form */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo icon */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t.auth.signup_title}</h1>
            <p className="text-gray-400 text-sm mt-1.5">{t.auth.signup_subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
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
                className="w-full h-12 px-4 rounded-xl bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
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
                className="w-full h-12 px-4 rounded-xl bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
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
                className="w-full h-12 px-4 rounded-xl bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
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
                className="w-full h-12 px-4 rounded-xl bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
              />
            </div>

            {(error || localError) && (
              <div role="alert" className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600 text-center">{localError || error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-l from-blue-500 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t.auth.signup_button}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            {t.auth.has_account}{' '}
            <Link
              href="/login"
              className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              {t.auth.login_link}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
