import { formatCampaignLifecycleStatus } from '@/shared/types/opsV2';
import { humanizeReviewValue } from '@/shared/types/reviews';

export function formatOpsDateTime(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

export function formatOpsStatus(value?: string | null) {
  if (!value) {
    return 'Unknown';
  }

  return humanizeReviewValue(value);
}

export function formatCampaignOpsStatus(value?: string | null) {
  return formatCampaignLifecycleStatus(value);
}

export function formatOpsStep(step?: number | null) {
  if (typeof step !== 'number' || !Number.isFinite(step)) {
    return 'Step Unknown';
  }

  if (step >= 1 && step <= 7) {
    return `Step ${step}/7`;
  }

  return `Step ${step}`;
}

export function toJsonPreview(value: unknown) {
  if (value === null || value === undefined) {
    return 'Not available';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function splitCsvLike(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
