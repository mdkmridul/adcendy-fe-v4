import type {
  BillingBundle,
  BillingCatalogue,
  BillingPilotOffer,
} from "@/shared/types/billing";

/**
 * AdCendy sells markets. One market is one country, covered end to end, and a
 * catalogue SKU's `credits` is how many markets it buys — the backend still
 * calls that unit a credit, so the translation lives here rather than being
 * re-spelled at every surface.
 *
 * Prices stay the server's: nothing here invents, filters or discounts one.
 */
export function marketCountLabel(credits: number): string {
  return credits === 1 ? "One market" : `${credits} markets`;
}

export function marketCountDescription(credits: number): string {
  return credits === 1
    ? "One country, one strategy, end to end."
    : `${credits} countries — one strategy each, end to end.`;
}

/**
 * The pilot is on only when the server says so outright. A catalogue that
 * has not loaded, or does not mention the pilot, shows none of it.
 */
export function isPilotCatalogue(
  catalogue: Pick<BillingCatalogue, "pilot"> | undefined,
): boolean {
  return catalogue?.pilot === true;
}

/**
 * How many pilot seats are left, in the server's count. Shown sold out too:
 * a full pilot is part of what makes it believable.
 */
export function pilotSeatsLabel(offer: BillingPilotOffer): string {
  if (offer.soldOut || offer.seatsRemaining <= 0) {
    return `All ${offer.seatsTotal} pilot seats are taken`;
  }
  const seats = offer.seatsRemaining === 1 ? "seat" : "seats";
  return `${offer.seatsRemaining} of ${offer.seatsTotal} pilot ${seats} left`;
}

/** The pre-discount price a pilot bundle is measured against, if stated. */
export function bundleOriginalPrice(
  bundle: BillingBundle,
): Pick<BillingBundle, "amountMinor" | "currency"> | null {
  const original = bundle.originalAmountMinor;
  if (!original || original <= bundle.amountMinor) return null;
  return { amountMinor: original, currency: bundle.currency };
}
