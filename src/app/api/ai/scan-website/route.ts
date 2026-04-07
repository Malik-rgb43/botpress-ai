import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        redirect: 'manual',
      })
      const html = await res.text()

      // Extract ALL links that could be policy/info pages — search ENTIRE page
      const policyKeywords = /policy|policies|terms|privacy|return|refund|exchange|shipping|delivery|faq|about|contact|hours|warranty|guarantee|cancell|תנאי|מדיניות|החזר|משלוח|פרטיות|שעות|אודות|צור.?קשר|ביטול|אחריות|תקנון|legal|tos|conditions|service/i
      const linkRegex = /href=["']([^"'#]+)["']/gi
      const policyLinks: string[] = []
      let linkMatch
      // Search entire HTML for relevant links
      while ((linkMatch = linkRegex.exec(html)) !== null) {
        const href = linkMatch[1]
        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue
        if (!policyKeywords.test(href)) continue
        try {
          const fullUrl = new URL(href, url).href
          // Only same domain
          if (fullUrl.startsWith('http') && new URL(fullUrl).hostname === parsedUrl.hostname && !policyLinks.includes(fullUrl)) {
            policyLinks.push(fullUrl)
          }
        } catch { /* skip invalid */ }
      }

      // Scrape up to 5 policy pages IN PARALLEL for speed
      const policyResults = await Promise.allSettled(
        policyLinks.slice(0, 5).map(async (policyUrl) => {
          const pRes = await fetch(policyUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BotPressAI/1.0)' },
            signal: AbortSignal.timeout(5000),
            redirect: 'manual',
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
          return { url: policyUrl, text: pText }
        })
      )
      for (const r of policyResults) {
        if (r.status === 'fulfilled' && r.value.text.length > 100) {
          policyContent += `\n\n--- Policy page: ${r.value.url} ---\n${r.value.text}`
        }
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

    const systemPrompt = `You are a senior business intelligence analyst with deep expertise in e-commerce, retail, and service businesses. You specialize in extracting comprehensive, accurate business data from websites to power AI customer service bots.

## YOUR MISSION
Analyze scraped website content to extract every piece of useful business information. The output will be used to configure an AI chatbot that answers customer questions — so accuracy and completeness are critical.

## DATA EXTRACTION RULES

### 1. BUSINESS STORY (story)
- Write a natural, compelling description (3-5 sentences) of the business
- Include: what they sell/do, who their customers are, what makes them unique, their values/mission
- Tone: professional but warm, as if the business owner is introducing their business
- Base ONLY on what the website actually says about itself
- If you find an "About Us" or "מי אנחנו" section, prioritize that content
- If no clear business description exists, return null

### 2. CONTACT INFORMATION (phone, email, address)
- Extract EXACT phone numbers, emails, and addresses as they appear
- Look in: footer, header, contact page content, "about us" section, sidebar
- Phone: include country code if present (e.g., +972-50-1234567 or 050-1234567)
- Email: only business emails (not noreply@ or automated addresses)
- Address: full street address with city
- Return null for any field not found — never guess

### 3. FREQUENTLY ASKED QUESTIONS (faqs)
- Generate 8-14 high-quality Q&A pairs from a CUSTOMER'S perspective
- Questions must be things a real customer would ask before/during/after purchase
- Answers must contain REAL, SPECIFIC information from the website (prices, times, sizes, materials, etc.)
- Categories to use: "כללי" (general), "משלוחים" (shipping), "החזרות" (returns), "מוצרים" (products), "תשלום" (payment), "שעות פעילות" (hours), "שירות" (service)
- DO NOT create generic FAQs. Every answer must have specific details from the website
- Examples of GOOD questions: "כמה עולה משלוח לתל אביב?", "האם אפשר להחזיר מוצר אחרי 30 יום?", "מה שעות הפעילות ביום שישי?"
- Examples of BAD questions: "מה החברה עושה?" (too vague), "האם אתם טובים?" (not useful)

### 4. BUSINESS POLICIES (policies)
- CRITICAL: Extract policies ONLY from actual policy page content provided in the "POLICY PAGES" section
- If NO policy pages were found in the scrape, return an EMPTY array []
- Never invent or assume policies
- For each policy found, extract:
  - type: "shipping" | "returns" | "hours" | "payment" | "privacy" | "terms" | "custom"
  - title: A clear title in ${promptLang}
  - content: The full, detailed policy text — summarize if very long (keep key details like timeframes, conditions, exceptions)
- Common policies to look for: return/exchange policy, shipping policy, privacy policy, terms of service, warranty, business hours

### 5. LANGUAGE & FORMATTING
- ALL output text must be in ${promptLang}
- Use natural, professional language
- Prices should include currency symbol (₪, $, etc.)
- Times in 24-hour format (e.g., 08:00-20:00)
- Phone numbers in local format

## OUTPUT
Return ONLY a valid JSON object. No explanations, no markdown.`

    const userPrompt = `Extract all business information from this website.

Business name: "${businessName || 'Unknown'}"
Website URL: ${url}

JSON structure:
{
  "story": "string or null",
  "phone": "string or null",
  "email": "string or null",
  "address": "string or null",
  "faqs": [{"question":"string","answer":"string","category":"string"}],
  "policies": [{"type":"string","title":"string","content":"string"}]
}

${fullContent}`

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8000,
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
      result = JSON.parse(content)
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
