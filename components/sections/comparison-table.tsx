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
    heading: 'Direction: knowing what to do',
    rows: [
      { label: 'Deep read of what your competitors do across advertising and search', values: ['yes', 'no', 'maybe'] },
      { label: 'Keyword and channel opportunities specific to your market', values: ['yes', 'maybe', 'maybe'] },
      { label: 'Gaps in your market no one is filling', values: ['yes', 'no', 'maybe'] },
      { label: 'Objective direction, with no execution work to sell you', values: ['yes', 'maybe', 'no'] },
      { label: 'A strategy your own team owns and can run', values: ['yes', 'no', 'maybe'] },
    ],
  },
  {
    heading: 'Hands: doing the work',
    rows: [
      { label: 'Runs your ads', values: ['no', 'maybe', 'yes'] },
      { label: 'Produces your content', values: ['no', 'maybe', 'yes'] },
      { label: 'Manages your day-to-day marketing', values: ['no', 'no', 'yes'] },
    ],
  },
  {
    heading: 'The trade',
    rows: [
      { label: 'How you pay', values: ['Once, no retainer', 'Per task or hourly', 'Monthly retainer, 10–50× the cost'] },
      { label: 'Direction ready in', values: ['7 days', 'Depends on the task', '30–90 days to ramp'] },
    ],
  },
];

const COLUMNS = ['AdCendy', 'Freelancer', 'Agency'];
const COLUMN_NOTES = ['Intelligence + strategy', 'A pair of hands for one task', 'Execution + some strategy, on retainer'];

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
    <section id="comparison" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            What do you actually need right now — direction, or hands?
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;re not competing with agencies or freelancers. We&apos;re a different category — and usually the step before them.
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
                  What you need
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
                    <span className="block mt-1 text-[11px] font-normal text-muted-foreground">
                      {COLUMN_NOTES[idx]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  <tr className="bg-muted/30">
                    <td
                      colSpan={COLUMNS.length + 1}
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

              <tr className="border-t border-border bg-primary/5">
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-4 text-center text-sm font-semibold text-foreground"
                >
                  Start with AdCendy when you need to know what to do. Bring in freelancers or an agency to do it.
                </td>
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
