import type { Metadata } from 'next';
import { CampaignFileHub } from '@/shared/components/campaigns/CampaignFileHub';

export const metadata: Metadata = {
  title: 'File Hub | AdCendy',
};

export default function CampaignFilesPage() {
  return <CampaignFileHub />;
}
