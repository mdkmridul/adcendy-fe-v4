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
