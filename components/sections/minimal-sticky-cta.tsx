'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function StickyMinimalCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const shouldShow = scrollPercentage > 50 || window.scrollY > 1500;
      setIsVisible(shouldShow);
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
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none"
        >
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-border rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6"
            >
              <div className="flex-1 text-center sm:text-left space-y-1">
                <h4 className="font-semibold text-foreground text-base">
                  Ready to get strategic clarity?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your market report is just 30 minutes away.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 sm:flex-none px-6 py-2.5 sm:px-8 sm:py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
                >
                  Generate Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDismissed(true)}
                  className="p-2.5 hover:bg-muted rounded-lg transition-colors"
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
