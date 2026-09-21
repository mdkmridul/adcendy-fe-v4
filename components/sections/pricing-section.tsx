'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Globe2, MapPinned } from 'lucide-react';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';
import { formatMinorAmount } from '@/shared/payments/razorpay';
import { usePublicCatalogue } from '@/shared/payments/usePublicCatalogue';
import type { BillingBundle } from '@/shared/types/billing';
import {
  bundleOriginalPrice,
  marketCountDescription,
  marketCountLabel,
  pilotSeatsLabel,
} from '@/shared/payments/market-catalogue';

type Currency = 'INR' | 'USD';

/** The struck-through price a discounted bundle is measured against. */
function PriceBeforeDiscount({ bundle }: { bundle: BillingBundle }) {
  const original = bundleOriginalPrice(bundle);
  if (!original) return null;
  return (
    <p className="text-sm text-muted-foreground">
      <span className="line-through">{formatMinorAmount(original)}</span>
      {bundle.discountPercent ? (
        <span className="ml-2 font-semibold text-primary">
          Save {bundle.discountPercent}%
        </span>
      ) : null}
    </p>
  );
}

// How many packages the server returns is the server's business — India is
// expected to have one, other markets three or four. Tailwind needs whole
// class strings, so the layout for each count is spelled out rather than
// assembled.
const GRID_BY_CARD_COUNT: Record<number, string> = {
  1: 'max-w-md grid-cols-1',
  2: 'max-w-4xl grid-cols-1 md:grid-cols-2',
  3: 'max-w-5xl grid-cols-1 md:grid-cols-3',
  4: 'max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};
const GRID_FALLBACK = 'max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

const INCLUDED = [
  'Competitive and market intelligence on your market, and a strategy built on it — delivered as a document your team owns',
  'Human review gate — nothing ships without passing it',
  'One revision round if the strategy doesn’t fit',
  '30 days of guided support — a kickoff, a check on your numbers against the plan’s targets, and a final review',
  'Email support throughout',
  'A clear roadmap for what to do next',
];

const MARKET_RULES = [
  {
    icon: Globe2,
    title: 'One market is one country.',
    body: 'A strategy covers a single country, end to end — the competitors in it, the searches your buyers run in it, the openings inside it.',
  },
  {
    icon: MapPinned,
    title: 'National only. No city or state strategies.',
    body: 'The competitor advertising data we read is published at country level. A city strategy would be national data wearing a local label, so we don’t sell one.',
  },
  {
    icon: Check,
    title: 'Your city still shows up in it.',
    body: 'What buyers near you actually search, and which competitors hold presence where you are, get read and folded into the national strategy.',
  },
];

export function Pricing() {
  const { status } = useMarketingAuth();
  const isAuthed = status === 'authed';
  const ctaHref = isAuthed ? '/app/checkout' : '/auth/signup';
  // Prices follow the visitor's location alone; there is no switch
  // (backend R-8).
  const catalogueQuery = usePublicCatalogue();
  const { isPilot } = catalogueQuery;
  // Shown while the pilot runs, sold out included; seats are the server's count.
  const pilotOffer = catalogueQuery.data?.pilotOffer ?? null;
  // Whatever the server priced for this visitor, in the order it sent it.
  const packages = catalogueQuery.data?.items ?? [];
  // Every listed package, plus the card for countries no package covers.
  const gridClass =
    GRID_BY_CARD_COUNT[packages.length + 1] ?? GRID_FALLBACK;
  // What the server actually priced in, not what was asked for.
  const currency: Currency | undefined =
    catalogueQuery.data?.currency === 'INR'
      ? 'INR'
      : catalogueQuery.data
        ? 'USD'
        : undefined;

  return (
    <section id="pricing" className="bg-background py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Priced by market
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You buy markets, not credits. Prices come from our billing server and follow where
            you are &mdash; the same live catalogue powers this page and secure checkout.
          </p>
          {pilotOffer && (
            <div className="space-y-2">
              <p className="inline-block px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-sm font-semibold text-primary">
                {pilotOffer.label} &mdash; {pilotSeatsLabel(pilotOffer)}
              </p>
              {pilotOffer.note && !pilotOffer.soldOut && (
                <p className="text-sm text-muted-foreground">{pilotOffer.note}</p>
              )}
            </div>
          )}
        </motion.div>

        {/* What counts as one market — stated here, and again in the FAQ, on purpose. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12 p-8 rounded-2xl border border-primary/30 bg-primary/5 space-y-5"
        >
          <h3 className="font-space-grotesk font-bold text-foreground">
            What counts as one market
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MARKET_RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div key={rule.title} className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-space-grotesk text-sm font-bold text-foreground">
                    {rule.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rule.body}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {catalogueQuery.isPending && (
          <div
            className="max-w-4xl mx-auto mb-12 grid grid-cols-1 gap-6 md:grid-cols-2"
            aria-label="Loading prices"
          >
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl border border-border bg-card/50"
              />
            ))}
          </div>
        )}

        {/* A catalogue that priced nothing for this visitor is as good as no price at all. */}
        {(catalogueQuery.isError ||
          (catalogueQuery.isSuccess && packages.length === 0)) && (
          <div className="max-w-4xl mx-auto mb-12 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Live pricing is temporarily unavailable.
            </p>
            <button
              type="button"
              onClick={() => void catalogueQuery.refetch()}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Retry loading prices
            </button>
          </div>
        )}

        {catalogueQuery.isSuccess && packages.length > 0 && (
          <div className={`mx-auto grid gap-6 mb-12 ${gridClass}`}>
            {packages.map((bundle, idx) => (
              <motion.div
                key={bundle.sku}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-primary bg-card shadow-lg shadow-primary/20 transition-all"
              >
                <div className="p-8 space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-space-grotesk text-xl font-bold text-foreground">
                        {marketCountLabel(bundle.credits)}
                      </h3>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        One-time
                      </span>
                      {bundle.pilot && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                          {pilotOffer?.label ?? 'Pilot price'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {marketCountDescription(bundle.credits)}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <motion.p
                      key={currency}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-bold text-primary"
                    >
                      {formatMinorAmount(bundle)}
                    </motion.p>
                    <PriceBeforeDiscount bundle={bundle} />
                    <p className="text-xs text-muted-foreground">
                      {bundle.pilot ? 'pilot price, one-time purchase' : 'one-time purchase'}
                    </p>
                    {bundle.pilot && pilotOffer && (
                      <p className="text-xs font-semibold text-primary">
                        {pilotSeatsLabel(pilotOffer)}
                      </p>
                    )}
                  </div>

                  <Link
                    href={ctaHref}
                    className="inline-flex w-full items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {bundle.credits === 1 ? 'Start one market' : 'Choose this package'}
                  </Link>
                </div>
              </motion.div>
            ))}

            {/* Not a catalogue item: the way out for countries no package covers. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: packages.length * 0.08 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card/50 hover:border-primary/30 transition-all"
            >
              <div className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-space-grotesk text-xl font-bold text-foreground">
                      Multiple markets
                    </h3>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      Custom
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selling into a set of countries these don&rsquo;t cover.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-foreground">Let&rsquo;s talk</p>
                  <p className="text-xs text-muted-foreground">priced with you</p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  We run the same campaign across each country you name, and price the package
                  with you.
                </p>

                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all text-sm border border-primary text-primary hover:bg-primary/10"
                >
                  Get a quote
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {packages.length > 0 && (
          <p className="-mt-6 mb-12 text-center text-xs text-muted-foreground">
            Prices from catalogue {catalogueQuery.data?.catalogueVersion}
          </p>
        )}

        {/* Included in every market */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto p-8 rounded-xl border border-border bg-card/50 space-y-5"
        >
          <h4 className="font-space-grotesk font-bold text-foreground">Every market includes:</h4>
          <div className="space-y-3">
            {INCLUDED.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* The guarantee is the pilot's; it goes when the pilot does. */}
        {isPilot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 max-w-3xl mx-auto p-6 rounded-xl border border-primary/20 bg-primary/5 text-center space-y-2"
          >
            <p className="text-sm font-semibold text-foreground">Pilot guarantee</p>
            <p className="text-sm text-muted-foreground">
              If your strategy doesn&apos;t surface at least 3 specific, actionable opportunities you
              didn&apos;t already know about, we&apos;ll refund the pilot fee. No questions, no forms.
            </p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Running strategies for multiple clients?{' '}
          <Link href="/contact" className="text-primary font-semibold hover:underline">
            Talk to us about partnership options
          </Link>{' '}
          — we work with agencies and resellers directly, not through bulk discounts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Start with a free competitive snapshot
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
