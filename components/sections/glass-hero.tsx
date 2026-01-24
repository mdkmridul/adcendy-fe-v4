'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EvidenceStream } from '@/components/interactive/evidence-stream';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Headline & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 sm:gap-8"
        >
          <div className="space-y-4">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-purple-200 bg-clip-text text-transparent">
                Market Evidence
              </span>
              {' '}at Your Fingertips
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Transform fragmented market signals into clear, actionable strategies. AdCendy ingests evidence from every channel and synthesizes it into intelligence.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="glass-strong bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none text-base font-medium rounded-full px-8 backdrop-blur-xl"
            >
              Start Analysis
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-strong text-white border-purple-400/50 hover:bg-purple-500/10 rounded-full px-8 text-base font-medium bg-transparent"
            >
              View Sample Report
            </Button>
          </motion.div>
        </motion.div>

        {/* Right: Evidence Stream */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="hidden lg:block"
        >
          <EvidenceStream />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="text-center text-slate-400 text-sm">
          <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <motion.div
              animate={{ y: [2, 8, 2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-2 bg-slate-400 rounded-full"
            ></motion.div>
          </div>
          Scroll to explore
        </div>
      </motion.div>
    </section>
  );
}
