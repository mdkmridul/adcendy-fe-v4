'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileStack,
  LockKeyhole,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';
import {
  useFinalizeStrategyReview,
  useStartStrategyReview,
  useStrategyReview,
  useUpdateStrategyReviewSection,
} from '@/hooks/useStrategyReviews';
import { StrategyContentRenderer } from '@/shared/components/strategy/StrategyContentRenderer';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { StrategyReviewDetail, StrategyReviewSection } from '@/shared/types/reviews';
import { humanizeReviewValue } from '@/shared/types/reviews';

interface SectionDraft {
  note: string;
}

function formatDateTime(value?: string | null): string {
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

function summarizeSections(review: StrategyReviewDetail) {
  return review.sections.reduce<Record<string, number>>((accumulator, section) => {
    const key = (section.decision ?? section.status ?? 'PENDING').toUpperCase();
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function isRegenerationPending(review: StrategyReviewDetail) {
  const reviewStatus = review.status.toUpperCase();
  if (reviewStatus.includes('QUEUE') || reviewStatus.includes('RUN') || reviewStatus.includes('REGENER')) {
    return true;
  }

  return review.deliverables.some((deliverable) => {
    const status = deliverable.status.toUpperCase();
    return status.includes('QUEUE') || status.includes('RUN') || status.includes('REGENER');
  });
}

function fallbackSectionTitle(section: StrategyReviewSection) {
  return section.title ?? humanizeReviewValue(section.callType);
}

function isPendingReviewStatus(status?: string | null) {
  const normalized = (status ?? '').toUpperCase();
  return normalized === 'PENDING_REVIEW' || normalized === 'PENDING';
}

function SectionNavigator({
  sections,
  selectedCallType,
  maxUnlockedIndex,
  visitedCallTypes,
  onSelect,
}: {
  sections: StrategyReviewSection[];
  selectedCallType: string | null;
  maxUnlockedIndex: number;
  visitedCallTypes: string[];
  onSelect: (callType: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-1 border-b border-border/70 px-5 py-4">
        <p className="font-space-grotesk text-lg font-semibold text-foreground">Sections</p>
        <p className="text-sm text-muted-foreground">Jump directly into any reviewable section.</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {sections.map((section, index) => {
            const isActive = section.callType === selectedCallType;
            const isLocked = index > maxUnlockedIndex;
            return (
              <button
                key={section.callType}
                type="button"
                onClick={() => {
                  if (!isLocked) {
                    onSelect(section.callType);
                  }
                }}
                disabled={isLocked}
                className={cn(
                  'w-full rounded-2xl border px-4 py-4 text-left transition-colors disabled:cursor-not-allowed',
                  isActive
                    ? 'border-primary/60 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm'
                    : isLocked
                      ? 'border-border/60 bg-muted/20 opacity-65'
                      : 'border-border bg-background hover:bg-muted/30',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-space-grotesk text-base font-semibold text-foreground">
                      {fallbackSectionTitle(section)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {index + 1}
                      </span>
                      {visitedCallTypes.includes(section.callType) && (
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
                          Reviewed
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <ReviewStatusBadge status={section.decision ?? section.status} className="shrink-0" />
                </div>
                {section.note && (
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{section.note}</p>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export function StrategyReviewWorkspace({ campaignId }: { campaignId: string }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const reviewQuery = useStrategyReview(campaignId);
  const startMutation = useStartStrategyReview(campaignId);
  const updateSectionMutation = useUpdateStrategyReviewSection(campaignId);
  const finalizeMutation = useFinalizeStrategyReview(campaignId);
  const review = reviewQuery.data;

  const [selectedCallType, setSelectedCallType] = useState<string | null>(null);
  const [visitedCallTypes, setVisitedCallTypes] = useState<string[]>([]);
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, SectionDraft>>({});
  const [summaryNote, setSummaryNote] = useState('');
  const [requestedChangesNote, setRequestedChangesNote] = useState('');

  useEffect(() => {
    if (!review?.sections.length) {
      setSelectedCallType(null);
      return;
    }

    setSelectedCallType((current) => {
      if (current && review.sections.some((section) => section.callType === current)) {
        return current;
      }

      return review.sections[0].callType;
    });
  }, [review?.sections]);

  useEffect(() => {
    if (!review?.sections.length) {
      setVisitedCallTypes([]);
      return;
    }

    setVisitedCallTypes((current) => {
      const valid = new Set(review.sections.map((section) => section.callType));
      const next = current.filter((callType) => valid.has(callType));
      const active = selectedCallType ?? review.sections[0]?.callType ?? null;

      if (active && !next.includes(active)) {
        next.push(active);
      }

      return next;
    });
  }, [review?.sections, selectedCallType]);

  useEffect(() => {
    if (!review) {
      return;
    }

    setSummaryNote(review.summaryNote ?? '');
    setRequestedChangesNote(review.requestedChangesNote ?? '');
    setSectionDrafts((current) => {
      const next = { ...current };

      review.sections.forEach((section) => {
        next[section.callType] = {
          note: current[section.callType]?.note ?? section.note ?? '',
        };
      });

      return next;
    });
  }, [review]);

  const selectedSection = useMemo(
    () => review?.sections.find((section) => section.callType === selectedCallType) ?? null,
    [review?.sections, selectedCallType],
  );

  const selectedDraft = selectedSection
    ? sectionDrafts[selectedSection.callType] ?? {
        note: selectedSection.note ?? '',
      }
    : { note: '' };

  const sectionSummary = review ? summarizeSections(review) : {};
  const unresolvedSections =
    review?.sections.filter((section) => !section.decision || section.decision === 'PENDING').length ?? 0;
  const approvedSections =
    review?.sections.filter((section) => section.decision?.toUpperCase() === 'APPROVED').length ?? 0;
  const selectedSectionIndex = selectedSection
    ? review?.sections.findIndex((section) => section.callType === selectedSection.callType) ?? -1
    : -1;
  const totalSections = review?.sections.length ?? 0;
  const allSectionsApproved = totalSections > 0 && approvedSections === totalSections;
  const isLastSection = selectedSectionIndex >= 0 && selectedSectionIndex === totalSections - 1;
  const firstPendingSectionIndex =
    review?.sections.findIndex((section) => !section.decision || section.decision === 'PENDING') ?? -1;
  const maxUnlockedIndex =
    firstPendingSectionIndex === -1 ? Math.max(totalSections - 1, 0) : firstPendingSectionIndex;
  const canFinalize = isLastSection && allSectionsApproved;
  const reviewBusy =
    startMutation.isPending || updateSectionMutation.isPending || finalizeMutation.isPending;

  const updateDraft = (callType: string, patch: Partial<SectionDraft>) => {
    setSectionDrafts((current) => ({
      ...current,
      [callType]: {
        note: current[callType]?.note ?? '',
        ...patch,
      },
    }));
  };

  const handleStartReview = async () => {
    try {
      await startMutation.mutateAsync();
      toast({
        title: 'Review started',
        description: 'The campaign is now in section-by-section review.',
      });
    } catch (error) {
      toast({
        title: 'Unable to start review',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSectionDecision = async (decision: 'APPROVED' | 'REQUEST_CHANGES') => {
    if (!selectedSection) {
      return;
    }

    const note = selectedDraft.note.trim();
    if (decision === 'REQUEST_CHANGES' && !note) {
      toast({
        title: 'Reviewer note required',
        description: 'Add a specific note before requesting changes on a section.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateSectionMutation.mutateAsync({
        callType: selectedSection.callType,
        data: {
          decision,
          note: note || undefined,
        },
      });

      toast({
        title: decision === 'APPROVED' ? 'Section approved' : 'Changes requested',
        description:
          decision === 'APPROVED'
            ? `${fallbackSectionTitle(selectedSection)} is marked approved.`
            : `${fallbackSectionTitle(selectedSection)} has been sent back for changes.`,
      });

      if (review && selectedSectionIndex >= 0 && selectedSectionIndex < review.sections.length - 1) {
        setSelectedCallType(review.sections[selectedSectionIndex + 1]?.callType ?? null);
      }
    } catch (error) {
      toast({
        title: 'Section update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFinalize = async (action: 'APPROVE' | 'REQUEST_CHANGES') => {
    const summary = summaryNote.trim();
    const requested = requestedChangesNote.trim();

    if (action === 'REQUEST_CHANGES' && !requested) {
      toast({
        title: 'Requested changes note required',
        description: 'Explain the overall requested changes before finalizing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await finalizeMutation.mutateAsync({
        action,
        summaryNote: summary || undefined,
        requestedChangesNote: requested || undefined,
      });

      toast({
        title: action === 'APPROVE' ? 'Review approved' : 'Changes requested',
        description:
          action === 'APPROVE'
            ? 'The campaign has moved out of review. Any customer notification is handled by the backend.'
            : 'Only the impacted sections and downstream dependents will be regenerated before the review returns to in review.',
      });
    } catch (error) {
      toast({
        title: 'Finalize action failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="h-[480px] animate-pulse rounded-lg bg-muted" />
          <div className="h-[720px] animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  const isReviewerOrAdmin = user?.role === 'REVIEWER' || user?.role === 'ADMIN';
  if (!isReviewerOrAdmin) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">Permission denied</p>
            <p className="text-sm text-muted-foreground">
              Only reviewers and admins can access campaign review decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviewQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="h-[520px] animate-pulse rounded-lg bg-muted" />
          <div className="h-[760px] animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (reviewQuery.error) {
    if (reviewQuery.error instanceof ApiError && reviewQuery.error.status === 404) {
      return (
        <Card className="border-border bg-card">
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileStack className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No strategy review yet</EmptyTitle>
                <EmptyDescription>
                  This campaign has not created a strategy review record yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to load review</AlertTitle>
        <AlertDescription>
          {reviewQuery.error instanceof Error ? reviewQuery.error.message : 'Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!review) {
    return null;
  }

  const handleSelectSection = (callType: string) => {
    setSelectedCallType(callType);
  };

  return (
    <div className="relative space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="font-space-grotesk text-2xl">
                  {review.campaignTitle ?? `Campaign ${review.campaignId}`}
                </CardTitle>
                <ReviewStatusBadge status={review.status} />
              </div>
              <CardDescription className="max-w-2xl text-sm">
                Review generated strategy sections one by one. New output first enters pending
                review, then moves into active review when the reviewer starts the process.
              </CardDescription>
            </div>

            {isPendingReviewStatus(review.status) && (
              <Button onClick={handleStartReview} disabled={reviewBusy}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Review
              </Button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assigned reviewer</p>
              <p className="mt-2 font-medium">
                {review.assignedReviewer?.displayName ??
                  review.assignedReviewer?.email ??
                  'Unassigned'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last updated</p>
              <p className="mt-2 font-medium">{formatDateTime(review.updatedAt)}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approved at</p>
              <p className="mt-2 font-medium">{formatDateTime(review.approvedAt)}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open sections</p>
              <p className="mt-2 font-medium">{unresolvedSections}</p>
            </div>
          </div>

          {review.deliverables.length > 0 && (
            <div className="grid gap-3 md:grid-cols-3">
              {review.deliverables.map((deliverable) => (
                <div key={deliverable.key} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{deliverable.label}</p>
                    <ReviewStatusBadge status={deliverable.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {deliverable.updatedAt ? `Updated ${formatDateTime(deliverable.updatedAt)}` : 'Awaiting reviewer resolution'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {review.requestedChangesNote && (
            <Alert>
              <Clock3 className="h-4 w-4" />
              <AlertTitle>Latest requested changes</AlertTitle>
              <AlertDescription>{review.requestedChangesNote}</AlertDescription>
            </Alert>
          )}

          {isRegenerationPending(review) && (
            <Alert>
              <Clock3 className="h-4 w-4" />
              <AlertTitle>Regeneration in flight</AlertTitle>
              <AlertDescription>
                The backend is processing targeted reruns for impacted sections and downstream
                dependents. Once finished, the campaign returns to in review.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
        <Card className="overflow-hidden border-border bg-card xl:sticky xl:top-6 xl:max-h-[calc(100vh-10rem)]">
          <SectionNavigator
            sections={review.sections}
            selectedCallType={selectedCallType}
            maxUnlockedIndex={maxUnlockedIndex}
            visitedCallTypes={visitedCallTypes}
            onSelect={handleSelectSection}
          />
        </Card>

        <div className="space-y-4">
          <Card className="border-border bg-card xl:min-h-[calc(100vh-10rem)]">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="font-space-grotesk text-2xl">
                  {selectedSection ? fallbackSectionTitle(selectedSection) : 'Select a section'}
                </CardTitle>
                {selectedSection && <ReviewStatusBadge status={selectedSection.status} />}
                {selectedSection?.decision && <ReviewStatusBadge status={selectedSection.decision} />}
                {selectedSectionIndex >= 0 && (
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Section {selectedSectionIndex + 1} of {totalSections}
                  </span>
                )}
              </div>
              <CardDescription>
                {selectedSection
                  ? 'Review the generated output, then leave a section decision below.'
                  : 'Choose a section from the left to inspect the generated output.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              {!selectedSection ? (
                <Empty className="border border-border">
                  <EmptyHeader>
                    <EmptyTitle>No section selected</EmptyTitle>
                    <EmptyDescription>Select a section to review its generated content.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col space-y-6">
                  {selectedSection.note && (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Current reviewer note
                      </p>
                      <p className="mt-2 text-sm leading-7">{selectedSection.note}</p>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-background via-card to-muted/10 xl:h-[calc(100vh-22rem)]">
                    <ScrollArea className="h-[28rem] xl:h-full">
                      <div className="p-5 md:p-6">
                        <StrategyContentRenderer content={selectedSection.content} />
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Submit a section decision to unlock the next section and keep the review moving.
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Section {Math.min(maxUnlockedIndex + 1, totalSections)} is currently unlocked.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Section decision</CardTitle>
              <CardDescription>Approve or send back only the section that needs revision.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedSection ? (
                <p className="text-sm text-muted-foreground">Select a section to unlock controls.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="section-note">Reviewer note</Label>
                    <Textarea
                      id="section-note"
                      value={selectedDraft.note}
                      onChange={(event) =>
                        updateDraft(selectedSection.callType, { note: event.target.value })
                      }
                      placeholder="Capture what is correct, what needs revision, and any specific fixes."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      A note is required when requesting changes on a section.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Final campaign decision
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The final campaign decision becomes available only on the last section, after
                      every section has been approved.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={() => handleSectionDecision('APPROVED')}
                      disabled={reviewBusy}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve Section
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSectionDecision('REQUEST_CHANGES')}
                      disabled={reviewBusy}
                    >
                      Request Changes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isLastSection ? (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Finalize review</CardTitle>
                <CardDescription>
                  Available on the last section only after every section has been approved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(sectionSummary).map(([status, count]) => (
                    <div key={status} className="rounded-2xl border border-border bg-muted/20 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {humanizeReviewValue(status)}
                      </p>
                      <p className="mt-2 text-lg font-semibold">{count}</p>
                    </div>
                  ))}
                </div>

                {!canFinalize && (
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="flex items-start gap-3">
                      <LockKeyhole className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-foreground">Final campaign decision is locked</p>
                        <p className="text-muted-foreground">
                          Approve all {totalSections} sections before finalizing the campaign.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="summary-note">Summary note</Label>
                    <Textarea
                      id="summary-note"
                      value={summaryNote}
                      onChange={(event) => setSummaryNote(event.target.value)}
                      placeholder="Optional overall reviewer summary."
                      rows={4}
                      disabled={!canFinalize}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requested-changes-note">Requested changes note</Label>
                    <Textarea
                      id="requested-changes-note"
                      value={requestedChangesNote}
                      onChange={(event) => setRequestedChangesNote(event.target.value)}
                      placeholder="Required when requesting overall changes."
                      rows={4}
                      disabled={!canFinalize}
                    />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => handleFinalize('APPROVE')}
                    disabled={reviewBusy || !canFinalize}
                  >
                    Approve Review
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFinalize('REQUEST_CHANGES')}
                    disabled={reviewBusy || !canFinalize}
                  >
                    Request Targeted Changes
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {approvedSections} of {totalSections} sections approved. {visitedCallTypes.length} of{' '}
                  {totalSections} sections visited.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Final campaign decision</CardTitle>
                <CardDescription>
                  This appears only on the last section after every section is approved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">Continue reviewing sections</p>
                      <p className="text-muted-foreground">
                        Move to section {totalSections} and approve each section on the way before
                        the final campaign decision becomes available.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
