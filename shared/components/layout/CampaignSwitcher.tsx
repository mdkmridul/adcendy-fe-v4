'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useLastCampaign } from '@/hooks/useLastCampaign';
import { cn } from '@/lib/utils';

export function CampaignSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { campaigns, isLoading } = useCampaigns();
  const { setLastCampaignId } = useLastCampaign();

  const campaignId = params?.campaignId as string;
  const currentCampaign = campaigns.find(c => c.id === campaignId);

  const handleSelectCampaign = (selectedId: string) => {
    setLastCampaignId(selectedId);

    // Extract the current section from pathname
    // e.g., /app/campaigns/id123/overview -> overview
    const pathParts = pathname.split('/');
    const sectionIndex = pathParts.indexOf(campaignId) + 1;
    const section = sectionIndex < pathParts.length ? pathParts[sectionIndex] : 'overview';

    // Navigate to the same section under new campaign
    router.push(`/app/campaigns/${selectedId}/${section}`);
  };

  if (!campaignId || isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2 bg-transparent">
        <span className="truncate max-w-[150px]">Loading...</span>
        <ChevronDown className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2',
            !currentCampaign && 'text-muted-foreground'
          )}
        >
          <span className="truncate max-w-[150px] text-left">
            {currentCampaign?.name || 'Select campaign'}
          </span>
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {campaigns.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No campaigns available
          </div>
        ) : (
          campaigns.map(campaign => (
            <DropdownMenuItem
              key={campaign.id}
              onClick={() => handleSelectCampaign(campaign.id)}
              className={cn(
                'cursor-pointer',
                campaign.id === campaignId && 'bg-accent'
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{campaign.name}</span>
                <span className="text-xs text-muted-foreground">
                  {campaign.city} • {campaign.niche}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
