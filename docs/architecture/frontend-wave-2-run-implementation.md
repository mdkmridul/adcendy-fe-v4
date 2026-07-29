# Frontend Wave 2 — Run contracts and asynchronous UX

## Contract baseline

- Backend revision: `c8eeb46eaef989febaa26bc59a4bdaaad6945904`
- OpenAPI version: `2.1.0`
- OpenAPI SHA-256: `1c8e71afa2c9d1567095ef94bd406ea039d5c9990be6492b67a8842c8129a6ae`
- Generated client: `src/generated/openapi.ts`

Regenerate with:

```powershell
node scripts/generate-api-types.mjs "..\adcendy-be-v4\docs\openapi\v2\adcendy-api.openapi.json"
```

## Canonical operations

- Client generation start: `POST /api/v2/wizard/commit`
- Admin manual start: `POST /api/v2/pipeline/runs`
- Status: `GET /api/v2/pipeline/runs/{runId}`
- Admin retry: `POST /api/v2/pipeline/runs/{runId}/retry`
- Reviewer/Admin recovery: `GET /api/v2/campaigns/{campaignId}/runs/recovery`
- Client recovery: `GET /api/v2/wizard/state/{campaignId}` and its `run` reference

There is no public resume or cancel operation. Reviewer responses resume the
same run automatically.

## Frontend behavior

- Wizard commit, manual start, and retry send a 16–128 character
  `Idempotency-Key`.
- A key is retained across ambiguous network/server failures and replaced
  after success or a definitive client error.
- The run ID returned by wizard commit is placed in the canonical route:
  `/app/campaigns/{campaignId}/runs/{runId}`.
- Retry uses the dedicated retry operation and asserts that Backend returned
  the same run ID.
- The status state machine covers `QUEUED`, `RUNNING`,
  `BLOCKED_AWAITING_REVIEW`, `COMPLETED`, and `FAILED`.
- Polling follows Backend `shouldPoll` and `pollAfterMs`, pauses when the page
  is hidden or offline, refreshes immediately on visibility/reconnect, honors
  `Retry-After`, and uses a 2–10 second bounded transient-error backoff.
- Progress is shown only when Backend supplies a non-null percentage.
- Client-facing legacy "start another strategy run" behavior was removed.
  Admin start and retry controls now use the canonical operations.

## Verification

```text
npm test                 PASS — 26 tests
npm run typecheck:wave2  PASS
npm run build            PASS
OpenAPI generation       PASS — checksum matched
git diff --check         PASS
```

The repository-wide `npm run typecheck` still reports pre-existing legacy
generated-schema and repository typing failures outside the Wave 2 scope.
Next.js is configured to skip repository-wide type validation during build;
the dedicated Wave 2 TypeScript project is the scoped gate for this work.
