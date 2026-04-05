import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// API routes that must be public (webhooks, widget, chat bot)
const PUBLIC_API_PATHS = [
  '/api/ai/chat',           // Widget chat — public, rate limited
  '/api/widget/messages',   // Widget polling — public, rate limited
  '/api/whatsapp',          // WhatsApp webhook — verified by token
  '/api/email/inbound',     // Email webhook — verified by signature
  '/api/email/push',        // Gmail push notification — from Google
  '/api/email/poll',        // Cron job — verified by secret
  '/api/summary',           // Cron job — verified by secret
  '/api/auth/gmail',        // OAuth flow — needs to be public
  '/api/auth/gmail/callback', // OAuth callback
  '/api/webhook',           // Generic webhook
]

// Pages that don't require authentication
const PUBLIC_PAGES = ['/', '/login', '/signup', '/privacy', '/terms']

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow all requests through
  if (!url || !key || url === 'https://placeholder.supabase.co') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Check if this is a public path
    const isPublicPage = PUBLIC_PAGES.some(p => pathname === p)
    const isPublicApi = PUBLIC_API_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
    const isStaticFile = pathname.match(/\.(js|css|png|jpg|svg|ico|woff|woff2)$/)

    if (!user && !isPublicPage && !isPublicApi && !isStaticFile) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
  } catch {
    // If Supabase call fails, allow request through
    return NextResponse.next({ request })
  }

  return supabaseResponse
}
