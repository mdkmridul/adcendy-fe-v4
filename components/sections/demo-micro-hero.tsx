'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, MapPin, Sparkles } from 'lucide-react';

const CITIES = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Austin'];
const NICHES = ['SaaS', 'E-commerce', 'Healthcare', 'FinTech', 'EdTech'];
const BUDGETS = ['$5K - $15K', '$15K - $50K', '$50K - $100K', '$100K+'];

const MOCK_SIGNALS = [
  { label: 'SERP', value: '2,480 keywords ranking', icon: '📊', trend: '+23%' },
  { label: 'Ads', value: '1,240 active ad variants', icon: '📢', trend: '+18%' },
  { label: 'Listings', value: '89 local listings optimized', icon: '📍', trend: '+12%' },
];

const MOCK_RECOMMENDATION = {
  title: 'Quick Win: Paid Search Expansion',
  description: 'Your competitors are allocating 40% more budget to search. We recommend scaling SERP bids by 15-25% across high-intent keywords.',
  impact: '+32% expected CTR',
};

export function DemoHero() {
  const [city, setCity] = useState('San Francisco');
  const [niche, setNiche] = useState('SaaS');
  const [budget, setBudget] = useState('$50K - $100K');
  const [simulating, setSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSimulate = () => {
    setShowResults(false);
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#0f172e] via-[#1a2555] to-[#0f172e] overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Aurora blob background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-screen blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/15 rounded-full mix-blend-screen blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
        {/* Left: Headlines & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="font-sora text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Market signals,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                winning strategy
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              See how AdCendy transforms SERP, ads, and local signals into your competitive edge. Simulate your market in seconds.
            </p>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span className="text-sm text-muted-foreground">5,000+ signals</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">98% accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">30 min delivery</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-liquid px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              Generate Strategy
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-liquid px-8 py-3 text-white font-semibold hover:bg-white/15 transition-all rounded-lg"
            >
              View Samples
            </motion.button>
          </div>
        </motion.div>

        {/* Right: Mini Strategy Simulator */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Input Card */}
          <div className="glass-liquid p-8 space-y-5">
            <h3 className="font-sora text-2xl font-bold text-white">Mini Strategy Simulator</h3>

            {/* City Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full glass-liquid-sm px-4 py-2 text-foreground bg-transparent cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-card">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Niche Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full glass-liquid-sm px-4 py-2 text-foreground bg-transparent cursor-pointer"
              >
                {NICHES.map((n) => (
                  <option key={n} value={n} className="bg-card">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Budget</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full glass-liquid-sm px-4 py-2 text-foreground bg-transparent cursor-pointer"
              >
                {BUDGETS.map((b) => (
                  <option key={b} value={b} className="bg-card">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulate Button */}
            <motion.button
              onClick={handleSimulate}
              disabled={simulating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full glass-liquid px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {simulating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  Simulating...
                </>
              ) : (
                'Simulate'
              )}
            </motion.button>
          </div>

          {/* Results Preview */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Signals */}
                <div className="space-y-3">
                  {MOCK_SIGNALS.map((signal, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="glass-liquid-sm p-4 border-l-2 border-teal-400"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">{signal.label}</p>
                          <p className="text-white font-semibold mt-1">{signal.value}</p>
                        </div>
                        <span className="text-teal-400 font-bold text-sm whitespace-nowrap">{signal.trend}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recommendation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="glass-liquid p-5 border-l-4 border-amber-400 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{MOCK_RECOMMENDATION.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{MOCK_RECOMMENDATION.description}</p>
                      <div className="mt-3 text-sm font-semibold text-teal-400">{MOCK_RECOMMENDATION.impact}</div>
                    </div>
                  </div>
                </motion.div>

                {/* View Report CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full glass-liquid px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  Open Sample Report →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
