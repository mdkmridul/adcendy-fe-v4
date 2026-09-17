/**
 * The product-word confirmation (backend R-3b). When research cannot confirm
 * what buyers search for when they look for what the client sells, the
 * pipeline blocks on a reviewer task listing the phrases it found, each with
 * its monthly searches and the sources that named it. The reviewer picks the
 * ones buyers really use, or types their own.
 *
 * Until this form existed the task could only be answered from the backend, so
 * a held client run could not be resumed from the reviewer page at all.
 *
 * Pure: reads the task detail and builds the answer the backend validates
 * against the template's answer schema. No imports, so `node --test` can run
 * it directly.
 */

export const PRODUCT_NOUN_FAILURE_MODE = 'product_noun_low_confidence';

/** The answer schema's limits. */
export const PRODUCT_NOUN_MIN_SELECTED = 1;
export const PRODUCT_NOUN_MAX_SELECTED = 8;
export const PRODUCT_NOUN_MIN_LENGTH = 2;
export const PRODUCT_NOUN_MAX_LENGTH = 80;
export const PRODUCT_NOUN_NOTES_MAX_LENGTH = 1200;

export type ProductNounCandidate = {
  phrase: string;
  /** Monthly searches, or null when nothing measured it. */
  searchVolume: number | null;
  sources: string[];
  confidence: string | null;
};

export type ProductNounModel = {
  clientName: string | null;
  marketLabel: string | null;
  /** Why the automatic step could not decide, in the pipeline's own words. */
  diagnosis: string | null;
  candidates: ProductNounCandidate[];
};

export type ProductNounAnswer = {
  product_nouns: string[];
  reviewer_notes?: string;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** A field under its camelCase name, as the task detail sends it, else snake_case. */
function field(record: Record<string, unknown>, camel: string, snake: string): unknown {
  return record[camel] ?? record[snake];
}

function normalizeMode(value: unknown): string | null {
  const text = toText(value);
  return text ? text.toLowerCase().replace(/[\s-]+/g, '_') : null;
}

export function isProductNounTask(failureMode: unknown): boolean {
  return normalizeMode(failureMode) === PRODUCT_NOUN_FAILURE_MODE;
}

function readSources(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const text = toText(entry);
    return text ? [text] : [];
  });
}

function readCandidates(value: unknown): ProductNounCandidate[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  return value.flatMap((entry) => {
    const record = toRecord(entry);
    const phrase = record ? toText(record.phrase) : null;
    if (!record || !phrase || seen.has(phrase.toLowerCase())) {
      return [];
    }
    seen.add(phrase.toLowerCase());
    return [
      {
        phrase,
        searchVolume: toNumber(field(record, 'searchVolume', 'search_volume')),
        sources: readSources(record.sources),
        confidence: toText(record.confidence),
      },
    ];
  });
}

/**
 * The candidate list from the task detail: its current values to fix, else the
 * question context it was asked with. Null when the task carries neither.
 */
export function readProductNounModel(task: {
  currentValuesToFix?: unknown;
  questionPayload?: unknown;
}): ProductNounModel | null {
  const payload = toRecord(task.questionPayload);
  const source =
    toRecord(task.currentValuesToFix) ??
    (payload ? toRecord(field(payload, 'questionContext', 'question_context')) : null);
  if (!source) {
    return null;
  }
  return {
    clientName: toText(field(source, 'clientName', 'client_name')),
    marketLabel: toText(field(source, 'marketLabel', 'market_label')),
    diagnosis: toText(source.diagnosis),
    candidates: readCandidates(source.candidates),
  };
}

/** A phrase the answer schema accepts, or null. */
export function normalizeProductNoun(value: unknown): string | null {
  const text = toText(value);
  if (!text) {
    return null;
  }
  const collapsed = text.replace(/\s+/g, ' ');
  return collapsed.length >= PRODUCT_NOUN_MIN_LENGTH &&
    collapsed.length <= PRODUCT_NOUN_MAX_LENGTH
    ? collapsed
    : null;
}

/**
 * The answer, or the reason it cannot be sent yet. The backend rejects an
 * answer outside the schema, so the form says so before the round trip.
 */
export function buildProductNounAnswer(input: {
  phrases: string[];
  notes?: string;
}): { answer: ProductNounAnswer } | { error: string } {
  const seen = new Set<string>();
  const phrases: string[] = [];
  for (const entry of input.phrases) {
    const phrase = normalizeProductNoun(entry);
    if (!phrase || seen.has(phrase.toLowerCase())) {
      continue;
    }
    seen.add(phrase.toLowerCase());
    phrases.push(phrase);
  }
  if (phrases.length < PRODUCT_NOUN_MIN_SELECTED) {
    return { error: 'Pick or type at least one search term buyers use.' };
  }
  if (phrases.length > PRODUCT_NOUN_MAX_SELECTED) {
    return {
      error: `Send at most ${PRODUCT_NOUN_MAX_SELECTED} search terms; ${phrases.length} are selected.`,
    };
  }
  const notes = toText(input.notes);
  if (notes && notes.length > PRODUCT_NOUN_NOTES_MAX_LENGTH) {
    return {
      error: `Notes are limited to ${PRODUCT_NOUN_NOTES_MAX_LENGTH} characters.`,
    };
  }
  return {
    answer: {
      product_nouns: phrases,
      ...(notes ? { reviewer_notes: notes } : {}),
    },
  };
}

/** "27,100 a month", or that nothing measured it. */
export function describeProductNounVolume(volume: number | null): string {
  return volume === null
    ? 'no measured searches'
    : `${volume.toLocaleString('en-IN')} a month`;
}
