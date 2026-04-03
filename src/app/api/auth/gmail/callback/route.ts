import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${request.nextUrl.origin}/api/auth/gmail/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=not_configured', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_failed', request.url))
    }

    // Get user's email address
    const profileRes = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileRes.json()

    // Save tokens to business record
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id, contact_info')
        .eq('user_id', user.id)
        .single()

      if (business) {
        // Merge new Gmail tokens with existing contact info (preserve phone, address, etc.)
        const existingInfo = (business.contact_info as Record<string, unknown>) || {}
        await supabase.from('businesses').update({
          contact_info: {
            ...existingInfo,
            email: profile.emailAddress,
            gmail_connected: true,
            gmail_refresh_token: tokens.refresh_token,
            gmail_access_token: tokens.access_token,
            gmail_token_expiry: Date.now() + (tokens.expires_in * 1000),
          }
        }).eq('id', business.id)
      }
    }

    return NextResponse.redirect(new URL('/dashboard/settings?success=gmail_connected', request.url))
  } catch (error) {
    console.error('Gmail OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=oauth_failed', request.url))
  }
}
