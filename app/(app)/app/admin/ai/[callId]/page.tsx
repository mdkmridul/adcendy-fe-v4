'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useAdminAiCallDetail } from '@/hooks/useAdminReview';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    second: '2-digit',
  }).format(new Date(value));
}

function formatValue(value: unknown) {
  if (value == null) {
    return 'Not available';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return 'Not available';
}

export default function AdminAiCallDetailPage() {
  const params = useParams();
  const callId = params?.callId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const detailQuery = useAdminAiCallDetail(callId, user?.role === 'ADMIN');

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading AI call detail...</div>;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                Only administrators can inspect AI call details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading AI call detail...</div>;
  }

  if (detailQuery.error || !detailQuery.data) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-8 text-sm text-destructive">
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load AI call detail.'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const call = detailQuery.data;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Link href="/admin/ai">
          <Button variant="ghost" className="-ml-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Monitoring
          </Button>
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="font-space-grotesk text-3xl font-bold text-foreground">{call.model}</h1>
            <p className="text-muted-foreground">Detailed call record for `{call.id}`.</p>
          </div>
          <ReviewStatusBadge status={call.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Provider</p>
            <p className="mt-2 font-medium">{formatValue(call.provider)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Operation</p>
            <p className="mt-2 font-medium">{call.operation}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Started</p>
            <p className="mt-2 font-medium">{formatDate(call.startedAt)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Finished</p>
            <p className="mt-2 font-medium">{formatDate(call.finishedAt as string | null | undefined)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Call Metadata</CardTitle>
          <CardDescription>Raw backend fields from `GET /v1/admin/ai/calls/:id`.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Request ID</p>
            <p className="mt-2 font-medium">{formatValue(call.requestId)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Job Run ID</p>
            <p className="mt-2 font-medium">{formatValue(call.jobRunId)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Campaign ID</p>
            <p className="mt-2 font-medium">{formatValue(call.campaignId)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Entity</p>
            <p className="mt-2 font-medium">
              {formatValue(call.entityType)} / {formatValue(call.entityId)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total tokens</p>
            <p className="mt-2 font-medium">{formatValue(call.totalTokens)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latency (ms)</p>
            <p className="mt-2 font-medium">{formatValue(call.latencyMs)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Cost</p>
            <p className="mt-2 font-medium">{formatValue(call.cost)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Error</p>
            <p className="mt-2 text-sm text-foreground">{formatValue(call.errorMessage)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Meta JSON</CardTitle>
          <CardDescription>Opaque backend payload for debugging.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs text-foreground">
            {JSON.stringify(call.metaJson ?? {}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
