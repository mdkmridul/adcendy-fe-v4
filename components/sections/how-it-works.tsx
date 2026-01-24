'use client';

import { motion } from 'framer-motion';
import { Search, BarChart3, Zap } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Submit your market',
    description: 'Tell us your city, niche, and budget. We gather competitive intelligence from 5,000+ live data points.',
    icon: Search,
  },
  {
    number: '02',
    title: 'We analyze signals',
    description: 'Our system processes SERP rankings, paid ads, local listings, and reviews in real-time.',
    icon: BarChart3,
  },
  {
    number: '03',
    title: 'Get your strategy',
    description: 'Receive a comprehensive report with signals, opportunities, and tactical recommendations in 30 minutes.',
    icon: Zap,
  },
];

export function HowItWorks() {
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
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            From submission to strategy in three straightforward steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="relative space-y-6"
              >
                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary via-primary to-transparent" />
                )}

                {/* Number badge */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                    <span className="font-space-grotesk text-lg font-bold text-primary">{step.number}</span>
                  </div>
                  <Icon className="w-6 h-6 text-accent flex-shrink-0 hidden sm:block" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="font-space-grotesk text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
