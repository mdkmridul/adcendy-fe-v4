'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

const evidenceCards = [
  {
    id: 1,
    title: 'Search Results',
    source: 'SERP',
    description: 'Real-time ranking positions, featured snippets, and competitor analysis across target keywords.',
    icon: '📊',
  },
  {
    id: 2,
    title: 'Paid Advertising',
    source: 'Meta Ads',
    description: 'Creative performance, audience targeting, bidding strategies, and conversion tracking across platforms.',
    icon: '📢',
  },
  {
    id: 3,
    title: 'Local Presence',
    source: 'Listings',
    description: 'Google Business Profile data, review sentiment, local pack visibility, and citation consistency.',
    icon: '📍',
  },
  {
    id: 4,
    title: 'Customer Feedback',
    source: 'Reviews',
    description: 'Sentiment analysis, theme extraction, competitive benchmarking, and reputation trends over time.',
    icon: '⭐',
  },
  {
    id: 5,
    title: 'Content Performance',
    source: 'Analytics',
    description: 'Traffic patterns, engagement metrics, user behavior signals, and content effectiveness scoring.',
    icon: '📈',
  },
];

export function WhatWeIngest() {
  const [dragActive, setDragActive] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            What We <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">Ingest</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Every signal matters. We collect evidence from your entire digital ecosystem to build comprehensive market intelligence.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left scroll button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('left')}
            className="absolute -left-4 sm:left-0 top-1/2 transform -translate-y-1/2 z-20 glass-strong p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            onMouseDown={() => setDragActive(true)}
            onMouseLeave={() => setDragActive(false)}
            onMouseUp={() => setDragActive(false)}
          >
            {evidenceCards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-full sm:w-96"
              >
                <div className="glass-strong p-6 rounded-xl h-full hover:bg-white/12 transition-all duration-300 group/card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl text-white font-bold mb-1">{card.title}</h3>
                      <p className="text-xs uppercase tracking-wider text-orange-400 font-semibold">{card.source}</p>
                    </div>
                    <div className="text-3xl group-hover/card:scale-110 transition-transform">{card.icon}</div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{card.description}</p>
                  <motion.div
                    className="mt-6 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full w-0 group-hover/card:w-full transition-all duration-300"
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right scroll button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('right')}
            className="absolute -right-4 sm:right-0 top-1/2 transform -translate-y-1/2 z-20 glass-strong p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Scroll hint */}
        <p className="text-center text-slate-500 text-sm mt-8">← Drag or use arrows to scroll →</p>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>
    </section>
  );
}
