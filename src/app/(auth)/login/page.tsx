'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bot, Loader2, Star } from 'lucide-react'

export default function LoginPage() {
  const { signIn, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-[#fafbfe]" />
        <div className="absolute top-[30%] left-[20%] w-96 h-96 bg-[#2e90fa]/5 rounded-full blur-[100px] -z-0" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#2e90fa]/20">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">התחברות</h1>
            <p className="text-gray-400 text-sm mt-1">הזן אימייל וסיסמה</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="h-11 rounded-xl border-gray-200 focus:border-[#2e90fa]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" className="h-11 rounded-xl border-gray-200 focus:border-[#2e90fa]" />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full bg-[#2e90fa] border-0 shadow-lg shadow-[#2e90fa]/30 rounded-xl py-3 hover:shadow-xl transition-all" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'התחבר'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            אין לך חשבון?{' '}
            <Link href="/signup" className="text-[#2e90fa] font-medium hover:underline">הירשם</Link>
          </p>
        </div>
      </div>

      {/* Right side — Testimonials (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 left-10 w-48 h-48 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 max-w-md text-white">
          <div className="flex gap-0.5 mb-6">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
          </div>
          <blockquote className="text-xl font-medium leading-relaxed mb-6">
            &ldquo;הבוט חסך לנו שעות ביום. 80% מהשאלות נענות אוטומטית ושביעות הרצון עלתה משמעותית.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">🍕</div>
            <div>
              <p className="font-semibold">יוסי לוי</p>
              <p className="text-sm text-white/60">בעלים, מסעדת הגג — תל אביב</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div><div className="text-2xl font-bold">500+</div><div className="text-xs text-white/50">עסקים</div></div>
              <div><div className="text-2xl font-bold">4.9</div><div className="text-xs text-white/50">דירוג</div></div>
              <div><div className="text-2xl font-bold">50K+</div><div className="text-xs text-white/50">הודעות</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
