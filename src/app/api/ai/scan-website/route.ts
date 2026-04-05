import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, businessName, language, businessId } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS allowed' }, { status: 400 })
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    const isPrivate =
      hostname === 'localhost' || hostname === '::1' ||
      hostname.endsWith('.local') || hostname.endsWith('.internal') ||
      /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.)/.test(hostname) ||
      hostname.startsWith('fc') || hostname.startsWith('fe80') || hostname.startsWith('fd')
    if (isPrivate) {
      return NextResponse.json({ error: 'Private URLs not allowed' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    // Scrape website
    let websiteContent = ''
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BotPressAI/1.0)' },
        signal: AbortSignal.timeout(10000),
      })
      const html = await res.text()
      websiteContent = html
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
        .slice(0, 10000)
    } catch {
      websiteContent = `Website: ${url}`
    }

    if (websiteContent.length < 50) {
      return NextResponse.json({ error: 'Could not extract content' }, { status: 400 })
    }

    const langMap: Record<string, string> = { he: 'Hebrew', en: 'English', ar: 'Arabic' }
    const promptLang = langMap[language] || 'Hebrew'

    const prompt = `You are an expert at analyzing business websites. Analyze this website content and extract ALL relevant business information.

Business name: "${businessName || 'Unknown'}"
Website: ${url}

Return a JSON object with these fields. ONLY include a field if you actually found relevant information on the website. If there's no info for a field, DO NOT include it — return null or omit it entirely. Never make up information.

{
  "story": "A 2-3 sentence business description/story. null if not found.",
  "phone": "Business phone number if found. null if not.",
  "email": "Business email if found. null if not.",
  "address": "Business address if found. null if not.",

  "faqs": [
    {"question": "...", "answer": "...", "category": "..."}
  ],
  // Generate 6-10 FAQs based on REAL info from the website. Customer perspective.
  // Only include FAQs where you have actual answers.

  "policies": [
    {"type": "shipping|returns|hours|payment|custom", "title": "...", "content": "..."}
  ]
  // Only include policies actually found (shipping, returns, hours, payment, etc.)
  // Empty array if none found.
}

All text must be in ${promptLang}.
Return ONLY valid JSON. No markdown, no explanation.

Website content:
${websiteContent}`

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 4000 },
        }),
      }
    )

    if (!aiRes.ok) {
      console.error('Gemini scan error:', aiRes.status)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await aiRes.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    let result
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      result = {}
    }

    // Clean: remove empty/null fields — only return what was actually found
    const response: Record<string, unknown> = {}
    if (result.story && result.story !== 'null' && result.story.length > 10) {
      response.story = result.story
    }
    if (result.phone && result.phone !== 'null' && result.phone.length > 5) {
      response.phone = result.phone
    }
    if (result.email && result.email !== 'null' && result.email.includes('@')) {
      response.email = result.email
    }
    if (result.address && result.address !== 'null' && result.address.length > 5) {
      response.address = result.address
    }
    if (result.faqs && Array.isArray(result.faqs) && result.faqs.length > 0) {
      response.faqs = result.faqs.filter((f: any) => f.question && f.answer)
    }
    if (result.policies && Array.isArray(result.policies) && result.policies.length > 0) {
      response.policies = result.policies.filter((p: any) => p.title && p.content)
    }

    if (Object.keys(response).length === 0) {
      return NextResponse.json({ error: 'No content found' }, { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Website scan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
