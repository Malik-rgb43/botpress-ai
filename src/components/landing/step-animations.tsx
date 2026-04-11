'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

/* ── Step URL Typing Animation ─────────────── */

export function StepUrlTyping() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'done' | 'clearing'>('typing')
  const fullText = 'https://my-business.co.il'

  useEffect(() => {
    let i = 0
    let timeout: ReturnType<typeof setTimeout>
    function typeChar() {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i))
        i++
        timeout = setTimeout(typeChar, 70 + Math.random() * 40)
      } else {
        setPhase('done')
        timeout = setTimeout(() => {
          setPhase('clearing')
          let j = fullText.length
          function clearChar() {
            if (j >= 0) {
              setText(fullText.slice(0, j))
              j--
              timeout = setTimeout(clearChar, 30)
            } else {
              setPhase('typing')
              i = 0
              timeout = setTimeout(typeChar, 500)
            }
          }
          clearChar()
        }, 2000)
      }
    }
    typeChar()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center gap-3 overflow-hidden relative group">
      <div className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300" style={{ boxShadow: phase === 'typing' ? '0 0 15px rgba(37,99,235,0.08), inset 0 0 15px rgba(37,99,235,0.03)' : 'none', opacity: phase === 'typing' ? 1 : 0 }} />
      <svg className="w-4 h-4 shrink-0 transition-colors duration-300" style={{ color: phase === 'typing' ? '#2563eb' : '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <div className="relative flex-1 min-h-[18px]" dir="ltr">
        <span className="font-mono text-xs text-blue-500 tracking-wide">{text}</span>
        <span className="inline-block w-[2px] h-[14px] bg-blue-500 rounded-full align-middle ms-[1px]" style={{ animation: phase === 'done' ? 'pulse 1s ease-in-out infinite' : 'none', opacity: phase === 'clearing' ? 0.5 : 1 }} />
      </div>
      {phase === 'done' && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
    </div>
  )
}

/* ── Step Bot Learning Animation ───────────── */

export function StepBotLearning() {
  const [activeItem, setActiveItem] = useState(0)
  const items = [
    { label: 'שאלות נפוצות', icon: '❓', color: '#2563eb' },
    { label: 'מדיניות', icon: '📋', color: '#7c3aed' },
    { label: 'שעות פעילות', icon: '🕐', color: '#10b981' },
    { label: 'טון דיבור', icon: '🎯', color: '#f59e0b' },
    { label: 'פרטי קשר', icon: '📞', color: '#2563eb' },
    { label: 'מוצרים', icon: '🛍️', color: '#7c3aed' },
  ]

  useEffect(() => {
    const timer = setInterval(() => setActiveItem(prev => (prev + 1) % items.length), 1200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isActive = i === activeItem
        const isDone = i < activeItem
        return (
          <div key={item.label} className="flex items-center gap-2.5 transition-all duration-300" style={{ opacity: isActive ? 1 : isDone ? 0.7 : 0.4 }}>
            <span className="text-xs">{item.icon}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: isDone ? '100%' : isActive ? '60%' : '0%', backgroundColor: item.color, boxShadow: isActive ? `0 0 8px ${item.color}40` : 'none' }} />
            </div>
            <span className="text-[10px] text-gray-400 w-16 text-left font-medium">{item.label}</span>
            {isDone && <Check className="w-3 h-3 text-emerald-500" />}
          </div>
        )
      })}
    </div>
  )
}

/* ── Step Channel Connect Animation ────────── */

export function StepChannelConnect() {
  const [connected, setConnected] = useState(0)
  const channels = [
    { name: 'WhatsApp', icon: 'W', color: '#25D366', bg: 'bg-[#25D366]' },
    { name: 'Email', icon: '@', color: '#2563eb', bg: 'bg-blue-500' },
    { name: 'Widget', icon: '</>', color: '#7c3aed', bg: 'bg-purple-500' },
  ]

  useEffect(() => {
    const timers = channels.map((_, i) =>
      setTimeout(() => setConnected(prev => Math.max(prev, i + 1)), 800 + i * 1200)
    )
    const resetTimer = setTimeout(() => setConnected(0), 800 + channels.length * 1200 + 2000)
    return () => { timers.forEach(clearTimeout); clearTimeout(resetTimer) }
  }, [connected === 0])

  return (
    <div className="space-y-2.5">
      {channels.map((ch, i) => {
        const isConnected = i < connected
        const isConnecting = i === connected - 1
        return (
          <div key={ch.name} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-500 ${isConnected ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className={`w-8 h-8 ${ch.bg} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform duration-300 ${isConnecting ? 'scale-110' : ''}`}>{ch.icon}</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-800">{ch.name}</div>
              <div className="text-[10px] text-gray-400">{isConnected ? 'מחובר ✓' : 'מחכה לחיבור...'}</div>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-gray-200'}`} style={{ animation: isConnecting ? 'pulse 1s ease-in-out infinite' : 'none' }} />
          </div>
        )
      })}
    </div>
  )
}
