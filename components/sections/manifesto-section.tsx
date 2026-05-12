'use client';

import { motion } from 'framer-motion';

const BELIEFS = [
  {
    title: 'Most marketing strategies fail because of bad inputs, not bad ideas.',
    body: 'Agencies skip research to hit deadlines. AI tools pattern-match instead of investigating. The output is generic because the input was generic. We invert that — research is where we spend the most time, not the least.',
  },
  {
    title: 'Founders need decisions, not frameworks.',
    body: "A strategy that says \"consider building a content engine\" isn't a strategy. We tell you what to build, why, and in what order — and we're willing to be wrong in writing.",
  },
  {
    title: 'The process is the product, not the output.',
    body: "Lots of tools can generate a marketing strategy in 10 seconds. Ours takes 7 days — because we spend 6 of them collecting real data about your actual market, running it through a structured pipeline, and having a strategist pressure-test every recommendation. The time is intentional. The rigour is the value.",
  },
];

export function Manifesto() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Our take on marketing for SMBs
          </h2>
          <p className="text-lg text-muted-foreground">
            Three things shaped how Adcendy works.
          </p>
        </motion.div>

        <div className="space-y-8">
          {BELIEFS.map((belief, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.12 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mt-1">
                <span className="font-space-grotesk text-xs font-bold text-primary">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-space-grotesk text-lg font-bold text-foreground">
                  {belief.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{belief.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <p className="text-muted-foreground text-sm leading-relaxed">
            We are a small team building Adcendy under{' '}
            <span className="text-foreground font-medium">Erraiway Technologies LLP</span>.
            We are starting with a 7-client pilot to build this <em>with</em> real founder
            feedback, not in a vacuum.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
