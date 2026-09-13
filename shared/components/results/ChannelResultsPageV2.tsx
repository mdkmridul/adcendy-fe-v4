'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCampaign } from '@/hooks/useCampaigns';
import {
  useChannelResultsV2,
  useDeleteChannelResultV2,
  useRecordChannelResultV2,
} from '@/hooks/useChannelResultsV2';
import { getCampaignLifecycleStage } from '@/shared/components/campaigns/campaign-ui';
import { ChannelResultFormV2 } from '@/shared/components/results/ChannelResultFormV2';
import {
  ChannelResultsByChannelV2,
  ChannelResultsTableV2,
} from '@/shared/components/results/ChannelResultsTablesV2';
import {
  buildChannelChoicesV2,
  buildMarketOptionsV2,
  campaignMarketCodesV2,
  channelLabelV2,
  describeChannelResultErrorV2,
  emptyChannelResultFormValuesV2,
  formatPeriodLabelV2,
  marketLabelV2,
  resultToFormValuesV2,
  type ChannelResultFormValuesV2,
} from '@/shared/components/results/channelResultsV2';
import type {
  ChannelResultInputV2,
  ChannelResultViewV2,
} from '@/shared/types/channelResultsV2';

const EMPTY_RESULTS: ChannelResultViewV2[] = [];

interface ChannelResultsPageV2Props {
  campaignId: string;
}

