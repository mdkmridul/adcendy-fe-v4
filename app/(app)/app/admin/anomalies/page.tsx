'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ChevronDown,
  CircleAlert,
  Clock3,
  OctagonAlert,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useOpsRunAnomalies } from '@/hooks/useOpsV2';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
  RunAnomaly,
  RunAnomalyGroup,
  RunAnomalySeverity,
} from '@/shared/types/opsV2';

/**
 * What went wrong lately that no reviewer answer can put right.
 *
 * A reviewer task asks a person a question. Everything here is the other kind:
 * a provider that timed out, a check that stopped a document, a run whose
 * worker died. Read worst first; each row carries what a person needs to chase
 * it - the run, the phase, the provider call, the message, and what to do.
 */

const SEVERITY_META: Record<
  RunAnomalySeverity,
  {
    label: string;
    blurb: string;
    icon: typeof OctagonAlert;
    chip: string;
    dot: string;
    edge: string;
    tile: string;
  }
> = {
  critical: {
    label: 'Stopped',
    blurb: 'The run stopped. Someone is waiting and no answer restarts it.',
    icon: OctagonAlert,
    chip: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    dot: 'bg-red-500',
    edge: 'border-l-red-500',
    tile: 'border-red-500/30 bg-red-500/[0.04]',
  },
  degraded: {
    label: 'Ran on less',
    blurb:
      'The run carried on with worse data. Nothing looks broken, and the plan is quietly poorer.',
    icon: CircleAlert,
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
    edge: 'border-l-amber-500',
    tile: 'border-amber-500/30 bg-amber-500/[0.04]',
  },
  handled: {
    label: 'Handled',
    blurb: 'It failed and the pipeline recovered it. Worth counting, not acting on.',
    icon: ShieldCheck,
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
    edge: 'border-l-emerald-500',
    tile: 'border-emerald-500/30 bg-emerald-500/[0.04]',
  },
};

const SOURCE_LABEL: Record<RunAnomaly['source'], string> = {
  run: 'Run',
  phase: 'Phase',
  dispatch: 'Queue',
  provider: 'Provider',
};

function formatWhen(value: string) {
  const date = new Date(value);
  const minutesAgo = Math.round((Date.now() - date.getTime()) / 60_000);
  const stamp = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  if (minutesAgo < 1) {
    return `${stamp} · just now`;
  }
  if (minutesAgo < 60) {
    return `${stamp} · ${minutesAgo}m ago`;
  }
  const hoursAgo = Math.round(minutesAgo / 60);
  if (hoursAgo < 48) {
    return `${stamp} · ${hoursAgo}h ago`;
  }
  return `${stamp} · ${Math.round(hoursAgo / 24)}d ago`;
}

