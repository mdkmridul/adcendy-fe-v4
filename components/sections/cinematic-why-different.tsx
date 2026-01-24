'use client';

import { motion } from 'framer-motion';
import { Database, RefreshCw, Zap } from 'lucide-react';

const differences = [
  {
    icon: Database,
    title: 'Real Market Signals',
    description: 'We don\'t analyze competitors in a vacuum. Every recommendation is backed by real market data from search, ads, listings, and customer reviews. 5,000+ signal points per report.',
  },
  {
    icon: RefreshCw,
    title: 'Instant Versioning',
    description: 'Market conditions change daily. Your strategy report includes version history and quarterly updates. Compare Q1 vs Q2 to see what shifted and adjust faster than competitors.',
  },
  {
    icon: Zap,
    title: 'Weekly Tweaks Loop',
    description: 'Get weekly signals about market moves, new competitor activity, and emerging opportunities. Subscribe to smart notifications and stay ahead of market changes.',
  },
];

export function WhyDifferent() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-space-grotesk">
            Why it's different
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Not another static competitor analysis. AdCendy is built for markets that move.
          </p>
        </motion.div>

        {/* Difference Cards */}
        <div className="space-y-6">
          {differences.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 bg-card/50 border border-border rounded-xl"
            >
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-primary/10 border border-primary/30 rounded-lg">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold font-space-grotesk text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
