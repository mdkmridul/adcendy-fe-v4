'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Zap, Shield, Brain, Layers } from 'lucide-react'

const DELIVERABLES = [
  {
    icon: BarChart3,
    title: 'Market Analysis',
    description: 'Deep-dive competitive landscape audit with gap identification and opportunity mapping.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Forecasting',
    description: 'Predictive analytics showing emerging patterns and market direction before competitors.',
  },
  {
    icon: Zap,
    title: 'Quick Wins',
    description: 'Immediate, high-impact actions you can execute in the next 30 days to drive results.',
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description: 'Identify threats, vulnerabilities, and competitive blind spots with mitigation plans.',
  },
  {
    icon: Brain,
    title: 'Strategic Roadmap',
    description: '6-12 month execution plan aligned with market signals and business objectives.',
  },
  {
    icon: Layers,
    title: 'Channel Optimization',
    description: 'Multi-channel strategy across paid, organic, local, and review channels.',
  },
]

export function Deliverables() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold text-foreground">
            What You Get
          </h2>
          <p className="font-inter text-lg text-muted-foreground leading-relaxed">
            Complete strategic toolkit to dominate your market and outmaneuver competition.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DELIVERABLES.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative rounded-xl border border-border/50 bg-card hover:bg-card/50 p-6 space-y-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Icon Background */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Icon */}
                <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="relative space-y-2">
                  <h3 className="font-space-grotesk text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Border gradient on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/0 to-accent/0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
