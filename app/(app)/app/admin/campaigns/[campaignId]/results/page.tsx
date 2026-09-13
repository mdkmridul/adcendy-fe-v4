'use client';

import { useParams } from 'next/navigation';
import { AdminChannelResultsPageV2 } from '@/shared/components/results/AdminChannelResultsPageV2';

export default function AdminCampaignResultsPage() {
  const params = useParams();
  return <AdminChannelResultsPageV2 campaignId={params.campaignId as string} />;
}
