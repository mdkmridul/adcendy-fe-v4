'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Starter',
    description: 'Perfect for small teams exploring market insights',
    price: '$2,500',
    period: 'one-time',
    features: [
      'Single market analysis report',
      'SERP keyword research (up to 500 keywords)',
      'Competitor positioning overview',
      'Email support',
      '60-day validity',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    description: 'Full strategic suite for scaling businesses',
    price: '$7,500',
    period: 'one-time',
    features: [
      'Complete signal atlas across all channels',
      'SERP + Paid + Local + Reviews analysis',
      'Detailed competitive intelligence',
      'Strategic roadmap (6-month execution plan)',
      'Quick wins playbook (30-60-90 days)',
      'Priority email + chat support',
      '1-year validity + quarterly updates',
    ],
    cta: 'Start Strategy',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large-scale operations',
    price: 'Custom',
    period: "let's talk",
    features: [
      'Everything in Professional',
      'Dedicated strategy consultant',
      'Custom signal integrations',
      'Real-time dashboard access',
      'Monthly strategy reviews & adjustments',
      'Priority phone support',
      'Ongoing market monitoring & alerts',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Simple, Transparent <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Choose the plan that fits your market intelligence needs. Scale up as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className={`relative group ${plan.highlighted ? 'md:scale-105' : ''}`}
            >
              <div
                className={`glass-strong p-8 rounded-2xl h-full flex flex-col transition-all duration-300 ${
                  plan.highlighted ? 'ring-2 ring-purple-400 bg-gradient-to-br from-purple-500/20 to-purple-500/5' : 'hover:bg-white/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Info */}
                <div className="space-y-2 mb-6 mt-2">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="space-y-1 mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{plan.period}</p>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold mb-8 transition-all text-base ${
                    plan.highlighted
                      ? 'glass-strong bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white'
                      : 'glass-subtle text-white hover:glass-strong'
                  }`}
                >
                  {plan.cta}
                </motion.button>

                {/* Features */}
                <div className="space-y-3 flex-grow border-t border-white/10 pt-8">
                  {plan.features.map((feature, featureIdx) => (
                    <motion.div
                      key={featureIdx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 + featureIdx * 0.05, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-strong p-8 rounded-xl text-center space-y-4"
        >
          <p className="text-slate-300">
            <span className="font-semibold text-white">Need a custom package?</span> We work with enterprises to build tailored solutions with unlimited features + dedicated support.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-subtle px-8 py-2 rounded-full font-semibold text-white hover:glass-strong transition-all text-base"
          >
            Contact Our Sales Team
          </motion.button>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>
    </section>
  );
}
