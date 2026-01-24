'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center">
      {/* Bold gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 -z-10" />
      
      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-5 -z-10" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23noiseFilter)" /%3E%3C/svg%3E")'
      }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* Subheading */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block"
          >
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Strategic Market Intelligence
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            Your Strategy Unfolds
          </motion.h1>

          {/* Subheading text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg sm:text-xl text-white/80 leading-relaxed"
          >
            Scroll through a comprehensive market strategy report, chapter by chapter. See your competitive positioning, channel plan, and week-by-week execution tactics unfold.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-purple-700 font-semibold text-base hover:bg-white/90 transition-all"
          >
            Start Your Strategy Report
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
