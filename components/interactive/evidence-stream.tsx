'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const evidenceSources = [
  { id: 1, label: 'SERP', color: 'from-blue-400 to-cyan-400' },
  { id: 2, label: 'Meta Ads', color: 'from-pink-400 to-rose-400' },
  { id: 3, label: 'Listings', color: 'from-amber-400 to-orange-400' },
  { id: 4, label: 'Reviews', color: 'from-green-400 to-emerald-400' },
];

const recommendations = [
  'Increase SERP budget 28%',
  'Optimize landing pages',
  'Refine audience targeting',
  'Test new ad creative',
];

export function EvidenceStream() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="relative w-full h-96 glass-strong p-6 rounded-2xl flex flex-col">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent rounded-2xl"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {/* Evidence Inputs */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Evidence Ingestion</p>
          <div className="grid grid-cols-2 gap-2">
            {evidenceSources.map((source, idx) => (
              <motion.div
                key={source.id}
                onMouseEnter={() => setHoveredId(source.id)}
                onMouseLeave={() => setHoveredId(null)}
                animate={{
                  scale: hoveredId === source.id ? 1.05 : 1,
                  opacity: hoveredId === null || hoveredId === source.id ? 1 : 0.6,
                }}
                className="group cursor-pointer"
              >
                <div className={`glass-subtle p-2 px-3 rounded-lg flex items-center gap-2 hover:glass-strong transition-all`}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: idx * 0.2 }}
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${source.color}`}
                  ></motion.div>
                  <span className="text-xs text-slate-200 font-medium">{source.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Arrow transition */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center text-slate-500 text-lg"
        >
          ↓
        </motion.div>

        {/* Recommendations Output */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Recommendations</p>
          <div className="space-y-1.5">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="glass-subtle p-2 px-3 rounded-lg flex items-start gap-2"
              >
                <motion.span
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: idx * 0.1 }}
                  className="text-orange-400 text-sm mt-0.5"
                >
                  ✓
                </motion.span>
                <span className="text-xs text-slate-300">{rec}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
