'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How do you collect market signals?',
    answer:
      'We aggregate real-time data from search engines (SERP rankings), paid advertising platforms (Meta, Google Ads), local business listings (Google My Business, Maps), customer review sites (Trustpilot, G2), and industry databases. This gives us a 360° view of market activity.',
  },
  {
    question: 'How long does it take to get my report?',
    answer:
      'Most reports are delivered within 30 minutes of submitting your market details. We analyze 5,000+ data points in real-time to ensure your recommendations are current and actionable.',
  },
  {
    question: 'Can I update my strategy if the market changes?',
    answer:
      'Yes. Your Professional plan includes quarterly updates to reflect market shifts. Enterprise customers get monthly reviews and real-time alerts for significant market changes.',
  },
  {
    question: 'What if I need custom analysis for multiple markets?',
    answer:
      'We can create multi-market reports that compare regions side-by-side. Enterprise customers get unlimited custom analyses and dedicated analyst support.',
  },
  {
    question: 'Is the data proprietary to my company?',
    answer:
      'Your strategy report is completely yours. We do not share insights with competitors. All analysis is confidential and can be used for investor presentations, board meetings, or internal strategy.',
  },
  {
    question: 'Do you provide ongoing support?',
    answer:
      'All plans include email support. Professional plans get priority support with faster response times. Enterprise customers get a dedicated account manager and 24/7 phone support.',
  },
];

export function CinematicFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-space-grotesk">
            Questions?
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Everything you need to know about AdCendy and market intelligence.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-card/50 transition-colors"
              >
                <span className="font-semibold text-foreground text-base">{faq.question}</span>
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
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 py-4 border-t border-border/50 bg-card/30 text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
