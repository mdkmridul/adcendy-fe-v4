/**
 * The landing page's sections, in the order the page presents them, with the
 * one label every nav and the footer use for each. Labels follow what the
 * section actually says, so a link never promises something the reader does
 * not find when they land.
 *
 * Each id is set on the section's own component; tests check every id here
 * resolves to exactly one element.
 */
export const LANDING_SECTIONS = {
  whyNotYourTeam: { id: 'why-not-your-team', label: 'Why not your team' },
  howItWorks: { id: 'how-it-works', label: 'How it works' },
  whatYouGet: { id: 'what-you-get', label: 'What you get' },
  benchmarks: { id: 'benchmarks', label: 'Benchmarks' },
  whoItsFor: { id: 'who-its-for', label: 'Is it for you' },
  whyNotAI: { id: 'why-not-ai', label: 'AI-powered, human-judged' },
  comparison: { id: 'comparison', label: 'Compare' },
  budget: { id: 'budget', label: 'Why it’s worth it' },
  pricing: { id: 'pricing', label: 'Pricing' },
  manifesto: { id: 'manifesto', label: 'About' },
  faq: { id: 'faq', label: 'FAQ' },
} as const;

/** Places inside a section that a link can land on directly. */
export const LANDING_SUB_TARGETS = {
  goodFit: { id: 'who-its-for-fit', label: 'Who it’s for' },
  notYetFit: { id: 'who-its-for-not-yet', label: 'Who it’s not for' },
  // The audiences are described in this FAQ answer, not in a section.
  industries: { id: 'faq-industries', label: 'SaaS, D2C & coaches' },
} as const;

export type LandingTarget = { id: string; label: string };
