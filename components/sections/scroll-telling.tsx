'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function ScrollTelling() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const { top, height } = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const viewportMiddle = windowHeight / 2

      // Calculate progress (0 to 1) as section scrolls through viewport
      const relativePos = viewportMiddle - top
      const progress = Math.max(0, Math.min(1, relativePos / (height / 2)))

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const steps = [
    {
      title: 'Signals',
      description: 'Market data flows in real-time from SERP, paid channels, reviews, and local listings. Every source becomes a signal.',
      icon: '◉',
    },
    {
      title: 'Insights',
      description: 'Patterns emerge. Signals combine into meaningful narratives. You see opportunities competitors miss.',
      icon: '◇',
    },
    {
      title: 'Strategy',
      description: 'Actionable strategy crystallizes. Your team gets a clear roadmap to outcompete and dominate.',
      icon: '◆',
    },
  ]

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 px-4 md:px-8 lg:px-12 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left: Steps */}
        <div className="lg:col-span-1 space-y-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-light text-primary">{step.icon}</span>
                <h3 className="font-space-grotesk text-2xl font-bold text-foreground">{step.title}</h3>
              </div>
              <p className="font-inter text-muted-foreground leading-relaxed ml-8">
                {step.description}
              </p>

              {idx < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.15 + 0.2 }}
                  className="ml-8 flex items-center gap-2 text-xs text-primary font-medium pt-4"
                >
                  <ArrowRight size={14} className="rotate-90" />
                  <span>Next</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Right: Sticky Preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-20 lg:h-fit">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0.5 + scrollProgress * 0.5 }}
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-background to-card/50 p-8 space-y-6 backdrop-blur-sm"
          >
            {/* Preview Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">Live Preview</span>
              </div>
              <h4 className="font-space-grotesk text-xl font-bold text-foreground">
                Strategy Report v{Math.floor(3 + scrollProgress * 1)}
              </h4>
            </div>

            {/* Dynamic Content Based on Scroll */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: Math.min(1, scrollProgress * 3), y: 0 }}
                className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2"
              >
                <div className="text-sm font-semibold text-foreground">Signal Collection</div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>SERP Keywords</span>
                    <span className="font-mono">{Math.floor(200 + scrollProgress * 300)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, scrollProgress * 200)}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: Math.min(1, Math.max(0, (scrollProgress - 0.33) * 3)), y: 0 }}
                className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-2"
              >
                <div className="text-sm font-semibold text-foreground">Insight Patterns</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Market Gap: +{Math.floor(15 + scrollProgress * 25)}%</div>
                  <div>Opportunity Score: {Math.floor(7.2 + scrollProgress * 2.6)}/10</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: Math.min(1, Math.max(0, (scrollProgress - 0.66) * 3)), y: 0 }}
                className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 space-y-2"
              >
                <div className="text-sm font-semibold text-foreground">Strategic Recommendations</div>
                <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>Expand content pillars by Q2</li>
                  <li>Increase paid budget allocation</li>
                  <li>Optimize conversion funnel</li>
                </ul>
              </motion.div>
            </div>

            {/* Progress Indicator */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Report Progress</span>
                <span>{Math.floor(scrollProgress * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, scrollProgress * 100)}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
