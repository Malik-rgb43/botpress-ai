/**
 * Local FAQ matching — answers simple questions without calling Gemini
 *
 * Uses keyword overlap scoring to find the best FAQ match.
 * Only returns a match if confidence is high enough (>= 0.6)
 */

import type { FAQ } from '@/types/database'

interface FAQMatch {
  faq: FAQ
  score: number
}

// Normalize text for matching: lowercase, remove punctuation, split to words
function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[?!.,;:'"()[\]{}]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1) // Drop single chars
}

// Hebrew stop words to ignore in matching
const STOP_WORDS = new Set([
  'של', 'את', 'עם', 'על', 'מה', 'איך', 'אם', 'לא', 'כן', 'גם', 'או',
  'זה', 'הם', 'היא', 'הוא', 'אני', 'אנחנו', 'שלי', 'שלכם', 'לי', 'לכם',
  'כל', 'רק', 'עוד', 'כמה', 'מתי', 'אחרי', 'לפני', 'בין', 'אצל', 'כדי',
  'the', 'is', 'it', 'in', 'to', 'and', 'or', 'for', 'of', 'at', 'by',
  'do', 'does', 'how', 'what', 'can', 'your', 'you', 'my', 'me', 'we',
])

function getKeywords(text: string): string[] {
  return normalize(text).filter(w => !STOP_WORDS.has(w))
}

/**
 * Try to match user message to a FAQ
 * Returns the best match with score, or null if no good match
 */
export function matchFAQ(message: string, faqs: FAQ[]): FAQMatch | null {
  if (faqs.length === 0) return null

  const msgKeywords = getKeywords(message)
  if (msgKeywords.length === 0) return null

  let bestMatch: FAQMatch | null = null

  for (const faq of faqs) {
    const faqKeywords = getKeywords(faq.question)
    if (faqKeywords.length === 0) continue

    // Calculate keyword overlap (Jaccard-like similarity)
    const msgSet = new Set(msgKeywords)
    const faqSet = new Set(faqKeywords)

    let overlapCount = 0
    for (const word of msgSet) {
      if (faqSet.has(word)) overlapCount++
      // Also check partial matches (for Hebrew word forms)
      else {
        for (const faqWord of faqSet) {
          if (faqWord.length >= 3 && word.length >= 3) {
            if (faqWord.includes(word) || word.includes(faqWord)) {
              overlapCount += 0.7
              break
            }
          }
        }
      }
    }

    // Score = overlap relative to the smaller set (so short questions can still match)
    const minSize = Math.min(msgSet.size, faqSet.size)
    const score = overlapCount / minSize

    if (score > (bestMatch?.score ?? 0)) {
      bestMatch = { faq, score }
    }
  }

  // Threshold: only return if confidence >= 0.6
  if (bestMatch && bestMatch.score >= 0.6) {
    return bestMatch
  }

  return null
}

/**
 * Select only relevant FAQs for the system prompt based on message intent
 * Instead of sending ALL FAQs (wastes tokens), send only potentially relevant ones
 */
export function selectRelevantFAQs(message: string, faqs: FAQ[], maxFaqs = 8): FAQ[] {
  if (faqs.length <= maxFaqs) return faqs

  const msgKeywords = getKeywords(message)
  if (msgKeywords.length === 0) return faqs.slice(0, maxFaqs)

  // Score each FAQ by relevance to the message
  const scored = faqs.map(faq => {
    const faqKeywords = getKeywords(faq.question + ' ' + faq.answer)
    const msgSet = new Set(msgKeywords)
    let overlap = 0
    for (const word of msgSet) {
      for (const faqWord of faqKeywords) {
        if (faqWord === word || (faqWord.length >= 3 && word.length >= 3 && (faqWord.includes(word) || word.includes(faqWord)))) {
          overlap++
          break
        }
      }
    }
    return { faq, score: overlap }
  })

  // Sort by relevance, take top N
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, maxFaqs).map(s => s.faq)
}
