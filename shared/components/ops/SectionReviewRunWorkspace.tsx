'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useApproveOpsSectionReview,
  useOpsSectionReviewWorkspace,
  useRequestOpsSectionRevision,
} from '@/hooks/useOpsV2';
import type { Role } from '@/features/auth/types';
import { ApiError } from '@/shared/api/errors';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import {
  formatCampaignOpsStatus,
  formatOpsDateTime,
  formatOpsStatus,
  toJsonPreview,
} from '@/shared/components/ops/opsUtils';
import {
  getSectionReviewForbiddenMessage,
  inferSectionReviewForbiddenReason,
} from '@/shared/components/ops/reviewAccess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface SectionReviewRunWorkspaceProps {
  runId: string;
  role: Role;
  defaultTab?: 'overview' | 'input-details' | 'strategy';
}

export function SectionReviewRunWorkspace({
  runId,
  role,
  defaultTab = 'overview',
}: SectionReviewRunWorkspaceProps) {
  const { toast } = useToast();
  const workspaceQuery = useOpsSectionReviewWorkspace(runId, Boolean(runId));
  const canReview = role === 'REVIEWER' || role === 'ADMIN';

  const sections = workspaceQuery.data?.sections ?? [];
  const [selectedSectionTaskId, setSelectedSectionTaskId] = useState<string | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [revisionInstruction, setRevisionInstruction] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');

  useEffect(() => {
    if (!sections.length) {
      setSelectedSectionTaskId(null);
      return;
    }

    setSelectedSectionTaskId((current) => {
      if (current && sections.some((section) => section.sectionReviewTaskId === current)) {
        return current;
      }
      return sections[0]?.sectionReviewTaskId ?? null;
    });
  }, [sections]);

  const selectedSection = useMemo(
    () => sections.find((section) => section.sectionReviewTaskId === selectedSectionTaskId) ?? null,
    [sections, selectedSectionTaskId],
  );

  const approveMutation = useApproveOpsSectionReview(selectedSection?.sectionReviewTaskId ?? null);
  const requestRevisionMutation = useRequestOpsSectionRevision(selectedSection?.sectionReviewTaskId ?? null);

  const submitApprove = async () => {
    if (!selectedSection?.sectionReviewTaskId) {
      return;
    }

    try {
      await approveMutation.mutateAsync({
        reviewerNotes: approveNotes.trim() || undefined,
      });

      toast({
        title: 'Section approved',
        description: selectedSection.sectionTitle || selectedSection.sectionId || selectedSection.sectionReviewTaskId,
      });

      setApproveNotes('');
      void workspaceQuery.refetch();
    } catch (error) {
      toast({
        title: 'Approve failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const submitRevision = async () => {
    if (!selectedSection?.sectionReviewTaskId) {
      return;
    }

    if (!revisionInstruction.trim()) {
      toast({
        title: 'Instruction required',
        description: 'Request revision requires a non-empty instruction.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await requestRevisionMutation.mutateAsync({
        instruction: revisionInstruction.trim(),
        reviewerNotes: revisionNotes.trim() || undefined,
      });

      toast({
        title: 'Revision requested',
        description: selectedSection.sectionTitle || selectedSection.sectionId || selectedSection.sectionReviewTaskId,
      });

      setRevisionInstruction('');
      setRevisionNotes('');
      void workspaceQuery.refetch();
    } catch (error) {
      toast({
        title: 'Request revision failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  if (workspaceQuery.isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-5 text-sm text-muted-foreground">Loading review workspace...</CardContent>
      </Card>
    );
  }

  if (workspaceQuery.error) {
    const forbiddenReason = inferSectionReviewForbiddenReason(workspaceQuery.error);
    if (forbiddenReason) {
      const message = getSectionReviewForbiddenMessage(role, forbiddenReason);
      return (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">{message.title}</p>
              <p className="text-sm text-muted-foreground">{message.description}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (workspaceQuery.error instanceof ApiError && workspaceQuery.error.status === 404) {
      return (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Workspace not available for this run yet.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="p-5 text-sm text-destructive">
          {workspaceQuery.error instanceof Error ? workspaceQuery.error.message : 'Failed to load workspace.'}
        </CardContent>
      </Card>
    );
  }

  const workspace = workspaceQuery.data;
  if (!workspace) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{workspace.campaignTitle || workspace.campaignId || workspace.runId}</CardTitle>
          <CardDescription>
            Run: {workspace.runId} {workspace.marketId ? `| Market: ${workspace.marketId}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ReviewStatusBadge status={workspace.status} label={formatOpsStatus(workspace.status)} />
            <ReviewStatusBadge
              status={workspace.campaignStatus}
              label={formatCampaignOpsStatus(workspace.campaignStatus)}
            />
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <p>Reviewer: {workspace.reviewerName || workspace.reviewerEmail || workspace.reviewerId || 'Unassigned'}</p>
            <p>Started: {formatOpsDateTime(workspace.startedAt)}</p>
            <p>Updated: {formatOpsDateTime(workspace.updatedAt)}</p>
            <p>Sections: {sections.length}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="input-details">Input Details</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>
                Review summary for run status, campaign state, and section coverage.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Campaign</p>
                <p className="mt-1 font-medium text-foreground">
                  {workspace.campaignTitle || workspace.campaignId || 'Not available'}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Run</p>
                <p className="mt-1 font-medium text-foreground">{workspace.runId}</p>
              </div>
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Market</p>
                <p className="mt-1 font-medium text-foreground">{workspace.marketId || 'Not available'}</p>
              </div>
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Reviewer</p>
                <p className="mt-1 font-medium text-foreground">
                  {workspace.reviewerName || workspace.reviewerEmail || workspace.reviewerId || 'Unassigned'}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Sections</p>
                <p className="mt-1 font-medium text-foreground">{sections.length}</p>
              </div>
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Last Updated</p>
                <p className="mt-1 font-medium text-foreground">{formatOpsDateTime(workspace.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="input-details">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Input Details</CardTitle>
              <CardDescription>Primary workspace payload from `GET /api/v2/section-reviews/:runId/workspace`.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[520px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                {toJsonPreview(workspace.inputs)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Strategy Sections</CardTitle>
                <CardDescription>Select a section to inspect detail and status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sections available.</p>
                ) : (
                  sections.map((section) => (
                    <button
                      key={section.sectionReviewTaskId}
                      type="button"
                      onClick={() => setSelectedSectionTaskId(section.sectionReviewTaskId)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedSectionTaskId === section.sectionReviewTaskId
                          ? 'border-primary/60 bg-primary/10'
                          : 'border-border bg-background hover:bg-muted/30'
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">
                        {section.sectionTitle || section.sectionId || section.sectionReviewTaskId}
                      </p>
                      <div className="mt-2">
                        <ReviewStatusBadge status={section.status} label={formatOpsStatus(section.status)} />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>{selectedSection?.sectionTitle || selectedSection?.sectionId || 'No section selected'}</CardTitle>
                  <CardDescription>
                    Task ID: {selectedSection?.sectionReviewTaskId || 'Not available'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSection ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <ReviewStatusBadge status={selectedSection.status} label={formatOpsStatus(selectedSection.status)} />
                        <ReviewStatusBadge
                          status={selectedSection.runStatus}
                          label={`Run ${formatOpsStatus(selectedSection.runStatus)}`}
                        />
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <p>Revision Count: {selectedSection.revisionCount ?? 0}</p>
                        <p>Updated: {formatOpsDateTime(selectedSection.updatedAt)}</p>
                        <p>Validation: {formatOpsStatus(selectedSection.generationValidationStatus)}</p>
                        <p>Output Constraint: {formatOpsStatus(selectedSection.outputConstraintOutcome)}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Question</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedSection.renderedQuestion || 'Not available'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Section Content</p>
                        <pre className="max-h-[420px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                          {toJsonPreview(selectedSection.sectionContent)}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a section to inspect details.</p>
                  )}
                </CardContent>
              </Card>

              {canReview && selectedSection ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Review Actions</CardTitle>
                    <CardDescription>Available to reviewer and admin users only.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3 rounded-md border border-border bg-background p-4">
                      <p className="text-sm font-medium text-foreground">Approve Section</p>
                      <div className="space-y-2">
                        <Label htmlFor="workspace-approve-notes">Reviewer Notes (optional)</Label>
                        <Textarea
                          id="workspace-approve-notes"
                          value={approveNotes}
                          onChange={(event) => setApproveNotes(event.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button onClick={() => void submitApprove()} disabled={approveMutation.isPending}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                    </div>

                    <div className="space-y-3 rounded-md border border-border bg-background p-4">
                      <p className="text-sm font-medium text-foreground">Request Revision</p>
                      <div className="space-y-2">
                        <Label htmlFor="workspace-revision-instruction">Instruction *</Label>
                        <Textarea
                          id="workspace-revision-instruction"
                          value={revisionInstruction}
                          onChange={(event) => setRevisionInstruction(event.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workspace-revision-notes">Reviewer Notes</Label>
                        <Textarea
                          id="workspace-revision-notes"
                          value={revisionNotes}
                          onChange={(event) => setRevisionNotes(event.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button onClick={() => void submitRevision()} disabled={requestRevisionMutation.isPending}>
                        {requestRevisionMutation.isPending ? 'Submitting...' : 'Request Revision'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
