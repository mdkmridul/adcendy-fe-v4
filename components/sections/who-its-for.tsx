'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

const STRONG_FIT = [
  'You have execution capacity — in-house marketers, freelancers, or an agency handling tactics — but no senior strategist or CMO setting direction.',
  "You're a founder with some marketing literacy who needs a coherent strategy, and a real read on your competition, to point your execution at.",
  "You're a funded early-stage brand or a growing business that knows how to act but needs to know what to act on.",
  'You want to see what competitors are actually doing and where the openings are — without spending weeks compiling it.',
];

const NOT_YET = [
  "You need someone to execute the marketing, not plan it — you're looking for an agency, and that's a different service.",
  "You already have a strong in-house strategy team — you likely don't need an outside plan, and your team won't thank you for one.",
  "You're a solo founder with no execution capacity — a strategy alone won't get you to done. You need hands as well as a head, and we're only the head.",
];

export function WhoItsFor() {
  return (
    <section id="who-its-for" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Built for teams with hands, but no head
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;d rather you find out here than after you&apos;ve paid.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col p-8 rounded-xl border border-primary/30 bg-card/50"
          >
            <h3 className="font-space-grotesk text-xl font-bold text-foreground mb-6">
              AdCendy is a strong fit if:
            </h3>
            <ul className="space-y-4">
              {STRONG_FIT.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col p-8 rounded-xl border border-border bg-card/50"
          >
            <h3 className="font-space-grotesk text-xl font-bold text-foreground mb-6">
              AdCendy is <em>not</em> the right fit (yet) if:
            </h3>
            <ul className="space-y-4">
              {NOT_YET.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                  <X className="w-4 h-4 text-destructive/60 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          Not sure which you are?{' '}
          <Link href="/sample-report" className="text-primary font-semibold hover:underline">
            See a sample report
          </Link>{' '}
          and decide for yourself.
        </motion.p>
      </div>
    </section>
  );
}
