'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  buildCompetitorSelectionAnswer,
  COMPETITOR_SELECTION_NOTES_MAX_LENGTH,
  formatCandidateKind,
  type CompetitorSelectionAnswer,
  type CompetitorSelectionDecision,
  type CompetitorSelectionModel,
  type CompetitorSelectionNamed,
} from './competitorSelection';

type CompetitorSelectionPickerProps = {
  model: CompetitorSelectionModel;
  question: string | null;
  /** The task no longer takes an answer. */
  readOnly: boolean;
  pending: boolean;
  onSubmit: (answer: CompetitorSelectionAnswer) => void;
};

function NamedList({ title, entries, note }: { title: string; entries: CompetitorSelectionNamed[]; note: string }) {
  if (entries.length === 0) {
    return null;
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id ?? entry.name}
            className="rounded-md border border-border bg-background/40 px-2.5 py-1 text-xs text-foreground"
          >
            {entry.name}
            {entry.domain ? <span className="text-muted-foreground"> ({entry.domain})</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The pick list for a market whose competitive tiers placed no competitor
 * beyond the client's named ones: which of the strongest candidates to treat
 * as competitors, or go ahead with the named competitors only.
 */
export function CompetitorSelectionPicker({
  model,
  question,
  readOnly,
  pending,
  onSubmit,
}: CompetitorSelectionPickerProps) {
  const [decision, setDecision] = useState<CompetitorSelectionDecision>(
    model.options.length > 0 ? 'use_selected_competitors' : 'proceed_with_named_competitors_only',
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const picking = decision === 'use_selected_competitors';
  const canSubmit = !readOnly && !pending && (!picking || selectedIds.length > 0);

  const toggle = (id: string, checked: boolean) => {
    setError(null);
    setSelectedIds((current) => (checked ? [...current.filter((entry) => entry !== id), id] : current.filter((entry) => entry !== id)));
  };

  const submit = () => {
    try {
      onSubmit(buildCompetitorSelectionAnswer({ decision, selectedIds, notes, model }));
    } catch (buildError) {
      setError(buildError instanceof Error ? buildError.message : 'The selection could not be sent.');
    }
  };

  return (
    <Card className="border-amber-300/30 bg-card">
      <CardHeader>
        <CardTitle>Pick Competitors</CardTitle>
        <CardDescription>
          Competitive research placed no competitor beyond the ones the client named. Choose the candidates to
          treat as competitors, or go ahead with the client&apos;s named competitors only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {question ? <p className="text-sm text-muted-foreground">{question}</p> : null}

        <NamedList
          title="Already included"
          note="The client named these; they are competitors whatever you choose."
          entries={model.named}
        />
        <NamedList
          title="Left out: website not confirmed"
          note="The sites found for these could not be confirmed as theirs, so they are not placed."
          entries={model.unconfirmed}
        />

        <RadioGroup
          value={decision}
          onValueChange={(value) => {
            setError(null);
            setDecision(value as CompetitorSelectionDecision);
          }}
          disabled={readOnly || pending}
          className="gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value="use_selected_competitors"
              id="competitor-selection-use"
              disabled={model.options.length === 0}
            />
            <Label htmlFor="competitor-selection-use">Treat the candidates I pick as competitors</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="proceed_with_named_competitors_only" id="competitor-selection-proceed" />
            <Label htmlFor="competitor-selection-proceed">Go ahead with the client&apos;s named competitors only</Label>
          </div>
        </RadioGroup>

        {model.options.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Candidates{picking ? ` (${selectedIds.length} picked)` : ''}
            </p>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {model.options.map((option, index) => {
                const checkboxId = `competitor-option-${index}`;
                const kind = formatCandidateKind(option.kind);
                return (
                  <li key={option.id} className="flex items-start gap-3 p-3">
                    <Checkbox
                      id={checkboxId}
                      className="mt-0.5"
                      checked={selectedIds.includes(option.id)}
                      disabled={!picking || readOnly || pending}
                      onCheckedChange={(checked) => toggle(option.id, checked === true)}
                    />
                    <Label htmlFor={checkboxId} className="block flex-1 cursor-pointer space-y-1 font-normal">
                      <span className="block text-sm font-semibold text-foreground">
                        {option.name}
                        {option.domain ? (
                          <span className="font-normal text-muted-foreground"> ({option.domain})</span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {[kind, option.score !== null ? `score ${option.score}` : null].filter(Boolean).join(' · ')}
                      </span>
                      {option.whyNotPlaced ? (
                        <span className="block text-xs text-muted-foreground">Held back: {option.whyNotPlaced}</span>
                      ) : null}
                    </Label>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No candidates were offered for this market.</p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="competitor-selection-notes">Notes (optional)</Label>
          <Textarea
            id="competitor-selection-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={COMPETITOR_SELECTION_NOTES_MAX_LENGTH}
            rows={3}
            disabled={readOnly || pending}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {readOnly ? (
          <p className="text-sm text-muted-foreground">This task has already been answered.</p>
        ) : null}

        <Button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 sm:w-auto"
        >
          {pending ? 'Submitting...' : picking ? 'Submit picks and resume' : 'Resume with named competitors only'}
        </Button>
      </CardContent>
    </Card>
  );
}
