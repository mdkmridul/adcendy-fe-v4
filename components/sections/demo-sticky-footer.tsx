'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';

export function StickyFooterCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const shouldShow = scrollPercentage > 60 || window.scrollY > 2000;

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
          className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 sm:px-6 sm:py-6 bg-gradient-to-t from-[#0f172e] via-[#0f172e] to-transparent pointer-events-none"
        >
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-liquid p-4 sm:p-6 rounded-lg sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
            >
              {/* Content */}
              <div className="flex-1 space-y-1 min-w-0 text-center sm:text-left">
                <h4 className="font-sora font-bold text-white text-base sm:text-lg leading-tight">
                  Ready to win your market?
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Simulate your market strategy in 30 seconds
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none glass-liquid px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Start Demo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDismissed(true)}
                  className="glass-liquid-sm p-2 rounded-lg hover:bg-white/15 transition-all"
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
