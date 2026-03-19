'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Campaign } from '@/shared/types/campaign';
import type { CampaignLifecycleStage } from '@/shared/components/campaigns/campaign-ui';

interface CampaignWorkspaceSidebarProps {
  campaign: Campaign;
  stage: CampaignLifecycleStage;
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}

interface WorkspaceNavItem {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  children?: Array<{
    label: string;
    href: string;
    isActive: (pathname: string) => boolean;
  }>;
}

function buildWorkspaceItems(campaign: Campaign, stage: CampaignLifecycleStage): WorkspaceNavItem[] {
  if (stage === 'draft') {
    return [
      {
        label: 'Setup',
        href: `/app/campaigns/${campaign.id}/setup`,
        isActive: (pathname) => pathname.includes('/setup') && !pathname.includes('/setup/preview'),
        children: [
          {
            label: 'Business Context',
            href: `/app/campaigns/${campaign.id}/setup/step-1`,
            isActive: (pathname) => pathname.includes('/setup/step-1'),
          },
          {
            label: 'Offer',
            href: `/app/campaigns/${campaign.id}/setup/step-2`,
            isActive: (pathname) => pathname.includes('/setup/step-2'),
          },
          {
            label: 'Audience',
            href: `/app/campaigns/${campaign.id}/setup/step-3`,
            isActive: (pathname) => pathname.includes('/setup/step-3'),
          },
        ],
      },
      {
        label: 'Review & Generate',
        href: `/app/campaigns/${campaign.id}/setup/preview`,
        isActive: (pathname) => pathname.includes('/setup/preview'),
      },
      {
        label: 'Files',
        href: `/app/campaigns/${campaign.id}/files`,
        isActive: (pathname) => pathname.includes('/files'),
      },
      {
        label: 'Settings',
        href: `/app/campaigns/${campaign.id}/settings`,
        isActive: (pathname) => pathname.includes('/settings'),
      },
    ];
  }

  if (stage === 'waiting') {
    return [
      {
        label: 'Overview',
        href: `/app/campaigns/${campaign.id}/overview`,
        isActive: (pathname) => pathname.includes('/overview'),
      },
      {
        label: 'Inputs',
        href: `/app/campaigns/${campaign.id}/inputs`,
        isActive: (pathname) => pathname.includes('/inputs'),
      },
      {
        label: 'Files',
        href: `/app/campaigns/${campaign.id}/files`,
        isActive: (pathname) => pathname.includes('/files'),
      },
      {
        label: 'Settings',
        href: `/app/campaigns/${campaign.id}/settings`,
        isActive: (pathname) => pathname.includes('/settings'),
      },
    ];
  }

  return [
    {
      label: 'Overview',
      href: `/app/campaigns/${campaign.id}/overview`,
      isActive: (pathname) => pathname.includes('/overview'),
    },
    {
      label: 'Strategy',
      href: `/app/campaigns/${campaign.id}/strategy`,
      isActive: (pathname) => pathname.includes('/strategy'),
    },
    {
      label: 'Weekly',
      href: `/app/campaigns/${campaign.id}/weekly`,
      isActive: (pathname) =>
        pathname.includes('/weekly') || pathname.includes('/anomalies') || pathname.includes('/tweaks'),
    },
    {
      label: 'Intelligence',
      href: `/app/campaigns/${campaign.id}/intelligence`,
      isActive: (pathname) => pathname.includes('/intelligence'),
    },
    {
      label: 'Files',
      href: `/app/campaigns/${campaign.id}/files`,
      isActive: (pathname) => pathname.includes('/files'),
    },
    {
      label: 'Settings',
      href: `/app/campaigns/${campaign.id}/settings`,
      isActive: (pathname) => pathname.includes('/settings'),
    },
  ];
}

export function CampaignWorkspaceSidebar({
  campaign,
  stage,
  pathname,
  className,
  onNavigate,
}: CampaignWorkspaceSidebarProps) {
  const items = buildWorkspaceItems(campaign, stage);

  return (
    <div className={cn('flex h-full flex-col bg-card', className)}>
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Campaign Sections
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const itemActive = item.isActive(pathname);

          return (
            <div key={item.href} className="space-y-1">
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  itemActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {item.label}
              </Link>

              {item.children ? (
                <div className="space-y-1 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                        child.isActive(pathname)
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
