import { ApiError } from '../api/errors.ts';
import type {
  PipelineRunStatusResponseV2,
  PipelineRunStatusV2,
} from '../types/runsV2.ts';

export type RunStateTone = 'neutral' | 'progress' | 'warning' | 'success' | 'error';

export interface RunStateDescriptor {
  label: string;
  description: string;
  tone: RunStateTone;
  terminal: boolean;
}

const RUN_STATES: Record<PipelineRunStatusV2, RunStateDescriptor> = {
  QUEUED: {
    label: 'Queued',
    description: 'Your run is queued and will begin shortly.',
    tone: 'neutral',
    terminal: false,
  },
  RUNNING: {
    label: 'Running',
    description: 'AdCendy is generating your campaign strategy.',
    tone: 'progress',
    terminal: false,
  },
  BLOCKED_AWAITING_REVIEW: {
    label: 'Review required',
    description: 'The run is paused until the requested review is completed.',
    tone: 'warning',
    terminal: false,
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Your campaign strategy is ready.',
    tone: 'success',
    terminal: true,
  },
  FAILED: {
    label: 'Failed',
    description: 'The run could not be completed.',
    tone: 'error',
    terminal: true,
  },
};

export function getRunStateDescriptor(
  status: PipelineRunStatusV2,
): RunStateDescriptor {
  return RUN_STATES[status];
}

export function isPermanentRunPollingError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 400 ||
    error.status === 401 ||
    error.status === 403 ||
    error.status === 404;
}

export function getRunPollingDelay(
  run: PipelineRunStatusResponseV2 | undefined,
  error: unknown,
  failureCount: number,
): number | false {
  if (isPermanentRunPollingError(error)) return false;

  if (error instanceof ApiError && error.retryAfterMs !== undefined) {
    return Math.max(0, error.retryAfterMs);
  }

  if (error) {
    const exponent = Math.max(0, failureCount - 1);
    return Math.min(10_000, 2_000 * (2 ** exponent));
  }

  if (!run?.shouldPoll) return false;
  return Math.max(0, run.pollAfterMs);
}
