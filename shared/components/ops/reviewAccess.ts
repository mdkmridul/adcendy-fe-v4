import { ApiError } from '@/shared/api/errors';
import type { Role } from '@/features/auth/types';

export type SectionReviewForbiddenReason =
  | 'startReviewFirst'
  | 'assignedToAnotherReviewer'
  | 'notOwner'
  | 'forbidden';

function toLowerText(value: unknown): string {
  if (typeof value === 'string') {
    return value.toLowerCase();
  }

  if (!value) {
    return '';
  }

  try {
    return JSON.stringify(value).toLowerCase();
  } catch {
    return '';
  }
}

export function inferSectionReviewForbiddenReason(error: unknown): SectionReviewForbiddenReason | null {
  if (!(error instanceof ApiError) || error.status !== 403) {
    return null;
  }

  const haystack = [toLowerText(error.message), toLowerText(error.details), toLowerText(error.data)]
    .filter(Boolean)
    .join(' ');

  if (
    haystack.includes('start review') ||
    haystack.includes('start-review') ||
    haystack.includes('pending_review') ||
    haystack.includes('must start') ||
    haystack.includes('review_not_started')
  ) {
    return 'startReviewFirst';
  }

  if (
    haystack.includes('assigned to another reviewer') ||
    haystack.includes('another reviewer') ||
    haystack.includes('reviewer assignment') ||
    haystack.includes('assignee mismatch')
  ) {
    return 'assignedToAnotherReviewer';
  }

  if (
    haystack.includes('not owner') ||
    haystack.includes('ownership') ||
    haystack.includes('not owned') ||
    haystack.includes('own campaign')
  ) {
    return 'notOwner';
  }

  return 'forbidden';
}

export function getSectionReviewForbiddenMessage(
  role: Role | null | undefined,
  reason: SectionReviewForbiddenReason,
) {
  if (role === 'REVIEWER') {
    if (reason === 'startReviewFirst') {
      return {
        title: 'Start review first',
        description: 'Click Review from the inbox first, then open the workspace.',
      };
    }

    if (reason === 'assignedToAnotherReviewer') {
      return {
        title: 'Assigned to another reviewer',
        description: 'This run is assigned to another reviewer and cannot be opened from your account.',
      };
    }
  }

  if (role === 'CLIENT' && reason === 'notOwner') {
    return {
      title: 'Not allowed for this run',
      description: 'You can only view strategy workspaces for campaigns you own.',
    };
  }

  return {
    title: 'Permission denied',
    description: 'You do not have access to this strategy workspace.',
  };
}
