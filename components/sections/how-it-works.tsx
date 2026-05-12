'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Search, UserCheck, FileText } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'You tell us about your business',
    time: '15 minutes',
    description:
      'A guided wizard captures your product, audience, goals, and current marketing setup. If you have a website, our system scrapes it for positioning, trust signals, and conversion architecture.',
    icon: ClipboardList,
  },
  {
    number: '02',
    title: 'Our data pipeline gets to work',
    time: 'within 24 hours',
    description:
      'We pull live competitor data, SERP rankings, keyword opportunities, and market positioning across 7 query categories — branded, non-branded, competitor, segment, and long-tail. Every data point is timestamped to your market.',
    icon: Search,
  },
  {
    number: '03',
    title: 'A human strategist reviews and refines',
    time: '3–5 days',
    description:
      'Nothing ships without passing our review gate. A strategist on our team validates the positioning, pressure-tests every recommendation, and turns the collected intelligence into a playbook you can actually run.',
    icon: UserCheck,
  },
  {
    number: '04',
    title: 'You get a 30-day execution-ready strategy',
    time: 'delivered day 7',
    description:
      'Not a pitch deck. A working document with positioning, messaging, channel mix, content themes, paid strategy, and a week-by-week execution calendar. Built to be used, not admired.',
    icon: FileText,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            From form to playbook in 7 days
          </h2>
          <p className="text-lg text-muted-foreground">
            Four steps. No calls until the strategy lands.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.6 }}
                className="relative space-y-5"
              >
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-linear-to-r from-primary/50 via-primary/20 to-transparent" />
                )}

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="font-space-grotesk text-sm font-bold text-primary">{step.number}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    {step.time}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Icon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <h3 className="font-space-grotesk text-base font-bold text-foreground leading-snug">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
