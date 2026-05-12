'use client';

import { motion } from 'framer-motion';
import { RadioTower, GitBranch, ShieldCheck, FileSearch } from 'lucide-react';

const PILLARS = [
  {
    icon: RadioTower,
    title: 'Live data collection, not stored patterns.',
    body: 'We pull from live SERPs, competitor sites, keyword databases, and search-trend feeds in real time. Every data point is specific to your market and timestamped to today — not inferred from what worked for someone else two years ago.',
  },
  {
    icon: GitBranch,
    title: 'A structured intelligence pipeline — not a single prompt.',
    body: 'The data moves through defined stages: collection → enrichment → competitive mapping → strategic synthesis. Each stage has its own quality checks. The system is built to catch gaps before a human ever touches the output.',
  },
  {
    icon: ShieldCheck,
    title: 'The human review gate is mandatory, not marketing.',
    body: "Every strategy goes through a human review before delivery. The reviewer can reject, request additional data, or refine the output. We don't ship if it doesn't pass. This isn't a nice-to-have — it's the last line of quality control.",
  },
  {
    icon: FileSearch,
    title: 'Every recommendation is traceable.',
    body: "Every claim in your strategy links back to a specific data source. You know exactly why we're recommending what we're recommending — not because a system was confident about it, but because the market data supports it.",
  },
];

export function WhyNotAI() {
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
            Most tools guess. We collect.
          </h2>
          <p className="text-lg text-muted-foreground">
            The difference between a generic strategy and one that actually fits your market
            is where the intelligence comes from.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-space-grotesk font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
