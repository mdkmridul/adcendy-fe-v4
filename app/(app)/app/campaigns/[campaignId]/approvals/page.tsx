'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weeklyRepository } from '@/shared/api/repositories/weekly.repo';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuth } from '@/features/auth/useAuth';
import { WeekSelector } from '@/shared/components/weekly/WeekSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, TrendingUp, Info, AlertCircle } from 'lucide-react';
import type { TweakItem } from '@/shared/types/weekly';

export default function ApprovalsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const campaignId = params?.campaignId as string;
  const { user } = useAuth();

  // RBAC check
  const isReviewerOrAdmin = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  const weekStartParam = searchParams?.get('weekStart');
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(
    weekStartParam || null
  );
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTweakForReject, setSelectedTweakForReject] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [selectedTweakForApprove, setSelectedTweakForApprove] = useState<string | null>(null);

  // Fetch all submissions to get available weeks
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: queryKeys.weekly.submissions(campaignId),
    queryFn: () => weeklyRepository.listSubmissions(campaignId),
    enabled: !!campaignId,
  });

  const availableWeeks = useMemo(() => {
    if (!submissions) return [];
    return submissions.map((s) => s.weekStart).sort((a, b) => b.localeCompare(a));
  }, [submissions]);

  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekStart) {
      setSelectedWeekStart(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeekStart]);

  // Fetch existing tweak run for the selected week
  const { data: existingRun } = useQuery({
    queryKey: queryKeys.weekly.tweakRunByWeek(campaignId, selectedWeekStart || ''),
    queryFn: () => weeklyRepository.getTweakRun(campaignId, selectedWeekStart || ''),
    enabled: !!campaignId && !!selectedWeekStart,
  });

  // Fetch tweak items
  const { data: tweaks, isLoading: isLoadingTweaks } = useQuery({
    queryKey: queryKeys.weekly.tweaks(existingRun?.id || ''),
    queryFn: () => weeklyRepository.listTweaks(existingRun!.id),
    enabled: !!existingRun && existingRun.status === 'SUCCEEDED',
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ tweakId, note }: { tweakId: string; note?: string }) =>
      weeklyRepository.approveTweak(tweakId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.weekly.tweaks(existingRun!.id),
      });
      setApproveNote('');
      setSelectedTweakForApprove(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ tweakId, note }: { tweakId: string; note: string }) =>
      weeklyRepository.rejectTweak(tweakId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.weekly.tweaks(existingRun!.id),
      });
      setRejectDialogOpen(false);
      setRejectNote('');
      setSelectedTweakForReject(null);
    },
  });

  const handleApprove = (tweakId: string) => {
    approveMutation.mutate({ tweakId, note: approveNote || undefined });
  };

  const handleRejectClick = (tweakId: string) => {
    setSelectedTweakForReject(tweakId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedTweakForReject && rejectNote.trim()) {
      rejectMutation.mutate({ tweakId: selectedTweakForReject, note: rejectNote.trim() });
    }
  };

  // RBAC - Unauthorized access
  if (!isReviewerOrAdmin) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center border-destructive bg-destructive/5">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            This page is only accessible to Reviewers and Administrators.
          </p>
        </Card>
      </div>
    );
  }

  if (!campaignId) {
    return (
      <div className="p-6">
        <p className="text-destructive">Campaign ID not found</p>
      </div>
    );
  }

  const impactConfig = {
    HIGH: { color: 'bg-green-500/10 text-green-600', label: 'High Impact' },
    MEDIUM: { color: 'bg-blue-500/10 text-blue-600', label: 'Medium Impact' },
    LOW: { color: 'bg-gray-500/10 text-gray-600', label: 'Low Impact' },
  };

  const statusConfig = {
    PROPOSED: { color: 'bg-yellow-500/10 text-yellow-700', icon: Clock, label: 'Proposed' },
    APPROVED: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2, label: 'Approved' },
    REJECTED: { color: 'bg-red-500/10 text-red-700', icon: XCircle, label: 'Rejected' },
  };

  // Group tweaks by status
  const proposedTweaks = tweaks?.filter((t) => t.status === 'PROPOSED') || [];
  const reviewedTweaks = tweaks?.filter((t) => t.status !== 'PROPOSED') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
          Approvals
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve or reject tweak recommendations
        </p>
      </div>

      {/* No submissions state */}
      {!isLoadingSubmissions && availableWeeks.length === 0 && (
        <Card className="p-8 text-center border border-border bg-card">
          <p className="text-muted-foreground">
            No weekly submissions yet. Submit weekly metrics and generate tweaks to see recommendations.
          </p>
        </Card>
      )}

      {/* Main content */}
      {availableWeeks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <WeekSelector
                weeks={availableWeeks}
                selectedWeek={selectedWeekStart || ''}
                onSelectWeek={setSelectedWeekStart}
                isLoading={isLoadingSubmissions}
                label="Select Week"
              />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* No tweak run yet */}
            {!existingRun && !isLoadingTweaks && (
              <Card className="p-8 text-center border border-border bg-card">
                <p className="text-muted-foreground">
                  No tweaks have been generated for this week yet.
                </p>
              </Card>
            )}

            {/* Tweak run still running */}
            {existingRun && existingRun.status === 'RUNNING' && (
              <Alert className="border-border bg-card">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Tweaks are still being generated for this week. Please check back shortly.
                </AlertDescription>
              </Alert>
            )}

            {/* Proposed tweaks section */}
            {existingRun && existingRun.status === 'SUCCEEDED' && (
              <>
                <Card className="p-6 border border-border bg-card">
                  <div className="mb-6 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Pending Approval
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Review and approve or reject proposed tweaks
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {proposedTweaks.length}
                      </Badge>
                    </div>
                  </div>

                  {isLoadingTweaks ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : proposedTweaks.length === 0 ? (
                    <Alert className="border-border bg-card">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No pending tweaks to review. All tweaks have been processed.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {proposedTweaks.map((tweak) => {
                        const impactCfg = impactConfig[tweak.impact];
                        return (
                          <Card
                            key={tweak.id}
                            className="p-4 border border-border bg-card"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {tweak.category}
                                    </Badge>
                                    <Badge className={impactCfg.color}>
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      {impactCfg.label}
                                    </Badge>
                                  </div>
                                  <h4 className="text-sm font-medium text-foreground">
                                    {tweak.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {tweak.recommendation}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2 border-t border-border">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(tweak.id)}
                                  disabled={approveMutation.isPending}
                                  className="flex-1"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectClick(tweak.id)}
                                  disabled={rejectMutation.isPending}
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Reviewed tweaks section */}
                {reviewedTweaks.length > 0 && (
                  <Card className="p-6 border border-border bg-card">
                    <div className="mb-6 pb-4 border-b border-border">
                      <h2 className="text-lg font-semibold text-foreground">
                        Reviewed Tweaks
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tweaks that have been approved or rejected
                      </p>
                    </div>

                    <div className="space-y-4">
                      {reviewedTweaks.map((tweak) => {
                        const impactCfg = impactConfig[tweak.impact];
                        const statusCfg = statusConfig[tweak.status];
                        const StatusIcon = statusCfg.icon;

                        return (
                          <Card
                            key={tweak.id}
                            className="p-4 border border-border bg-card"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {tweak.category}
                                </Badge>
                                <Badge className={impactCfg.color}>
                                  {impactCfg.label}
                                </Badge>
                                <Badge className={statusCfg.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusCfg.label}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-medium text-foreground">
                                {tweak.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {tweak.recommendation}
                              </p>
                              {tweak.reviewerNote && (
                                <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border">
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Reviewer Note:</span>{' '}
                                    {tweak.reviewerNote}
                                  </p>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Tweak</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this tweak. This note will be visible to
              the team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-note">Rejection Note *</Label>
              <Textarea
                id="reject-note"
                placeholder="Explain why this tweak is being rejected..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectNote.trim() || rejectMutation.isPending}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
