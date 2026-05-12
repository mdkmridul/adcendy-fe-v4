'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Megaphone, Globe, Users, LayoutGrid, MessageSquare, CalendarDays, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const DELIVERABLES = [
  {
    title: 'Business positioning audit',
    description: 'What you\'re saying vs. what your market actually hears.',
    icon: Megaphone,
  },
  {
    title: 'Competitive landscape',
    description: 'Where the gaps are and how you enter them.',
    icon: Globe,
  },
  {
    title: 'ICP refinement',
    description: 'The specific buyer this 30-day plan targets.',
    icon: Users,
  },
  {
    title: 'Channel strategy',
    description: 'Paid, organic, content, partnerships — with rationale per channel.',
    icon: LayoutGrid,
  },
  {
    title: 'Messaging framework',
    description: 'Angles, hooks, and copy patterns built around your audience.',
    icon: MessageSquare,
  },
  {
    title: '30-day execution calendar',
    description: 'What to ship each week, in priority order.',
    icon: CalendarDays,
  },
  {
    title: 'KPIs and what to expect',
    description: 'Realistic numbers, not vanity metrics.',
    icon: TrendingUp,
  },
];

export function WhatYouGet() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-4 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Inside your strategy document
          </h2>
          <p className="text-lg text-muted-foreground">
            This isn&apos;t a deck. It&apos;s a working playbook.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground mb-12"
        >
          Average length: 25–35 pages. Time to read: ~1 hour. Time to act on it: starts day one.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DELIVERABLES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.6 }}
                whileHover={{ y: -3 }}
                className="p-6 rounded-lg border border-border bg-card/50 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-space-grotesk font-bold text-foreground text-sm">
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link href="/sample-report" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            See a sample strategy
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
