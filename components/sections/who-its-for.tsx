'use client';

import { motion } from 'framer-motion';

const AUDIENCES = [
  {
    title: 'For SaaS founders',
    body: "You've got a product, a few users, and a hunch about who should buy. We turn that hunch into a positioning + acquisition plan that doesn't depend on you posting on LinkedIn every day.",
    bestFit: 'Pre-Series A, ARR under $1M, founder doing marketing alone.',
  },
  {
    title: 'For D2C brands',
    body: "You're spending on Meta with diminishing returns. We rebuild the funnel — creative angles, audience strategy, retention layer, and where organic should slot in to bring CAC down.",
    bestFit: 'Monthly revenue ₹5L–50L, heavy on paid, no in-house marketer.',
  },
  {
    title: 'For coaches & consultants',
    body: "You're great at your craft, terrible at packaging it. We turn your offer into a clear positioning + content engine that brings inbound leads instead of you cold-DMing.",
    bestFit: 'Solo practitioner or small team, charging premium, tired of referrals being your only channel.',
  },
];

export function WhoItsFor() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Built for founders who don&apos;t have time to figure marketing out from scratch
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIENCES.map((audience, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col p-8 rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors"
            >
              <h3 className="font-space-grotesk text-xl font-bold text-foreground mb-4">
                {audience.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed flex-1">{audience.body}</p>
              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Best fit:</span>{' '}
                  {audience.bestFit}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
