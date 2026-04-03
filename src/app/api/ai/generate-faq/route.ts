import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, businessName } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    // Fetch website content
    let websiteContent = ''
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'BotPressAI/1.0' } })
      const html = await res.text()
      // Simple HTML strip
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

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!aiRes.ok) {
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await aiRes.json()
    const content = data.choices?.[0]?.message?.content || '[]'

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
