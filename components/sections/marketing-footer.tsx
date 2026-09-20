import Link from 'next/link';

/**
 * A destination that exists, or one that is still being written. A pending
 * entry is shown as plain text rather than a link to '#': the reader is told
 * it is coming instead of being sent nowhere.
 */
type FooterLink =
  | { label: string; href: string }
  | { label: string; pending: true };

// Every anchor here is a section id that exists on the landing page, in the
// order the page presents them. Root-relative so the footer keeps working if
// it is ever rendered off '/'.
const LINKS: Record<string, FooterLink[]> = {
  Product: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'What you get', href: '/#what-you-get' },
    { label: 'Benchmarks', href: '/#benchmarks' },
    { label: 'Why not an AI tool', href: '/#why-not-ai' },
    { label: 'Compare', href: '/#comparison' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Sample strategy', href: '/sample-report' },
  ],
  For: [
    { label: 'SaaS founders', href: '/#who-its-for' },
    { label: 'D2C brands', href: '/#who-its-for' },
    { label: 'Coaches & consultants with a team', href: '/#who-its-for' },
    { label: 'Who it’s not for', href: '/#who-its-for' },
  ],
  Company: [
    { label: 'About', href: '/#manifesto' },
    { label: 'Why the strategy is the cheap part', href: '/#budget' },
    { label: 'Contact', href: '/contact' },
  ],
  // Published by the backend and accepted at signup and checkout today; the
  // public pages that render them are still to come.
  Legal: [
    { label: 'Privacy', pending: true },
    { label: 'Terms', pending: true },
    { label: 'Refund policy', pending: true },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="font-space-grotesk text-lg font-bold text-foreground">
              Adcendy
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Market intelligence. Expert review.
              <br />
              Direction your team can own.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                {section}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {'href' in link ? (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground/70">
                        {link.label}{' '}
                        <span className="text-xs text-muted-foreground/50">(In Progress)</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Erraiway Technologies LLP. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Adcendy &mdash; Market intelligence. Expert review. Direction your team can own.
          </p>
        </div>
      </div>
    </footer>
  );
}
