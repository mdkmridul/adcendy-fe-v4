'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  channelLabelV2,
  formatCountV2,
  formatMoneyV2,
  formatPeriodLabelV2,
  formatResultSourceV2,
  formatReturnOnSpendV2,
  marketLabelV2,
} from '@/shared/components/results/channelResultsV2';
import type {
  ChannelResultSummaryV2,
  ChannelResultViewV2,
} from '@/shared/types/channelResultsV2';

interface ChannelResultsTableV2Props {
  results: readonly ChannelResultViewV2[];
  editingId: string | null;
  onEdit: (result: ChannelResultViewV2) => void;
  onDelete: (result: ChannelResultViewV2) => void;
}

/** Every recorded period, newest first, as the API returns them. */
export function ChannelResultsTableV2({
  results,
  editingId,
  onEdit,
  onDelete,
}: ChannelResultsTableV2Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Market</TableHead>
          <TableHead className="text-right">Spend</TableHead>
          <TableHead className="text-right">Impressions</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead className="text-right">Leads</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => (
          <TableRow
            key={result.id}
            className={cn(editingId === result.id && 'bg-muted/60')}
          >
            <TableCell className="whitespace-nowrap">
              {formatPeriodLabelV2(result.period, result.period_start)}
            </TableCell>
            <TableCell className="min-w-[10rem] whitespace-normal">
              <p className="font-medium text-foreground">{channelLabelV2(result.channel_id)}</p>
              {result.notes ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">{result.notes}</p>
              ) : null}
            </TableCell>
            <TableCell>{marketLabelV2(result.market)}</TableCell>
            <TableCell className="text-right">{formatMoneyV2(result.spend, result.currency)}</TableCell>
            <TableCell className="text-right">{formatCountV2(result.impressions, result.currency)}</TableCell>
            <TableCell className="text-right">{formatCountV2(result.clicks, result.currency)}</TableCell>
            <TableCell className="text-right">{formatCountV2(result.leads, result.currency)}</TableCell>
            <TableCell className="text-right">{formatCountV2(result.orders, result.currency)}</TableCell>
            <TableCell className="text-right">{formatMoneyV2(result.revenue, result.currency)}</TableCell>
            <TableCell className="text-muted-foreground">{formatResultSourceV2(result.source)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(result)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(result)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface ChannelResultsByChannelV2Props {
  summaries: readonly ChannelResultSummaryV2[];
}

/**
 * One row per market, channel and currency, straight from the API's
 * `by_channel`: amounts in different currencies are never added together.
 */
export function ChannelResultsByChannelV2({ summaries }: ChannelResultsByChannelV2Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead>Market</TableHead>
          <TableHead className="text-right">Periods reported</TableHead>
          <TableHead className="text-right">Total spend</TableHead>
          <TableHead className="text-right">Leads</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Cost per lead</TableHead>
          <TableHead className="text-right">Cost per order</TableHead>
          <TableHead className="text-right">Return on spend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summaries.map((summary) => (
          <TableRow key={`${summary.market}|${summary.channel_id}|${summary.currency}`}>
            <TableCell className="font-medium text-foreground">
              {channelLabelV2(summary.channel_id)}
            </TableCell>
            <TableCell>{marketLabelV2(summary.market)}</TableCell>
            <TableCell className="text-right">{formatCountV2(summary.periods_reported)}</TableCell>
            <TableCell className="text-right">{formatMoneyV2(summary.totals.spend, summary.currency)}</TableCell>
            <TableCell className="text-right">{formatCountV2(summary.totals.leads, summary.currency)}</TableCell>
            <TableCell className="text-right">{formatCountV2(summary.totals.orders, summary.currency)}</TableCell>
            <TableCell className="text-right">{formatMoneyV2(summary.totals.revenue, summary.currency)}</TableCell>
            <TableCell className="text-right">{formatMoneyV2(summary.metrics.cost_per_lead, summary.currency)}</TableCell>
            <TableCell className="text-right">{formatMoneyV2(summary.metrics.cost_per_order, summary.currency)}</TableCell>
            <TableCell className="text-right">{formatReturnOnSpendV2(summary.metrics.return_on_spend)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
