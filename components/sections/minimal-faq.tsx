'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How quickly will I get my report?',
    answer:
      'Your strategy report is delivered within 30 minutes of starting your analysis. We conduct real-time market research and competitive analysis to provide actionable, data-driven insights.',
  },
  {
    question: 'What makes these insights different?',
    answer:
      'AdCendy analyzes real market signals across search, paid advertising, local listings, and reviews. We synthesize this data into strategic recommendations tailored to your specific market and competitive landscape.',
  },
  {
    question: 'Who should use AdCendy?',
    answer:
      'Ideal for marketing leaders, product managers, and strategists at B2B SaaS, B2C, and mid-market companies who need competitive intelligence and strategic clarity without lengthy consulting engagements.',
  },
  {
    question: 'Can I get updates after my report?',
    answer:
      'Yes. Professional and Enterprise plans include quarterly updates to track market changes and competitive shifts. Enterprise customers get real-time monitoring and monthly strategy reviews.',
  },
  {
    question: 'What if I have questions about my report?',
    answer:
      'All customers get email support. Professional and Enterprise plans include priority support and optional strategy consultation calls to walk through recommendations and implementation.',
  },
  {
    question: 'Is this just for digital marketing?',
    answer:
      'While our signals are marketing-focused, the strategic insights apply across your entire business—from product positioning to pricing strategy to go-to-market planning.',
  },
];

export function MinimalFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Questions?
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about AdCendy.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
              viewport={{ once: true }}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between gap-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold text-foreground text-base sm:text-lg">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIdx === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-primary" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-border bg-muted/30">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 pt-8 border-t border-border"
        >
          <h3 className="text-2xl font-bold text-foreground">Still have questions?</h3>
          <p className="text-muted-foreground">
            Reach out to our team. We'd love to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-base"
            >
              Schedule a Call
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors text-base"
            >
              Email Us
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
