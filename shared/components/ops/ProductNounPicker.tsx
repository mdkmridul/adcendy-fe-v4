'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  buildProductNounAnswer,
  describeProductNounVolume,
  normalizeProductNoun,
  PRODUCT_NOUN_MAX_SELECTED,
  PRODUCT_NOUN_NOTES_MAX_LENGTH,
  type ProductNounAnswer,
  type ProductNounModel,
} from './productNounConfirmation';

type ProductNounPickerProps = {
  model: ProductNounModel;
  question: string | null;
  /** The task no longer takes an answer. */
  readOnly: boolean;
  pending: boolean;
  onSubmit: (answer: ProductNounAnswer) => void;
};

/**
 * The search terms buyers use for what the client sells, when research could
 * not decide them on its own. The reviewer picks from the candidates the task
 * found - each with its monthly searches and the sources that named it - and
 * can type terms of their own.
 */
export function ProductNounPicker({
  model,
  question,
  readOnly,
  pending,
  onSubmit,
}: ProductNounPickerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [typed, setTyped] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const chosen = [...selected, ...typed];
  const disabled = readOnly || pending;

  const toggle = (phrase: string, checked: boolean) => {
    setError(null);
    setSelected((current) =>
      checked ? [...current.filter((entry) => entry !== phrase), phrase] : current.filter((entry) => entry !== phrase),
    );
  };

  const addTyped = () => {
    const phrase = normalizeProductNoun(draft);
    if (!phrase) {
      setError('Type a search term between 2 and 80 characters.');
      return;
    }
    if (chosen.some((entry) => entry.toLowerCase() === phrase.toLowerCase())) {
      setError('That term is already on the list.');
      setDraft('');
      return;
    }
    setError(null);
    setTyped((current) => [...current, phrase]);
    setDraft('');
  };

  const removeTyped = (phrase: string) => {
    setError(null);
    setTyped((current) => current.filter((entry) => entry !== phrase));
  };

  const submit = () => {
    const built = buildProductNounAnswer({ phrases: chosen, notes });
    if ('error' in built) {
      setError(built.error);
      return;
    }
    setError(null);
    onSubmit(built.answer);
  };

  return (
    <Card className="border-amber-300/30 bg-card">
      <CardHeader>
        <CardTitle>Confirm The Search Terms</CardTitle>
        <CardDescription>
          Research could not confirm what buyers search for when they look for what{' '}
          {model.clientName ?? 'this client'} sells
          {model.marketLabel ? ` in ${model.marketLabel}` : ''}. Pick the terms buyers really use, or type your own.
          Everything downstream - competitors, keywords, pages - is researched from these.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {question ? <p className="text-sm text-muted-foreground">{question}</p> : null}

        {model.diagnosis ? (
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-sm font-semibold text-foreground">Why this is being asked</p>
            <p className="mt-1 text-sm text-muted-foreground">{model.diagnosis}</p>
          </div>
        ) : null}

        {model.candidates.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Candidates found ({selected.length} picked)
            </p>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {model.candidates.map((candidate, index) => {
                const checkboxId = `product-noun-candidate-${index}`;
                return (
                  <li key={candidate.phrase} className="flex items-start gap-3 p-3">
                    <Checkbox
                      id={checkboxId}
                      className="mt-0.5"
                      checked={selected.includes(candidate.phrase)}
                      disabled={disabled}
                      onCheckedChange={(checked) => toggle(candidate.phrase, checked === true)}
                    />
                    <Label htmlFor={checkboxId} className="block flex-1 cursor-pointer space-y-1 font-normal">
                      <span className="block text-sm font-semibold text-foreground">{candidate.phrase}</span>
                      <span className="block text-xs text-muted-foreground">
                        {[
                          describeProductNounVolume(candidate.searchVolume),
                          candidate.sources.length > 0 ? `named by ${candidate.sources.join(', ')}` : null,
                          candidate.confidence ? `confidence ${candidate.confidence}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </Label>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No candidates were found for this market, so every term has to be typed below.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="product-noun-draft">Add a term of your own</Label>
          <div className="flex gap-2">
            <Input
              id="product-noun-draft"
              value={draft}
              disabled={disabled}
              placeholder="smart ring"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addTyped();
                }
              }}
            />
            <Button type="button" variant="outline" disabled={disabled} onClick={addTyped}>
              Add
            </Button>
          </div>
          {typed.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {typed.map((phrase) => (
                <li
                  key={phrase}
                  className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1 text-xs text-foreground"
                >
                  {phrase}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    disabled={disabled}
                    onClick={() => removeTyped(phrase)}
                    aria-label={`Remove ${phrase}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-noun-notes">Notes (optional)</Label>
          <Textarea
            id="product-noun-notes"
            value={notes}
            disabled={disabled}
            maxLength={PRODUCT_NOUN_NOTES_MAX_LENGTH}
            placeholder="Anything the pipeline should know about these terms."
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {chosen.length} of {PRODUCT_NOUN_MAX_SELECTED} terms selected. The run resumes from competitor
            identification.
          </p>
          <Button type="button" disabled={disabled || chosen.length === 0} onClick={submit}>
            {pending ? 'Submitting…' : 'Submit search terms'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
