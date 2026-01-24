'use client';

import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

const DIFFERENTIATORS = [
  {
    icon: AlertCircle,
    title: 'Real Market Signals',
    description: 'We analyze actual SERP positions, competitor ads, local listings, and customer reviews. No guesswork. Just data.',
    details: ['5,000+ SERP keywords tracked', 'Live ad copy analysis', 'Review sentiment monitoring'],
  },
  {
    icon: RefreshCw,
    title: 'Instant Versioning',
    description: 'Get Strategy v1 today, Strategy v2 next week. Market conditions change fast. Your strategy should too.',
    details: ['Weekly market updates', 'Quarterly deep dives', 'Real-time alerts for shifts'],
  },
  {
    icon: TrendingUp,
    title: 'Weekly Tweaks Loop',
    description: 'Your strategy isn\'t set in stone. We recommend quick optimizations every week based on new signals.',
    details: ['Automated signal monitoring', 'Tactical recommendations', 'Performance benchmarks'],
  },
];

export function WhyDifferent() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Why It's Different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Strategy based on evidence, not intuition. Updated constantly, not gathered dust.
          </p>
        </motion.div>

        {/* Differentiators */}
        <div className="space-y-8">
          {DIFFERENTIATORS.map((item, idx) => {
            const Icon = item.icon;
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                {/* Icon Side */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="flex-shrink-0 relative"
                >
                  <div className="absolute inset-0 bg-accent/10 rounded-2xl w-32 h-32 blur-xl"></div>
                  <div className="relative w-32 h-32 flex items-center justify-center bg-accent/5 border border-accent/20 rounded-2xl">
                    <Icon className="w-16 h-16 text-accent" />
                  </div>
                </motion.div>

                {/* Content Side */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.15 + 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="flex-1 space-y-4"
                >
                  <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{item.description}</p>

                  {/* Details List */}
                  <div className="space-y-2 pt-2">
                    {item.details.map((detail, detailIdx) => (
                      <motion.div
                        key={detailIdx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 + detailIdx * 0.08, duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 text-muted-foreground"
                      >
                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                        <span>{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
