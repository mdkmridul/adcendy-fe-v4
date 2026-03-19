# Strategy Review Workflow

This document describes the intended frontend-visible lifecycle for campaign strategy review.

## Review Status Flow

The campaign strategy review should move through these states:

1. `PENDING_REVIEW`
   - Initial state after strategy output is ready for reviewer attention.
   - The reviewer has not started the review yet.

2. `IN_REVIEW`
   - Entered when the reviewer explicitly starts the review.
   - The reviewer is actively approving sections or requesting changes.

3. `CHANGES_REQUESTED`
   - Entered when the reviewer requests changes on one or more sections, or finalizes with requested changes.
   - AI re-iteration and downstream regeneration begin from this state.

4. `IN_REVIEW`
   - Entered again after backend/system reruns finish and the campaign is ready for reviewer re-check.
   - This loop can repeat until the reviewer is satisfied.

5. `APPROVED`
   - Final state when the reviewer approves the review.
   - The campaign moves out of review at this point.

In shorthand:

`PENDING_REVIEW -> IN_REVIEW -> CHANGES_REQUESTED -> IN_REVIEW -> ... -> APPROVED`

## Frontend Behavior

- The reviewer inbox must keep `PENDING_REVIEW` separate from `IN_REVIEW`.
- The `Start Review` action is only available in `PENDING_REVIEW`.
- Requesting changes moves the review into `CHANGES_REQUESTED`.
- The frontend does not force the return from `CHANGES_REQUESTED` to `IN_REVIEW`; that transition is backend-owned and should be reflected when the API returns the updated status.
- Approval moves the review out of the review workflow.

## Notification Note

- Customer notification after final approval is expected to be handled by backend workflows.
- The frontend currently communicates approval state, but it does not independently send email.
