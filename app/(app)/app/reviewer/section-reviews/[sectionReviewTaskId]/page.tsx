'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  useAnalyzeOpsSectionRevisionImpact,
  useApproveOpsSectionReview,
  useConfirmOpsSectionRevisionImpact,
  useOpsSectionReviewTask,
  useRequestOpsSectionRevision,
} from '@/hooks/useOpsV2';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import {
  formatCampaignOpsStatus,
  formatOpsDateTime,
  formatOpsStatus,
  formatOpsStep,
  toJsonPreview,
} from '@/shared/components/ops/opsUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function SectionReviewDetailPage() {
  const params = useParams();
  const sectionReviewTaskId = params?.sectionReviewTaskId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const isOpsRole = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  const detailQuery = useOpsSectionReviewTask(sectionReviewTaskId, isOpsRole);
  const approveMutation = useApproveOpsSectionReview(sectionReviewTaskId);
  const requestRevisionMutation = useRequestOpsSectionRevision(sectionReviewTaskId);
  const analyzeImpactMutation = useAnalyzeOpsSectionRevisionImpact(sectionReviewTaskId);

  const [reviewerId, setReviewerId] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [instruction, setInstruction] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [fixtureKey, setFixtureKey] = useState('');
  const [forceMode, setForceMode] = useState<'live' | 'fixture'>('live');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<unknown>(null);
  const confirmImpactMutation = useConfirmOpsSectionRevisionImpact(analysisId);

  useEffect(() => {
    if (user?.id) {
      setReviewerId(user.id);
    }
  }, [user?.id]);

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading section review detail...</div>;
  }

  if (!isOpsRole) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                This workspace is available to reviewer and admin users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const detail = detailQuery.data;

  const approveTask = async () => {
    try {
      await approveMutation.mutateAsync({
        reviewerId: reviewerId.trim() || undefined,
        reviewerNotes: approveNotes.trim() || undefined,
      });

      toast({
        title: 'Section approved',
        description: `sectionReviewTaskId=${sectionReviewTaskId} reviewerId=${reviewerId || 'none'} action=approve`,
      });

      setApproveNotes('');
      void detailQuery.refetch();
    } catch (error) {
      toast({
        title: 'Approve failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const requestRevision = async () => {
    if (!instruction.trim()) {
      toast({
        title: 'Instruction required',
        description: 'Request revision requires a non-empty instruction.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'User context missing',
        description: 'Unable to determine requestedByUserId.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await requestRevisionMutation.mutateAsync({
        requestedByUserId: user.id,
        instruction: instruction.trim(),
        reviewerNotes: revisionNotes.trim() || undefined,
        fixtureKey: fixtureKey.trim() || undefined,
        forceMode,
      });

      toast({
        title: 'Revision requested',
        description: `sectionReviewTaskId=${sectionReviewTaskId} requestedByUserId=${user.id} action=request-revision`,
      });

      setInstruction('');
      setRevisionNotes('');
      setFixtureKey('');
      void detailQuery.refetch();
    } catch (error) {
      toast({
        title: 'Request revision failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const analyzeImpact = async () => {
    if (!instruction.trim()) {
      toast({
        title: 'Instruction required',
        description: 'Analyze impact requires a non-empty instruction.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'User context missing',
        description: 'Unable to determine requestedByUserId.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await analyzeImpactMutation.mutateAsync({
        requestedByUserId: user.id,
        instruction: instruction.trim(),
        reviewerNotes: revisionNotes.trim() || undefined,
        fixtureKey: fixtureKey.trim() || undefined,
        forceMode,
      });
      const nextAnalysisId =
        typeof result.analysisId === 'string'
          ? result.analysisId
          : typeof result.id === 'string'
            ? result.id
            : null;
      setAnalysisId(nextAnalysisId);
      setAnalysisResult(result);
      toast({
        title: 'Impact analyzed',
        description: nextAnalysisId
          ? `analysisId=${nextAnalysisId}`
          : 'Impact analysis completed.',
      });
    } catch (error) {
      toast({
        title: 'Analyze impact failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const confirmImpactDecision = async (decision: 'confirm_apply' | 'cancel') => {
    if (!analysisId) {
      toast({
        title: 'Analysis required',
        description: 'Run Analyze Impact before confirming a decision.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await confirmImpactMutation.mutateAsync({ decision });
      setAnalysisResult(result);
      toast({
        title: decision === 'confirm_apply' ? 'Selected revisions applied' : 'Impact plan cancelled',
        description: `analysisId=${analysisId}`,
      });
      if (decision === 'confirm_apply') {
        void detailQuery.refetch();
      }
    } catch (error) {
      toast({
        title: 'Impact decision failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Link href="/app/reviewer/section-reviews">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Section Inbox
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Section Review Detail</h1>
          <p className="text-muted-foreground">
            Approve section output or request focused revision to unblock the approval gate.
          </p>
        </div>
      </div>

      {detailQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">Loading detail...</CardContent>
        </Card>
      ) : detailQuery.error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5 text-sm text-destructive">
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load section review detail.'}
          </CardContent>
        </Card>
      ) : !detail ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">Section review task not found.</CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{detail.sectionTitle || detail.sectionId || `Section Task ${detail.id}`}</CardTitle>
              <CardDescription>
                Task ID: {detail.id} | Run: {detail.pipelineRunId || 'Not available'} | Campaign:{' '}
                {detail.campaignTitle || detail.campaignId || 'Not available'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ReviewStatusBadge status={detail.status} label={formatOpsStatus(detail.status)} />
                <ReviewStatusBadge status={detail.runStatus} label={`Run ${formatOpsStatus(detail.runStatus)}`} />
                <ReviewStatusBadge
                  status={detail.campaignStatus}
                  label={formatCampaignOpsStatus(detail.campaignStatus)}
                />
                <ReviewStatusBadge
                  status={String(detail.currentStep ?? 'UNKNOWN')}
                  label={formatOpsStep(detail.currentStep)}
                />
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>Updated: {formatOpsDateTime(detail.updatedAt)}</p>
                <p>Revision Count: {typeof detail.revisionCount === 'number' ? detail.revisionCount : 0}</p>
                <p>Validation: {formatOpsStatus(detail.generationValidationStatus)}</p>
                <p>Output Constraint: {formatOpsStatus(detail.outputConstraintOutcome)}</p>
                <p>Redundancy Outcome: {formatOpsStatus(detail.redundancyOutcome)}</p>
              </div>

              {detail.pipelineRunId && (
                <Link href={`/app/reviewer/runs/${detail.pipelineRunId}`}>
                  <Button size="sm" variant="outline">
                    Open Run Context
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Section Content</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[420px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                  {toJsonPreview(detail.sectionContent)}
                </pre>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Question + Schema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground">{detail.renderedQuestion || 'Not available'}</p>
                <pre className="max-h-[320px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                  {toJsonPreview(detail.answerSchema)}
                </pre>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Approval Gate</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <p>Selected Sections: {detail.approvalGate?.selectedSectionCount ?? 'Not available'}</p>
              <p>Approved Sections: {detail.approvalGate?.approvedSectionCount ?? 'Not available'}</p>
              <p>
                Output Assembly Blocked:{' '}
                {typeof detail.approvalGate?.outputAssemblyBlocked === 'boolean'
                  ? detail.approvalGate.outputAssemblyBlocked
                    ? 'Yes'
                    : 'No'
                  : 'Not available'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Revision Requests Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(detail.revisionRequests ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No revision requests yet.</p>
              ) : (
                (detail.revisionRequests ?? []).map((revision) => (
                  <div key={revision.id} className="rounded-md border border-border bg-background p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ReviewStatusBadge status={revision.status} label={formatOpsStatus(revision.status)} />
                      <p className="text-xs text-muted-foreground">Request ID: {revision.id}</p>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{revision.instruction}</p>
                    {revision.reviewerNotes && (
                      <p className="mt-1 text-sm text-muted-foreground">Notes: {revision.reviewerNotes}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">Updated: {formatOpsDateTime(revision.updatedAt)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Approve directly or request targeted revisions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 rounded-md border border-border bg-background p-4">
                <p className="text-sm font-medium text-foreground">Approve Section</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="approve-reviewer-id">Reviewer ID (optional)</Label>
                    <Input
                      id="approve-reviewer-id"
                      value={reviewerId}
                      onChange={(event) => setReviewerId(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approve-notes">Reviewer Notes (optional)</Label>
                    <Input
                      id="approve-notes"
                      value={approveNotes}
                      onChange={(event) => setApproveNotes(event.target.value)}
                      placeholder="approval notes"
                    />
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button onClick={() => void approveTask()} disabled={approveMutation.isPending}>
                        {approveMutation.isPending ? 'Approving...' : 'Approve Section'}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    Approve this section for final output. All required sections must be approved.
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-3 rounded-md border border-border bg-background p-4">
                <p className="text-sm font-medium text-foreground">Request Revision</p>
                <div className="space-y-2">
                  <Label htmlFor="revision-instruction">Instruction *</Label>
                  <Textarea
                    id="revision-instruction"
                    value={instruction}
                    onChange={(event) => setInstruction(event.target.value)}
                    placeholder="Explain what must change in this section."
                    rows={4}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="revision-notes">Reviewer Notes</Label>
                    <Input
                      id="revision-notes"
                      value={revisionNotes}
                      onChange={(event) => setRevisionNotes(event.target.value)}
                      placeholder="optional notes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fixture-key">Fixture Key</Label>
                    <Input
                      id="fixture-key"
                      value={fixtureKey}
                      onChange={(event) => setFixtureKey(event.target.value)}
                      placeholder="optional fixture key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="force-mode">Force Mode</Label>
                    <Select value={forceMode} onValueChange={(value) => setForceMode(value as 'live' | 'fixture')}>
                      <SelectTrigger id="force-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">live</SelectItem>
                        <SelectItem value="fixture">fixture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button onClick={() => void requestRevision()} disabled={requestRevisionMutation.isPending}>
                          {requestRevisionMutation.isPending ? 'Submitting...' : 'Request Revision'}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="max-w-[320px]">
                      Send change instructions and regenerate this section for another review pass.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          onClick={() => void analyzeImpact()}
                          disabled={analyzeImpactMutation.isPending}
                        >
                          {analyzeImpactMutation.isPending ? 'Analyzing...' : 'Analyze Impact'}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="max-w-[320px]">
                      Check which other sections may need updates before applying changes.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          onClick={() => void confirmImpactDecision('confirm_apply')}
                          disabled={confirmImpactMutation.isPending || !analysisId}
                        >
                          {confirmImpactMutation.isPending ? 'Applying...' : 'Apply Selected Revisions'}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="max-w-[320px]">
                      Apply the source revision and regenerate selected impacted sections.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          onClick={() => void confirmImpactDecision('cancel')}
                          disabled={confirmImpactMutation.isPending || !analysisId}
                        >
                          {confirmImpactMutation.isPending ? 'Cancelling...' : 'Cancel Impact Plan'}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="max-w-[320px]">
                      Discard this impact analysis without changing any section.
                    </TooltipContent>
                  </Tooltip>
                </div>
                {analysisResult ? (
                  <pre className="max-h-[240px] overflow-auto rounded-md border border-border bg-card p-3 text-xs text-foreground">
                    {toJsonPreview(analysisResult)}
                  </pre>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
