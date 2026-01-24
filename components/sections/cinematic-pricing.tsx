'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$2,500',
    description: 'Single market analysis',
    features: ['Market snapshot', 'Competitive positioning', '3 signal sources', 'Email support'],
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$7,500',
    description: 'Full strategic suite',
    features: [
      'All signals (5 sources)',
      'Detailed opportunity map',
      'Quick wins playbook',
      'Quarterly updates',
      'Channel strategy',
      'Priority support',
    ],
    cta: 'Start Now',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Dedicated strategy',
    features: [
      'Everything in Professional',
      'Dedicated analyst',
      'Monthly reviews',
      'Custom integrations',
      'Real-time dashboard',
      '24/7 phone support',
    ],
    cta: 'Contact Sales',
  },
];

export function CinematicPricing() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-space-grotesk">
            Transparent pricing
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Choose the plan that matches your ambition.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-xl border transition-all ${
                plan.highlighted
                  ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20 md:scale-105'
                  : 'bg-card/50 border-border hover:border-primary/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-primary text-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan Info */}
              <div className="space-y-2 mb-6">
                <h3 className="text-2xl font-bold font-space-grotesk text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="text-4xl font-bold font-space-grotesk text-foreground">{plan.price}</div>
                {plan.name !== 'Enterprise' && (
                  <p className="text-xs text-muted mt-1">one-time</p>
                )}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2.5 rounded-lg font-semibold transition-colors mb-6 ${
                  plan.highlighted
                    ? 'bg-primary hover:bg-primary/90 text-foreground'
                    : 'border border-primary/50 text-primary hover:bg-primary/10'
                }`}
              >
                {plan.cta}
              </motion.button>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, featureIdx) => (
                  <motion.div
                    key={featureIdx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 + featureIdx * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
