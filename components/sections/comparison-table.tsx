'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, X } from 'lucide-react';

type CellValue = 'yes' | 'maybe' | 'no' | string;

interface Row {
  label: string;
  values: CellValue[];
}

interface Category {
  heading: string;
  rows: Row[];
}

const CATEGORIES: Category[] = [
  {
    heading: 'Understanding Your Business',
    rows: [
      { label: 'Deep analysis of your website', values: ['yes', 'maybe', 'maybe', 'yes', 'maybe'] },
      { label: 'Study of what competitors are doing', values: ['yes', 'maybe', 'no', 'maybe', 'maybe'] },
      { label: 'Research on what customers search for', values: ['yes', 'no', 'no', 'maybe', 'no'] },
      { label: 'Defining your ideal customer', values: ['yes', 'no', 'no', 'maybe', 'maybe'] },
      { label: 'Review of how your website converts visitors', values: ['yes', 'maybe', 'no', 'yes', 'no'] },
    ],
  },
  {
    heading: 'Your Marketing Plan',
    rows: [
      { label: 'Strategy made specifically for your business', values: ['yes', 'maybe', 'yes', 'maybe', 'no'] },
      { label: 'Clear 30-day action plan', values: ['yes', 'no', 'maybe', 'maybe', 'no'] },
      { label: 'Where to focus (Google, Instagram, LinkedIn…)', values: ['yes', 'yes', 'yes', 'maybe', 'maybe'] },
      { label: 'What topics and content to create', values: ['yes', 'maybe', 'yes', 'maybe', 'maybe'] },
      { label: 'How to spend your budget', values: ['yes', 'maybe', 'yes', 'yes', 'no'] },
    ],
  },
  {
    heading: 'Real Human Review',
    rows: [
      { label: 'Human review gate before delivery', values: ['yes', 'yes', 'yes', 'yes', 'no'] },
      { label: 'Refined and improved before you see it', values: ['yes', 'maybe', 'yes', 'maybe', 'no'] },
      { label: 'Tailored to your business stage', values: ['yes', 'maybe', 'yes', 'maybe', 'no'] },
    ],
  },
  {
    heading: '30 Days of Hands-On Support',
    rows: [
      { label: 'Kickoff call to get started', values: ['yes', 'yes', 'yes', 'yes', 'no'] },
      { label: 'Mid-month check-in call', values: ['yes', 'maybe', 'yes', 'maybe', 'no'] },
      { label: 'End-of-month review of what worked', values: ['yes', 'yes', 'maybe', 'maybe', 'no'] },
      { label: 'Email/chat support throughout', values: ['yes', 'yes', 'yes', 'maybe', 'no'] },
      { label: 'Direction on what your ads should say', values: ['yes', 'yes', 'yes', 'maybe', 'no'] },
      { label: 'Feedback on your website pages', values: ['yes', 'maybe', 'yes', 'maybe', 'no'] },
    ],
  },
  {
    heading: "What We Don't Do (honest upfront)",
    rows: [
      { label: 'Run your ads for you', values: ['no', 'yes', 'yes', 'maybe', 'no'] },
      { label: 'Post on your social media', values: ['no', 'yes', 'yes', 'maybe', 'no'] },
      { label: 'Manage your day-to-day marketing', values: ['no', 'yes', 'yes', 'maybe', 'no'] },
    ],
  },
  {
    heading: 'How You Pay',
    rows: [
      { label: 'Pay once, no subscription', values: ['yes', 'no', 'no', 'maybe', 'maybe'] },
      { label: 'No long contracts', values: ['yes', 'no', 'no', 'yes', 'yes'] },
      { label: 'No setup fees', values: ['yes', 'no', 'no', 'yes', 'yes'] },
      { label: 'No hidden charges on your ad spend', values: ['yes', 'no', 'no', 'yes', 'yes'] },
      { label: 'Pricing shown clearly upfront', values: ['yes', 'no', 'no', 'maybe', 'yes'] },
    ],
  },
  {
    heading: 'What You Own',
    rows: [
      { label: 'You keep the full strategy document', values: ['yes', 'maybe', 'maybe', 'yes', 'yes'] },
      { label: 'You own everything we create', values: ['yes', 'maybe', 'maybe', 'yes', 'yes'] },
      { label: 'Not tied to any platform or tool', values: ['yes', 'no', 'no', 'yes', 'yes'] },
      { label: 'Walk away anytime', values: ['yes', 'no', 'no', 'yes', 'yes'] },
    ],
  },
];

const SPEED_ROW = {
  label: 'Strategy ready in',
  values: ['7 days', '30–60 days', '30–90 days', '14–30 days', 'Instant (poor quality)'],
};

const COLUMNS = ['Adcendy', 'Indian Agency', 'US Agency', 'Freelance Marketer', 'DIY AI Tools'];

function Cell({ value, isAdcendy }: { value: CellValue; isAdcendy: boolean }) {
  if (value === 'yes') {
    return (
      <td className={`px-4 py-3 text-center ${isAdcendy ? 'bg-primary/5' : ''}`}>
        <Check className="w-4 h-4 text-accent mx-auto" />
      </td>
    );
  }
  if (value === 'maybe') {
    return (
      <td className={`px-4 py-3 text-center ${isAdcendy ? 'bg-primary/5' : ''}`}>
        <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
      </td>
    );
  }
  if (value === 'no') {
    return (
      <td className={`px-4 py-3 text-center ${isAdcendy ? 'bg-primary/5' : ''}`}>
        <X className="w-4 h-4 text-destructive/60 mx-auto" />
      </td>
    );
  }
  // string value (speed row)
  return (
    <td className={`px-4 py-3 text-center text-xs font-medium ${isAdcendy ? 'bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
      {value}
    </td>
  );
}

export function ComparisonTable() {
  return (
    <section id="compare" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Adcendy vs. the alternatives
          </h2>
          <p className="text-lg text-muted-foreground">
            Honest comparison, including what we <em>don&apos;t</em> do.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-10 overflow-x-auto rounded-xl border border-border"
        >
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-4 text-left font-medium text-muted-foreground w-64">
                  What you get
                </th>
                {COLUMNS.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-4 text-center font-space-grotesk font-bold text-sm ${
                      idx === 0
                        ? 'text-primary bg-primary/5 border-x border-primary/20'
                        : 'text-foreground'
                    }`}
                  >
                    {col}
                    {idx === 0 && (
                      <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold align-middle">
                        YOU
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  <tr className="bg-muted/30">
                    <td
                      colSpan={6}
                      className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {cat.heading}
                    </td>
                  </tr>
                  {cat.rows.map((row, rowIdx) => (
                    <tr
                      key={`${catIdx}-${rowIdx}`}
                      className="border-t border-border/50 hover:bg-card/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground text-xs">{row.label}</td>
                      {row.values.map((val, colIdx) => (
                        <Cell key={colIdx} value={val} isAdcendy={colIdx === 0} />
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Speed row */}
              <tr className="border-t border-border bg-muted/20">
                <td className="px-4 py-3 text-xs font-semibold text-foreground">
                  Strategy ready in
                </td>
                {SPEED_ROW.values.map((val, colIdx) => (
                  <Cell key={colIdx} value={val} isAdcendy={colIdx === 0} />
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center gap-6 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-accent" /> Yes</span>
          <span className="flex items-center gap-1.5"><Minus className="w-3 h-3 text-muted-foreground" /> Sometimes / depends</span>
          <span className="flex items-center gap-1.5"><X className="w-3 h-3 text-destructive/60" /> No</span>
        </motion.div>
      </div>
    </section>
  );
}
