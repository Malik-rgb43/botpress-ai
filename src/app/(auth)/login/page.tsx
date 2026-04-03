'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bot, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { signIn, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-md border-blue-100/60 shadow-xl shadow-blue-500/5">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bot className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">התחברות</CardTitle>
          <CardDescription>הכנס את הפרטים שלך כדי להתחבר</CardDescription>
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
                className="border-blue-100 focus:border-blue-300"
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
                className="border-blue-100 focus:border-blue-300"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full gradient-primary border-0 shadow-md shadow-blue-500/25" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'התחבר'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            אין לך חשבון?{' '}
            <Link href="/signup" className="text-blue-600 font-medium hover:underline">
              הירשם
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
