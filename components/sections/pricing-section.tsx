'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Globe2, MapPinned } from 'lucide-react';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';
import { formatMinorAmount } from '@/shared/payments/razorpay';
import { usePublicCatalogue } from '@/shared/payments/usePublicCatalogue';
import type { BillingBundle, BillingPilotOffer } from '@/shared/types/billing';
import {
  bundleOriginalPrice,
  marketCountDescription,
  marketCountLabel,
  pilotSeatsLabel,
  priceGroupHeading,
  separatePilotPackages,
} from '@/shared/payments/market-catalogue';
import { BUSINESS_TERMS as TERMS, PILOT_GUARANTEE_TEXT, revisionRoundsLabel } from '@/shared/marketing/business-terms';

type Currency = 'INR' | 'USD';

/** The struck-through price a discounted bundle is measured against. */
function PriceBeforeDiscount({ bundle }: { bundle: BillingBundle }) {
  const original = bundleOriginalPrice(bundle);
  if (!original) return null;
  return (
    <p className="text-sm text-muted-foreground">
      <span className="line-through">{formatMinorAmount(original)}</span>
      {bundle.discountPercent ? (
        <span className="ml-2 font-semibold text-primary">Save {bundle.discountPercent}%</span>
      ) : null}
    </p>
  );
}

// How many packages the server returns is the server's business — India is
// expected to have one, other markets several. Cards wrap three to a row and
// a short last row is centred, so any count lays out without a gap.
const CARD_ROW = 'mx-auto flex max-w-6xl flex-wrap justify-center gap-6';
const CARD_WIDTH = 'w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]';

/** Seats taken and left, as the server counts them. */
function SeatMeter({ offer }: { offer: BillingPilotOffer }) {
  const taken = Math.max(0, offer.seatsTotal - offer.seatsRemaining);
  const percent = Math.round((taken / offer.seatsTotal) * 100);
  return (
    <div className="mx-auto max-w-md space-y-1.5">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={offer.seatsTotal}
        aria-valuenow={taken}
        aria-label="Pilot seats taken"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-center text-xs font-semibold text-primary">{pilotSeatsLabel(offer)}</p>
    </div>
  );
}

type PackageKind = 'pilot' | 'package';

/**
 * One priced package. A pilot card is set apart and carries its own saving
 * against the regular price, so it needs no twin beside it.
 */
