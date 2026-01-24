'use client';

import { motion } from 'framer-motion';
import { BarChart3, PieChart } from 'lucide-react';

export function SampleReportPreview() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Sample Report
          </h2>
          <p className="text-lg text-muted-foreground">
            See what a completed AdCendy strategy report looks like.
          </p>
        </motion.div>

        {/* Report preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-25 px-8 py-6 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">Market Intelligence Report</h3>
            <p className="text-sm text-muted-foreground mt-1">SaaS Analytics Platform | Q1 2025</p>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Left column - Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h4 className="font-semibold text-foreground mb-2">Market Size & Growth</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The market is currently valued at $12.4B with projected 28% CAGR through 2027. Key drivers include AI adoption, demand for real-time analytics, and consolidation among competitors.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Top Opportunities</h4>
                <ul className="space-y-2">
                  {['Enterprise SMB segment (underserved)', 'Vertical-specific solutions', 'AI-powered insights'].map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Recommended Positioning</h4>
                <p className="text-muted-foreground text-sm bg-muted p-4 rounded-lg italic">
                  "The fastest way to turn market data into winning strategy—trusted by Fortune 500 teams."
                </p>
              </div>
            </motion.div>

            {/* Right column - Charts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Chart 1 */}
              <div className="bg-muted p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-foreground text-sm">Competitive Positioning</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Price Competitiveness', value: 75 },
                    { label: 'Feature Set', value: 88 },
                    { label: 'Market Presence', value: 62 },
                    { label: 'Customer Satisfaction', value: 82 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          transition={{ delay: 0.4 + idx * 0.1, duration: 0.8 }}
                          viewport={{ once: true }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2 */}
              <div className="bg-muted p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-foreground text-sm">Channel Opportunity</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Paid Search', value: '35%', color: 'bg-primary' },
                    { label: 'Content Marketing', value: '28%', color: 'bg-purple-300' },
                    { label: 'Partnerships', value: '22%', color: 'bg-purple-200' },
                    { label: 'Direct Sales', value: '15%', color: 'bg-purple-100' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="bg-muted px-8 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Page 1 of 12</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Download Full Report
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
