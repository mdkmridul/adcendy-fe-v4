'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, TrendingUp, Zap } from 'lucide-react';

interface DemoState {
  city: string;
  niche: string;
  budget: string;
  isSimulating: boolean;
  showResults: boolean;
}

const CITIES = ['New York', 'San Francisco', 'London', 'Toronto', 'Austin'];
const NICHES = ['SaaS', 'E-commerce', 'FinTech', 'Healthcare', 'EdTech'];
const BUDGETS = ['$5K', '$10K', '$25K', '$50K', '$100K+'];

export function MicroDemoCard() {
  const [state, setState] = useState<DemoState>({
    city: 'San Francisco',
    niche: 'SaaS',
    budget: '$25K',
    isSimulating: false,
    showResults: false,
  });

  const handleSimulate = () => {
    setState(prev => ({ ...prev, isSimulating: true, showResults: false }));
    setTimeout(() => {
      setState(prev => ({ ...prev, isSimulating: false, showResults: true }));
    }, 1800);
  };

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-6 shadow-xl"
      layoutId="demo-card"
    >
      <h3 className="font-space-grotesk text-lg font-bold text-foreground mb-6">
        Simulate Your Strategy
      </h3>

      <AnimatePresence mode="wait">
        {!state.showResults ? (
          <motion.div
            key="inputs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 mb-6"
          >
            {/* City Select */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wider">
                City
              </label>
              <select
                value={state.city}
                onChange={(e) => setState(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Niche Select */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wider">
                Niche
              </label>
              <select
                value={state.niche}
                onChange={(e) => setState(prev => ({ ...prev, niche: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {NICHES.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>
            </div>

            {/* Budget Select */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wider">
                Monthly Budget
              </label>
              <select
                value={state.budget}
                onChange={(e) => setState(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {BUDGETS.map(budget => (
                  <option key={budget} value={budget}>{budget}</option>
                ))}
              </select>
            </div>

            {/* Simulate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSimulate}
              disabled={state.isSimulating}
              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {state.isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Simulate
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Signals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Market Signals
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'SERP', value: '2,340 opportunities', icon: TrendingUp },
                  { label: 'Paid Ads', value: '12 competitors active', icon: Zap },
                  { label: 'Listings', value: '87% market coverage', icon: TrendingUp },
                ].map((signal, idx) => {
                  const Icon = signal.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-accent" />
                        <span className="text-xs font-medium text-muted-foreground">{signal.label}</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{signal.value}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30"
            >
              <p className="text-xs font-bold text-accent mb-1">Recommendation</p>
              <p className="text-xs text-foreground leading-relaxed">
                Strong market opportunity in {state.city} {state.niche} space. Recommend SEO + paid focus for rapid growth.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setState(prev => ({ ...prev, showResults: false }))}
              className="w-full px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Open sample report
            </motion.button>

            {/* Back button */}
            <button
              onClick={() => setState(prev => ({ ...prev, showResults: false }))}
              className="w-full px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-background transition-colors text-sm"
            >
              Try another scenario
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
