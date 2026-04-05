import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, businessName } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL to prevent SSRF
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs allowed' }, { status: 400 })
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    // Comprehensive SSRF protection — block all private/reserved ranges
    const isPrivate =
      hostname === 'localhost' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      /^127\./.test(hostname) ||                          // Loopback
      /^10\./.test(hostname) ||                           // RFC 1918 Class A
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||     // RFC 1918 Class B
      /^192\.168\./.test(hostname) ||                     // RFC 1918 Class C
      /^169\.254\./.test(hostname) ||                     // Link-local
      /^0\./.test(hostname) ||                            // Current network
      /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./.test(hostname) || // CGNAT
      hostname === '[::1]' ||
      hostname.startsWith('fc') ||                        // IPv6 unique local
      hostname.startsWith('fe80') ||                      // IPv6 link-local
      hostname.startsWith('fd')                           // IPv6 unique local
    if (isPrivate) {
      return NextResponse.json({ error: 'Private URLs not allowed' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    // Fetch website content
    let websiteContent = ''
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'BotPressAI/1.0' } })
      const html = await res.text()
      websiteContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000)
    } catch {
      websiteContent = `Website: ${url}`
    }

    const prompt = `Based on this website content for "${businessName || 'the business'}", generate 8-10 frequently asked questions with answers in Hebrew. Return a JSON array of objects with "question", "answer", and "category" fields.

Website content:
${websiteContent}

Return ONLY valid JSON array, no markdown, no explanation.`

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
      }
    )

    if (!aiRes.ok) {
      console.error('Gemini FAQ error:', aiRes.status)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await aiRes.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

    // Parse JSON from response
    let faqs
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      faqs = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    } catch {
      faqs = []
    }

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('FAQ generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
