import Link from 'next/link';
import { SectionLink } from '@/components/nav/section-link';
import {
  LANDING_SECTIONS as S,
  LANDING_SUB_TARGETS as T,
  type LandingTarget,
} from '@/features/landing/landing-sections';
import { usePublicLegalDocuments } from '@/shared/legal/useLegalCatalogue';
import { copyrightNotice } from '@/shared/marketing/business-terms';

/** A place on the landing page, or another page. */
type FooterLink =
  | { section: LandingTarget }
  | { label: string; href: string };

// The sitemap follows the page, in the order the page presents it, and uses
// the same labels as the navbar.
const LINKS: Record<string, FooterLink[]> = {
  Product: [
    { section: S.whyNotYourTeam },
    { section: S.howItWorks },
    { section: S.whatYouGet },
    { section: S.benchmarks },
    { section: S.whyNotAI },
    { section: S.comparison },
    { section: S.budget },
    { section: S.pricing },
    { section: S.faq },
    { label: 'Sample strategy', href: '/sample-report' },
  ],
  'Is it for you': [
    { section: T.goodFit },
    { section: T.notYetFit },
    { section: T.industries },
  ],
  Company: [
    { section: S.manifesto },
    { label: 'Contact', href: '/contact' },
  ],
};

/** The published policies, as the Backend lists them; the column hides until they load. */
function useLegalLinks(): FooterLink[] {
  const { data } = usePublicLegalDocuments();
  return (data ?? [])
    .filter((document) => document.url)
    .map((document) => ({ label: document.title, href: document.url as string }));
}

const LINK_CLASS = 'text-sm text-muted-foreground hover:text-foreground transition-colors';

function FooterEntry({ link }: { link: FooterLink }) {
  if ('section' in link) {
    return (
      <SectionLink sectionId={link.section.id} className={LINK_CLASS}>
        {link.section.label}
      </SectionLink>
    );
  }
  return (
    <Link href={link.href} className={LINK_CLASS}>
      {link.label}
    </Link>
  );
}

export function MarketingFooter() {
  const legalLinks = useLegalLinks();
  const columns = legalLinks.length > 0 ? { ...LINKS, Legal: legalLinks } : LINKS;

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
          {Object.entries(columns).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                {section}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={'section' in link ? link.section.id : link.label}>
                    <FooterEntry link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {copyrightNotice()}
          </p>
          <p className="text-xs text-muted-foreground">
            Adcendy &mdash; Market intelligence. Expert review. Direction your team can own.
          </p>
        </div>
      </div>
    </footer>
  );
}
