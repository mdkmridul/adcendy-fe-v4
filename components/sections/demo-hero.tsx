'use client';

import React from "react"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, Target } from 'lucide-react';

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
const NICHES = ['SaaS', 'E-commerce', 'Local Services', 'Agency', 'Tech'];
const BUDGETS = ['$5K-$10K', '$10K-$25K', '$25K-$50K', '$50K+'];

type DemoSignal = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type DemoResult = {
  signals: DemoSignal[];
  recommendation: string;
};

const DEMO_RESULTS: Record<string, DemoResult> = {
  'New York-SaaS-$5K-$10K': {
    signals: [
      { label: 'SERP Opportunity', value: 'High volume keywords underserved', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Paid Gap', value: '$12-18/click average CPC', icon: <Target className="w-4 h-4" /> },
      { label: 'Competitor Strength', value: '3/10 saturation level', icon: <Users className="w-4 h-4" /> },
    ],
    recommendation: 'Focus on long-tail SERP strategy with paid ads in vertical niches. Budget allows for 500-800 conversions at current CPC.',
  },
  'Los Angeles-E-commerce-$10K-$25K': {
    signals: [
      { label: 'SERP Opportunity', value: 'Product category keywords trending', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Review Sentiment', value: '87% positive competitor reviews', icon: <Users className="w-4 h-4" /> },
      { label: 'Paid Efficiency', value: '$8-15/click with 3.2% CTR', icon: <Target className="w-4 h-4" /> },
    ],
    recommendation: 'Leverage review-focused content strategy. Allocate 60% to paid, 40% to organic growth with competitive pricing advantage.',
  },
  'Chicago-Local Services-$25K-$50K': {
    signals: [
      { label: 'Local Visibility', value: 'Map pack dominance possible', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Search Intent', value: 'High commercial intent keywords', icon: <Target className="w-4 h-4" /> },
      { label: 'Market Gap', value: 'Weak brand presence top 5', icon: <Users className="w-4 h-4" /> },
    ],
    recommendation: 'Invest in local SEO + Google Ads for service areas. Budget supports 15-20 qualified leads monthly with strong ROAS.',
  },
};

export function DemoHero() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [selectedNiche, setSelectedNiche] = useState(NICHES[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGETS[0]);
  const [showResults, setShowResults] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setShowResults(true);
      setIsSimulating(false);
    }, 1200);
  };

  const resultKey = `${selectedCity}-${selectedNiche}-${selectedBudget}`;
  const result = DEMO_RESULTS[resultKey] || DEMO_RESULTS['New York-SaaS-$5K-$10K'];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Your Market Intelligence in{' '}
            <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">30 Seconds</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Tell us about your market. Watch AdCendy analyze real signals and generate your strategic advantage.
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 sm:p-12 mb-12"
        >
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            <h3 className="text-white font-semibold text-lg">Ask AdCendy</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* City Select */}
              <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city} className="bg-slate-900">
                      {city}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Niche Select */}
              <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Niche</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {NICHES.map((niche) => (
                    <option key={niche} value={niche} className="bg-slate-900">
                      {niche}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Budget Select */}
              <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Budget</label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {BUDGETS.map((budget) => (
                    <option key={budget} value={budget} className="bg-slate-900">
                      {budget}
                    </option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* Simulate Button */}
            <motion.button
              onClick={handleSimulate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <TrendingUp className="w-5 h-5" />
                  </motion.div>
                  Analyzing...
                </>
              ) : (
                <>
                  Simulate <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-6 border-t border-white/20 pt-8"
              >
                <h4 className="text-white font-semibold">Market Signals Detected</h4>

                {/* Signal Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.signals.map((signal, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15, duration: 0.6 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-orange-400 mt-0.5">{signal.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">{signal.label}</p>
                          <p className="text-sm text-slate-400 mt-1">{signal.value}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recommendation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-400/30 rounded-lg p-4"
                >
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-orange-400">Recommendation: </span>
                    {result.recommendation}
                  </p>
                </motion.div>

                {/* View Report Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all"
                >
                  View Full Sample Report
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-slate-300 space-y-2"
        >
          <p className="text-sm font-medium">Backed by real market signals from</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide">5,000+ SERP Positions</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold uppercase tracking-wide">15,000+ Ad Variants</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold uppercase tracking-wide">98% Accuracy</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
