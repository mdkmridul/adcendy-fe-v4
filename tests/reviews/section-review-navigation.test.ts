import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

test('successful section approval returns to the refreshed pending-review inbox', () => {
  const detailPage = read(
    'app/(app)/app/reviewer/section-reviews/[sectionReviewTaskId]/page.tsx',
  );
  const inboxPage = read(
    'app/(app)/app/reviewer/section-reviews/page.tsx',
  );
  const hooks = read('hooks/useOpsV2.ts');
  const approveHandler = detailPage.match(
    /const approveTask = async \(\) => \{[\s\S]*?\n  \};/,
  )?.[0];

  assert.ok(approveHandler, 'approve handler should exist');
  assert.match(approveHandler, /await approveMutation\.mutateAsync\(/);
  assert.match(
    approveHandler,
    /router\.replace\(PENDING_SECTION_REVIEW_INBOX_PATH\)/,
  );
  assert.doesNotMatch(approveHandler, /detailQuery\.refetch/);
  assert.match(
    detailPage,
    /PENDING_SECTION_REVIEW_INBOX_PATH =\s*['"]\/app\/reviewer\/section-reviews\?status=PENDING_REVIEW['"]/,
  );
  assert.match(
    hooks,
    /useApproveOpsSectionReview[\s\S]*?await queryClient\.invalidateQueries\(\{ queryKey: queryKeys\.opsV2\.all \}\)/,
  );
  assert.match(
    inboxPage,
    /case 'PENDING_REVIEW':[\s\S]*?return 'pending_review'/,
  );
  assert.match(
    inboxPage,
    /case 'CHANGES_REQUESTED':[\s\S]*?return 'changes_requested'/,
  );
  assert.match(inboxPage, /case 'APPROVED':[\s\S]*?return 'approved'/);
  assert.doesNotMatch(inboxPage, /SelectItem value="PENDING"/);
  assert.doesNotMatch(inboxPage, /SelectItem value="REVISION_REQUESTED"/);
});
