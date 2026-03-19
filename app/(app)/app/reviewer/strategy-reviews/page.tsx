'use client';

import Link from 'next/link';
import { AlertCircle, Inbox } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useAssignedStrategyReviews } from '@/hooks/useStrategyReviews';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { StrategyReviewInboxItem } from '@/shared/types/reviews';

type ReviewBucket = 'PENDING' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED';

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function toBucket(status: string): ReviewBucket {
  const normalized = status.toUpperCase();
  if (normalized === 'PENDING_REVIEW' || normalized === 'PENDING') return 'PENDING';
  if (normalized.includes('APPROV')) return 'APPROVED';
  if (normalized.includes('CHANGE')) return 'CHANGES_REQUESTED';
  if (normalized.includes('REVIEW')) return 'IN_REVIEW';
  return 'PENDING';
}

function ReviewCards({ items }: { items: StrategyReviewInboxItem[] }) {
  if (items.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-10">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No assigned reviews in this state</EmptyTitle>
              <EmptyDescription>
                New strategy reviews will appear here as soon as they are assigned.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((review) => (
        <Card key={review.campaignId} className="border-border bg-card">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{review.campaignTitle}</h2>
                <ReviewStatusBadge status={review.status} />
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em]">Created</p>
                  <p className="mt-1 text-foreground">{formatDate(review.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em]">Updated</p>
                  <p className="mt-1 text-foreground">{formatDate(review.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em]">Approved at</p>
                  <p className="mt-1 text-foreground">{formatDate(review.approvedAt)}</p>
                </div>
              </div>
              {review.requestedChangesNote && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Requested changes
                  </p>
                  <p className="mt-2 text-foreground">{review.requestedChangesNote}</p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <Link href={`/app/reviewer/campaigns/${review.campaignId}/review`}>
                <Button className="w-full lg:w-auto">Open Review</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ReviewerStrategyReviewsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const reviewsQuery = useAssignedStrategyReviews(user?.role === 'REVIEWER');

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading reviewer inbox...</div>;
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
                This inbox is only available to reviewer users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviewsQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading assigned reviews...</div>;
  }

  if (reviewsQuery.error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-8 text-sm text-destructive">
            {reviewsQuery.error instanceof Error ? reviewsQuery.error.message : 'Failed to load reviewer inbox.'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const reviews = reviewsQuery.data ?? [];
  const buckets: Record<ReviewBucket, StrategyReviewInboxItem[]> = {
    PENDING: reviews.filter((review) => toBucket(review.status) === 'PENDING'),
    IN_REVIEW: reviews.filter((review) => toBucket(review.status) === 'IN_REVIEW'),
    CHANGES_REQUESTED: reviews.filter((review) => toBucket(review.status) === 'CHANGES_REQUESTED'),
    APPROVED: reviews.filter((review) => toBucket(review.status) === 'APPROVED'),
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Reviewer Inbox</h1>
        <p className="text-muted-foreground">
          Track assigned strategy reviews and move directly into section-level decisions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(buckets).map(([key, items]) => (
          <Card key={key} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {key.replace('_', ' ')}
              </p>
              <p className="mt-2 text-2xl font-semibold">{items.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No assigned strategy reviews</EmptyTitle>
                <EmptyDescription>
                  Reviews assigned to you will appear here with their current review state.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="PENDING" className="space-y-4">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="PENDING">Pending Review</TabsTrigger>
            <TabsTrigger value="IN_REVIEW">In Review</TabsTrigger>
            <TabsTrigger value="CHANGES_REQUESTED">Changes Requested</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          </TabsList>
          <TabsContent value="PENDING">
            <ReviewCards items={buckets.PENDING} />
          </TabsContent>
          <TabsContent value="IN_REVIEW">
            <ReviewCards items={buckets.IN_REVIEW} />
          </TabsContent>
          <TabsContent value="CHANGES_REQUESTED">
            <ReviewCards items={buckets.CHANGES_REQUESTED} />
          </TabsContent>
          <TabsContent value="APPROVED">
            <ReviewCards items={buckets.APPROVED} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
