'use client';

import { useOpsCampaignCost } from '@/hooks/useOpsV2';
import type {
  CampaignCostBucket,
  CampaignCostOperationRow,
} from '@/shared/types/opsV2';
import { formatOpsDateTime, formatOpsStatus } from './opsUtils';
import { Badge } from '@/components/ui/badge';
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
 * Provider spend for one campaign, across every run it has made.
 *
 * Measured and estimated cost are shown as separate columns rather than one
 * total. Only DataForSEO and the token-priced LLM calls settle at a figure the
 * provider actually reported; the rest still settle at a reservation estimate,
 * and presenting an estimate as a billed amount is how a cost view misleads.
 */
export function CampaignCostPanel({ campaignId }: CampaignCostPanelProps) {
  const costQuery = useOpsCampaignCost(campaignId, Boolean(campaignId));
  const data = costQuery.data;

  if (costQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Provider cost</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Loading provider cost…
        </CardContent>
      </Card>
    );
  }

  if (costQuery.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Provider cost</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          Provider cost is unavailable for this campaign.
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const hasEstimate = (data.totals.estimatedCostUsd ?? 0) > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Provider cost</CardTitle>
          <CardDescription>
            Spend across {data.runCount ?? 0} run
            {data.runCount === 1 ? '' : 's'}, from{' '}
            <code>GET /api/v2/telemetry/admin/campaigns/:campaignId/cost</code>.
            Measured cost is what a provider reported; estimated cost is the
            reservation placed before a call whose price it never returned.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <CostStat label="Total" value={formatUsd(data.totals.totalCostUsd)} />
          <CostStat
            label="Measured"
            value={formatUsd(data.totals.actualCostUsd)}
            hint="Reported by the provider"
          />
          <CostStat
            label="Estimated"
            value={formatUsd(data.totals.estimatedCostUsd)}
            hint="Reservation, not a billed figure"
            muted={!hasEstimate}
          />
          <CostStat
            label="Provider calls"
            value={(data.totals.calls ?? 0).toLocaleString()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By provider</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Measured</TableHead>
                <TableHead className="text-right">Estimated</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byProvider.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No provider calls recorded for this campaign.
                  </TableCell>
                </TableRow>
              ) : (
                data.byProvider.map((row) => (
                  <TableRow key={row.provider}>
                    <TableCell className="font-medium">{row.provider}</TableCell>
                    <TableCell className="text-right">
                      {(row.calls ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatUsd(row.actualCostUsd)}
                    </TableCell>
                    <TableCell className="text-right">
                      <EstimateCell bucket={row} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(row.totalCostUsd)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By operation</CardTitle>
          <CardDescription>
            Units are what the provider actually billed — FireCrawl charges per
            credit rather than per call, so a scrape costing five credits is not
            one unit of spend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byOperation.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No operations recorded.
                  </TableCell>
                </TableRow>
              ) : (
                data.byOperation.map((row) => (
                  <TableRow key={`${row.provider}:${row.operation}`}>
                    <TableCell>{row.provider}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.operation}
                    </TableCell>
                    <TableCell className="text-right">
                      {(row.calls ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <UnitsCell row={row} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(row.totalCostUsd)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By run</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byRun.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No runs recorded.
                  </TableCell>
                </TableRow>
              ) : (
                data.byRun.map((row) => (
                  <TableRow key={row.pipelineRunId}>
                    <TableCell className="font-mono text-xs">
                      {row.pipelineRunId}
                    </TableCell>
                    <TableCell>
                      {row.status ? formatOpsStatus(row.status) : 'Unknown'}
                    </TableCell>
                    <TableCell>{formatOpsDateTime(row.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {(row.calls ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(row.totalCostUsd)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collected data reuse</CardTitle>
          <CardDescription>
            {data.collectedDataReuse.note ??
              'Counts reuse of data this campaign collected.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <CostStat
            label="Observations collected"
            value={(
              data.collectedDataReuse.observationsCollected ?? 0
            ).toLocaleString()}
          />
          <CostStat
            label="Served to later runs"
            value={(
              data.collectedDataReuse.timesServedToLaterRuns ?? 0
            ).toLocaleString()}
            hint="Provider calls later runs did not have to pay for"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function CostStat({
  label,
  value,
  hint,
  muted = false,
}: {
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          muted ? 'text-2xl font-semibold text-muted-foreground' : 'text-2xl font-semibold'
        }
      >
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/**
 * An estimate is flagged rather than shown as a plain number, so a reservation
 * is never mistaken for something the provider charged.
 */
function EstimateCell({ bucket }: { bucket: CampaignCostBucket }) {
  const estimated = bucket.estimatedCostUsd ?? 0;
  if (estimated <= 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="font-normal">
          {formatUsd(estimated)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        Reservation estimate. This provider did not report a price for these
        calls, so the figure is a ceiling rather than a billed amount.
      </TooltipContent>
    </Tooltip>
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
      {perCall && perCall !== 1 ? (
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

  // Provider costs run to fractions of a cent, so two decimals would render
  // most individual operations as $0.00.
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
  }).format(value);
}
