'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { usePublicCatalogue } from '@/shared/payments/usePublicCatalogue';

type Faq = { question: string; answer: string; id?: string };

// Pilot-only promises are said only while the server says the pilot is on.
// An entry with an `id` can be linked to directly, and opens when it is.
function buildFaqs(isPilot: boolean): Faq[] {
  return [
    {
      question: 'What counts as one market?',
      answer:
        "One market is one country. One strategy covers one country, end to end — the competitors in it, the searches your buyers run in it, and the openings inside it. We work at national level only: we don't build city or state strategies, because the competitor advertising data we read is published at country level, so a city strategy would be national data wearing a local label. What your city does contribute is real — what buyers near you actually search, and which competitors hold presence where you are, get read and folded into the national strategy. Selling into more than one country means more than one market, and we quote that package with you.",
    },
    {
      question: 'How is this different from an AI tool?',
      answer:
        "Generic tools generate from patterns — they don't know your actual competitors or what's moving in your market right now. We analyze your real market first, and the strategy is built on what we find. Then a human strategist validates it before it reaches you.",
    },
    {
      question: "What if I don't have a website yet?",
      answer:
        "We have a structured intake path for pre-website founders. We'll capture your offer, audience, and goals through a guided form and look at what the market already says about you and your competitors.",
    },
    {
      question: 'How long does it actually take?',
      answer:
        "About 7 days from intake to delivery. Market analysis runs in the first 24 hours; human review and strategy refinement takes 3–5 days; a revision round, if needed, adds 1–2 days. " +
        (isPilot
          ? "During the pilot we deliberately cap how many strategies we take on at once so this timeline holds — if we're at capacity when you order, we'll tell you the honest turnaround before you pay, not after."
          : "If we're ever at capacity when you order, we'll tell you the honest turnaround before you pay, not after."),
    },
    {
      question: "What if the strategy doesn't fit my business?",
      answer:
        "You get one revision round included." +
        (isPilot
          ? " If after that the strategy still doesn't surface 3 actionable opportunities specific to your business, we refund the pilot fee."
          : ""),
    },
    {
      question: 'Will you execute the strategy for me?',
      answer:
        "No — and that's deliberate. We're the direction, not the hands. The strategy is built for your team (in-house marketers, freelancers, or an agency) to own and run. Every market includes 30 days of guided support — a kickoff, a check on your numbers against the plan's targets, and a final review — so your team isn't on its own while they execute. If you have no way to execute yet, we're probably not the right first step.",
    },
    {
      question: 'Can I see a sample before paying?',
      answer:
        "Yes — and we'd encourage it. A redacted sample report shows exactly what's inside before you commit. Or use the free competitive snapshot to see how we read your own market.",
    },
    {
      question: 'Do you work with international clients?',
      answer:
        "Yes. We cover India, the US, and the UK today, and more countries on request. International pricing is in USD; the deliverable is the same. Each country is a separate market — see \"What counts as one market?\" above.",
    },
    {
      id: 'faq-industries',
      question: 'What industries do you specialize in?',
      answer:
        "Three: SaaS, D2C e-commerce, and established coaches or consultants who have a team or freelancers to execute. We've intentionally narrowed to deliver real depth in each — and since a strategy only works if you have the hands to run it, we focus on businesses with execution capacity, not solo operators.",
    },
    {
      question: 'Who actually reviews my strategy?',
      answer:
        "Every strategy is reviewed by an experienced marketer before delivery — nothing ships without passing that review. As we grow, we're building out the review bench so that standard holds as volume increases.",
    },
    {
      question: 'What happens to my data?',
      answer:
        "Your business information is used only to build your strategy. We don't sell or share data, and you can request deletion at any time.",
    },
  ];
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { isPilot } = usePublicCatalogue();
  const faqs = buildFaqs(isPilot);

  // A link straight to an answer opens it, on arrival and on every click
  // after, since SectionLink announces the hash even when it is unchanged.
  useEffect(() => {
    const openLinked = () => {
      // The pilot changes answers, never order, so either list gives the index.
      const linked = buildFaqs(false).findIndex(
        (faq) => faq.id && `#${faq.id}` === window.location.hash,
      );
      if (linked !== -1) setOpenIdx(linked);
    };
    openLinked();
    window.addEventListener('hashchange', openLinked);
    return () => window.removeEventListener('hashchange', openLinked);
  }, []);

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
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              id={faq.id}
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
