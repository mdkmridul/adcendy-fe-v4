'use client';

import { motion } from 'framer-motion';
import { Target, LineChart, Stethoscope } from 'lucide-react';

const POINTS = [
  {
    title: 'Every play comes with a target',
    body: 'For each recommendation: the metric that tells you it’s working, and the range you should expect it to move into — grounded in your category and your unit economics.',
    icon: Target,
  },
  {
    title: 'You read your own numbers',
    body: 'You check your results against the ranges in the plan. In range, you’re on track — keep going. Outside it, you know early, not three months in.',
    icon: LineChart,
  },
  {
    title: 'We help you read what they mean',
    body: 'During your support window, if a number’s off, we help you diagnose why — a setup issue, an execution gap, or a real reason to adjust the plan. You’re never staring at a dashboard alone.',
    icon: Stethoscope,
  },
];

export function Benchmarks() {
  return (
    <section id="benchmarks" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            You&apos;ll know if it&apos;s working — without guessing
          </h2>
          <p className="text-lg text-muted-foreground">
            Most strategies hand you actions and leave you wondering whether they&apos;re landing. Ours
            tells you what to watch, and what &ldquo;on track&rdquo; looks like — before you start.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POINTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-xl border bg-card/50 transition-colors ${
                  idx === 0 ? 'border-primary/30' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-space-grotesk font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          Honest ranges, not vanity promises — set wide enough to mean something, specific enough to act on.
        </motion.p>
      </div>
    </section>
  );
}
