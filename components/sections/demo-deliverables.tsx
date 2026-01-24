'use client';

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Target, Zap, Map, CheckCircle } from 'lucide-react';

const DELIVERABLES = [
  { icon: TrendingUp, title: 'Market Analysis', desc: 'Deep-dive competitive landscape' },
  { icon: BarChart3, title: 'Competitor Intel', desc: 'Ad spend, keywords, positioning' },
  { icon: Target, title: 'Opportunity Map', desc: 'Gaps in the market' },
  { icon: Zap, title: 'Quick Wins', desc: '30-60-90 day action plan' },
  { icon: Map, title: 'Channel Strategy', desc: 'SERP, Ads, Local, Reviews' },
  { icon: CheckCircle, title: 'Implementation', desc: 'Tactics & metrics' },
];

export function Deliverables() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-sora text-4xl sm:text-5xl font-bold text-white">What You Get</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive deliverables in every AdCendy strategy report
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DELIVERABLES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="glass-liquid p-6 hover:bg-white/15 transition-all group cursor-pointer"
              >
                <Icon className="w-8 h-8 text-blue-400 mb-4 group-hover:text-teal-400 transition-colors" />
                <h3 className="font-semibold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
