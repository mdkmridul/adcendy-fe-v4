'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';

export function FinalCTA() {
  const { status } = useMarketingAuth();
  const isAuthed = status === 'authed';
  const ctaHref = isAuthed ? '/app' : '/auth/signup';

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Stop building marketing in your head.{' '}
            <span className="text-primary">Get it on paper.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Free 1-page competitive snapshot. No card, no call, no commitment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href={ctaHref}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Get my snapshot
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Or book a 20-minute call if you'd rather talk first
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="text-xs text-muted-foreground"
        >
          No card. No call. 5-minute form, results in 24 hours.
        </motion.p>
      </div>
    </section>
  );
}
