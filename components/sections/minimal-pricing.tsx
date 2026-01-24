'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    description: 'Single market analysis',
    price: '$2,500',
    features: [
      'Market snapshot report',
      'Competitive positioning',
      'Basic opportunity sizing',
      '60-day access',
    ],
  },
  {
    name: 'Professional',
    description: 'Full strategic suite',
    price: '$7,500',
    features: [
      'Complete market analysis',
      'Detailed competitive intel',
      'Strategic roadmap (6 months)',
      'Ad variants & messaging',
      'Quick wins playbook',
      '1-year access + quarterly updates',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom + support',
    price: 'Custom',
    features: [
      'Everything in Professional',
      'Dedicated strategist',
      'Real-time dashboard',
      'Monthly strategy reviews',
      'Custom integrations',
      'Priority support',
    ],
  },
];

export function MinimalPricing() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Simple Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className={`rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-purple-50 border-primary ring-2 ring-primary/20'
                  : 'bg-white border-border hover:border-primary/30'
              }`}
            >
              <div className="p-8 space-y-6">
                {/* Plan name */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-foreground">{plan.price}</p>
                  {plan.price !== 'Custom' && (
                    <p className="text-xs text-muted-foreground">one-time</p>
                  )}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-base ${
                    plan.highlighted
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  Get Started
                </motion.button>

                {/* Features */}
                <div className="space-y-3 border-t border-border pt-6">
                  {plan.features.map((feature, featureIdx) => (
                    <motion.div
                      key={featureIdx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 + featureIdx * 0.05, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
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
