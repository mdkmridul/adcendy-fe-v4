'use client';

import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, AlertCircle, Lightbulb, Clock } from 'lucide-react';

const deliverables = [
  {
    icon: BarChart3,
    title: 'Market Analysis',
    description: 'Comprehensive overview of market size, growth, and segmentation.',
  },
  {
    icon: Users,
    title: 'Competitor Intel',
    description: 'Detailed positioning, messaging, and strategy of top 5 competitors.',
  },
  {
    icon: TrendingUp,
    title: 'Opportunity Map',
    description: 'High-confidence growth opportunities with addressable market size.',
  },
  {
    icon: AlertCircle,
    title: 'Risk Assessment',
    description: 'Key threats, market saturation points, and competitive vulnerabilities.',
  },
  {
    icon: Lightbulb,
    title: 'Quick Wins',
    description: '30-60-90 day playbook with immediate actions and expected ROI.',
  },
  {
    icon: Clock,
    title: 'Channel Strategy',
    description: 'Recommended marketing channels with budget allocation and KPIs.',
  },
];

export function WhatYouGet() {
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
            What you get
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Every strategy report includes six comprehensive deliverables backed by real market evidence.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group p-6 bg-card/50 border border-border hover:border-primary/50 rounded-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 group-hover:bg-primary/20 border border-primary/30 rounded-lg transition-colors mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold font-space-grotesk text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.description}</p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <span>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
