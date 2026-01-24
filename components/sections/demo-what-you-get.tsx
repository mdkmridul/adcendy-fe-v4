'use client';

import { motion } from 'framer-motion';
import { BarChart3, PieChart, FileText, Zap, Users, Target } from 'lucide-react';

const DELIVERABLES = [
  {
    icon: BarChart3,
    title: 'Market Analysis',
    description: 'Comprehensive breakdown of your market landscape with competitor positioning.',
  },
  {
    icon: PieChart,
    title: 'Opportunity Map',
    description: 'Identified gaps and untapped opportunities across all channels.',
  },
  {
    icon: FileText,
    title: 'Strategic Report',
    description: 'Actionable roadmap with 6-month execution plan and KPIs.',
  },
  {
    icon: Zap,
    title: 'Quick Wins',
    description: 'Immediate tactics to implement in the next 30-90 days.',
  },
  {
    icon: Users,
    title: 'Competitor Intel',
    description: 'Detailed analysis of top 3 competitors and their strategies.',
  },
  {
    icon: Target,
    title: 'Channel Strategy',
    description: 'Tailored recommendations for SERP, paid ads, and listings.',
  },
];

export function WhatYouGet() {
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
            What You Get
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every report includes a complete intelligence package delivered within minutes.
          </p>
        </motion.div>

        {/* Deliverables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DELIVERABLES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group p-6 sm:p-8 bg-card border border-border rounded-xl hover:border-primary/40 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="text-accent mb-4"
                >
                  <Icon className="w-8 h-8" />
                </motion.div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>

                {/* Hover accent */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-border text-sm text-accent font-medium"
                >
                  Included in all plans →
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
