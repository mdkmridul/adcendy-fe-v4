'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { formatDistanceToNow } from 'date-fns';
import { CreateCampaignModal } from '@/shared/components/campaigns/CreateCampaignModal';
import { useLastCampaign } from '@/hooks/useLastCampaign';
import { useSearchParams } from 'next/navigation';
import Loading from './loading';

export default function CampaignsPage() {
  const { campaigns, isLoading, error } = useCampaigns();
  const { setLastCampaignId } = useLastCampaign();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const query = searchQuery.toLowerCase();
    return campaigns.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.niche.toLowerCase().includes(query)
    );
  }, [campaigns, searchQuery]);

  const handleCampaignClick = (campaignId: string) => {
    setLastCampaignId(campaignId);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive">Failed to load campaigns: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage your market intelligence campaigns</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {campaigns.length > 0 && (
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by name, city, or niche..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 bg-card animate-pulse h-24" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center bg-card border border-border relative overflow-hidden">
          {/* Subtle intelligence presence cue */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
          
          <div className="relative">
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              <span>Intelligence system ready</span>
            </div>

            {/* Main message */}
            <h2 className="font-space-grotesk text-xl font-semibold text-foreground mb-2">
              No market intelligence campaigns yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create a campaign to start tracking competitor signals, market patterns, and weekly strategic insights.
            </p>

            {/* What happens next - inline steps */}
            <div className="flex items-center justify-center gap-8 mb-8 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <div className="w-5 h-5 rounded-full border border-border/50 flex items-center justify-center text-[10px] font-medium">1</div>
                <span>Collect signals</span>
              </div>
              <div className="w-4 h-[1px] bg-border/50" />
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <div className="w-5 h-5 rounded-full border border-border/50 flex items-center justify-center text-[10px] font-medium">2</div>
                <span>Analyze patterns</span>
              </div>
              <div className="w-4 h-[1px] bg-border/50" />
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <div className="w-5 h-5 rounded-full border border-border/50 flex items-center justify-center text-[10px] font-medium">3</div>
                <span>Generate strategy</span>
              </div>
            </div>

            {/* Elevated CTA */}
            <div className="space-y-2">
              <Button 
                onClick={() => setCreateModalOpen(true)} 
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create First Campaign
              </Button>
              <p className="text-xs text-muted-foreground/50">Takes ~3 minutes</p>
            </div>
          </div>
        </Card>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="p-8 text-center bg-card border border-border">
          <p className="text-muted-foreground">No campaigns match your search.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/app/campaigns/${campaign.id}/overview`}
              onClick={() => handleCampaignClick(campaign.id)}
            >
              <Card className="p-6 hover:border-primary transition-colors cursor-pointer border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-space-grotesk text-lg font-semibold text-foreground">
                        {campaign.name}
                      </h2>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="text-muted-foreground">{campaign.city}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{campaign.niche}</span>
                    </div>
                    {campaign.website && (
                      <p className="text-xs text-muted-foreground">{campaign.website}</p>
                    )}
                    <div className="text-xs text-muted-foreground pt-2">
                      Updated {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateCampaignModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
