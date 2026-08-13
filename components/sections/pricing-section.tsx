'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useMarketingAuth } from '@/src/lib/auth/useAuth';
import { billingRepository } from '@/shared/api/repositories/billing.repo';
import { queryKeys } from '@/shared/api/queryKeys';
import { formatMinorAmount } from '@/shared/payments/razorpay';

type Currency = 'INR' | 'USD';

const INCLUDED = [
  'A marketing strategy document built specifically for your business',
  'Human review gate — nothing ships without passing it',
  '30 days of guided support — kickoff call, mid-month check-in, final review',
  'Email support throughout',
  'A clear roadmap for what to do next',
];

export function Pricing() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const { status } = useMarketingAuth();
  const isAuthed = status === 'authed';
  const ctaHref = isAuthed ? '/app/checkout' : '/auth/signup';
  const countryCode = currency === 'INR' ? 'IN' : 'US';
  const catalogueQuery = useQuery({
    queryKey: queryKeys.billing.publicBundles(countryCode),
    queryFn: () => billingRepository.listPublicBundles(countryCode),
    staleTime: 60_000,
  });
  const bundles = catalogueQuery.data?.items ?? [];
  const highlightedIndex = Math.floor(bundles.length / 2);

  return (
    <section id="pricing" className="bg-background py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 space-y-4"
        >
          <h2 className="font-space-grotesk text-4xl sm:text-5xl font-bold text-foreground">
            Simple, transparent strategy credits
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Buy one-time credits now. The same live catalogue powers this page and secure checkout.
          </p>
        </motion.div>

        {/* Currency toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card/50">
            {(['INR', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {c === 'INR' ? '₹ India' : '$ International'}
              </button>
            ))}
          </div>
        </motion.div>

        {catalogueQuery.isPending && (
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3" aria-label="Loading prices">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-border bg-card/50"
              />
            ))}
          </div>
        )}

        {catalogueQuery.isError && (
          <div className="mb-12 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
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

        {catalogueQuery.isSuccess && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {bundles.map((bundle, idx) => {
              const highlighted = idx === highlightedIndex;
              const creditLabel = bundle.credits === 1 ? 'credit' : 'credits';
              return (
                <motion.div
                  key={bundle.sku}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative rounded-2xl border transition-all ${highlighted ? 'md:scale-105 bg-card border-primary shadow-lg shadow-primary/20' : 'bg-card/50 border-border hover:border-primary/30'}`}
                >
                  {highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8 space-y-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-space-grotesk text-xl font-bold text-foreground">
                          {bundle.credits} strategy {creditLabel}
                        </h3>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                          One-time
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Generate {bundle.credits} complete campaign{' '}
                        {bundle.credits === 1 ? 'strategy' : 'strategies'}.
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
                      <p className="text-xs text-muted-foreground">one-time purchase</p>
                    </div>

                    <Link
                      href={ctaHref}
                      className={`inline-flex w-full items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all text-sm ${highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-primary text-primary hover:bg-primary/10'}`}
                    >
                      Choose bundle
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {catalogueQuery.data && (
          <p className="-mt-6 mb-12 text-center text-xs text-muted-foreground">
            Prices from catalogue {catalogueQuery.data.catalogueVersion}
          </p>
        )}

        {/* Included in every Sprint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto p-8 rounded-xl border border-border bg-card/50 space-y-5"
        >
          <h4 className="font-space-grotesk font-bold text-foreground">
            Every strategy credit includes:
          </h4>
          <div className="space-y-3">
            {INCLUDED.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pilot guarantee */}
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
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
