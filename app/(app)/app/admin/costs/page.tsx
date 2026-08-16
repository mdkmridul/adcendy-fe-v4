'use client';

import Link from 'next/link';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useOpsCampaignCostSummaries } from '@/hooks/useOpsV2';
import { formatOpsDateTime } from '@/shared/components/ops/opsUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatUsd(value?: number | null) {
  if (typeof value !== 'number') {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function AdminCostsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const summariesQuery = useOpsCampaignCostSummaries(isAdmin);

  if (isAuthLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading provider cost…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                Provider cost is only available to administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = summariesQuery.data ?? [];
  const grandTotal = items.reduce(
    (sum, item) => sum + (item.totalCostUsd ?? 0),
    0,
  );
  // Bars are scaled to the most expensive campaign so the ranking stays
  // readable when one campaign dominates.
  const widest = items[0]?.totalCostUsd ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-3">
        <Link href="/app/admin">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Admin Ops
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
            Provider Cost
          </h1>
          <p className="text-muted-foreground">
            What each campaign spent with FireCrawl, SerpAPI, DataForSEO, and
            the model providers — priced per call and per billable unit rather
            than estimated per provider.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            All campaigns
          </p>
          <p className="font-space-grotesk mt-1 text-4xl font-semibold tracking-tight tabular-nums">
            {formatUsd(grandTotal)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            across {items.length} campaign{items.length === 1 ? '' : 's'} that
            have made provider calls
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="px-0 py-0">
          {summariesQuery.isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">
              Loading campaigns…
            </p>
          ) : summariesQuery.error ? (
            <p className="p-6 text-sm text-destructive">
              Campaign cost could not be loaded.
            </p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No campaign has made a provider call yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Campaign</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="w-[30%]">Spend</TableHead>
                  <TableHead className="pr-6 text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.campaignId}
                    className="group cursor-pointer"
                  >
                    <TableCell className="pl-6">
                      {/* The whole row reads as one target: the link fills the
                          first cell and the row carries the hover state. */}
                      <Link
                        href={`/admin/costs/${item.campaignId}`}
                        className="flex items-center gap-2 font-medium hover:underline"
                      >
                        {item.campaignTitle ?? item.campaignId}
                        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        Last run {formatOpsDateTime(item.lastRunAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(item.runCount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(item.calls ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="h-2 w-full rounded-sm bg-muted/60">
                        <div
                          className="h-full rounded-sm bg-[var(--chart-2)]"
                          style={{
                            width: `${
                              widest > 0
                                ? Math.max(
                                    ((item.totalCostUsd ?? 0) / widest) * 100,
                                    1.5,
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium tabular-nums">
                      {formatUsd(item.totalCostUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
