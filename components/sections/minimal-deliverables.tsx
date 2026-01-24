'use client';

import { motion } from 'framer-motion';
import { FileText, TrendingUp, Lightbulb, MapPin, Zap, Calendar } from 'lucide-react';

const DELIVERABLES = [
  {
    icon: FileText,
    title: 'Executive Summary',
    description: 'Crystal-clear overview of market landscape and strategic opportunities.',
  },
  {
    icon: TrendingUp,
    title: 'Competitive Analysis',
    description: 'Deep dive into competitor positioning, messaging, and performance.',
  },
  {
    icon: Lightbulb,
    title: 'Quick Wins',
    description: 'Immediate, actionable recommendations for 30-60-90 day execution.',
  },
  {
    icon: MapPin,
    title: 'Channel Strategy',
    description: 'Optimized channel mix with messaging and budget allocation.',
  },
  {
    icon: Zap,
    title: 'Ad Variants',
    description: 'Ready-to-launch creative angles based on market insights.',
  },
  {
    icon: Calendar,
    title: 'Execution Roadmap',
    description: '6-month strategic roadmap with milestones and KPIs.',
  },
];

export function Deliverables() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            What You'll Receive
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive strategy report delivered within 30 minutes, packed with actionable insights.
          </p>
        </motion.div>

        {/* Deliverables grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {DELIVERABLES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-4 group"
              >
                <div className="inline-block p-3 bg-muted group-hover:bg-primary/10 rounded-lg transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
