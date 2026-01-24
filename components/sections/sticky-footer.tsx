'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function StickyFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      // Show sticky CTA when user is near the bottom of page
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      // Show when 60% through the page or scrolled 2000px
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
          className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 sm:px-6 sm:py-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pointer-events-none"
        >
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-strong p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
            >
              {/* Content */}
              <div className="flex-1 space-y-1 min-w-0 text-center sm:text-left">
                <h4 className="font-bold text-white text-base sm:text-lg leading-tight">Ready to transform your market strategy?</h4>
                <p className="text-xs sm:text-sm text-slate-400">Get your personalized evidence report and start winning today.</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none glass-strong bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold text-white text-sm sm:text-base transition-all"
                >
                  Start Analysis
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDismissed(true)}
                  className="glass-subtle p-2 rounded-lg hover:glass-strong transition-all"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
