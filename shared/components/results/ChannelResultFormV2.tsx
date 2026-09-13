'use client';

import { useId, useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  CHANNEL_RESULT_NOTES_MAX_LENGTH_V2,
  FIGURE_FIELDS_V2,
  MONTH_OPTIONS_V2,
  buildChannelResultPayloadV2,
  channelLabelV2,
  convertPeriodStartV2,
  defaultCurrencyForMarketV2,
  findReportedPeriodV2,
  formatPeriodLabelV2,
  marketLabelV2,
  monthPeriodStartFromPartsV2,
  monthPickerYearsV2,
  todayIsoV2,
  weekPeriodStartV2,
  type ChannelChoicesV2,
  type ChannelResultFormErrorsV2,
  type ChannelResultFormValuesV2,
  type EnteredByV2,
  type EntrySourceV2,
  type MarketOptionV2,
} from '@/shared/components/results/channelResultsV2';
import type {
  ChannelResultInputV2,
  ChannelResultPeriodV2,
  ChannelResultViewV2,
} from '@/shared/types/channelResultsV2';

interface ChannelResultFormV2Props {
  /** `edit` re-submits one saved period: market, channel and period stay fixed. */
  mode: 'new' | 'edit';
  initialValues: ChannelResultFormValuesV2;
  marketOptions: MarketOptionV2[];
  channelChoices: ChannelChoicesV2;
  reportedResults: readonly ChannelResultViewV2[];
  enteredBy: EnteredByV2;
  isSaving: boolean;
  serverError: string | null;
  onSubmit: (payload: ChannelResultInputV2) => void;
  onCancelEdit: () => void;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

export function ChannelResultFormV2({
  mode,
  initialValues,
  marketOptions,
  channelChoices,
  reportedResults,
  enteredBy,
  isSaving,
  serverError,
  onSubmit,
  onCancelEdit,
}: ChannelResultFormV2Props) {
  const fieldId = useId();
  const [values, setValues] = useState<ChannelResultFormValuesV2>(initialValues);
  const [errors, setErrors] = useState<ChannelResultFormErrorsV2>({});
  const [currencyTouched, setCurrencyTouched] = useState(mode === 'edit');
  const [today] = useState(() => todayIsoV2());
  const isEditing = mode === 'edit';

  const clearErrors = (...keys: Array<keyof ChannelResultFormErrorsV2>) => {
    setErrors((current) => {
      const next = { ...current };
      for (const key of keys) delete next[key];
      return next;
    });
  };

  const setField = <K extends keyof ChannelResultFormValuesV2>(
    key: K,
    value: ChannelResultFormValuesV2[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    clearErrors(key);
  };

  const handleMarketChange = (market: string) => {
    setValues((current) => ({
      ...current,
      market,
      currency: currencyTouched ? current.currency : defaultCurrencyForMarketV2(market),
    }));
    clearErrors('market', 'currency');
  };

  const handlePeriodChange = (period: ChannelResultPeriodV2) => {
    setValues((current) => ({
      ...current,
      period,
      periodStart: convertPeriodStartV2(period, current.periodStart || today),
    }));
    clearErrors('period', 'periodStart');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const built = buildChannelResultPayloadV2(values, { enteredBy });
    if (!built.ok) {
      setErrors(built.errors);
      return;
    }
    setErrors({});
    onSubmit(built.payload);
  };

  const monthStart =
    values.period === 'month' && values.periodStart
      ? values.periodStart
      : `${today.slice(0, 7)}-01`;
  const selectedYear = monthStart.slice(0, 4);
  const selectedMonth = monthStart.slice(5, 7);
  const years = monthPickerYearsV2(today, selectedYear);
  const alreadyReported = isEditing ? null : findReportedPeriodV2(reportedResults, values);
  const periodLabel = values.periodStart
    ? formatPeriodLabelV2(values.period, values.periodStart)
    : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {isEditing && periodLabel ? (
        <Alert>
          <AlertDescription>
            {`You're changing ${channelLabelV2(values.channelId)} for ${periodLabel} in ${marketLabelV2(values.market)}. Saving replaces what was recorded for that period.`}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${fieldId}-market`}>Market</Label>
          <Select
            value={values.market || undefined}
            onValueChange={handleMarketChange}
            disabled={isEditing}
          >
            <SelectTrigger id={`${fieldId}-market`} className="w-full">
              <SelectValue placeholder="Choose a market" />
            </SelectTrigger>
            <SelectContent>
              {marketOptions.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.market} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${fieldId}-channel`}>Channel</Label>
          <Select
            value={values.channelId || undefined}
            onValueChange={(channelId) => setField('channelId', channelId)}
            disabled={isEditing}
          >
            <SelectTrigger id={`${fieldId}-channel`} className="w-full">
              <SelectValue placeholder="Choose a channel" />
            </SelectTrigger>
            <SelectContent>
              {channelChoices.reported.length > 0 ? (
                <>
                  <SelectGroup>
                    <SelectLabel>Channels you have reported</SelectLabel>
                    {channelChoices.reported.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                </>
              ) : null}
              <SelectGroup>
                <SelectLabel>All channels</SelectLabel>
                {channelChoices.all.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError message={errors.channelId} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>How often are you reporting?</Label>
          <RadioGroup
            value={values.period}
            onValueChange={(period) => handlePeriodChange(period as ChannelResultPeriodV2)}
            className="flex flex-wrap gap-6 pt-2"
            disabled={isEditing}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="month" id={`${fieldId}-period-month`} />
              <Label htmlFor={`${fieldId}-period-month`} className="font-normal">
                By month
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="week" id={`${fieldId}-period-week`} />
              <Label htmlFor={`${fieldId}-period-week`} className="font-normal">
                By week
              </Label>
            </div>
          </RadioGroup>
          <FieldError message={errors.period} />
        </div>

        {values.period === 'month' ? (
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-month`}>Month</Label>
            <div className="flex gap-2">
              <Select
                value={selectedMonth}
                onValueChange={(month) =>
                  setField('periodStart', monthPeriodStartFromPartsV2(selectedYear, month) ?? '')
                }
                disabled={isEditing}
              >
                <SelectTrigger id={`${fieldId}-month`} className="w-full">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS_V2.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear}
                onValueChange={(year) =>
                  setField('periodStart', monthPeriodStartFromPartsV2(year, selectedMonth) ?? '')
                }
                disabled={isEditing}
              >
                <SelectTrigger aria-label="Year" className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldError message={errors.periodStart} />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-week`}>Week</Label>
            <Input
              id={`${fieldId}-week`}
              type="date"
              max={today}
              value={values.periodStart}
              onChange={(event) =>
                setField('periodStart', weekPeriodStartV2(event.target.value) ?? '')
              }
              disabled={isEditing}
            />
            <p className="text-xs text-muted-foreground">
              {periodLabel
                ? `${periodLabel}. Weeks run Monday to Sunday.`
                : 'Pick any day in the week.'}
            </p>
            <FieldError message={errors.periodStart} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${fieldId}-currency`}>Currency</Label>
        <Input
          id={`${fieldId}-currency`}
          className="w-32 uppercase"
          maxLength={3}
          value={values.currency}
          onChange={(event) => {
            setCurrencyTouched(true);
            setField('currency', event.target.value.toUpperCase());
          }}
        />
        <p className="text-xs text-muted-foreground">
          The currency your spend and revenue are in, like INR or USD.
        </p>
        <FieldError message={errors.currency} />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Figures</p>
          <p className="text-xs text-muted-foreground">
            Fill in what you have. Leave the rest blank.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FIGURE_FIELDS_V2.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`${fieldId}-${field.key}`}>
                {field.kind === 'money' && values.currency
                  ? `${field.label} (${values.currency})`
                  : field.label}
              </Label>
              <Input
                id={`${fieldId}-${field.key}`}
                inputMode={field.kind === 'money' ? 'decimal' : 'numeric'}
                autoComplete="off"
                value={values[field.key]}
                onChange={(event) => {
                  setField(field.key, event.target.value);
                  clearErrors('figures');
                }}
              />
              <FieldError message={errors[field.key]} />
            </div>
          ))}
        </div>
        <FieldError message={errors.figures} />
      </div>

      <div className="space-y-2">
        <Label>Where did these numbers come from?</Label>
        <RadioGroup
          value={values.entrySource}
          onValueChange={(entrySource) => setField('entrySource', entrySource as EntrySourceV2)}
          className="space-y-1 pt-1"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="self" id={`${fieldId}-source-self`} />
            <Label htmlFor={`${fieldId}-source-self`} className="font-normal">
              I entered them myself
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="platform" id={`${fieldId}-source-platform`} />
            <Label htmlFor={`${fieldId}-source-platform`} className="font-normal">
              {"Copied from an ad platform's report"}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${fieldId}-notes`}>Notes</Label>
        <Textarea
          id={`${fieldId}-notes`}
          rows={3}
          maxLength={CHANNEL_RESULT_NOTES_MAX_LENGTH_V2}
          placeholder="Anything that explains these numbers, like a sale or a paused campaign."
          value={values.notes}
          onChange={(event) => setField('notes', event.target.value)}
        />
        <FieldError message={errors.notes} />
      </div>

      {alreadyReported ? (
        <p className="text-sm text-muted-foreground">
          {"You've already recorded this period for this channel. Saving will replace those figures."}
        </p>
      ) : null}

      {serverError ? (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Save results'}
        </Button>
        {isEditing ? (
          <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
