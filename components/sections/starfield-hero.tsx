'use client';

import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { MicroDemoCard } from '@/components/interactive/micro-demo-card';
import { Starfield } from '@/components/interactive/starfield';

export function StarfieldHero() {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-background via-background to-background overflow-hidden">
      {/* Starfield canvas */}
      <Starfield />

      {/* Gradient beams */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-b from-accent/15 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-12 px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto h-screen">
        {/* Left: Headline & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 max-w-xl space-y-8"
        >
          <div className="space-y-4">
            <h1 className="font-space-grotesk text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Market signals into winning strategy
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Get comprehensive competitive intelligence and actionable recommendations in 30 minutes. Grounded in real market data.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Generate plan
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-card/50 transition-colors flex items-center justify-center gap-2"
            >
              View sample report
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap gap-6 pt-8 border-t border-border/50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Grounded signals</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Versioned outputs</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Weekly improvements</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Micro Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="hidden lg:block flex-1 max-w-md"
        >
          <MicroDemoCard />
        </motion.div>
      </div>

      {/* Run status pill - below hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 flex justify-center pb-20"
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-md w-fit mx-auto">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-muted-foreground">
            Collecting → Summarizing → Strategy Ready
          </span>
        </div>
      </motion.div>
    </section>
  );
}
