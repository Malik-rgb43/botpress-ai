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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md border-gray-100 shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Bot className="h-10 w-10 text-black" />
          </div>
          <CardTitle className="text-2xl">הרשמה</CardTitle>
          <CardDescription>צור חשבון חדש והתחל לבנות את הבוט שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אימות סיסמה</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            {(error || localError) && (
              <p className="text-sm text-red-500 text-center">{localError || error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'צור חשבון'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-black font-medium hover:underline">
              התחבר
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
