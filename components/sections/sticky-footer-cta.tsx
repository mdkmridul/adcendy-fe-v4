'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';

export function StickyFooterCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { status } = useMarketingAuth();
  const ctaHref = status === 'authed' ? '/app/wizard' : '/auth/signup?next=/app/wizard';

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const shouldBeVisible = scrollPercentage > 60 || window.scrollY > 2000;
      
      // Only update state if visibility actually changes
      setIsVisible(prev => prev === shouldBeVisible ? prev : shouldBeVisible);
    };

    // Throttle scroll events to reduce excessive re-renders
    let rafId: number | null = null;
    const throttledScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          rafId = null;
        });
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none"
        >
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-space-grotesk font-semibold text-foreground text-base sm:text-lg">
                  Ready for your market strategy?
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Get started with AdCendy in 30 seconds
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <Link
                  href={ctaHref}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm text-center"
                >
                  Get Started
                </Link>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="px-3 py-2.5 border border-border hover:bg-card/50 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
