'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function StickyFooterCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercentage > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 left-4 z-40 sm:left-auto sm:right-6 sm:max-w-sm"
        >
          <div className="bg-card/80 backdrop-blur border border-border rounded-lg shadow-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">
                  Ready to find your edge?
                </h3>
                <p className="text-xs sm:text-sm text-muted">
                  Get your strategy report in 30 minutes.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDismissed(true)}
                className="flex-shrink-0 text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-3 py-2.5 bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-lg transition-colors text-sm"
            >
              Generate Report
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
