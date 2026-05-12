'use client';

import { motion } from 'framer-motion';

const PROBLEMS = [
  {
    label: 'Agencies',
    description:
      'Charge ₹1.5L–5L/month and take 4–6 weeks to deliver a strategy that\'s hard to tell apart from the one they sold the founder before you.',
  },
  {
    label: 'AI tools',
    description: 'Spit out generic playbooks pulled from blog posts you\'ve already read.',
  },
  {
    label: 'DIY',
    description:
      'Eats 20+ hours a week you don\'t have, and you still second-guess every channel decision.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            You don&apos;t have a marketing problem. You have a marketing{' '}
            <span className="text-primary">decision problem.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every SMB founder we talk to is stuck in the same loop:
          </p>
        </motion.div>

        <div className="space-y-4">
          {PROBLEMS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-5 p-6 rounded-lg border border-border bg-card/50"
            >
              <div className="flex-shrink-0 pt-0.5">
                <span className="inline-block px-3 py-1 bg-muted text-foreground text-sm font-semibold rounded-md">
                  {item.label}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="p-6 rounded-lg border border-primary/30 bg-primary/5 space-y-2"
        >
          <p className="text-foreground leading-relaxed">
            What you actually need: a strategy specific to <em>your</em> business,{' '}
            <em>your</em> competitors, and <em>your</em> customer — that someone qualified
            has stress-tested before handing it over.
          </p>
          <p className="text-primary font-semibold">That&apos;s what Adcendy does.</p>
        </motion.div>
      </div>
    </section>
  );
}
