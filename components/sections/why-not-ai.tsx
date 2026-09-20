'use client';

import { motion } from 'framer-motion';
import { RadioTower, GitBranch, ShieldCheck, FileSearch, Sparkles, Cpu } from 'lucide-react';

const PILLARS = [
  {
    icon: RadioTower,
    title: 'Your market as it stands today, not stored patterns.',
    body: 'We analyze your actual competitors, the searches your buyers run, and where demand is moving. Every finding is specific to your market and current — not inferred from what worked for someone else two years ago.',
  },
  {
    icon: GitBranch,
    title: 'Intelligence first, strategy second.',
    body: 'We map the competitive landscape before a single recommendation is written, with quality checks at every step. The strategy is built on what we find — not the other way round.',
  },
  {
    icon: ShieldCheck,
    title: 'The human review gate is mandatory, not marketing.',
    body: "A named reviewer can reject the strategy, send it back for more data, catch what the model missed, and is accountable for the bet it asks you to make. Nothing ships without passing that gate. Most tools hand you whatever the model produced, unread by anyone.",
  },
  {
    icon: FileSearch,
    title: 'Every recommendation is grounded.',
    body: "Recommendations trace back to the market evidence behind them — you see the reasoning for each one, not just a confident assertion. When the data doesn't support a claim, we don't make it.",
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
            AI-powered, human-judged &mdash; not AI-generated
          </h2>
          <p className="text-lg text-muted-foreground">
            The difference between a generic strategy and one that actually fits your market is
            where the intelligence comes from &mdash; and who signs off on it.
          </p>
        </motion.div>

        {/* AI-powered is not AI-generated: the distinction the whole product rests on. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="p-8 rounded-xl border border-border bg-card/30 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-space-grotesk font-bold text-muted-foreground">AI-generated</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A model guessing from the few lines you typed into it. That is what a free tool or a
              $20 chatbot gives you: fluent, confident, and built on nothing but your own inputs and
              whatever it absorbed before your market moved.
            </p>
          </div>
          <div className="p-8 rounded-xl border border-primary/40 bg-primary/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-space-grotesk font-bold text-foreground">AI-powered</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI doing the heavy lifting &mdash; reading real, current market data at a scale no
              person could work through by hand. The judgment about what it means and what you
              should do about it stays human.
            </p>
          </div>
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
