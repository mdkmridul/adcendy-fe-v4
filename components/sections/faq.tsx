'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'What exactly are "market signals" and how do you collect them?',
    answer:
      'Market signals are data points across search, paid advertising, local listings, and review platforms that reveal market trends and competitive activity. We aggregate data from SERP rankings, Meta Ads benchmarks, local business listings, and customer reviews to create a comprehensive market picture.',
  },
  {
    question: 'How long does it take to get my strategy report?',
    answer:
      'Reports are delivered in approximately 30 minutes from when you start the analysis. We conduct real-time market research, competitive analysis, and strategic planning to ensure your report is thorough and actionable.',
  },
  {
    question: 'Is this just for digital marketing, or does it cover the entire business?',
    answer:
      'While our focus is market signals and competitive strategy, the insights apply across your entire business. From product positioning to pricing strategy to GTM execution, a strong market understanding informs all business decisions.',
  },
  {
    question: 'Can I use the strategy report for multiple markets or regions?',
    answer:
      'Each report is customized for your specific target market or region. If you want analysis across multiple geographic areas or market segments, we can build a comprehensive multi-market strategy with regional breakdowns.',
  },
  {
    question: 'What if I don\'t understand something in the report?',
    answer:
      'All plans include email support, and our team will help clarify any findings. Professional and Enterprise plans get priority support and optional strategy calls to walk through recommendations.',
  },
  {
    question: 'Do you provide ongoing updates or is this a one-time report?',
    answer:
      'The base deliverable is a comprehensive one-time report. Professional plans include quarterly updates to track market changes, and Enterprise plans offer real-time monitoring with monthly strategy reviews.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Everything you need to know about AdCendy and market intelligence.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-strong rounded-xl overflow-hidden hover:bg-white/12 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between gap-4 text-left"
              >
                <span className="font-bold text-white text-base sm:text-lg">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIdx === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-orange-400" />
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
                    <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-white/10 bg-white/5">
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-strong p-8 sm:p-12 rounded-xl text-center space-y-4"
        >
          <h3 className="text-2xl font-bold text-white">Still have questions?</h3>
          <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">
            Our market strategy experts are ready to discuss your specific situation and customize an approach that fits your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-strong bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-8 py-3 rounded-lg font-semibold text-white transition-all text-base"
            >
              Schedule a Call
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-subtle px-8 py-3 rounded-lg font-semibold text-white hover:glass-strong transition-all text-base"
            >
              Email Us
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>
    </section>
  );
}
