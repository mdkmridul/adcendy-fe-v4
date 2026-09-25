'use client';

import { motion } from 'framer-motion';
import { Check, ChevronRight, Megaphone, Globe, Users, LayoutGrid, MessageSquare, CalendarDays, X } from 'lucide-react';
import Link from 'next/link';
import { BUSINESS_TERMS as TERMS } from '@/shared/marketing/business-terms';

const DELIVERABLES = [
  {
    title: 'Competitive & market intelligence',
    description: 'How your competitors position themselves, what they\'re doing across advertising and search, and the gaps no one\'s filling.',
    icon: Globe,
  },
  {
    title: 'Positioning audit',
    description: 'What you\'re saying vs. what your market actually hears.',
    icon: Megaphone,
  },
  {
    title: 'ICP refinement',
    description: 'The specific buyer this 30-day plan targets.',
    icon: Users,
  },
  {
    title: 'Keyword & channel direction',
    description: 'Where the openings are — paid, organic, content, partnerships — with the rationale for each.',
    icon: LayoutGrid,
  },
  {
    title: 'Messaging framework',
    description: 'Angles, hooks, and copy patterns built around your audience.',
    icon: MessageSquare,
  },
  {
    title: '30-day priorities',
    description: 'What your team should aim at each week, in priority order.',
    icon: CalendarDays,
  },
];

const PROVIDES = [
  'A full competitive and market intelligence workup — competitor positioning, their advertising and search approach in plain terms, keyword and channel opportunities, and the gaps in your market.',
  'A marketing strategy built on that intelligence — priorities, positioning, channel and messaging direction, grounded in your unit economics.',
  'Delivered as a clear document your team owns, executes, and refines — not a black box.',
  'A strategic starting point at consultant-grade depth, without the consultant timeline or retainer.',
];

const DOES_NOT = [
  'We don\'t run your marketing. No ad management, no content production, no campaign execution.',
  'We\'re not an agency or a done-for-you service.',
  'We don\'t replace your marketing team — we give them direction and intelligence to act on.',
  'We\'re not useful if you have no way to execute (no team, no freelancers, no capacity). A plan needs hands to run it.',
];

export function WhatYouGet() {
  return (
    <section id="what-you-get" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-4 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            What you get — and what you don&apos;t
          </h2>
          <p className="text-lg text-muted-foreground">
            Intelligence first, then the direction built on it. The document is just how it reaches your team.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground mb-12"
        >
          Average length: {TERMS.report.pages} pages. Time to read: {TERMS.report.readingTime}. Time for your team to act on it: starts day one.
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div className="p-8 rounded-xl border border-primary/30 bg-card/50 space-y-4">
            <h3 className="font-space-grotesk font-bold text-foreground">What AdCendy provides</h3>
            <ul className="space-y-3">
              {PROVIDES.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-xl border border-border bg-card/50 space-y-4">
            <h3 className="font-space-grotesk font-bold text-foreground">
              What AdCendy does <em>not</em> do
            </h3>
            <ul className="space-y-3">
              {DOES_NOT.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <X className="w-4 h-4 text-destructive/60 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link href="/sample-report" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            See what&apos;s inside a report
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
