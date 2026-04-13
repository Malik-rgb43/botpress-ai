import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/auth'
import { badRequest, forbidden, serverError, ok } from '@/lib/api-response'

const PLAN_LIMITS: Record<string, number> = {
  free: 2,
  basic: 5,
  premium: 20,
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 req/hour — AI generation is expensive
  const rlKey = getRateLimitKey(request, 'generate-faq')
  const rl = await checkRateLimit(rlKey, { limit: 5, windowMs: 60 * 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many FAQ generation requests', retryAfter: rl.retryAfter  }, { status: 429 })
  }
  try {
    // Auth check
    const { user, supabase: supabaseAuth, error: authError } = await requireAuth()
    if (authError) return authError

    const { url, businessName, language, businessId } = await request.json()

    if (!url) {
      return badRequest('URL is required')
    }

    if (!businessId) {
      return badRequest('businessId is required')
    }

    // Verify business ownership — prevent users from accessing other businesses
    const { data: ownedBiz } = await supabaseAuth
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()
    if (!ownedBiz) {
      return forbidden('Business not found or not authorized')
    }

    // Validate URL to prevent SSRF
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return badRequest('Invalid URL')
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return badRequest('Only HTTP/HTTPS URLs allowed')
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    const isPrivate =
      hostname === 'localhost' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname) ||
      /^0\./.test(hostname) ||
      /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./.test(hostname) ||
      hostname === '[::1]' ||
      hostname.startsWith('fc') ||
      hostname.startsWith('fe80') ||
      hostname.startsWith('fd')
    if (isPrivate) {
      return badRequest('Private URLs not allowed')
    }

    // Check usage limit
    {
      const supabase = await createClient()

      // Get current plan
      const { data: biz } = await supabase
        .from('businesses')
        .select('id, contact_info')
        .eq('id', businessId)
        .single()

      const plan = (biz?.contact_info as any)?.plan || 'free'
      const limit = PLAN_LIMITS[plan] || 2

      // Count uses this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('faq_generations')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('created_at', startOfMonth.toISOString())

      const usedCount = count || 0
      if (usedCount >= limit) {
        return NextResponse.json({
          error: 'limit_reached',
          limit,
          used: usedCount
        }, { status: 429 })
      }

      // Log this usage
      await supabase.from('faq_generations').insert({
        business_id: businessId,
        url,
      }).then(() => {}) // fire and forget
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return serverError('AI not configured')
    }

    // Fetch website content with better extraction
    let websiteContent = ''
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BotPressAI/1.0)' },
        signal: AbortSignal.timeout(10000),
        redirect: 'manual',
      })
      const html = await res.text()
      websiteContent = html
        // Remove nav/header/footer/aside blocks first
        .replace(/<(nav|header|footer|aside|menu|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000)
    } catch {
      websiteContent = `Website: ${url}`
    }

    // Language mapping for the prompt
    const langMap: Record<string, string> = {
      he: 'Hebrew',
      en: 'English',
      ar: 'Arabic',
    }
    const promptLang = langMap[language] || 'Hebrew'

    const prompt = `You are an expert at analyzing business websites and creating helpful FAQ content.

Analyze this website content for "${businessName || 'the business'}" and generate 8-12 frequently asked questions with detailed, helpful answers.

Focus on:
- Products/services offered and their details
- Pricing and payment options
- Shipping/delivery info
- Return/exchange policies
- Business hours and contact info
- Any unique selling points

Write the questions from a CUSTOMER's perspective (what would they ask?).
Write answers that are informative, friendly, and complete.
All content must be in ${promptLang}.

Website content:
${websiteContent}

Return ONLY a valid JSON array of objects with "question", "answer", and "category" fields. No markdown, no explanation.
Example format: [{"question":"...","answer":"...","category":"..."}]`

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
        }),
      }
    )

    if (!aiRes.ok) {
      console.error('Gemini FAQ error:', aiRes.status)
      return serverError('AI generation failed')
    }

    const data = await aiRes.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

    let faqs
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      faqs = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    } catch {
      faqs = []
    }

    return ok({ faqs })
  } catch (error) {
    console.error('FAQ generation error:', error)
    return serverError()
  }
}
