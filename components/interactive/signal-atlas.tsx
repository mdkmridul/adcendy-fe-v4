'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Signal {
  id: string
  label: string
  x: number
  y: number
  color: string
}

const SIGNALS: Signal[] = [
  { id: 'serp', label: 'SERP', x: 30, y: 20, color: '#7c3aed' },
  { id: 'meta', label: 'Meta Ads', x: 70, y: 25, color: '#ec4899' },
  { id: 'listings', label: 'Listings', x: 50, y: 60, color: '#3b82f6' },
  { id: 'reviews', label: 'Reviews', x: 25, y: 75, color: '#f97316' },
]

export function SignalAtlas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let animationFrameId: number
    let time = 0

    const animate = () => {
      time += 0.01

      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw connecting lines between signals
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.2)'
      ctx.lineWidth = 1
      for (let i = 0; i < SIGNALS.length; i++) {
        for (let j = i + 1; j < SIGNALS.length; j++) {
          const from = SIGNALS[i]
          const to = SIGNALS[j]
          const x1 = (from.x / 100) * canvas.width
          const y1 = (from.y / 100) * canvas.height
          const x2 = (to.x / 100) * canvas.width
          const y2 = (to.y / 100) * canvas.height

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      }

      // Draw signals as animated dots
      SIGNALS.forEach((signal, idx) => {
        const x = (signal.x / 100) * canvas.width
        const y = (signal.y / 100) * canvas.height
        const offset = Math.sin(time + idx) * 3

        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25)
        gradient.addColorStop(0, signal.color + '40')
        gradient.addColorStop(0.5, signal.color + '20')
        gradient.addColorStop(1, signal.color + '00')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, 25, 0, Math.PI * 2)
        ctx.fill()

        // Core dot
        ctx.fillStyle = signal.color
        ctx.beginPath()
        ctx.arc(x, y, 6 + offset, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="relative w-full h-full rounded-2xl border border-border/50 bg-gradient-to-br from-card via-background to-card/50 overflow-hidden backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />

      {/* Signal Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {SIGNALS.map((signal) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + Math.random() * 0.3 }}
            className="absolute flex items-center gap-2 pointer-events-auto"
            style={{
              left: `${signal.x}%`,
              top: `${signal.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: signal.color }}
            />
            <span className="text-xs font-medium text-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md whitespace-nowrap">
              {signal.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Report Outline (Right side) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute bottom-6 right-6 bg-background/90 backdrop-blur-md border border-border/50 rounded-lg p-4 max-w-xs space-y-2"
      >
        <div className="text-xs font-semibold text-primary uppercase tracking-wider">Strategy Report</div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Executive Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Market Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>Action Items</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
