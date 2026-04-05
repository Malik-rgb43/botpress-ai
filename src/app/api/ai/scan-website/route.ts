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

    // Scrape website — main page + policy pages from footer links
    let websiteContent = ''
    let policyContent = ''
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BotPressAI/1.0)' },
        signal: AbortSignal.timeout(10000),
      })
      const html = await res.text()

      // Extract footer links for policy pages before stripping HTML
      const policyKeywords = /policy|policies|terms|privacy|return|refund|shipping|delivery|faq|about|hours|contact/i
      const footerMatch = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/i)
      const linkSection = footerMatch?.[0] || html.slice(-3000) // fallback to last 3000 chars
      const linkRegex = /href=["']([^"']+)["']/gi
      const policyLinks: string[] = []
      let linkMatch
      while ((linkMatch = linkRegex.exec(linkSection)) !== null) {
        const href = linkMatch[1]
        if (policyKeywords.test(href) && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          try {
            const fullUrl = new URL(href, url).href
            if (fullUrl.startsWith('http') && !policyLinks.includes(fullUrl)) {
              policyLinks.push(fullUrl)
            }
          } catch { /* skip invalid */ }
        }
      }

      // Scrape up to 3 policy pages
      for (const policyUrl of policyLinks.slice(0, 3)) {
        try {
          const pRes = await fetch(policyUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BotPressAI/1.0)' },
            signal: AbortSignal.timeout(5000),
          })
          const pHtml = await pRes.text()
          const pText = pHtml
            .replace(/<(nav|header|footer|aside|menu|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 2000)
          if (pText.length > 100) {
            policyContent += `\n\n--- Policy page: ${policyUrl} ---\n${pText}`
          }
        } catch { /* skip failed pages */ }
      }

      // Main page content (keep footer for contact info)
      websiteContent = html
        .replace(/<(nav|menu|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
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

    if (websiteContent.length < 50) {
      return NextResponse.json({ error: 'Could not extract content' }, { status: 400 })
    }

    const langMap: Record<string, string> = { he: 'Hebrew', en: 'English', ar: 'Arabic' }
    const promptLang = langMap[language] || 'Hebrew'

    const fullContent = policyContent
      ? `${websiteContent}\n\n=== POLICY PAGES FOUND ON WEBSITE ===\n${policyContent}`
      : websiteContent

    const systemPrompt = `You are a professional business analyst AI specializing in extracting structured business data from websites.

YOUR ROLE:
You receive scraped website content (main page + any policy/terms pages found in the footer). Your job is to extract real, accurate business information and structure it as JSON.

ABSOLUTE RULES:
1. ACCURACY FIRST: Only include information that is explicitly stated or clearly implied on the website. Never invent, guess, or assume.
2. POLICIES FROM POLICY PAGES ONLY: Policies (returns, shipping, privacy, terms) must come from actual policy page content provided in the "POLICY PAGES" section. If no policy pages were found, return policies as an empty array []. Do NOT generate policies from FAQ or general page content.
3. CONTACT INFO: Extract phone numbers, email addresses, and physical addresses only if they appear on the website. Look in footer, contact section, and "about us" areas.
4. BUSINESS STORY: Write a natural, compelling 2-4 sentence description of the business based on how they present themselves. Include: what they do, their unique value, target audience.
5. FAQs: Generate 8-12 helpful Q&A pairs from a CUSTOMER'S perspective based on real website content. Questions should be things customers would actually ask. Answers must contain real information from the website.
6. LANGUAGE: All output text must be in ${promptLang}.
7. CATEGORIES: For FAQs, assign relevant categories (e.g., "shipping", "products", "pricing", "general"). For policies, use type values: "shipping", "returns", "hours", "payment", "privacy", "terms", or "custom".

OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown fences, no explanation, no comments.`

    const userPrompt = `Analyze this website and extract business information:

Business: "${businessName || 'Unknown'}"
URL: ${url}

Return this JSON structure (omit any field where you found no real data — use null):
{
  "story": "Business description (2-4 sentences). null if nothing found.",
  "phone": "Phone number or null",
  "email": "Email address or null",
  "address": "Physical address or null",
  "faqs": [{"question":"...","answer":"...","category":"..."}],
  "policies": [{"type":"shipping|returns|hours|payment|privacy|terms|custom","title":"...","content":"..."}]
}

Remember: policies ONLY from the policy pages section below. If no policy pages exist, policies = [].

=== WEBSITE CONTENT ===
${fullContent}`

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4000,
            responseMimeType: 'application/json',
          },
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
