'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Search, UserCheck, FileText } from 'lucide-react';
import { BUSINESS_TERMS as TERMS, deliveryWindowLabel } from '@/shared/marketing/business-terms';

// Only the intake and the delivery commitment carry a time: the stages in
// between are ours to schedule, and the policy promises the end date only.
const STEPS: Array<{
  number: string;
  title: string;
  time?: string;
  description: string;
  icon: typeof ClipboardList;
}> = [
  {
    number: '01',
    title: 'You tell us about your business',
    time: `${TERMS.intake.formMinutes} minutes`,
    description:
      'A guided intake captures your product, audience, goals, and the team you have to execute. If you have a website, we analyze it for positioning, trust signals, and how it converts.',
    icon: ClipboardList,
  },
  {
    number: '02',
    title: 'We map your market',
    description:
      'We analyze what your competitors are doing across advertising and search, where the keyword and channel opportunities sit, and how your market positions itself — specific to your market, as it stands today.',
    icon: Search,
  },
  {
    number: '03',
    title: 'A human strategist reviews and refines',
    description:
      'Nothing ships without passing our review gate. An experienced strategist validates the positioning, pressure-tests every recommendation, and turns the intelligence into direction your team can act on.',
    icon: UserCheck,
  },
  {
    number: '04',
    title: 'Your team gets a strategy they own',
    time: `delivered ${deliveryWindowLabel()}`,
    description:
      'Not a pitch deck. A working document with the market intelligence, positioning, messaging, channel direction, and 30-day priorities — clear enough for your team to run with from day one.',
    icon: FileText,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            From intake to direction {deliveryWindowLabel()}
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
                  {step.time ? (
                    <div className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      {step.time}
                    </div>
                  ) : null}
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
