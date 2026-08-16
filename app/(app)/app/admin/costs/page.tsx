'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useOpsCampaignOverviews, useOpsCostsSummary } from '@/hooks/useOpsV2';
import { CampaignCostPanel } from '@/shared/components/ops/CampaignCostPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminCostsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const router = useRouter();
  const searchParams = useSearchParams();
  // The selection lives in the URL so a cost view can be sent to someone and
  // survives a reload, rather than resetting to nothing.
  const campaignIdFromUrl = searchParams?.get('campaignId') ?? '';
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignIdFromUrl);

  const campaignsQuery = useOpsCampaignOverviews(isAdmin);
  const orgTotalsQuery = useOpsCostsSummary(isAdmin);

  const campaigns = useMemo(
    () =>
      [...(campaignsQuery.data ?? [])].sort((left, right) =>
        (left.title ?? '').localeCompare(right.title ?? ''),
      ),
    [campaignsQuery.data],
  );

  const activeCampaignId = selectedCampaignId || campaignIdFromUrl;
  const activeCampaign = campaigns.find(
    (campaign) => campaign.id === activeCampaignId,
  );

  const handleSelect = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('campaignId', campaignId);
    router.replace(`/admin/costs?${params.toString()}`, { scroll: false });
  };

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

  const orgTotal = orgTotalsQuery.data?.totalCost;

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
            What a campaign spent with FireCrawl, SerpAPI, DataForSEO, and the
            model providers — priced per call and per billable unit rather than
            estimated per provider.
          </p>
        </div>
      </div>

      {/* The selector is the page's primary control, so it leads rather than
          sitting under a row of statistics that compete with the campaign's own
          headline figure. */}
      <Card className="border-border bg-card">
        <CardContent className="space-y-2 p-4">
          <Label htmlFor="cost-campaign-select">Campaign</Label>
          {campaignsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading campaigns…</p>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No campaigns are available to inspect.
            </p>
          ) : (
            <Select value={activeCampaignId} onValueChange={handleSelect}>
              <SelectTrigger id="cost-campaign-select">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {activeCampaignId ? (
        <CampaignCostPanel campaignId={activeCampaignId} />
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Select a campaign to see its provider cost, broken down by
              provider, operation, and run.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Org-wide spend is context, not the subject of this page, so it sits
          below the campaign it would otherwise compete with. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>
          Across all campaigns:{' '}
          <span className="font-medium text-foreground tabular-nums">
            {typeof orgTotal === 'number'
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(orgTotal)
              : 'not available'}
          </span>
        </span>
        <span>
          {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
        </span>
        {activeCampaign ? (
          <Link
            href={`/admin/campaigns/${activeCampaign.id}`}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Open {activeCampaign.title} in campaign ops
          </Link>
        ) : null}
      </div>
    </div>
  );
}
