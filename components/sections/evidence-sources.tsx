'use client';

import { motion } from 'framer-motion';

const SOURCES = [
  { name: 'SERP', icon: '🔍', desc: 'Search rankings & keywords' },
  { name: 'Ads', icon: '📢', desc: 'Paid ad campaigns' },
  { name: 'Listings', icon: '📍', desc: 'Local business data' },
  { name: 'Reviews', icon: '⭐', desc: 'Customer sentiment' },
];

export function EvidenceSources() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          Evidence We Ingest
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SOURCES.map((source, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-liquid-sm p-4 text-center hover:bg-white/12 transition-all cursor-pointer group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{source.icon}</div>
              <p className="font-semibold text-white text-sm">{source.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{source.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
