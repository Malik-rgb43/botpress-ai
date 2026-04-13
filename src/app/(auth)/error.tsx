'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Auth error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-50/50">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">משהו השתבש</h2>
      <p className="text-gray-500 text-sm mb-6">אירעה שגיאה. נסה לרענן את הדף.</p>
      <Button onClick={reset} className="gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white">
        <RefreshCw className="h-4 w-4" />
        נסה שוב
      </Button>
    </div>
  )
}