export function ChannelResultsPageV2({ campaignId }: ChannelResultsPageV2Props) {
  const { campaign, isLoading: isCampaignLoading, error: campaignError } = useCampaign(campaignId);
  const { user } = useAuth();
  const { toast } = useToast();
  const resultsQuery = useChannelResultsV2(campaignId);
  const recordMutation = useRecordChannelResultV2(campaignId);
  const deleteMutation = useDeleteChannelResultV2(campaignId);
  const formRef = useRef<HTMLDivElement>(null);

  const [editing, setEditing] = useState<ChannelResultViewV2 | null>(null);
  const [nextEntry, setNextEntry] = useState<{
    key: number;
    values: ChannelResultFormValuesV2 | null;
  }>({ key: 0, values: null });
  const [pendingDelete, setPendingDelete] = useState<ChannelResultViewV2 | null>(null);

  const results = resultsQuery.data?.results ?? EMPTY_RESULTS;
  const summaries = resultsQuery.data?.by_channel ?? [];
  const campaignMarkets = useMemo(
    () => (campaign ? campaignMarketCodesV2(campaign) : []),
    [campaign],
  );
  const marketOptions = useMemo(
    () => buildMarketOptionsV2([...campaignMarkets, ...results.map((result) => result.market)]),
    [campaignMarkets, results],
  );
  const channelChoices = useMemo(
    () => buildChannelChoicesV2(results.map((result) => result.channel_id)),
    [results],
  );

  if (isCampaignLoading && !campaign) {
    return <div className="h-40 animate-pulse rounded-lg bg-card" />;
  }

  if (!campaign) {
    return (
      <Card className="border-border bg-card p-8 text-center">
        <p className="text-destructive">{campaignError ?? 'Failed to load campaign.'}</p>
      </Card>
    );
  }

  const header = (
    <div className="space-y-2">
      <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Results</h1>
      <p className="max-w-2xl text-muted-foreground">
        Record what you spent and what came back, channel by channel. We use your own results to
        sharpen the next plan.
      </p>
    </div>
  );

  if (getCampaignLifecycleStage(campaign) !== 'active') {
    return (
      <div className="max-w-5xl space-y-6">
        {header}
        <Card className="border-border bg-card p-8 text-center">
          <h2 className="font-space-grotesk text-xl font-semibold">
            Results open once your plan is delivered
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            When your strategy plan is ready and you start running it, come back here to record
            what each channel cost and brought in.
          </p>
          <Button asChild className="mt-5">
            <Link href={`/app/campaigns/${campaignId}/overview`}>Return to campaign overview</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const enteredBy = user?.role === 'ADMIN' ? 'operator' : 'client';
  const formValues = editing
    ? resultToFormValuesV2(editing)
    : (nextEntry.values ?? emptyChannelResultFormValuesV2({ market: campaignMarkets[0] ?? '' }));
  const formKey = editing ? `edit-${editing.id}-${editing.updated_at}` : `new-${nextEntry.key}`;

  const startEdit = (result: ChannelResultViewV2) => {
    recordMutation.reset();
    setEditing(result);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => {
    recordMutation.reset();
    setEditing(null);
  };

  const handleSubmit = (payload: ChannelResultInputV2) => {
    recordMutation.mutate(payload, {
      onSuccess: (saved) => {
        toast({
          title: 'Results saved',
          description: `${channelLabelV2(saved.channel_id)}, ${formatPeriodLabelV2(saved.period, saved.period_start)}.`,
        });
        setEditing(null);
        // Keep the market, channel and period for the next entry; clear the figures.
        setNextEntry((current) => ({
          key: current.key + 1,
          values: emptyChannelResultFormValuesV2({
            market: saved.market,
            channelId: saved.channel_id,
            period: saved.period,
            periodStart: saved.period_start,
            currency: saved.currency,
            entrySource: saved.source === 'platform_export' ? 'platform' : 'self',
          }),
        }));
      },
    });
  };

  const closeDeleteDialog = () => {
    setPendingDelete(null);
    deleteMutation.reset();
  };

  const confirmDelete = () => {
    const target = pendingDelete;
    if (!target) return;
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        if (editing?.id === target.id) setEditing(null);
        closeDeleteDialog();
        toast({ title: 'Results deleted' });
      },
    });
  };

  return (
    <div className="max-w-6xl space-y-6">
      {header}

      <div ref={formRef}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-space-grotesk text-lg">
              {editing ? 'Change recorded results' : 'Record results'}
            </CardTitle>
            <CardDescription>
              One entry per channel for each month or week. Recording the same period again
              replaces what was there.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelResultFormV2
              key={formKey}
              mode={editing ? 'edit' : 'new'}
              initialValues={formValues}
              marketOptions={marketOptions}
              channelChoices={channelChoices}
              reportedResults={results}
              enteredBy={enteredBy}
              isSaving={recordMutation.isPending}
              serverError={
                recordMutation.error ? describeChannelResultErrorV2(recordMutation.error) : null
              }
              onSubmit={handleSubmit}
              onCancelEdit={cancelEdit}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-lg">How each channel is doing</CardTitle>
          <CardDescription>
            Totals across every period you have recorded. Return on spend is revenue divided by
            spend. Amounts in different currencies are shown separately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resultsQuery.isLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-muted/40" />
          ) : summaries.length > 0 ? (
            <ChannelResultsByChannelV2 summaries={summaries} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Your totals will show here once you record some results.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-lg">Recorded results</CardTitle>
          <CardDescription>Newest period first.</CardDescription>
        </CardHeader>
        <CardContent>
          {resultsQuery.isLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-muted/40" />
          ) : resultsQuery.error ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                {describeChannelResultErrorV2(resultsQuery.error)}
              </p>
              <Button type="button" variant="outline" onClick={() => void resultsQuery.refetch()}>
                Try again
              </Button>
            </div>
          ) : results.length > 0 ? (
            <ChannelResultsTableV2
              results={results}
              editingId={editing?.id ?? null}
              onEdit={startEdit}
              onDelete={setPendingDelete}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing recorded yet. Your saved results will show here.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) closeDeleteDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete these results?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `This removes ${channelLabelV2(pendingDelete.channel_id)} for ${formatPeriodLabelV2(pendingDelete.period, pendingDelete.period_start)} in ${marketLabelV2(pendingDelete.market)}. You can't undo this.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.error ? (
            <p className="text-sm text-destructive">
              {describeChannelResultErrorV2(deleteMutation.error)}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Keep them</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                // Stay open until the delete finishes, so a failure can be shown here.
                event.preventDefault();
                confirmDelete();
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
