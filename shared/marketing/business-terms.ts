/**
 * Commercial promises the marketing pages make, in one place. Change a term
 * here and every page that states it follows.
 *
 * These are copy, not contract: the binding terms are the policies the Backend
 * publishes (served by the legal API, shown at their public paths such as
 * /refund-policy and /delivery-policy). Keep the two saying the same thing.
 */
export const BUSINESS_TERMS = {
  company: {
    legalName: 'Erraiway Technologies LLP',
  },
  delivery: {
    /**
     * The Digital Delivery Policy's commitment: delivered within this many
     * business days of confirming the inputs are complete. The policy wins;
     * copy states only this, never per-stage timings.
     */
    businessDays: 4,
  },
  intake: {
    formMinutes: 15,
    /** The optional call offered instead of the form. */
    callMinutes: 20,
  },
  revisionRoundsIncluded: 1,
  guidedSupportDays: 30,
  pilotGuarantee: {
    /** Fewer actionable opportunities than this and the pilot fee is refunded. */
    minimumOpportunities: 3,
  },
  contactResponse: 'one business day',
  report: {
    pages: '25–35',
    readingTime: '~1 hour',
  },
} as const;

/** Worded exactly as the Refund Policy's pilot clause. */
export const PILOT_GUARANTEE_TEXT = `If your strategy doesn't surface at least ${BUSINESS_TERMS.pilotGuarantee.minimumOpportunities} specific, actionable opportunities you didn't already know about, we'll refund the pilot fee. No questions, no forms.`;

/** "within 4 business days" */
export function deliveryWindowLabel(): string {
  return `within ${BUSINESS_TERMS.delivery.businessDays} business days`;
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five'] as const;

/** "one revision round", "two revision rounds"; "One revision round" at a sentence start. */
export function revisionRoundsLabel(
  { sentenceStart = false }: { sentenceStart?: boolean } = {},
  count: number = BUSINESS_TERMS.revisionRoundsIncluded,
): string {
  const word = NUMBER_WORDS[count] ?? String(count);
  const label = `${word} revision round${count === 1 ? '' : 's'}`;
  return sentenceStart ? label.charAt(0).toUpperCase() + label.slice(1) : label;
}

export function copyrightNotice(now: Date = new Date()): string {
  return `© ${now.getFullYear()} ${BUSINESS_TERMS.company.legalName}. All rights reserved.`;
}
