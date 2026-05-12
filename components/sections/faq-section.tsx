'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How is this different from an AI tool?',
    answer:
      "Generic tools generate from patterns — they don't know your live competitors, your current SERP, or what's actually moving in your market right now. We collect that data through a live pipeline before any analysis begins. The difference is the source: collected, not generated. Then a human strategist validates it before it reaches you.",
  },
  {
    question: "What if I don't have a website yet?",
    answer:
      "We have a structured intake path for pre-website founders. We'll capture your offer, audience, and goals through a guided form and use SERP brand lookup for any external signals.",
  },
  {
    question: 'How long does it actually take?',
    answer:
      '7 days from wizard completion to delivery. Data collection and pipeline processing runs in the first 24 hours. Human review and strategy refinement takes 3–5 days. Revision round (if needed) adds 1–2 days.',
  },
  {
    question: "What if the strategy doesn't fit my business?",
    answer:
      "You get one revision round included. If after that the strategy still doesn't surface 3 actionable opportunities specific to your business, we refund the pilot fee.",
  },
  {
    question: 'Will you execute the strategy for me?',
    answer:
      "The strategy document is standalone — you (or your team) can run it. If you want execution support, the 30-Day Sprint adds weekly check-ins, content briefs, and ad creative direction.",
  },
  {
    question: 'Can I see a sample before paying?',
    answer:
      "Yes — anonymized samples are available on request. Or use the free competitive snapshot to see how we work without committing.",
  },
  {
    question: 'Do you work with international clients?',
    answer:
      "Yes. We work with clients across India, the US, UK, and SEA. International pricing is in USD; the deliverable is the same.",
  },
  {
    question: 'What industries do you specialize in?',
    answer:
      "Three: SaaS, D2C e-commerce, and coaches/consultants. We've intentionally narrowed to deliver real depth in each — we don't take on every type of business.",
  },
  {
    question: 'Who actually reviews my strategy?',
    answer:
      "Each strategy is reviewed by a human marketer on our team before delivery. As we scale the pilot, we're expanding the review team to maintain output quality.",
  },
  {
    question: 'What happens to my data?',
    answer:
      "Your business information is used only to build your strategy. We don't sell or share data, and you can request deletion at any time.",
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
            Everything you need to know about Adcendy
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              viewport={{ once: true }}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-card/30 transition-colors"
              >
                <span className="font-space-grotesk font-semibold text-foreground text-sm sm:text-base">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIdx === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-primary shrink-0" />
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
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {faq.answer}
                      </p>
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
