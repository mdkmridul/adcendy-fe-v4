'use client';

import { useMemo, useState } from 'react';
import { useOpsCampaignCost } from '@/hooks/useOpsV2';
import { ChevronRight } from 'lucide-react';
import type {
  CampaignCostOperationRow,
  CampaignCostProviderRow,
  CampaignCostRunRow,
} from '@/shared/types/opsV2';
import { formatOpsDateTime, formatOpsStatus } from './opsUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CampaignCostPanelProps {
  campaignId: string;
}

/**
 * Provider spend for one campaign.
 *
 * Two decisions drive the layout. The reader's first question is "how much, and
 * can I trust it" — so the total is a hero figure and the measured/estimated
 * split is the first thing under it, not a column buried in a table. Their
 * second question is "where did it go", which is a magnitude comparison, so
 * providers are ranked bars in a single hue rather than six categorical colours
 * that would make the dominant provider harder to spot, not easier.
 *
 * Measured cost is what a provider reported. Estimated cost is the reservation
 * placed before a call whose price it never returned. They are never summed
 * into one confident-looking number, and the estimated portion carries a
 * hatch so the distinction survives greyscale, print, and colour blindness.
 */
export function CampaignCostPanel({ campaignId }: CampaignCostPanelProps) {
  const costQuery = useOpsCampaignCost(campaignId, Boolean(campaignId));
  const data = costQuery.data;

  const providers = useMemo(
    () =>
      [...(data?.byProvider ?? [])].sort(
        (left, right) => (right.totalCostUsd ?? 0) - (left.totalCostUsd ?? 0),
      ),
    [data?.byProvider],
  );

  if (costQuery.isLoading) {
    return <PanelMessage>Loading provider cost…</PanelMessage>;
  }

  if (costQuery.error) {
    return (
      <PanelMessage tone="destructive">
        Provider cost could not be loaded for this campaign.
      </PanelMessage>
    );
  }

  if (!data) {
    return null;
  }

  const measured = data.totals.actualCostUsd ?? 0;
  const estimated = data.totals.estimatedCostUsd ?? 0;
  const total = data.totals.totalCostUsd ?? 0;
  const calls = data.totals.calls ?? 0;
  const widest = providers[0]?.totalCostUsd ?? 0;
  // Run bars are scaled to the most expensive attempt, so a rerun that reused
  // most of its data reads as visibly cheaper rather than merely smaller.
  const widestRun = data.byRun.reduce(
    (max, run) => Math.max(max, run.totalCostUsd ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Provider cost
          </CardTitle>
          <CardDescription>
            {calls.toLocaleString()} provider call{calls === 1 ? '' : 's'} across{' '}
            {data.runCount ?? 0} run{data.runCount === 1 ? '' : 's'}
            {data.campaignTitle ? ` for ${data.campaignTitle}` : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="font-space-grotesk text-5xl font-semibold tracking-tight">
              {formatUsd(total)}
            </p>
          </div>

          {total > 0 ? (
            <CertaintySplit measured={measured} estimated={estimated} total={total} />
          ) : calls > 0 ? (
            <p className="text-sm text-muted-foreground">
              {calls.toLocaleString()} calls are recorded for this campaign but
              none carries a cost. That means the run predates cost accounting
              rather than that it was free.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No provider calls have been recorded for this campaign.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Where it went</CardTitle>
          <CardDescription>
            Ranked by total spend. Bars show the measured and estimated portions
            of each provider&rsquo;s cost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No provider calls recorded.
            </p>
          ) : (
            <div className="space-y-4">
              {providers.map((row) => (
                <ProviderBar
                  key={row.provider}
                  row={row}
                  widest={widest}
                  total={total}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>By operation</CardTitle>
          <CardDescription>
            Units are what the provider actually billed. FireCrawl charges per
            credit and a scrape costs five, so a call count and a unit count are
            different questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Operation</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Units billed</TableHead>
                <TableHead className="pr-6 text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byOperation.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="pl-6 text-sm text-muted-foreground">
                    No operations recorded.
                  </TableCell>
                </TableRow>
              ) : (
                data.byOperation.map((row) => (
                  <TableRow key={`${row.provider}:${row.operation}`}>
                    <TableCell className="pl-6">
                      <span className="font-mono text-xs">{row.operation}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {row.provider}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(row.calls ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <UnitsCell row={row} />
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium tabular-nums">
                      {formatUsd(row.totalCostUsd)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>By run</CardTitle>
          <CardDescription>
            A campaign is re-run after reviewer changes and after failures, so
            this total is a sum over attempts. Open a run to see which
            providers and which phases its cost came from.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.byRun.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs recorded.</p>
          ) : (
            data.byRun.map((run, index) => (
              <RunBreakdown
                key={run.pipelineRunId}
                run={run}
                widest={widestRun}
                // The newest run is the one a reader just triggered, so it
                // opens without a click and older attempts stay collapsed.
                defaultOpen={index === 0}
              />
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Data this campaign collected</CardTitle>
            <CardDescription>
              Later runs can be served from stored provider data instead of
              paying again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Stat
                label="Observations stored"
                value={(
                  data.collectedDataReuse.observationsCollected ?? 0
                ).toLocaleString()}
              />
              <Stat
                label="Served to later runs"
                value={(
                  data.collectedDataReuse.timesServedToLaterRuns ?? 0
                ).toLocaleString()}
                hint="Provider calls nobody had to pay for again"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Spend this campaign avoided by reading another run&rsquo;s data is
              not shown: a reuse short-circuits before a provider call exists, so
              there is no record to attribute.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Measured against estimated, as one bar rather than two numbers.
 *
 * The reader needs to know how much of the total is a real figure before the
 * total means anything, and a proportion answers that faster than a pair of
 * currency values they would have to divide.
 */
function CertaintySplit({
  measured,
  estimated,
  total,
}: {
  measured: number;
  estimated: number;
  total: number;
}) {
  const measuredPct = total > 0 ? (measured / total) * 100 : 0;
  const estimatedPct = Math.max(0, 100 - measuredPct);

  return (
    <div className="space-y-3">
      {/* 2px surface gap between segments does the separating, not a border. */}
      <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-sm bg-muted">
        {measuredPct > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full rounded-l-sm bg-[var(--chart-2)]"
                style={{ width: `${measuredPct}%` }}
              />
            </TooltipTrigger>
            <TooltipContent>
              {formatUsd(measured)} measured — reported by the provider
            </TooltipContent>
          </Tooltip>
        ) : null}
        {estimatedPct > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full rounded-r-sm"
                style={{
                  width: `${estimatedPct}%`,
                  // Hatch, so the uncertain portion survives greyscale, print,
                  // and colour blindness rather than relying on hue alone.
                  backgroundColor: 'color-mix(in oklch, var(--chart-2) 22%, transparent)',
                  backgroundImage:
                    'repeating-linear-gradient(45deg, color-mix(in oklch, var(--chart-2) 45%, transparent) 0 2px, transparent 2px 6px)',
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              {formatUsd(estimated)} estimated — a reservation, not a billed
              amount
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <LegendItem
          swatchClassName="bg-[var(--chart-2)]"
          label="Measured"
          value={formatUsd(measured)}
          detail={`${Math.round(measuredPct)}% of total`}
        />
        <LegendItem
          swatchStyle={{
            backgroundColor: 'color-mix(in oklch, var(--chart-2) 22%, transparent)',
            backgroundImage:
              'repeating-linear-gradient(45deg, color-mix(in oklch, var(--chart-2) 45%, transparent) 0 2px, transparent 2px 6px)',
          }}
          label="Estimated"
          value={formatUsd(estimated)}
          detail={
            estimated > 0 ? 'reservation, not billed' : 'nothing unmeasured'
          }
        />
      </div>
    </div>
  );
}

/**
 * One attempt at the campaign, with the reason its cost differs from the
 * others.
 *
 * Providers answer "who was paid" and phases answer "what for" — a rerun that
 * re-bought SERP but reused domain metrics looks identical to a cheap first
 * run on provider alone, and completely different once the phase is named.
 * Both are shown because neither is sufficient.
 */
function RunBreakdown({
  run,
  widest,
  defaultOpen,
}: {
  run: CampaignCostRunRow;
  widest: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const runTotal = run.totalCostUsd ?? 0;
  // Scaled across runs, so a run's bar is comparable to its siblings.
  const widthPct = widest > 0 ? Math.max((runTotal / widest) * 100, 1.5) : 0;
  const hasDetail = run.byProvider.length > 0 || run.byPhase.length > 0;

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!hasDetail}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-default"
      >
        <ChevronRight
          aria-hidden
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-90' : ''
          } ${hasDetail ? '' : 'opacity-0'}`}
        />
        <div className="min-w-0 flex-1">
          <span className="block truncate font-mono text-xs">
            {run.pipelineRunId}
          </span>
          <span className="text-xs text-muted-foreground">
            {run.status ? formatOpsStatus(run.status) : 'Unknown'} ·{' '}
            {formatOpsDateTime(run.createdAt)} ·{' '}
            {(run.calls ?? 0).toLocaleString()} call
            {run.calls === 1 ? '' : 's'}
          </span>
        </div>
        <div className="hidden h-2 w-32 shrink-0 rounded-sm bg-muted/60 sm:block">
          <div
            className="h-full rounded-sm bg-[var(--chart-2)]"
            style={{ width: `${widthPct}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums">
          {formatUsd(runTotal)}
        </span>
      </button>

      {open && hasDetail ? (
        <div className="grid gap-6 border-t border-border px-4 py-4 sm:grid-cols-2">
          <MiniBreakdown
            label="Providers"
            rows={run.byProvider.map((row) => ({
              key: row.provider,
              label: row.provider,
              calls: row.calls ?? 0,
              total: row.totalCostUsd ?? 0,
            }))}
            runTotal={runTotal}
          />
          <MiniBreakdown
            label="Phases"
            rows={run.byPhase.map((row) => ({
              key: row.phase,
              label: row.phase.replace(/_v2$/, '').replace(/_/g, ' '),
              calls: row.calls ?? 0,
              total: row.totalCostUsd ?? 0,
            }))}
            runTotal={runTotal}
          />
        </div>
      ) : null}
    </div>
  );
}

function MiniBreakdown({
  label,
  rows,
  runTotal,
}: {
  label: string;
  rows: Array<{ key: string; label: string; calls: number; total: number }>;
  runTotal: number;
}) {
  // Scaled within the run, not across the campaign: this answers "what drove
  // *this* run", and rescaling to the campaign would flatten a cheap run into
  // an unreadable row of slivers.
  const widest = rows[0]?.total ?? 0;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not recorded.</p>
      ) : (
        rows.map((row) => (
          <div key={row.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{row.label}</span>
              <span className="shrink-0 tabular-nums">
                {formatUsd(row.total)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-sm bg-muted/60">
                <div
                  className="h-full rounded-sm bg-[var(--chart-2)]"
                  style={{
                    width: `${widest > 0 ? Math.max((row.total / widest) * 100, 1.5) : 0}%`,
                  }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {runTotal > 0
                  ? `${Math.round((row.total / runTotal) * 100)}%`
                  : '—'}{' '}
                · {row.calls.toLocaleString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ProviderBar({
  row,
  widest,
  total,
}: {
  row: CampaignCostProviderRow;
  widest: number;
  total: number;
}) {
  const rowTotal = row.totalCostUsd ?? 0;
  const rowMeasured = row.actualCostUsd ?? 0;
  const rowEstimated = row.estimatedCostUsd ?? 0;
  // Bars are scaled to the largest provider so the ranking is readable even
  // when one provider dominates the campaign.
  const widthPct = widest > 0 ? (rowTotal / widest) * 100 : 0;
  const measuredShare = rowTotal > 0 ? (rowMeasured / rowTotal) * 100 : 0;
  const shareOfTotal = total > 0 ? (rowTotal / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">{row.provider}</span>
        <span className="text-muted-foreground tabular-nums">
          {(row.calls ?? 0).toLocaleString()} call
          {row.calls === 1 ? '' : 's'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-5 flex-1 rounded-sm bg-muted/60">
          {rowTotal > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex h-full gap-[2px] rounded-sm"
                  style={{ width: `${Math.max(widthPct, 1.5)}%` }}
                >
                  <div
                    className="h-full rounded-l-sm bg-[var(--chart-2)]"
                    style={{ width: `${measuredShare}%` }}
                  />
                  <div
                    className="h-full flex-1 rounded-r-sm"
                    style={{
                      backgroundColor:
                        'color-mix(in oklch, var(--chart-2) 22%, transparent)',
                      backgroundImage:
                        'repeating-linear-gradient(45deg, color-mix(in oklch, var(--chart-2) 45%, transparent) 0 2px, transparent 2px 6px)',
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span className="block">
                  {formatUsd(rowMeasured)} measured
                </span>
                <span className="block">
                  {formatUsd(rowEstimated)} estimated
                </span>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        {/* Value at the tip, outside the bar, so it is never clipped. */}
        <span className="w-24 text-right text-sm font-medium tabular-nums">
          {formatUsd(rowTotal)}
        </span>
        <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
          {shareOfTotal >= 0.5 ? `${Math.round(shareOfTotal)}%` : ''}
        </span>
      </div>
    </div>
  );
}

function LegendItem({
  swatchClassName,
  swatchStyle,
  label,
  value,
  detail,
}: {
  swatchClassName?: string;
  swatchStyle?: React.CSSProperties;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className={`h-3 w-3 shrink-0 rounded-[2px] ${swatchClassName ?? ''}`}
        style={swatchStyle}
      />
      <span>
        <span className="font-medium tabular-nums">{value}</span>{' '}
        <span className="text-muted-foreground">{label}</span>
        {detail ? (
          <span className="ml-1 text-xs text-muted-foreground">({detail})</span>
        ) : null}
      </span>
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function PanelMessage({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'destructive';
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent
        className={`py-10 text-center text-sm ${
          tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
        }`}
      >
        {children}
      </CardContent>
    </Card>
  );
}

function UnitsCell({ row }: { row: CampaignCostOperationRow }) {
  if (!row.unitsConsumed) {
    return <span className="text-muted-foreground">—</span>;
  }

  const { unit, quantity } = row.unitsConsumed;
  const perCall = row.calls && row.calls > 0 ? quantity / row.calls : null;

  return (
    <span>
      {quantity.toLocaleString()} {unit}
      {quantity === 1 ? '' : 's'}
      {perCall !== null && perCall !== 1 ? (
        <span className="ml-1 text-xs text-muted-foreground">
          ({perCall.toFixed(perCall % 1 === 0 ? 0 : 1)}/call)
        </span>
      ) : null}
    </span>
  );
}

function formatUsd(value?: number | null) {
  if (value === null || value === undefined) {
    return '—';
  }

  // Individual operations run to fractions of a cent, so a flat two decimals
  // would render most of this table as $0.00.
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
  }).format(value);
}
