'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useCampaignRunWorkspace } from '@/hooks/useCampaignRunWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminCampaignReviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const runWorkspace = useCampaignRunWorkspace(campaignId, isAdmin);

  useEffect(() => {
    if (isLoading || !isAdmin || runWorkspace.isLoading) {
      return;
    }

    if (runWorkspace.runId) {
      router.replace(`/app/admin/runs/${runWorkspace.runId}`);
      return;
    }

    router.replace(`/app/admin/campaigns/${campaignId}`);
  }, [campaignId, isAdmin, isLoading, router, runWorkspace.isLoading, runWorkspace.runId]);

  if (isLoading || runWorkspace.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Resolving admin run workspace...</div>;
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
                Only administrators can access review workspaces.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (runWorkspace.error) {
    return (
      <div className="space-y-4 p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            {runWorkspace.error instanceof Error
              ? runWorkspace.error.message
              : 'Failed to resolve the campaign run workspace.'}
          </CardContent>
        </Card>
        <Link href={`/app/admin/campaigns/${campaignId}`}>
          <Button variant="outline">Back to Campaign Detail</Button>
        </Link>
      </div>
    );
  }

  return <div className="p-6 text-sm text-muted-foreground">Redirecting to admin run workspace...</div>;
}
