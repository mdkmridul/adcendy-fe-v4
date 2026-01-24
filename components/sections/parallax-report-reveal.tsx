'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, Radio, Zap, RefreshCw } from 'lucide-react';

const CHAPTERS = [
  {
    id: 1,
    title: 'Market Snapshot',
    subtitle: 'Current landscape analysis',
    icon: BarChart3,
    preview: 'Market Overview',
    content: 'Deep dive into your competitive landscape. Market size, growth trends, key players, and white space opportunities.',
  },
  {
    id: 2,
    title: 'Offer & Positioning',
    subtitle: 'Your strategic advantage',
    icon: Target,
    preview: 'Positioning Map',
    content: 'Your unique value proposition. How you differentiate. Messaging framework and positioning statement.',
  },
  {
    id: 3,
    title: 'Channel Plan',
    subtitle: 'Where to win',
    icon: Radio,
    preview: 'Channel Strategy',
    content: 'Primary and secondary channel strategy. Budget allocation. Timing and sequencing for maximum impact.',
  },
  {
    id: 4,
    title: 'Ad Variants',
    subtitle: 'Creative testing framework',
    icon: Zap,
    preview: 'Creative Direction',
    content: 'Three ad variants per channel. Headlines, hooks, and CTA strategies. A/B testing roadmap.',
  },
  {
    id: 5,
    title: 'Weekly Tweaks Loop',
    subtitle: 'Continuous optimization',
    icon: RefreshCw,
    preview: 'Optimization Cycle',
    content: 'Week-by-week optimization plan. KPIs to track. Triggers for pivots. Your 90-day execution rhythm.',
  },
];

export function ParallaxReportReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Calculate where in the section we are
      const scrollInSection = Math.max(0, viewportHeight - sectionTop);
      const progress = Math.min(1, scrollInSection / (sectionHeight + viewportHeight));
      
      setScrollProgress(progress);

      // Calculate active chapter based on scroll
      const chapterIndex = Math.floor(progress * CHAPTERS.length);
      setActiveChapter(Math.min(chapterIndex, CHAPTERS.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Container with parallax layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start relative min-h-[300vh]">
          
          {/* Left: Chapters */}
          <div className="space-y-24 lg:sticky lg:top-32 lg:self-start">
            {CHAPTERS.map((chapter, idx) => {
              const Icon = chapter.icon;
              const isActive = idx === activeChapter;

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  className={`space-y-3 transition-all duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white scale-110'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {chapter.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Chapter number indicator */}
                  <div className="flex items-center gap-2 ml-15">
                    <div className={`h-1 transition-all duration-300 ${
                      isActive ? 'w-12 bg-gradient-to-r from-purple-500 to-indigo-600' : 'w-6 bg-border'
                    }`} />
                    <span className={`text-xs font-semibold transition-colors duration-300 ${
                      isActive ? 'text-purple-600' : 'text-muted-foreground'
                    }`}>
                      Chapter {chapter.id}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Sticky Preview */}
          <div className="hidden lg:block lg:sticky lg:top-32 lg:self-start">
            <motion.div
              key={`preview-${activeChapter}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-xl"
            >
              {/* Report header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                  Strategy Report
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {CHAPTERS[activeChapter].preview}
                </h2>
              </div>

              {/* Report content */}
              <div className="p-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Key Finding
                    </p>
                    <p className="mt-2 font-bold text-foreground">
                      {activeChapter === 0 ? '42%' : activeChapter === 1 ? '3x' : activeChapter === 2 ? '68%' : activeChapter === 3 ? '1.8x' : '+35%'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Opportunity
                    </p>
                    <p className="mt-2 font-bold text-foreground">
                      ${activeChapter === 0 ? '2.4M' : activeChapter === 1 ? '1.8M' : activeChapter === 2 ? '890K' : activeChapter === 3 ? '1.2M' : '650K'}
                    </p>
                  </div>
                </div>

                {/* Content preview */}
                <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-foreground">
                    {CHAPTERS[activeChapter].title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {CHAPTERS[activeChapter].content}
                  </p>
                </div>

                {/* Progress indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Reading Progress</span>
                    <span className="text-muted-foreground">
                      {Math.round(((activeChapter + 1) / CHAPTERS.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                      animate={{ width: `${((activeChapter + 1) / CHAPTERS.length) * 100}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
