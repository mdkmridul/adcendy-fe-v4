/**
 * The empty-tier competitor pick (backend block R3b). When a market's
 * competitive tiers hold no competitor beyond the ones the client named, the
 * pipeline blocks on a reviewer task that lists the strongest candidates it
 * found. The reviewer picks the ones to treat as competitors, or goes ahead
 * with the client's named competitors alone.
 *
 * Pure: reads the task detail and builds the answer the backend validates
 * against the template's answer schema. No imports, so `node --test` can run
 * it directly.
 */

export const COMPETITOR_SELECTION_FAILURE_MODE =
  'competitive_empty_tier_selection_required';

/** The answer schema's limit on reviewer notes. */
export const COMPETITOR_SELECTION_NOTES_MAX_LENGTH = 1200;

export type CompetitorSelectionDecision =
  | 'use_selected_competitors'
  | 'proceed_with_named_competitors_only';

export type CompetitorSelectionOption = {
  id: string;
  name: string;
  domain: string | null;
  score: number | null;
  kind: string | null;
  whyNotPlaced: string | null;
};

export type CompetitorSelectionNamed = {
  id: string | null;
  name: string;
  domain: string | null;
};

export type CompetitorSelectionModel = {
  /** The client's named competitors, which are placed whatever the answer. */
  named: CompetitorSelectionNamed[];
  /** Named competitors left out because the site found for them is not theirs. */
  unconfirmed: CompetitorSelectionNamed[];
  options: CompetitorSelectionOption[];
};

export type CompetitorSelectionAnswer = {
  decision: CompetitorSelectionDecision;
  selected_competitor_ids?: string[];
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

export function isCompetitorSelectionTask(failureMode: unknown): boolean {
  return normalizeMode(failureMode) === COMPETITOR_SELECTION_FAILURE_MODE;
}

/** Whether the task still takes an answer. */
export function isAnswerableTaskStatus(status: unknown): boolean {
  const normalized = normalizeMode(status);
  return normalized === 'pending_review' || normalized === 'pending';
}

function readNamedList(value: unknown): CompetitorSelectionNamed[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const record = toRecord(entry);
    const name = record ? toText(record.name) : null;
    return record && name
      ? [{ id: toText(record.id), name, domain: toText(record.domain) }]
      : [];
  });
}

function readOptions(value: unknown): CompetitorSelectionOption[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  return value.flatMap((entry) => {
    const record = toRecord(entry);
    const id = record ? toText(record.id) : null;
    const name = record ? toText(record.name) : null;
    if (!record || !id || !name || seen.has(id)) {
      return [];
    }
    seen.add(id);
    return [
      {
        id,
        name,
        domain: toText(record.domain),
        score: toNumber(record.score),
        kind: toText(record.kind),
        whyNotPlaced: toText(field(record, 'whyNotPlaced', 'why_not_placed')),
      },
    ];
  });
}

/**
 * The pick list from the task detail: its current values to fix, else the
 * question context it was asked with. Null when the task carries neither.
 */
export function readCompetitorSelectionModel(task: {
  currentValuesToFix?: unknown;
  questionPayload?: unknown;
}): CompetitorSelectionModel | null {
  const payload = toRecord(task.questionPayload);
  const source =
    toRecord(task.currentValuesToFix) ??
    (payload
      ? toRecord(field(payload, 'questionContext', 'question_context'))
      : null);
  if (!source) {
    return null;
  }
  return {
    named: readNamedList(field(source, 'namedCompetitors', 'named_competitors')),
    unconfirmed: readNamedList(
      field(source, 'unconfirmedNamedCompetitors', 'unconfirmed_named_competitors'),
    ),
    options: readOptions(source.options),
  };
}

/** A candidate kind as the reviewer reads it: "direct_competitor" -> "Direct competitor". */
export function formatCandidateKind(kind: string | null): string | null {
  if (!kind) {
    return null;
  }
  const words = kind.replace(/_/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : null;
}

/**
 * The answer for the respond API. Picks are kept to the offered candidates,
 * in the order they were offered; going ahead with the named competitors
 * sends none. Throws when a pick list is chosen with nothing picked.
 */
export function buildCompetitorSelectionAnswer(input: {
  decision: CompetitorSelectionDecision;
  selectedIds: string[];
  notes: string;
  model: CompetitorSelectionModel;
}): CompetitorSelectionAnswer {
  const notes = input.notes
    .trim()
    .slice(0, COMPETITOR_SELECTION_NOTES_MAX_LENGTH);
  const withNotes = notes ? { reviewer_notes: notes } : {};
  if (input.decision === 'proceed_with_named_competitors_only') {
    return { decision: input.decision, ...withNotes };
  }
  const picked = new Set(input.selectedIds);
  const selected = input.model.options
    .filter((option) => picked.has(option.id))
    .map((option) => option.id);
  if (selected.length === 0) {
    throw new Error(
      "Pick at least one candidate, or go ahead with the client's named competitors only.",
    );
  }
  return {
    decision: input.decision,
    selected_competitor_ids: selected,
    ...withNotes,
  };
}
