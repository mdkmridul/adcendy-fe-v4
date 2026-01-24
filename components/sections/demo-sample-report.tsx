'use client';

import { motion } from 'framer-motion';

export function SampleReport() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-sora text-4xl sm:text-5xl font-bold text-white">Sample Report Preview</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what a complete AdCendy strategy report looks like
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-liquid p-8 space-y-6 max-w-4xl mx-auto"
        >
          {/* Report Header */}
          <div className="border-b border-white/10 pb-6">
            <h3 className="font-sora text-2xl font-bold text-white mb-2">Market Strategy Report</h3>
            <p className="text-muted-foreground">SaaS | San Francisco | Generated: Jan 23, 2026</p>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Executive Summary</h4>
            <p className="text-muted-foreground leading-relaxed">
              Your market shows 23% opportunity growth YoY. Competitors are investing heavily in search and paid social, with an estimated combined monthly ad spend of $480K. You have clear positioning gaps in the pricing-sensitive segment.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Competitor Count', value: '12' },
              { label: 'SERP Keywords', value: '2,480' },
              { label: 'Ad Variants', value: '1,240' },
              { label: 'Opportunity Score', value: '8.7/10' },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-liquid-sm p-4 text-center"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                <p className="text-2xl font-bold text-blue-400 mt-2">{metric.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Competitive Analysis */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <h4 className="font-semibold text-white">Top 3 Competitive Moves</h4>
            {[
              'Competitor A expanded into vertical markets (20% budget increase)',
              'Competitor B launched aggressive paid search campaign',
              'Competitor C optimized local listings across 50+ regions',
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-3"
              >
                <span className="text-teal-400 font-bold flex-shrink-0">{idx + 1}.</span>
                <p className="text-muted-foreground">{item}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full glass-liquid py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all mt-8"
          >
            Download Full Report PDF
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
