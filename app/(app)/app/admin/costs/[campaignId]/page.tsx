'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { CampaignCostPanel } from '@/shared/components/ops/CampaignCostPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminCampaignCostPage() {
  const params = useParams<{ campaignId: string }>();
  const campaignId = params?.campaignId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (isAuthLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading provider cost…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                Provider cost is only available to administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-3">
        <Link href="/admin/costs">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            All campaigns
          </Button>
        </Link>
      </div>

      <CampaignCostPanel campaignId={campaignId} />

      <div className="border-t border-border pt-4 text-xs text-muted-foreground">
        <Link
          href={`/admin/campaigns/${campaignId}`}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Open this campaign in campaign ops
        </Link>
      </div>
    </div>
  );
}
