'use client'

import { motion } from 'framer-motion'
import { Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SampleReport() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 lg:px-12 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold text-foreground">
            See It In Action
          </h2>
          <p className="font-inter text-lg text-muted-foreground leading-relaxed">
            Explore a sample strategy report to understand the depth and clarity of your market insights.
          </p>
        </motion.div>

        {/* Report Viewer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-background to-card/50 overflow-hidden shadow-lg"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Report_2024_Q1_Strategy.pdf</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Eye size={16} />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Download size={16} />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>

          {/* Report Content Preview */}
          <div className="aspect-video md:aspect-auto md:h-[600px] bg-gradient-to-b from-background to-muted/5 p-8 md:p-12 space-y-8 overflow-y-auto">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: false, amount: 0.3 }}
              className="space-y-4"
            >
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Q1 2024</span>
              </div>
              <h3 className="font-space-grotesk text-3xl md:text-4xl font-bold text-foreground">
                Strategic Market Analysis
              </h3>
              <p className="font-inter text-muted-foreground max-w-2xl">
                Comprehensive market signals assessment and strategic recommendations for Q1-Q2 2024
              </p>
            </motion.div>

            {/* Executive Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: false, amount: 0.3 }}
              className="space-y-4 pt-8 border-t border-border/30"
            >
              <h4 className="font-space-grotesk text-xl font-semibold text-foreground">Executive Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Market Opportunity', value: '+$2.4M' },
                  { label: 'Competitive Gap', value: '-35%' },
                  { label: 'Implementation Timeline', value: '90 days' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + idx * 0.1, duration: 0.6 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-1"
                  >
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className="font-space-grotesk text-2xl font-bold text-primary">
                      {stat.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Key Findings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: false, amount: 0.3 }}
              className="space-y-4 pt-8 border-t border-border/30"
            >
              <h4 className="font-space-grotesk text-xl font-semibold text-foreground">Key Findings</h4>
              <ul className="space-y-3 font-inter text-muted-foreground text-sm">
                {[
                  'SERP performance showing untapped keyword volume in adjacent categories',
                  'Meta Ads benchmarks 23% below industry standards — immediate optimization opportunity',
                  'Review sentiment analysis reveals customer satisfaction gap vs. competitors',
                  'Local search intent trending +15% YoY with minimal competitive saturation',
                ].map((finding, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + idx * 0.08, duration: 0.6 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-primary font-bold mt-1 flex-shrink-0">→</span>
                    <span>{finding}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Recommendations Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: false, amount: 0.3 }}
              className="space-y-4 pt-8 border-t border-border/30"
            >
              <h4 className="font-space-grotesk text-xl font-semibold text-foreground">Strategic Recommendations</h4>
              <div className="space-y-3 text-sm">
                {[
                  { phase: 'Phase 1 (30 days)', action: 'Launch keyword expansion campaign across 50+ new queries' },
                  { phase: 'Phase 2 (60 days)', action: 'Optimize Meta Ads targeting and creative rotation' },
                  { phase: 'Phase 3 (90 days)', action: 'Implement reputation management and review solicitation program' },
                ].map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + idx * 0.1, duration: 0.6 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="p-4 rounded-lg bg-accent/5 border border-accent/20"
                  >
                    <div className="font-semibold text-accent mb-1">{rec.phase}</div>
                    <div className="text-muted-foreground">{rec.action}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Footer note */}
            <div className="pt-8 border-t border-border/30 text-center text-xs text-muted-foreground">
              {/* Show more pages indicator */}
              <span>+12 more pages of detailed analysis, metrics, and implementation guides</span>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="font-inter text-muted-foreground">Ready to see your full strategy report?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="font-space-grotesk font-semibold">
              Get Your Report
            </Button>
            <Button size="lg" variant="outline" className="font-space-grotesk font-semibold bg-transparent">
              Schedule Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
