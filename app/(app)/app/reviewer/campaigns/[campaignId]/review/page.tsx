'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { StrategyReviewWorkspace } from '@/shared/components/reviews/StrategyReviewWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ReviewerCampaignReviewPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading reviewer workspace...</div>;
  }

  if (user?.role !== 'REVIEWER') {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                Only reviewers can access this review workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3 pb-6">
        <Link href="/app/reviewer/strategy-reviews">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Reviewer Inbox
          </Button>
        </Link>
        <div className="space-y-2">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Reviewer Workspace</h1>
          <p className="text-muted-foreground">
            Section-by-section review surface for strategy and execution outputs.
          </p>
        </div>
      </div>

      <StrategyReviewWorkspace campaignId={campaignId} />
    </div>
  );
}
