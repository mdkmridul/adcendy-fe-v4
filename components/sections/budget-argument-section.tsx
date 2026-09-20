'use client';

import { motion } from 'framer-motion';
import { Banknote, CalendarClock, ShieldAlert } from 'lucide-react';

const COSTS = [
  {
    icon: Banknote,
    label: 'The ad spend it directs',
    body: 'Every rupee or dollar you put behind the wrong angle, the wrong audience, or the wrong channel is spent whether the direction was right or not.',
  },
  {
    icon: CalendarClock,
    label: 'The team-months it books',
    body: 'A quarter of your marketer’s, your freelancer’s, or your agency’s time goes into executing whatever the plan says. You pay for that time either way.',
  },
  {
    icon: ShieldAlert,
    label: 'The quarter you don’t get back',
    body: 'A wrong strategy doesn’t fail loudly. It spends the budget, fills the calendar, and shows you at the end of the quarter that you aimed at the wrong thing.',
  },
];

export function BudgetArgument() {
  return (
    <section id="budget" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            The strategy is the cheap part
          </h2>
          <p className="text-lg text-muted-foreground">
            The plan is a one-time fee. What the plan sends into motion is not.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COSTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-xl border border-border bg-card/50 space-y-3 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-space-grotesk font-bold text-foreground text-sm">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-8 rounded-xl border border-primary/30 bg-primary/5 text-center"
        >
          <p className="text-base text-foreground leading-relaxed max-w-3xl mx-auto">
            A wrong strategy doesn&rsquo;t just waste what it cost — it wastes everything you
            spend executing it. Set against the budget it governs, a verified, human-checked
            strategy is the cheapest insurance you can buy on it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
