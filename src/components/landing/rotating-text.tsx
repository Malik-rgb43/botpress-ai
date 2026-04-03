'use client'

import { useState, useEffect } from 'react'

const WORDS = ['וואטסאפ 💬', 'אימייל 📧', 'באתר שלך 🌐']

export default function RotatingText() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

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
    <span
      className="gradient-text inline-block transition-all duration-400"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {WORDS[index]}
    </span>
  )
}