function PackageCard({
  bundle,
  kind,
  pilotLabel,
  soldOut = false,
  ctaHref,
  currency,
  delay,
}: {
  bundle: BillingBundle;
  kind: PackageKind;
  pilotLabel?: string;
  soldOut?: boolean;
  ctaHref: string;
  currency: Currency | undefined;
  delay: number;
}) {
  const isPilot = kind === 'pilot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className={
        isPilot
          ? 'h-full rounded-2xl border-2 border-primary bg-card shadow-lg shadow-primary/30 transition-all'
          : 'h-full rounded-2xl border border-border bg-card transition-all hover:border-primary/40'
      }
    >
      <div className="p-8 space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-space-grotesk text-xl font-bold text-foreground">
              {marketCountLabel(bundle.credits)}
            </h3>
            {isPilot ? (
              <span className="inline-block px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {pilotLabel ?? 'Pilot price'}
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                One-time
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{marketCountDescription(bundle.credits)}</p>
        </div>

        <div className="space-y-0.5">
          <motion.p
            key={currency}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-4xl font-bold ${isPilot ? 'text-primary' : 'text-foreground'}`}
          >
            {formatMinorAmount(bundle)}
          </motion.p>
          <PriceBeforeDiscount bundle={bundle} />
          <p className="text-xs text-muted-foreground">
            {isPilot ? 'pilot price, one-time purchase' : 'one-time purchase'}
          </p>
        </div>

        {soldOut ? (
          <p className="inline-flex w-full items-center justify-center py-3 px-4 rounded-lg text-sm font-semibold border border-border text-muted-foreground">
            All pilot seats are taken
          </p>
        ) : (
          <Link
            href={ctaHref}
            className={
              isPilot
                ? 'inline-flex w-full items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all text-sm bg-primary text-primary-foreground hover:bg-primary/90'
                : 'inline-flex w-full items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all text-sm border border-primary text-primary hover:bg-primary/10'
            }
          >
            {isPilot
              ? 'Claim a pilot seat'
              : bundle.credits === 1
                ? 'Start one market'
                : 'Choose this package'}
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/**
 * How wide the quote card is: as wide as the last row of packages above it,
 * so it reads as the row's continuation. Rows hold three cards on large
 * screens; Tailwind needs each width spelled out.
 */
function customCardWidth(regularCount: number): string {
  const lastRow = regularCount % 3;
  if (lastRow === 1 || regularCount === 0) return CARD_WIDTH;
  if (lastRow === 2) return 'w-full lg:w-[calc(66.666%-0.5rem)]';
  return 'w-full';
}

/**
 * The multi-market quote, in a package card's styling: the same border,
 * type and button, with "Let's talk" where a price would be.
 */
function CustomQuoteCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-full rounded-2xl border border-border bg-card transition-all hover:border-primary/40"
    >
      <div className="p-8 grid gap-6 md:grid-cols-2 md:items-end">
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
            Selling into a set of countries these packages don&rsquo;t cover? We run the same
            campaign across each country you name, and price the package with you.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-0.5">
            <p className="text-4xl font-bold text-foreground">Let&rsquo;s talk</p>
            <p className="text-xs text-muted-foreground">priced with you</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all text-sm border border-primary text-primary hover:bg-primary/10"
          >
            Get a quote
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

const INCLUDED = [
  'Competitive and market intelligence on your market, and a strategy built on it — delivered as a document your team owns',
  'Human review gate — nothing ships without passing it',
  `${revisionRoundsLabel({ sentenceStart: true })} if the strategy doesn’t fit`,
  `${TERMS.guidedSupportDays} days of guided support — a kickoff, a check on your numbers against the plan’s targets, and a final review`,
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
  // The pilot stands on its own; every regular package follows, one-market
  // included, in the server's order.
  const { pilot: pilotPackages, regular: regularPackages } = separatePilotPackages(
    packages,
    pilotOffer,
  );
  // What the server actually priced in, not what was asked for.
  const currency: Currency | undefined =
    catalogueQuery.data?.currency === 'INR' ? 'INR' : catalogueQuery.data ? 'USD' : undefined;

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
            You buy markets, not credits. Prices come from our billing server and follow where you
            are &mdash; the same live catalogue powers this page and secure checkout.
          </p>
          {pilotOffer && !pilotOffer.soldOut && (
            <p className="inline-block px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-sm font-semibold text-primary">
              {pilotOffer.label} &mdash; {pilotSeatsLabel(pilotOffer)}
            </p>
          )}
        </motion.div>

        {/* The guarantee is the pilot's; it leads the prices while the pilot runs,
            and goes when the pilot does. */}
        {isPilot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 max-w-3xl mx-auto p-6 rounded-xl border border-primary/30 bg-primary/5 text-center space-y-2"
          >
            <p className="text-sm font-semibold text-foreground">Pilot guarantee</p>
            <p className="text-sm text-muted-foreground">
              {PILOT_GUARANTEE_TEXT}
            </p>
          </motion.div>
        )}

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
        {(catalogueQuery.isError || (catalogueQuery.isSuccess && packages.length === 0)) && (
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
          <div className="mb-12 space-y-12">
            {/* The pilot on its own, ahead of everything else. */}
            {pilotOffer && pilotPackages.length > 0 && (
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-space-grotesk text-2xl font-bold text-foreground">
                    {priceGroupHeading(pilotOffer.label)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pilotOffer.soldOut
                      ? 'The pilot is full. Regular prices apply.'
                      : (pilotOffer.note ?? 'Pilot pricing') +
                        ' \u2014 limited to ' +
                        pilotOffer.seatsTotal +
                        ' clients. Everyone after them pays the regular price.'}
                  </p>
                </div>
                <SeatMeter offer={pilotOffer} />
                <div className={CARD_ROW}>
                  {pilotPackages.map((bundle) => (
                    <div key={bundle.sku} className="w-full sm:max-w-md">
                      <PackageCard
                        bundle={bundle}
                        kind="pilot"
                        pilotLabel={pilotOffer.label}
                        soldOut={pilotOffer.soldOut}
                        ctaHref={ctaHref}
                        currency={currency}
                        delay={0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {regularPackages.length > 0 && pilotPackages.length > 0 && (
                <h3 className="text-center font-space-grotesk text-2xl font-bold text-foreground">
                  Regular price
                </h3>
              )}
              {regularPackages.length > 0 && (
                <div className={CARD_ROW}>
                  {regularPackages.map((bundle, idx) => (
                    <div key={bundle.sku} className={CARD_WIDTH}>
                      <PackageCard
                        bundle={bundle}
                        kind="package"
                        ctaHref={ctaHref}
                        currency={currency}
                        delay={idx * 0.08}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Not a catalogue item, so not in the grid: it sits right under the
                  last row, as wide as that row, styled like the cards above it. */}
              <div className={CARD_ROW}>
                <div className={customCardWidth(regularPackages.length)}>
                  <CustomQuoteCard />
                </div>
              </div>
            </div>

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
