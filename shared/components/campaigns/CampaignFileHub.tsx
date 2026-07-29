'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  AlertCircle,
  ArrowUpRight,
  Clock3,
  Download,
  FileClock,
  FileText,
  FolderOpen,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaignLifecycle } from '@/hooks/useCampaignLifecycle';
import { useToast } from '@/hooks/use-toast';
import {
  useCampaignArtifactDownload,
  useCampaignArtifacts,
  useCampaignDocumentDownload,
  useCampaignDocuments,
} from '@/hooks/useCampaignDocuments';
import { canAccessCampaignFiles } from '@/shared/components/campaigns/campaign-ui';
import { getFreshDownloadAuthorization } from '@/shared/files/file-policy';
import ENV from '@/lib/env';
import type {
  CampaignArtifact,
  CampaignDocument,
} from '@/shared/types/campaignDocument';

const PRIORITY_PATTERNS = [
  /launch brief/i,
  /tracking/i,
  /baseline/i,
  /setup guide/i,
  /onboarding/i,
];

type AvailabilityState = 'available' | 'scheduled';

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: string | null): string {
  const parsed = parseDate(value);

  if (!parsed) {
    return 'Not provided';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function formatRelativeDate(value: string | null): string {
  const parsed = parseDate(value);

  if (!parsed) {
    return 'Unknown upload date';
  }

  return `${formatDistanceToNowStrict(parsed, { addSuffix: true })}`;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null || Number.isNaN(bytes) || bytes <= 0) {
    return 'Unknown size';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : size >= 10 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
}

function isPriorityDocument(document: CampaignDocument): boolean {
  const haystack = `${document.title} ${document.fileName}`;
  return PRIORITY_PATTERNS.some((pattern) => pattern.test(haystack));
}

function getAvailabilityState(document: CampaignDocument): AvailabilityState {
  const availableAt = parseDate(document.availableAt);
  const now = Date.now();

  if (availableAt && availableAt.getTime() > now) {
    return 'scheduled';
  }

  return 'available';
}

function getAvailabilityCopy(document: CampaignDocument) {
  const state = getAvailabilityState(document);

  if (state === 'scheduled') {
    return {
      state,
      badgeLabel: 'Scheduled',
      badgeVariant: 'outline' as const,
      description: `Available ${formatDate(document.availableAt)}`,
      disabled: true,
      actionLabel: 'Scheduled',
    };
  }

  return {
    state,
    badgeLabel: 'Available',
    badgeVariant: 'default' as const,
    description: document.availableAt ? `Available ${formatDate(document.availableAt)}` : 'Available now',
    disabled: false,
    actionLabel: 'Open file',
  };
}

function compareDocuments(a: CampaignDocument, b: CampaignDocument): number {
  const aPriority = isPriorityDocument(a) ? 1 : 0;
  const bPriority = isPriorityDocument(b) ? 1 : 0;

  if (aPriority !== bPriority) {
    return bPriority - aPriority;
  }

  const aDate = parseDate(a.createdAt)?.getTime() ?? 0;
  const bDate = parseDate(b.createdAt)?.getTime() ?? 0;

  return bDate - aDate;
}

function FileMetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-space-grotesk text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

function FileHubSection({
  title,
  description,
  documents,
  activeDocumentId,
  onOpen,
}: {
  title: string;
  description: string;
  documents: CampaignDocument[];
  activeDocumentId: string | null;
  onOpen: (document: CampaignDocument) => Promise<void>;
}) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-space-grotesk text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        {documents.map((document) => {
          const availability = getAvailabilityCopy(document);
          const isPriority = isPriorityDocument(document);
          const isPending = activeDocumentId === document.documentId;

          return (
            <Card key={document.documentId} className="border-border bg-card p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {isPriority ? <Badge variant="secondary">Onboarding</Badge> : null}
                      <Badge variant={availability.badgeVariant}>{availability.badgeLabel}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="font-space-grotesk text-lg font-semibold text-foreground">
                            {document.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {document.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-border/80 bg-background/40 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        File name
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-foreground">
                        {document.fileName}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-background/40 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        File size
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formatFileSize(document.fileSizeBytes)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-background/40 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Uploaded
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formatDate(document.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-background/40 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Availability
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {document.availableAt ? formatDate(document.availableAt) : 'Immediate'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-52">
                  <div className="rounded-lg border border-border/80 bg-background/40 p-3 text-sm text-muted-foreground">
                    {availability.description}
                  </div>
                  <Button
                    className="w-full gap-2"
                    disabled={availability.disabled || isPending}
                    onClick={() => onOpen(document)}
                  >
                    {isPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isPending ? 'Opening...' : availability.actionLabel}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function FileHubLoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export function CampaignFileHub() {
  const params = useParams();
  const campaignId = params?.campaignId as string | undefined;
  const { toast } = useToast();
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const { campaign, isLoading: isCampaignLoading } = useCampaignLifecycle(campaignId ?? null);
  const filesAvailable = campaign ? canAccessCampaignFiles(campaign) : false;

  const { data, error, isLoading, refetch, isFetching } = useCampaignDocuments(
    campaignId && filesAvailable ? campaignId : null,
  );
  const downloadDocument = useCampaignDocumentDownload(campaignId && filesAvailable ? campaignId : null);
  const artifactsQuery = useCampaignArtifacts(
    campaignId && filesAvailable ? campaignId : null,
  );
  const downloadArtifact = useCampaignArtifactDownload(
    campaignId && filesAvailable ? campaignId : null,
  );

  const documents = useMemo(() => {
    return [...(data?.items ?? [])].sort(compareDocuments);
  }, [data?.items]);
  const artifacts = artifactsQuery.data?.items ?? [];

  const priorityDocuments = useMemo(
    () => documents.filter((document) => isPriorityDocument(document)),
    [documents],
  );

  const standardDocuments = useMemo(
    () => documents.filter((document) => !isPriorityDocument(document)),
    [documents],
  );

  const primarySectionDocuments = priorityDocuments.length > 0 ? priorityDocuments : documents;
  const showSecondarySection = priorityDocuments.length > 0 && standardDocuments.length > 0;

  const availableCount = documents.filter(
    (document) => getAvailabilityState(document) === 'available',
  ).length;
  const scheduledCount = documents.filter(
    (document) => getAvailabilityState(document) === 'scheduled',
  ).length;
  const recentDocuments = [...documents]
    .sort((a, b) => (parseDate(b.createdAt)?.getTime() ?? 0) - (parseDate(a.createdAt)?.getTime() ?? 0))
    .slice(0, 4);
  const totalSizeBytes = documents.reduce(
    (sum, document) => sum + (document.fileSizeBytes ?? 0),
    0,
  );

  const handleOpenDocument = async (document: CampaignDocument) => {
    setActiveDocumentId(document.documentId);

    try {
      const { url } = await getFreshDownloadAuthorization(
        () => downloadDocument.mutateAsync(document.documentId),
        { appEnvironment: ENV.APP_ENV },
      );
      window.location.assign(url.toString());
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : 'Unable to open the requested file.';

      toast({
        variant: 'destructive',
        title: 'Failed to open file',
        description: message,
      });
    } finally {
      setActiveDocumentId(null);
    }
  };

  const handleOpenArtifact = async (artifact: CampaignArtifact) => {
    if (!artifact.availableForDownload) return;
    setActiveArtifactId(artifact.artifactId);

    try {
      const { url } = await getFreshDownloadAuthorization(
        () => downloadArtifact.mutateAsync(artifact.artifactId),
        { appEnvironment: ENV.APP_ENV },
      );
      window.location.assign(url.toString());
    } catch (downloadError) {
      toast({
        variant: 'destructive',
        title: 'Failed to open generated file',
        description:
          downloadError instanceof Error
            ? downloadError.message
            : 'Unable to authorize the generated file.',
      });
    } finally {
      setActiveArtifactId(null);
    }
  };

  if (isCampaignLoading || isLoading || artifactsQuery.isLoading) {
    return <FileHubLoadingState />;
  }

  if (campaign && !filesAvailable) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">File Hub</h1>
          <p className="text-muted-foreground">
            Files unlock after the campaign finishes the active review stage.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Files are unavailable during review</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              This campaign is still being generated or reviewed, so the files section is hidden
              until that process is complete.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/app/campaigns/${campaign.id}/overview`}>Back to Overview</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error || artifactsQuery.error) {
    const loadError = error ?? artifactsQuery.error;
    const message =
      loadError instanceof Error
        ? loadError.message
        : 'Unable to load campaign files.';

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">File Hub</h1>
          <p className="text-muted-foreground">
            Campaign documents, onboarding guides, and signed downloads in one place.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load campaign files</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
            <Button
              className="mt-3 gap-2"
              onClick={() => {
                void Promise.all([refetch(), artifactsQuery.refetch()]);
              }}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (documents.length === 0 && artifacts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">File Hub</h1>
          <p className="text-muted-foreground">
            Campaign documents, onboarding guides, and signed downloads in one place.
          </p>
        </div>

        <Card className="border-dashed border-border bg-card">
          <Empty className="min-h-[360px] border-0">
            <EmptyMedia variant="icon">
              <FolderOpen className="h-6 w-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No documents yet</EmptyTitle>
              <EmptyDescription>
                Files will appear here once the campaign team uploads onboarding materials or
                supporting documents.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="text-muted-foreground">
              Signed links are generated only when a file is ready, so this hub stays current
              without exposing direct storage URLs.
            </EmptyContent>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">File Hub</h1>
          {isFetching ? (
            <Badge variant="outline" className="gap-1">
              <LoaderCircle className="h-3 w-3 animate-spin" />
              Refreshing
            </Badge>
          ) : null}
        </div>
        <p className="max-w-3xl text-muted-foreground">
          Review onboarding materials, campaign assets, and recently uploaded files. Each file
          opens through a fresh signed link when it is ready.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FileMetricCard
          label="Files available now"
          value={availableCount.toString()}
          description="Documents ready to open immediately."
        />
        <FileMetricCard
          label="Scheduled releases"
          value={scheduledCount.toString()}
          description="Files with a future availability date."
        />
        <FileMetricCard
          label="Library size"
          value={formatFileSize(totalSizeBytes)}
          description={`${documents.length + artifacts.length} file${documents.length + artifacts.length === 1 ? '' : 's'} across documents and generated outputs.`}
        />
      </div>

      {artifacts.length > 0 ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-space-grotesk text-xl font-semibold text-foreground">
              Generated outputs
            </h2>
            <p className="text-sm text-muted-foreground">
              Pipeline artifacts are downloadable only after Backend storage is ready.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {artifacts.map((artifact) => {
              const isPending = activeArtifactId === artifact.artifactId;
              return (
                <Card
                  className="flex flex-col justify-between gap-4 border-border bg-card p-5"
                  key={artifact.artifactId}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{artifact.type}</Badge>
                      <Badge
                        variant={
                          artifact.status === 'FAILED' ||
                          artifact.status === 'EXPIRED'
                            ? 'destructive'
                            : artifact.availableForDownload
                              ? 'default'
                              : 'outline'
                        }
                      >
                        {artifact.status.replaceAll('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground">
                      {artifact.fileName || 'Generated campaign artifact'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created {formatDate(artifact.createdAt)}
                      {artifact.fileSizeBytes
                        ? ` · ${formatFileSize(artifact.fileSizeBytes)}`
                        : ''}
                    </p>
                  </div>
                  <Button
                    className="gap-2"
                    disabled={!artifact.availableForDownload || isPending}
                    onClick={() => void handleOpenArtifact(artifact)}
                  >
                    {isPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isPending
                      ? 'Authorizing...'
                      : artifact.availableForDownload
                        ? 'Download'
                        : 'Not available'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
        <div className="space-y-6">
          <FileHubSection
            activeDocumentId={activeDocumentId}
            description={
              priorityDocuments.length > 0
                ? 'Priority onboarding files rise to the top so the launch path is obvious.'
                : 'Every file attached to this campaign, ordered by upload recency.'
            }
            documents={primarySectionDocuments}
            onOpen={handleOpenDocument}
            title={priorityDocuments.length > 0 ? 'Priority documents' : 'Campaign files'}
          />

          {showSecondarySection ? (
            <FileHubSection
              activeDocumentId={activeDocumentId}
              description="Every other file attached to this campaign, ordered by upload recency."
              documents={standardDocuments}
              onOpen={handleOpenDocument}
              title="All campaign files"
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card p-5">
            <div className="space-y-4">
              <div>
                <h2 className="font-space-grotesk text-xl font-semibold text-foreground">
                  Recent uploads
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The newest files added to this campaign.
                </p>
              </div>

              <div className="space-y-3">
                {recentDocuments.map((document) => {
                  const isPending =
                    activeDocumentId === document.documentId;
                  const availability = getAvailabilityCopy(document);

                  return (
                    <button
                      key={document.documentId}
                      className="flex w-full items-start justify-between gap-3 rounded-lg border border-border/80 bg-background/40 p-3 text-left transition-colors hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={availability.disabled || isPending}
                      onClick={() => handleOpenDocument(document)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {document.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatRelativeDate(document.createdAt)}
                        </p>
                      </div>
                      {isPending ? (
                        <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                      ) : availability.disabled ? (
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileClock className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-space-grotesk text-lg font-semibold text-foreground">
                  Secure access
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Opening a file first requests a fresh signed URL from the campaign documents API.
                Scheduled files remain unavailable until their release time.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
