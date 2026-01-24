'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Shield, Zap, BarChart3, Target } from 'lucide-react';

const DELIVERABLES = [
  {
    title: 'Market Snapshot',
    description: 'High-level overview of competitive landscape, market size, and growth trends.',
    icon: BarChart3,
  },
  {
    title: 'Competitor Intelligence',
    description: 'Detailed analysis of 3-5 top competitors, their strategies, and positioning.',
    icon: TrendingUp,
  },
  {
    title: 'Opportunity Map',
    description: 'Identified gaps and white space where you can differentiate and win.',
    icon: Target,
  },
  {
    title: 'Quick Wins',
    description: 'Immediate tactical recommendations you can implement this month.',
    icon: Zap,
  },
  {
    title: 'Risk Assessment',
    description: 'Market threats, saturation levels, and barriers to entry analysis.',
    icon: Shield,
  },
  {
    title: 'Strategic Insights',
    description: 'Deep insights on messaging, positioning, and go-to-market strategy.',
    icon: Lightbulb,
  },
];

export function WhatYouGet() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            What you get
          </h2>
          <p className="text-lg text-muted-foreground">
            Six deliverables designed to inform every strategic decision.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DELIVERABLES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Icon className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-space-grotesk font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
