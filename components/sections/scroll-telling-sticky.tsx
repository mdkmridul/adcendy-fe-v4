'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Target, Sparkles, TrendingUp } from 'lucide-react';

const CHAPTERS = [
  {
    id: 1,
    title: 'Market Snapshot',
    icon: BarChart3,
    description: 'Current market size, growth trends, and competitive density in your target segment.',
    subtitle: 'Understand the landscape',
  },
  {
    id: 2,
    title: 'Offer & Positioning',
    icon: Target,
    description: 'How your positioning compares. Where the gaps are. What message resonates.',
    subtitle: 'Find your angle',
  },
  {
    id: 3,
    title: 'Channel Plan',
    icon: Zap,
    description: 'Which channels work in your market. Budget allocation. Tactical playbook for each.',
    subtitle: 'Go-to-market roadmap',
  },
  {
    id: 4,
    title: 'Ad Variants',
    icon: Sparkles,
    description: 'Winning ad copy, creative angles, and audience segments to test first.',
    subtitle: 'Conversion accelerators',
  },
  {
    id: 5,
    title: 'Weekly Tweaks Loop',
    icon: TrendingUp,
    description: 'Automatic weekly updates. Market monitor. What changed, what to fix, what to double down on.',
    subtitle: 'Staying ahead',
  },
];

export function ScrollTellingSection() {
  const [activeChapter, setActiveChapter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const sections = containerRef.current.querySelectorAll('[data-chapter]');
      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.4) {
          setActiveChapter(idx);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Inside your strategy report
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scroll through each chapter to see what's inside. Sticky preview updates in real-time.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Chapters */}
          <div className="lg:col-span-1 space-y-6">
            {CHAPTERS.map((chapter, idx) => {
              const Icon = chapter.icon;
              const isActive = idx === activeChapter;

              return (
                <motion.div
                  key={chapter.id}
                  data-chapter={chapter.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-card border-primary shadow-lg shadow-primary/20'
                      : 'bg-background/50 border-border hover:border-border/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-primary/20' : 'bg-border'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-space-grotesk text-lg font-semibold text-foreground">{chapter.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{chapter.subtitle}</p>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{chapter.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Sticky Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                {/* Chapter header */}
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 bg-primary/20 rounded-full">
                    <span className="text-xs font-semibold text-primary">Chapter {activeChapter + 1}</span>
                  </div>
                  <h3 className="font-space-grotesk text-3xl font-bold text-foreground">
                    {CHAPTERS[activeChapter].title}
                  </h3>
                  <p className="text-muted-foreground">{CHAPTERS[activeChapter].description}</p>
                </div>

                {/* Preview content - varies by chapter */}
                <motion.div
                  key={activeChapter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {activeChapter === 0 && (
                    <div className="space-y-4">
                      <div className="bg-background/50 rounded-lg p-4 space-y-2">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Market Size</p>
                        <p className="text-2xl font-bold text-foreground">$4.2B TAM</p>
                        <p className="text-xs text-accent">+18% YoY growth</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4 space-y-2">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Key Competitors</p>
                        <p className="text-sm text-foreground">5 major players, 12+ emerging</p>
                      </div>
                    </div>
                  )}

                  {activeChapter === 1 && (
                    <div className="space-y-4">
                      <div className="bg-background/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Your Position</p>
                        <div className="space-y-1">
                          <p className="text-sm text-foreground">Differentiation: Speed + Accuracy</p>
                          <p className="text-xs text-muted-foreground">vs competitors focused on enterprise</p>
                        </div>
                      </div>
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                        <p className="text-xs text-accent uppercase font-semibold mb-2">Recommendation</p>
                        <p className="text-sm text-foreground">Lead with "30-minute strategy" messaging</p>
                      </div>
                    </div>
                  )}

                  {activeChapter === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground mb-2">Paid Ads</p>
                          <p className="text-xl font-bold text-foreground">40%</p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground mb-2">SEO</p>
                          <p className="text-xl font-bold text-foreground">35%</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground bg-background/50 rounded-lg p-4">Total monthly budget: $15K-25K</p>
                    </div>
                  )}

                  {activeChapter === 3 && (
                    <div className="space-y-4">
                      <div className="bg-background/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-semibold text-foreground">Ad Theme 1: Speed</p>
                        <p className="text-xs text-muted-foreground">"Market strategy in 30 minutes, not 30 days"</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-semibold text-foreground">Ad Theme 2: Data-Driven</p>
                        <p className="text-xs text-muted-foreground">"Real signals, real strategy"</p>
                      </div>
                    </div>
                  )}

                  {activeChapter === 4 && (
                    <div className="space-y-4">
                      <p className="text-sm text-foreground">Every week, your strategy updates automatically:</p>
                      <ul className="space-y-2">
                        <li className="flex gap-2">
                          <span className="text-accent font-bold">→</span>
                          <span className="text-sm text-foreground">New market data ingested</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-accent font-bold">→</span>
                          <span className="text-sm text-foreground">Strategy recalculated (v2, v3...)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-accent font-bold">→</span>
                          <span className="text-sm text-foreground">You get alerts on changes</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </motion.div>

                {/* Progress indicator */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Reading progress</span>
                    <span className="text-xs font-semibold text-foreground">{activeChapter + 1} of {CHAPTERS.length}</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((activeChapter + 1) / CHAPTERS.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
