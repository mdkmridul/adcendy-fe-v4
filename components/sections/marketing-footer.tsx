import Link from 'next/link';

const LINKS = {
  Product: [
    { label: 'How it works', href: '#how' },
    { label: 'What you get', href: '#what-you-get' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Sample strategy', href: '/sample-report' },
  ],
  For: [
    { label: 'SaaS founders', href: '#who' },
    { label: 'D2C brands', href: '#who' },
    { label: 'Coaches & consultants', href: '#who' },
  ],
  Company: [
    { label: 'About', href: '#manifesto' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Refund policy', href: '#' },
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
              Live data. Human review.
              <br />
              Strategy that holds up.
            </p>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [string, { label: string; href: string }[]][]).map(
            ([section, links]) => (
              <div key={section} className="space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {section}
                </p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Erraiway Technologies LLP. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Adcendy &mdash; Live data. Human review. Strategy that holds up.
          </p>
        </div>
      </div>
    </footer>
  );
}
