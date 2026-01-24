'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    icon: Zap,
    title: 'Select Your Market',
    description: 'Tell us your city, niche, and budget. We pull real market data instantly.',
  },
  {
    number: 2,
    icon: TrendingUp,
    title: 'Analyze Signals',
    description: 'Our system detects SERP gaps, competitor positioning, and ad opportunities.',
  },
  {
    number: 3,
    icon: CheckCircle,
    title: 'Get Your Strategy',
    description: 'Receive actionable recommendations and a full market analysis report.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple. Transparent. Powered by real market intelligence.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className="relative space-y-4"
              >
                {/* Step Number Circle */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-accent/10 rounded-full w-16 h-16"></div>
                  <div className="relative w-14 h-14 flex items-center justify-center bg-accent text-white rounded-full font-bold text-lg">
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-accent"
                >
                  <Icon className="w-8 h-8" />
                </motion.div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Connector Line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-border"></div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
