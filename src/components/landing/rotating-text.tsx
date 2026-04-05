'use client'

import { useState, useEffect, useRef } from 'react'

const WORDS = ['וואטסאפ', 'אימייל', 'אתר שלך']

export default function RotatingText() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [width, setWidth] = useState<number | undefined>(undefined)
  const measureRef = useRef<HTMLSpanElement>(null)

  // Measure max width on mount
  useEffect(() => {
    if (!measureRef.current) return
    const spans = measureRef.current.querySelectorAll('span')
    let maxW = 0
    spans.forEach(s => { maxW = Math.max(maxW, s.offsetWidth) })
    setWidth(maxW)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => (prev + 1) % WORDS.length)
        setVisible(true)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Hidden measurement container */}
      <span ref={measureRef} className="absolute invisible whitespace-nowrap" style={{ fontSize: 'inherit', fontWeight: 'inherit' }} aria-hidden="true">
        {WORDS.map(w => <span key={w} className="block">ב{w}</span>)}
      </span>
      {/* Visible rotating word with fixed width */}
      <span
        className="inline-block text-center whitespace-nowrap"
        style={{
          width: width ? `${width}px` : 'auto',
          color: '#1a1a2e',
        }}
      >
        <span
          className="inline-block"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          ב{WORDS[index]}
        </span>
      </span>
    </>
  )
}
