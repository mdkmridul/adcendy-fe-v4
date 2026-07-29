'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCampaignLifecycle } from '@/hooks/useCampaignLifecycle';
import { CampaignWorkspaceHeader } from '@/shared/components/campaigns/CampaignWorkspaceHeader';
import { CampaignWorkspaceSidebar } from '@/shared/components/campaigns/CampaignWorkspaceSidebar';
import { useLegacyPerformanceWorkspacesEnabled } from '@/shared/runtime-config/features';

const LEGACY_PERFORMANCE_PATH =
  /\/campaigns\/[^/]+\/(?:weekly|anomalies|tweaks|approvals)(?:\/|$)/;

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const campaignId = params?.campaignId as string;
  const { campaign, stage, isLoading, error } = useCampaignLifecycle(campaignId || null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const legacyPerformanceEnabled =
    useLegacyPerformanceWorkspacesEnabled();
  const legacyPerformanceBlocked =
    LEGACY_PERFORMANCE_PATH.test(pathname) && !legacyPerformanceEnabled;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-28 animate-pulse rounded-lg bg-card" />
      </div>
    );
  }

  if (error || !campaign || !stage) {
    return (
      <div className="space-y-6 p-6">
        <Card className="border-border bg-card p-8 text-center">
          <p className="text-destructive">Failed to load campaign.</p>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/app/campaigns">Back to Campaigns</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-full bg-background">
      {stage !== 'draft' ? (
        <aside className="hidden w-72 shrink-0 border-r border-border lg:block">
          <CampaignWorkspaceSidebar
            campaign={campaign}
            stage={stage}
            pathname={pathname}
            legacyPerformanceEnabled={legacyPerformanceEnabled}
          />
        </aside>
      ) : null}

      <div className="min-w-0 flex-1">
        <CampaignWorkspaceHeader
          campaign={campaign}
          stage={stage}
          pathname={pathname}
          legacyPerformanceEnabled={legacyPerformanceEnabled}
          mobileNavigationTrigger={
            stage !== 'draft' ? (
              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <CampaignWorkspaceSidebar
                    campaign={campaign}
                    stage={stage}
                    pathname={pathname}
                    legacyPerformanceEnabled={legacyPerformanceEnabled}
                    onNavigate={() => setMobileSidebarOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            ) : null
          }
        />

        <div className="px-6 py-6">
          {legacyPerformanceBlocked ? (
            <Card className="border-border bg-card p-8 text-center">
              <h2 className="font-space-grotesk text-xl font-semibold">
                Not included in the first UAT scope
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Weekly, anomaly, tweak, and tweak-approval workspaces remain
                disabled until their legacy Backend contracts are pinned and
                approved for UAT.
              </p>
              <Button asChild className="mt-5">
                <Link href={`/app/campaigns/${campaignId}/overview`}>
                  Return to campaign overview
                </Link>
              </Button>
            </Card>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
