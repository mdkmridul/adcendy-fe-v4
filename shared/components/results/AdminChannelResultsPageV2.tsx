'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/useAuth';
import { useAdminCampaignDetail } from '@/hooks/useAdminReview';
import { useOpsCampaignOverviews } from '@/hooks/useOpsV2';
import { ChannelResultsViewV2 } from '@/shared/components/results/ChannelResultsPageV2';
import { adminResultsCampaignV2 } from '@/shared/components/results/channelResultsV2';

/**
 * An admin's Results page for any campaign: the page a client sees, with the
 * campaign loaded through the admin campaign detail. The client workspace
 * under /app/campaigns is for campaign owners only, so admins could not reach
 * a campaign's results there.
 */
export function AdminChannelResultsPageV2({ campaignId }: { campaignId: string }) {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const detailQuery = useAdminCampaignDetail(campaignId, isAdmin, { refetchOnMount: 'always' });
  // The detail does not carry the campaign's markets; the overview does.
  const overviewsQuery = useOpsCampaignOverviews(isAdmin);
  const overview = overviewsQuery.data?.find((entry) => entry.id === campaignId) ?? null;
  const campaign = adminResultsCampaignV2(detailQuery.data, overview);
  const detailHref = `/admin/campaigns/${campaignId}`;

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading campaign results...</div>;
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
                Only administrators can open another client&apos;s results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Admin
        </Link>
        <span>/</span>
        <Link href="/admin/campaigns" className="hover:text-foreground">
          Campaigns
        </Link>
        <span>/</span>
        <Link href={detailHref} className="hover:text-foreground">
          {campaign?.title ?? campaignId}
        </Link>
        <span>/</span>
        <span>Results</span>
      </div>
      <ChannelResultsViewV2
        campaignId={campaignId}
        campaign={campaign}
        // Wait for the markets too: the entry form takes its default market once.
        isCampaignLoading={detailQuery.isLoading || overviewsQuery.isLoading}
        campaignError={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : detailQuery.error
              ? 'Failed to load campaign.'
              : null
        }
        audience="admin"
        backHref={detailHref}
      />
    </div>
  );
}
