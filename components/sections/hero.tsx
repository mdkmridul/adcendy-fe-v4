'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SignalAtlas } from '@/components/interactive/signal-atlas'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center px-4 md:px-8 lg:px-12 py-12 md:py-24 overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#e0e0e0_1px,transparent_1px),linear-gradient(0deg,#e0e0e0_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        {/* Left: Headline + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Signal Atlas Ready</span>
              </motion.div>

              <h1 className="font-space-grotesk text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                Market Signals
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                  Into Winning Strategies
                </span>
              </h1>
            </div>

            <p className="font-inter text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Transform scattered market data into actionable strategic insights. Watch your signals flow, crystallize, and become your competitive advantage.
            </p>

            {/* Run Status Pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border/50 w-fit"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Run status:</span>
                <div className="flex items-center gap-1">
                  <motion.span
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Collecting</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <span className="text-sm font-medium text-muted-foreground">Summarizing</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-sm font-medium text-muted-foreground">Strategy v3</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="font-space-grotesk font-semibold">
                Generate Plan
              </Button>
              <Button size="lg" variant="outline" className="font-space-grotesk font-semibold bg-transparent">
                View Sample Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Right: Interactive Signal Atlas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full min-h-96 lg:min-h-[600px]"
        >
          <SignalAtlas />
        </motion.div>
      </div>
    </section>
  )
}
