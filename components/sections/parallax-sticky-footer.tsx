'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function StickyFooterCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      // Show sticky CTA when user is past a certain scroll point
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      // Show when 40% through the page
      const shouldShow = scrollPercentage > 40 && scrollPercentage < 95;

      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 sm:px-6 sm:py-6 bg-gradient-to-t from-white via-white to-transparent border-t border-slate-200 pointer-events-none"
        >
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between gap-4 sm:gap-6 px-6 py-4 sm:py-5 rounded-lg bg-white border border-slate-200 shadow-lg"
            >
              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground text-base sm:text-lg">
                  Your strategy report is ready to explore
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Scroll through 5 chapters of actionable insights
                </p>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm sm:text-base hover:shadow-lg transition-all"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDismissed(true)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
