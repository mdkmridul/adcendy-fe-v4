'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'What signals does AdCendy analyze?',
    answer: 'We analyze SERP rankings, paid ad campaigns, local business listings, and customer reviews across major platforms. This gives you a 360° view of your competitive landscape.',
  },
  {
    question: 'How quickly can I get my strategy report?',
    answer: 'Reports are generated in approximately 30 minutes from submission. Our system processes market data in real-time to ensure you get the most current insights.',
  },
  {
    question: 'Can I update my strategy report?',
    answer: 'Yes! Professional and Enterprise plans include quarterly updates to track market changes and refine your strategy as conditions evolve.',
  },
  {
    question: 'Is this suitable for my industry?',
    answer: 'AdCendy works across SaaS, E-commerce, FinTech, Healthcare, and many other industries. If you operate in a competitive market with digital signals, we can help.',
  },
  {
    question: 'What support do you offer?',
    answer: 'All plans include email support. Professional plans get priority email support, and Enterprise plans include a dedicated consultant plus phone support.',
  },
  {
    question: 'Can I get a custom strategy?',
    answer: 'Absolutely. Our Enterprise plan is designed for custom requirements. Contact our sales team to discuss your specific needs.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-sora text-4xl sm:text-5xl font-bold text-white">FAQ</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Common questions about AdCendy
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="glass-liquid rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/10 transition-colors"
              >
                <span className="font-semibold text-white text-left">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIdx === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-teal-400 flex-shrink-0" />
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
                    <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
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
