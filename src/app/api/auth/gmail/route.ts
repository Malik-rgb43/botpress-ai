import { NextRequest, NextResponse } from 'next/server'

// Gmail OAuth — redirect to Google consent screen
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/gmail/callback`
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify')

  // Generate CSRF state parameter
  const crypto = await import('crypto')
  const state = crypto.randomBytes(32).toString('hex')

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state', state, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600
  })
  return response
}