function SeverityChip({ severity }: { severity: RunAnomalySeverity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        meta.chip,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

function CountTile({
  severity,
  count,
  active,
  onSelect,
}: {
  severity: RunAnomalySeverity;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  const meta = SEVERITY_META[severity];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-xl border p-4 text-left transition',
        meta.tile,
        active ? 'ring-2 ring-offset-2 ring-offset-background' : 'hover:brightness-110',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-semibold text-foreground">{meta.label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{count}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.blurb}</p>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="break-all font-mono text-foreground">{value}</span>
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: RunAnomaly }) {
  const meta = SEVERITY_META[anomaly.severity];
  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 border-border bg-background/60 p-4',
        meta.edge,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{anomaly.title}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{anomaly.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {SOURCE_LABEL[anomaly.source]}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="h-3 w-3" />
            {formatWhen(anomaly.occurredAt)}
          </span>
        </div>
      </div>

      {anomaly.detail ? (
        <p className="mt-3 whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed text-foreground">
          {anomaly.detail}
        </p>
      ) : null}

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        <DetailRow label="Run" value={anomaly.pipelineRunId} />
        <DetailRow label="Campaign" value={anomaly.campaignId} />
        <DetailRow label="Phase" value={anomaly.phaseName} />
        <DetailRow label="Market" value={anomaly.marketId} />
        <DetailRow
          label="Provider"
          value={
            anomaly.provider
              ? `${anomaly.provider}${anomaly.operation ? ` · ${anomaly.operation}` : ''}`
              : null
          }
        />
        {!anomaly.provider && anomaly.operation ? (
          <DetailRow label="Operation" value={anomaly.operation} />
        ) : null}
      </div>

      {anomaly.nextStep ? (
        <p className="mt-3 rounded-md border border-border bg-card p-3 text-xs leading-relaxed text-foreground">
          <span className="font-semibold">What to do: </span>
          {anomaly.nextStep}
        </p>
      ) : null}

      {anomaly.pipelineRunId ? (
        <div className="mt-3">
          <Link href={`/admin/runs/${anomaly.pipelineRunId}`}>
            <Button variant="outline" size="sm">
              Open the run
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function GroupCard({
  group,
  anomalies,
}: {
  group: RunAnomalyGroup;
  anomalies: RunAnomaly[];
}) {
  const [open, setOpen] = useState(false);
  const meta = SEVERITY_META[group.severity];
  const occurrences = anomalies.filter((entry) => entry.code === group.code);
  return (
    <div className={cn('rounded-xl border border-l-4 border-border bg-card', meta.edge)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 p-4 text-left"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityChip severity={group.severity} />
            <span className="font-mono text-sm font-semibold text-foreground">
              {group.code}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{group.sample.title}</p>
          <p className="text-xs text-muted-foreground">
            {group.count} {group.count === 1 ? 'time' : 'times'}
            {group.runCount > 0
              ? ` · ${group.runCount} ${group.runCount === 1 ? 'run' : 'runs'}`
              : ''}
            {' · last '}
            {formatWhen(group.lastSeenAt)}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open ? 'rotate-180' : '',
          )}
        />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border p-4">
          {occurrences.slice(0, 20).map((anomaly) => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
          ))}
          {occurrences.length > 20 ? (
            <p className="text-xs text-muted-foreground">
              Showing the 20 most recent of {occurrences.length}.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminAnomaliesPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [days, setDays] = useState('7');
  const [severity, setSeverity] = useState<'all' | RunAnomalySeverity>('all');

  const params = useMemo(
    () => ({
      days: Number(days),
      ...(severity === 'all' ? {} : { severity }),
    }),
    [days, severity],
  );
  const isAdmin = user?.role === 'ADMIN';
  const anomaliesQuery = useOpsRunAnomalies(params, isAdmin);

  if (!isAuthLoading && !isAdmin) {
    router.replace('/app');
    return null;
  }

  const report = anomaliesQuery.data;
  const total = report
    ? report.counts.critical + report.counts.degraded + report.counts.handled
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Activity className="h-6 w-6" />
            Anomalies
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            What went wrong that no reviewer answer can put right: providers that
            failed or came back short, checks that stopped a document, runs whose
            worker died. Reviewer questions live under Strategy Reviews.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void anomaliesQuery.refetch()}
          disabled={anomaliesQuery.isFetching}
        >
          <RefreshCcw
            className={cn('mr-2 h-4 w-4', anomaliesQuery.isFetching ? 'animate-spin' : '')}
          />
          Refresh
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="anomaly-window">Window</Label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger id="anomaly-window" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="pb-2 text-sm text-muted-foreground">
            {report
              ? `${total} recorded · read ${formatWhen(report.generatedAt)}`
              : 'Loading…'}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {(['critical', 'degraded', 'handled'] as const).map((entry) => (
          <CountTile
            key={entry}
            severity={entry}
            count={report?.counts[entry] ?? 0}
            active={severity === entry}
            onSelect={() => setSeverity(severity === entry ? 'all' : entry)}
          />
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>
            {severity === 'all'
              ? 'Everything, worst first'
              : `${SEVERITY_META[severity].label}, newest first`}
          </CardTitle>
          <CardDescription>
            One row per error code. Open a row for the occurrences, the message
            and what to do about it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {anomaliesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Reading the last {days} days…</p>
          ) : anomaliesQuery.error ? (
            <p className="text-sm text-destructive">
              {anomaliesQuery.error instanceof Error
                ? anomaliesQuery.error.message
                : 'The anomalies could not be loaded.'}
            </p>
          ) : (report?.groups ?? []).length === 0 ? (
            <div className="rounded-lg border border-border bg-background/60 p-6 text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-emerald-500" />
              <p className="mt-2 text-sm font-medium text-foreground">
                Nothing recorded in this window.
              </p>
              <p className="text-xs text-muted-foreground">
                Every run finished what it started, and no provider came back short.
              </p>
            </div>
          ) : (
            (report?.groups ?? []).map((group) => (
              <GroupCard
                key={group.code}
                group={group}
                anomalies={report?.anomalies ?? []}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
