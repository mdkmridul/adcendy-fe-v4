'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'What signals does AdCendy analyze?',
    answer: 'We analyze SERP rankings, paid advertising campaigns, local business listings, and customer reviews across major platforms. This gives you a 360-degree view of your competitive market landscape and real market opportunities.',
  },
  {
    question: 'How quickly can I get my strategy report?',
    answer: 'Your initial report is delivered in approximately 30 minutes from submission. We process market data in real-time to ensure you get the most current and actionable insights for your market.',
  },
  {
    question: 'What makes the "versioned" strategy different?',
    answer: 'Your strategy automatically evolves with the market. Professional plans get weekly updates creating v1, v2, v3 of your strategy. You see what changed in the market and what tactics to adjust. Traditional consultants deliver once—we keep you ahead.',
  },
  {
    question: 'Can I customize the strategy for my specific situation?',
    answer: 'Absolutely. While our base reports are data-driven and comprehensive, Enterprise plans include a dedicated strategy consultant who can tailor recommendations to your specific business model, sales cycle, and resources.',
  },
  {
    question: 'Is this suitable for startups or only established companies?',
    answer: 'We work with companies at all stages. Startups especially benefit from understanding market signals early. Our Starter plan gives you that foundation. As you grow, upgrade to Professional or Enterprise for ongoing market intelligence.',
  },
  {
    question: 'What happens if I don\'t implement the recommendations?',
    answer: 'The strategy is there when you need it. Many customers keep their report for reference and implement tactics over time. Professional plans give you weekly updates so you can phase things in strategically without overwhelming your team.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-background py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about AdCendy
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
              className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-card/30 transition-colors"
              >
                <span className="font-space-grotesk font-semibold text-foreground">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIdx === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
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
                    <div className="px-6 py-4 border-t border-border bg-card/30">
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
