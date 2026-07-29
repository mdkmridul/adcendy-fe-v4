type UnknownRecord = Record<string, unknown>;

export function buildReviewerTaskRespondBody(payload: {
  answer: UnknownRecord;
}): { answer: UnknownRecord } {
  return { answer: payload.answer };
}

export function buildSectionApprovalBody(payload: {
  reviewerNotes?: string;
}): { reviewerNotes?: string } {
  return payload.reviewerNotes === undefined
    ? {}
    : { reviewerNotes: payload.reviewerNotes };
}

export function buildSectionRevisionBody(payload: {
  instruction: string;
  reviewerNotes?: string;
}): { instruction: string; reviewerNotes?: string } {
  return {
    instruction: payload.instruction,
    ...(payload.reviewerNotes === undefined
      ? {}
      : { reviewerNotes: payload.reviewerNotes }),
  };
}

export const buildSectionImpactAnalysisBody = buildSectionRevisionBody;

export function buildSectionImpactConfirmationBody(payload: {
  decision: 'confirm_apply' | 'cancel';
  selectedScopeKeys?: string[];
}): {
  decision: 'confirm_apply' | 'cancel';
  selectedScopeKeys?: string[];
} {
  return {
    decision: payload.decision,
    ...(payload.selectedScopeKeys === undefined
      ? {}
      : { selectedScopeKeys: payload.selectedScopeKeys }),
  };
}

export function buildAdminReviewerAssignmentBody(payload: {
  assigneeUserId: string | null;
}): { assigneeUserId: string | null } {
  return { assigneeUserId: payload.assigneeUserId };
}
