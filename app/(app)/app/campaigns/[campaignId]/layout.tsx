'use client';

import React from "react"

import { useCampaign } from '@/hooks/useCampaigns';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/useAuth';
import type { Role } from '@/features/auth/types';

interface TabConfig {
  id: string;
  label: string;
  href: (campaignId: string) => string;
  requiredRole?: Role; // If set, only users with this role or higher can see this tab
}

const ALL_TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', href: (campaignId: string) => `/app/campaigns/${campaignId}/overview` },
  { id: 'setup', label: 'Setup', href: (campaignId: string) => `/app/campaigns/${campaignId}/setup` },
  { id: 'strategy', label: 'Strategy', href: (campaignId: string) => `/app/campaigns/${campaignId}/strategy` },
  { id: 'weekly', label: 'Weekly', href: (campaignId: string) => `/app/campaigns/${campaignId}/weekly` },
  { id: 'anomalies', label: 'Anomalies', href: (campaignId: string) => `/app/campaigns/${campaignId}/anomalies` },
  { id: 'tweaks', label: 'Tweaks', href: (campaignId: string) => `/app/campaigns/${campaignId}/tweaks` },
  { id: 'approvals', label: 'Approvals', href: (campaignId: string) => `/app/campaigns/${campaignId}/approvals`, requiredRole: 'REVIEWER' },
  { id: 'intelligence', label: 'Intelligence', href: (campaignId: string) => `/app/campaigns/${campaignId}/intelligence` },
  { id: 'settings', label: 'Settings', href: (campaignId: string) => `/app/campaigns/${campaignId}/settings` },
];

const ROLE_HIERARCHY: Record<Role, number> = {
  'CLIENT': 1,
  'REVIEWER': 2,
  'ADMIN': 3,
};

function hasRoleAtLeast(userRole: Role | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const campaignId = params?.campaignId as string;
  const { campaign, isLoading, error } = useCampaign(campaignId || null);
  const { user } = useAuth();

  // Filter tabs based on user role and campaign status
  const TABS = React.useMemo(() => {
    const filteredByRole = ALL_TABS.filter(tab => {
      if (!tab.requiredRole) return true;
      return hasRoleAtLeast(user?.role, tab.requiredRole);
    });

    // If campaign is DRAFT (setup in progress), only show setup tab
    if (campaign?.status === 'DRAFT') {
      return filteredByRole.filter(tab => tab.id === 'setup');
    }

    // For ACTIVE campaigns, show all tabs except setup
    return filteredByRole.filter(tab => tab.id !== 'setup');
  }, [user?.role, campaign?.status]);

  // Determine current tab from pathname
  const currentTabId = TABS.find(tab => pathname.includes(`/${tab.id}`))?.id || 'overview';

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-24 bg-card animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-6 space-y-6">
        <Link href="/app/campaigns">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </Link>
        <Card className="p-8 text-center bg-card">
          <p className="text-destructive">Failed to load campaign</p>
          <Link href="/app/campaigns" className="mt-4 inline-block">
            <Button variant="outline">Back to Campaigns</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-card border-b border-border">
        <div className="p-6 space-y-4">
          <Link href="/app/campaigns">
            <Button variant="ghost" className="gap-2 -ml-3">
              <ChevronLeft className="w-4 h-4" />
              Back to Campaigns
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="font-space-grotesk text-3xl font-bold text-foreground">{campaign.name}</h1>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>{campaign.city}</span>
              <span>•</span>
              <span>{campaign.niche}</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 flex gap-1 border-t border-border overflow-x-auto">
          {TABS.map(tab => (
            <Link key={tab.id} href={tab.href(campaignId)}>
              <button
                className={cn(
                  'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  currentTabId === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
