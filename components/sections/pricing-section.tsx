'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '$2,500',
    desc: 'One-time comprehensive report',
    features: [
      'Market snapshot analysis',
      'Competitive positioning',
      'Top opportunities identified',
      'Email support',
      '60-day validity',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$7,500',
    desc: 'Full strategy + versioning',
    features: [
      'All Starter features',
      'Weekly market monitoring',
      'Auto-versioned strategy (v1, v2, v3...)',
      'Channel-specific playbooks',
      'Quick wins implementation guide',
      'Priority email support',
      '1-year validity + quarterly updates',
    ],
    highlighted: true,
    cta: 'Start Growing',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Dedicated strategy partnership',
    features: [
      'Everything in Professional',
      'Dedicated strategy consultant',
      'Real-time dashboard access',
      'Monthly strategy reviews',
      'Custom signal integrations',
      'Phone + VIP support',
      'Multi-market analysis',
    ],
    cta: 'Contact Sales',
  },
];

export function Pricing() {
  return (
    <section className="bg-background py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that matches your market intelligence needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl border transition-all ${
                plan.highlighted
                  ? 'md:scale-105 bg-card border-primary shadow-lg shadow-primary/20'
                  : 'bg-card/50 border-border hover:border-primary/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 space-y-8">
                <div className="space-y-2">
                  <h3 className="font-space-grotesk text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-4xl font-bold text-primary">{plan.price}</p>
                  <p className="text-xs text-muted-foreground">one-time investment</p>
                </div>

                <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-primary text-white hover:bg-blue-700'
                    : 'border border-primary text-primary hover:bg-primary/10'
                }`}>
                  {plan.cta}
                </button>

                <div className="space-y-3 border-t border-border pt-8">
                  {plan.features.map((feature, fidx) => (
                    <motion.div
                      key={fidx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + fidx * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
