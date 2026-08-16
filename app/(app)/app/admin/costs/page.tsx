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

function formatUsd(value?: number | null) {
  if (typeof value !== 'number') {
    return 'Not available';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function AdminCostsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const router = useRouter();
  const searchParams = useSearchParams();
  // The selected campaign lives in the URL so a cost view can be linked to
  // and survives a reload, rather than resetting to nothing.
  const campaignIdFromUrl = searchParams?.get('campaignId') ?? '';
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignIdFromUrl);

  const campaignsQuery = useOpsCampaignOverviews(isAdmin);
  const totalsQuery = useOpsCostsSummary(isAdmin);

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
        Loading cost dashboard...
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

  return (
    <div className="space-y-6 p-6">
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
            What each campaign has spent with FireCrawl, SerpAPI, DataForSEO,
            and the model providers, measured per call rather than estimated
            per provider.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              All campaigns, total
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {formatUsd(totalsQuery.data?.totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              All campaigns, calls
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {totalsQuery.data?.totalCalls?.toLocaleString() ?? 'Not available'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Campaigns
            </p>
            <p className="mt-2 text-3xl font-semibold">{campaigns.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="space-y-2 p-4">
          <Label htmlFor="cost-campaign-select">Campaign</Label>
          {campaignsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No campaigns are available to inspect.
            </p>
          ) : (
            <Select value={activeCampaignId} onValueChange={handleSelect}>
              <SelectTrigger id="cost-campaign-select" className="max-w-xl">
                <SelectValue placeholder="Select a campaign to see its provider cost" />
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
          {activeCampaign ? (
            <p className="text-xs text-muted-foreground">
              Showing{' '}
              <Link
                href={`/admin/campaigns/${activeCampaign.id}`}
                className="underline underline-offset-2"
              >
                {activeCampaign.title}
              </Link>
              . Cost is attributed to the campaign that made the provider calls.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {activeCampaignId ? (
        <CampaignCostPanel campaignId={activeCampaignId} />
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Select a campaign above to see its provider cost, broken down by
            provider, operation, and run.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
