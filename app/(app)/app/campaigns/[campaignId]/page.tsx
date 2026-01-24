import { redirect } from 'next/navigation';

export default function CampaignDetailPage({
  params,
}: {
  params: { campaignId: string };
}) {
  redirect(`/app/campaigns/${params.campaignId}/overview`);
}
