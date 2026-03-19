'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

export default function CampaignReviewPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user?.role === 'REVIEWER') {
      router.replace(`/app/reviewer/campaigns/${campaignId}/review`);
      return;
    }

    if (user?.role === 'ADMIN') {
      router.replace(`/admin/campaigns/${campaignId}/review`);
      return;
    }

    router.replace('/app/unauthorized');
  }, [campaignId, isLoading, router, user?.role]);

  return <div className="p-6 text-sm text-muted-foreground">Redirecting...</div>;
}
