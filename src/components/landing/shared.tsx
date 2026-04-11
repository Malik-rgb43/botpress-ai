'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, useInView, type Variants } from 'framer-motion'

/* ── Framer Motion Variants (shared) ────────── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

/* ── Animated Counter ──────────────────────── */

export function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, amount: 0.3 })
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const duration = 1500
    const steps = 40
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── FAQ Item ──────────────────────────────── */

export function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.06 }}
    >
      <details className="group rounded-xl bg-white border border-gray-100 overflow-hidden hover:border-blue-200/60 hover:shadow-lg hover:shadow-blue-500/[0.03] transition-all duration-300">
        <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer select-none">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100/60 flex items-center justify-center shrink-0 group-open:from-blue-500 group-open:to-purple-500 group-open:border-transparent transition-all duration-300">
              <span className="text-blue-500 text-xs font-bold group-open:text-white transition-colors duration-300">?</span>
            </div>
            <span className="font-semibold text-gray-900 text-[15px] leading-snug">{q}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-blue-50 group-open:bg-blue-500 flex items-center justify-center shrink-0 transition-all duration-300">
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-open:text-white group-open:rotate-180 transition-all duration-300" />
          </div>
        </summary>
        <div className="px-5 md:px-6 pb-5 md:pb-6 pr-[60px] text-sm text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>
      </details>
    </motion.div>
  )
}

/* ── Floating Orb ──────────────────────────── */

export function FloatingOrb({ className, color, size, blur }: { className?: string; color: string; size: number; blur: number }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
