'use client';

import { useParams } from 'next/navigation';
import { ChannelResultsPageV2 } from '@/shared/components/results/ChannelResultsPageV2';

export default function CampaignResultsPage() {
  const params = useParams();
  return <ChannelResultsPageV2 campaignId={params.campaignId as string} />;
}
