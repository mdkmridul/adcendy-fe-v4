'use client';

import { motion } from 'framer-motion';

export function WhyNotYourTeam() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Why not just have your team do this?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Because the hard part isn&apos;t writing a plan — it&apos;s the intelligence underneath it.
            Decoding what every competitor in your market is doing across advertising and search,
            finding the keyword and channel openings, and turning it into direction is days of
            specialized work per cycle. Most teams have the capacity to <em>execute</em> — what
            they&apos;re missing is a dedicated strategist to tell them what to aim at.
          </p>
          <p className="text-lg text-foreground font-semibold leading-relaxed">
            AdCendy does the part that&apos;s expensive to staff. Your team does what they&apos;re good
            at: making it happen.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
