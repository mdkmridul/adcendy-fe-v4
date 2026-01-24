import type { RunStatus } from '@/shared/types/common';

export function isTerminal(status: RunStatus): boolean {
  return status === 'SUCCEEDED' || status === 'FAILED';
}

export function isActive(status: RunStatus): boolean {
  return status === 'QUEUED' || status === 'RUNNING';
}

export function getStatusLabel(status: RunStatus): string {
  const labels: Record<RunStatus, string> = {
    QUEUED: 'Queued',
    RUNNING: 'Running',
    SUCCEEDED: 'Complete',
    FAILED: 'Failed',
  };
  return labels[status];
}
