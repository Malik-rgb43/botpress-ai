'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')

  async function signUp(email: string, password: string, fullName?: string) {
    setLoading(true)
    setError(null)
    setNeedsConfirmation(false)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // If email confirmation is required, user.identities will be empty or user won't have a session
    if (data.user && !data.session) {
      setNeedsConfirmation(true)
      setConfirmationEmail(email)
      setLoading(false)
      return
    }
    router.push('/onboarding')
    setLoading(false)
  }

  async function signIn(email: string, password: string) {
    setLoading(true)
    setError(null)
    setNeedsConfirmation(false)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Supabase returns this when email isn't confirmed
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        setNeedsConfirmation(true)
        setConfirmationEmail(email)
        setLoading(false)
        return
      }
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
    setLoading(false)
  }

  async function resendConfirmation(email?: string) {
    const targetEmail = email || confirmationEmail
    if (!targetEmail) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: targetEmail,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return false
    }
    return true
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return { signUp, signIn, signOut, resendConfirmation, loading, error, needsConfirmation, confirmationEmail }
}
