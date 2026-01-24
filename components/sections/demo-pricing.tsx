'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '$2,500',
    desc: 'Single market analysis',
    features: ['SERP research', 'Competitor overview', 'Quick wins', 'Email support'],
  },
  {
    name: 'Professional',
    price: '$7,500',
    desc: 'Full market strategy',
    features: ['All 4 signals', 'Detailed competitive intel', '6-month roadmap', 'Priority support', 'Quarterly updates'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Custom solutions',
    features: ['Everything', 'Dedicated consultant', 'Real-time dashboard', 'Monthly reviews', 'Custom integrations'],
  },
];

export function Pricing() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-sora text-4xl sm:text-5xl font-bold text-white">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent, no hidden fees
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
              className={`glass-liquid p-8 relative ${plan.highlighted ? 'ring-2 ring-blue-500 md:scale-105' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-xs font-bold text-white">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-sora text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                </div>

                <div>
                  <p className="text-4xl font-bold text-blue-400">{plan.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">one-time</p>
                </div>

                <button className={`w-full py-3 font-semibold rounded-lg transition-all ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'glass-liquid text-white hover:bg-white/15'
                }`}>
                  Get Started
                </button>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  {plan.features.map((feature, fidx) => (
                    <motion.div
                      key={fidx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + fidx * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
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
