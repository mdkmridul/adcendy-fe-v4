'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const BENEFITS = [
  'Market snapshot & competitive analysis',
  'Your differentiation strategy',
  'Multi-channel execution plan',
  'Creative variants for testing',
  'Weekly optimization framework',
  '1-year validity with updates',
];

export function CTA() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Ready to see your strategy?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your personalized strategy report includes everything you need to dominate your market.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid sm:grid-cols-2 gap-4 py-8">
            {BENEFITS.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-left"
              >
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
            >
              Generate My Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg border-2 border-foreground text-foreground font-semibold hover:bg-foreground/5 transition-all"
            >
              See Sample Report
            </motion.button>
          </motion.div>

          <p className="text-sm text-muted-foreground">
            30 minutes. Comprehensive. Actionable. <span className="font-semibold text-foreground">$7,500</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
