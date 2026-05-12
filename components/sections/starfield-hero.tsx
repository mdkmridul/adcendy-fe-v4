'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Starfield } from '@/components/interactive/starfield';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';

export function StarfieldHero() {
  const { status } = useMarketingAuth();
  const isAuthed = status === 'authed';
  const ctaHref = isAuthed ? '/app' : '/auth/signup';

  return (
    <section className="relative w-full min-h-screen bg-linear-to-b from-background via-background to-background overflow-hidden">
      <Starfield />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-linear-to-b from-primary/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-linear-to-b from-accent/15 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-border/50 bg-card/30 backdrop-blur-md">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              For SaaS founders, D2C brands, and coaches building their next 30 days
            </span>
          </div>

          <h1 className="font-space-grotesk text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Get a marketing strategy you can actually execute —{' '}
            <span className="text-primary">in 7 days, not 7 weeks.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Adcendy runs a live data pipeline across your market — competitors, keywords, SERPs, audience signals — then puts a human strategist on it before anything reaches you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href={ctaHref}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Get a free competitive snapshot
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </Link>
            <Link href="/sample-report">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-card/50 transition-colors flex items-center justify-center gap-2"
              >
                See a sample strategy
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xs text-muted-foreground"
          >
            No card. No call. 5-minute form, results in 24 hours.
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-md">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-muted-foreground">
            7 days · Human-reviewed · Execution-ready
          </span>
        </div>
      </motion.div>
    </section>
  );
}
