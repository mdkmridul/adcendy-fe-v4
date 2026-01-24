'use client';

import { motion } from 'framer-motion';
import { Upload, Zap, FileText } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Share Your Market',
    description: 'Tell us your city, niche, and competition. We collect real signals from search, ads, listings, and reviews.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'We Analyze Signals',
    description: 'Our system processes 5,000+ data points in real-time, identifying patterns and opportunities competitors miss.',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Get Your Strategy',
    description: 'Receive a comprehensive strategy report with actionable recommendations, positioning, and a 30-90 day execution plan.',
  },
];

export function HowItWorks() {
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
            How it works
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            From market data to competitive strategy in three simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="relative space-y-4"
            >
              {/* Number Badge */}
              <div className="text-6xl font-bold font-space-grotesk text-primary/20">{step.number}</div>

              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/30 rounded-lg">
                <step.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-space-grotesk text-foreground">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.description}</p>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
