'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bot, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const { signUp, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    if (password !== confirmPassword) {
      setLocalError('הסיסמאות לא תואמות')
      return
    }
    if (password.length < 6) {
      setLocalError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    await signUp(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-white -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2e90fa]/5 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-sm bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2e90fa] to-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg shadow-[#2e90fa]/25">
              <Bot className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">הרשמה</CardTitle>
          <CardDescription>הרשם ותתחיל לבנות את הבוט שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="h-11 rounded-xl border-gray-200 focus:border-[#2e90fa]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" className="h-11 rounded-xl border-gray-200 focus:border-[#2e90fa]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אימות סיסמה</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required dir="ltr" className="h-11 rounded-xl border-gray-200 focus:border-[#2e90fa]" />
            </div>
            {(error || localError) && (
              <p className="text-sm text-red-500 text-center">{localError || error}</p>
            )}
            <Button type="submit" className="w-full bg-[#2e90fa] border-0 shadow-lg shadow-[#2e90fa]/30 rounded-xl hover:shadow-xl hover:shadow-[#2e90fa]/40 transition-all" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'צור חשבון'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-[#2e90fa] font-medium hover:underline">
              התחבר
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
