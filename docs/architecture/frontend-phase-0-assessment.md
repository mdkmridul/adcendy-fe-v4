# Adcendy Frontend Phase 0 Architecture Assessment

> Historical baseline: this assessment describes commit `ca1c6a7...` before
> Waves 1–4. The implementation findings are superseded by the Wave 1–3
> handoffs and
> `docs/architecture/frontend-wave-4-files-quality.md`. UAT/Production
> operational sign-off is still not claimed.

Assessment date: 2026-07-28

Repository commit assessed: `ca1c6a7ecce7f1074e9365850be363f986936f66`
Overall verdict: **unsuitable** for UAT or Production until the P0 findings are resolved.

## 1. Executive summary

The repository is a Next.js 16 App Router application with React 19, TypeScript, TanStack Query, SWR, and a mixture of generated OpenAPI clients and hand-written adapters.

| Decision | Final status | Headline conclusion |
|---|---|---|
| FE-01 — API origin and routing | REQUIRES CHANGE | Requests use a build-time absolute API origin; no same-origin proxy or runtime config exists, and UAT/Production cannot share the same artifact safely. |
| FE-02 — Token storage and refresh | REQUIRES CHANGE | Access and refresh tokens are returned to JavaScript and persisted in `localStorage`; refresh is body-token based and no request includes cookie credentials. |
| FE-03 — Client identity authority | REQUIRES CHANGE | Active V2 reviewer flows send `reviewerId` and `requestedByUserId` from browser-held user state. |
| FE-04 — Async progress and recovery | REQUIRES CHANGE | Some V1 screens poll, but the V2 commit flow discards its tracking response, status support is incomplete, hidden-tab handling is ineffective, and retry starts a new run. |
| FE-05 — Upload and download | PARTIAL | Backend-authorized signed document download exists; upload is not implemented and the document endpoints are absent from the generated contract. |
| FE-06 — Public configuration | REQUIRES CHANGE | Six public variables are compiled into the client; no runtime-config mechanism exists, so a single UAT/Production artifact is not promotable. |

P0 blockers:

1. **SECURITY RISK:** access and refresh tokens are stored in `localStorage`.
2. **SECURITY RISK:** reviewer actor identity is supplied by the browser in V2 action bodies.
3. **SECURITY RISK / availability and cost risk:** strategy retry calls the start endpoint and can create a duplicate billable run.
4. **SECURITY RISK:** the API origin is an unrestricted public build variable; there is no UAT guard preventing a UAT build/configuration from targeting Production.

Additional release blockers include a failing type-check, a build configured to ignore TypeScript errors, a non-runnable lint command, a stale/incomplete generated API contract, and 44 missing Phase 0 validation tests.

## 2. Repository scope

**CONFIRMED:** The assessment inspected:

- package metadata and both lockfiles;
- Next.js and TypeScript configuration;
- ignored local `.env*` files by variable name and redacted value classification;
- the API client, generated OpenAPI types, real and mock repositories;
- auth pages, auth storage, route guards, and logout;
- V1 and V2 campaign, strategy, reviewer, run, document, and admin flows;
- browser storage, cookies, analytics, and source-map configuration;
- GitHub Actions;
- the complete test inventory;
- a freshly generated `.next` production build and its browser assets.

No Dockerfile, Compose file, reverse-proxy configuration, service worker, runtime-config file, E2E suite, or deployment manifest exists in the repository.

The `.env*` files in this working copy are all ignored by `.gitignore:20`; their presence is useful local evidence but does not prove deployed configuration. No live API, deployment, credentialed service, or customer data was accessed.

Checks executed:

| Check | Result |
|---|---|
| `npm test` | PASS — 8/8 legal-flow unit tests; none covers FE-01–FE-06. |
| `npx tsc --noEmit --incremental false` | FAIL — errors in polling, strategy/intelligence/weekly adapters, generated schema names, and repository signatures. |
| `npm run lint` | NOT RUNNABLE — `eslint` is not installed or declared. |
| `npm run build` | PASS — Next.js explicitly skipped type validation because `ignoreBuildErrors` is enabled. |
| Redacted `.next/static` scan | 112 files, 0 source maps, no detected prohibited config names or common credential patterns; the Production API origin was embedded. |

## 3. Verified Frontend technology stack

**CONFIRMED:**

- Framework: Next.js `16.0.10`, App Router (`app/`).
- Rendering: hybrid static and server-rendered routes. The build emitted both static (`○`) and dynamic (`ƒ`) routes.
- UI: React and React DOM `19.2.0`.
- Language: TypeScript 5.
- Data fetching: TanStack Query `^5.45.0`, SWR `2.3.8`, native `fetch`, and `openapi-fetch`.
- Forms/validation: React Hook Form and Zod.
- Styling: Tailwind/PostCSS plus Radix UI components.
- Analytics: `@vercel/analytics`, rendered globally.
- Package-manager evidence: both `package-lock.json` and `pnpm-lock.yaml` exist. CI uses pnpm 8, while this assessment used the installed npm dependencies.
- Node: repository does not declare an engine. CI selects Node 18 (`.github/workflows/ci.yml:23-27`), while installed Next.js declares Node `>=20.9.0`; the assessment ran on Node `22.14.0`.

**RECOMMENDATION:** choose one lockfile/package manager and update CI to a Node version supported by the installed Next.js release.

## 4. Build and runtime model

**CONFIRMED:** `package.json:6-18` defines `next build` and `next start`. `next.config.mjs:2-8` has no rewrite/proxy/runtime-config integration and sets `typescript.ignoreBuildErrors: true`.

**CONFIRMED:** public configuration is read in `lib/env.ts:8-43` through direct `process.env.NEXT_PUBLIC_*` expressions. Next.js substitutes these client values during build.

**CONFIRMED:** the working-copy Production and staging files contain different absolute API base URLs. CI builds with the staging API origin (`.github/workflows/ci.yml:53-63`) and uploads `.next`.

**CONSEQUENCE:** the current artifact is environment-bound. Promoting the exact `.next` output from UAT to Production would retain the UAT API origin. Rebuilding changes the artifact digest.

**SECURITY RISK:** validation exists as an unused function (`lib/env.ts:66-81`). No import/call was found, so missing or cross-environment values are not rejected.

## 5. API client architecture

### FE-01 decision record

Target decision: Production and UAT use their own app origin, browser API calls are relative `/v1/*` and `/api/v2/*`, and the reverse proxy routes them to the environment-local Backend so one frontend artifact is promotable.

Current implementation:

**CONFIRMED:** two client layers exist:

- `shared/api/http.ts` is the main hand-written client used by repositories. It concatenates `ENV.API.baseURL` and a path (`:145-170`), adds bearer auth (`:180-185`), and retries once after refresh (`:188-224`).
- `src/lib/api/client.ts` creates an `openapi-fetch` client with the same absolute base URL (`:37-40`) and bearer middleware (`:42-82`). Auth pages directly use this layer.

Route prefixes in active code are `/v1/*` and `/api/v2/*`.

No `credentials: "include"` or `withCredentials` usage exists. No EventSource, WebSocket, or SSE client exists.

**INFERRED:** cross-origin calls require Backend CORS to allow the configured frontend origin, `Authorization`, `Content-Type`, and `X-Request-Id`. Cookie auth would not work cross-origin with the present clients.

**SECURITY RISK:** `src/lib/auth-redirect.ts:58-89` returns an unvalidated `next` parameter for client users, and `app/(public)/auth/login/page.tsx:111-119` passes it to `router.replace`. This needs a same-origin path allowlist to prevent open redirect or unsafe scheme handling.

Final status: **REQUIRES CHANGE**

Security/availability consequence: the browser is tied to the API origin embedded at build time, same-origin cookie advantages are absent, and configuration has no rule preventing a UAT artifact from targeting Production. A missing public value can fall back to localhost.

Required changes: use relative routes behind the environment-local reverse proxy; otherwise document the separate-origin CORS/cookie/CSRF design and inject an allowlisted runtime origin. Call runtime validation at startup and reject cross-environment, localhost, non-HTTPS, and unapproved hosts. Restrict login redirects to validated same-origin relative paths.

Required tests: same-artifact UAT/Production startup; bidirectional UAT/Production origin rejection; localhost rejection; CORS/cookie behavior; safe callback/redirect handling.

Confidence: **high** for source/build behavior; **insufficient evidence** for deployed reverse-proxy and CORS rules.

## 6. Authentication/session architecture

### FE-02 decision record

Target decision: access token in memory; refresh token in an HttpOnly, Secure, host-only, reviewed-SameSite cookie; cookie-backed reload refresh; session revocation and safe rotation/replay handling.

Current implementation:

- **CONFIRMED:** login stores `result.accessToken`, `result.refreshToken`, and the user (`app/(public)/auth/login/page.tsx:81-119`).
- **CONFIRMED:** `features/auth/auth.ts:13-56` stores both tokens in `localStorage`.
- **CONFIRMED:** reload restores the already-persisted token/user rather than obtaining a new access token from the Backend (`features/auth/useAuth.ts:14-21`).
- **CONFIRMED:** refresh reads the JavaScript-readable refresh token, posts it as JSON, and persists both rotated tokens (`shared/api/http.ts:16-66`).
- **CONFIRMED:** one in-tab refresh promise coalesces concurrent 401s (`shared/api/http.ts:8-20`).
- **CONFIRMED:** the original request is retried once after refresh and is not recursively refreshed (`shared/api/http.ts:188-224`).
- **CONFIRMED:** logout calls the Backend and clears local data even when the Backend call fails (`shared/components/layout/AppShell.tsx:73-81`).
- **CONFIRMED:** no logout-all UI/API call exists.
- **CONFIRMED:** multi-tab storage events synchronize token/user changes (`src/lib/auth/useAuth.ts:37-57`, `app/(app)/layout.tsx:63-74`).
- **OPEN QUESTION:** refresh rotation, replay detection, cookie attributes, session-family revocation after password reset/account changes, Origin/Referer validation, and Backend CSRF controls cannot be proven.

Final status: **REQUIRES CHANGE**

Security/availability consequence: **P0 SECURITY RISK.** Any script executing in the origin can read both long- and short-lived credentials. This is incompatible with the approved session design and prevents meaningful confirmation of cookie/CSRF behavior.

Required changes:

1. Stop returning/accepting the refresh token as browser JSON and set it only as an HttpOnly cookie.
2. Keep access tokens only in memory; on app bootstrap, call refresh with cookie credentials.
3. Use same-origin relative API paths, or explicitly set `credentials: "include"` and review CORS/CSRF if a separate API origin remains.
4. Keep single-flight refresh, add explicit refresh replay/revocation handling, and implement logout-all.
5. Clear in-memory auth on password-reset/session-family invalidation signals.

Required tests: all authentication rows in section 15.

Confidence: **high** for current frontend behavior; **insufficient evidence** for Backend cookie/session attributes.

## 7. Browser-storage inventory

| Storage | Key/data | Classification | Evidence |
|---|---|---|---|
| `localStorage` | `adcendy_token` | **P0 SECURITY RISK** — access credential | `features/auth/auth.ts:13-45` |
| `localStorage` | `adcendy_refresh_token` | **P0 SECURITY RISK** — refresh credential | `features/auth/auth.ts:13-56` |
| `localStorage` | `adcendy_user` including role/id | Session/UI state; tamperable and must never authorize | `features/auth/auth.ts:73-100` |
| `localStorage` | last campaign ID | Resource/navigation preference | `hooks/useLastCampaign.ts:9-20`, `src/lib/auth-redirect.ts:43-49` |
| `localStorage` | landing design variant | Deliberately public preference/feature flag | `features/landing/components/LandingVariantToggle.tsx:11-19` |
| `localStorage` | reviewer-task-to-campaign map | Resource/navigation mapping; potentially sensitive metadata on shared devices | `app/(app)/app/reviewer/strategy-reviews/page.tsx:303-318` |
| Cookie readable by JavaScript | `sidebar_state` | Non-auth UI preference | `components/ui/sidebar.tsx:28-29,85-86` |
| `sessionStorage` | none found | — | Repository-wide search |
| IndexedDB | none found | — | Repository-wide search |

No token persistence was found in the reviewer task map or landing preference.

## 8. Authorization and client-identity findings

### FE-03 decision record

Target decision: authenticated actor/user/role/tenant values are derived by the Backend. The browser may send resource IDs and explicit admin assignment targets.

Current implementation:

| Occurrence | Classification | Evidence and conclusion |
|---|---|---|
| `reviewerId: user?.id` in section approval | Potentially unsafe Backend-authoritative actor field | `shared/components/ops/SectionReviewRunWorkspace.tsx:75-84`; forwarded unchanged at `shared/api/real/opsV2.real.ts:216-220`. |
| Editable `reviewerId` in section approval | Potentially unsafe client authority; user can type another ID | `app/(app)/app/reviewer/section-reviews/[sectionReviewTaskId]/page.tsx:51-65,91-101`. |
| `requestedByUserId: user.id` for revision | Unsafe actor/audit authority | `shared/components/ops/SectionReviewRunWorkspace.tsx:116-130`; payload type requires it at `shared/types/opsV2.ts:171-184`. |
| `requestedByUserId: user.id` for revision/impact | Unsafe actor/audit authority | `app/(app)/app/reviewer/section-reviews/[sectionReviewTaskId]/page.tsx:114-145,160-181`. |
| `reviewerId` in blocker response | Potentially unsafe actor field; sourced from task data or browser user state | `app/(app)/app/reviewer/tasks/[taskId]/page.tsx:980,1170-1185,1289-1292`; sent at `shared/api/real/opsV2.real.ts:164-171`. |
| Admin reviewer status URL ID | Explicit admin target/resource identifier; acceptable if Backend authorizes admin | `app/(app)/app/admin/reviewers/page.tsx:229-238`, `shared/api/real/adminReview.real.ts:205-212`. |
| Admin AI `userId` filters | Admin-scoped filter, not the authenticated actor | `app/(app)/app/admin/ai/page.tsx:49-71`, `shared/api/real/aiUsage.real.ts:48-70`. |
| Campaign/run/task/document/artifact IDs | Resource identifiers | Used in URL paths/query throughout repositories; Backend ownership checks remain required. |
| `ownerId`, `createdByUserId`, `organizationId`, `tenantId` | Response/generated/mock only; no active request send found | Repository-wide source search excluding generated/mocks, plus `src/generated/openapi.ts` response schemas. |
| `role` | Display/route gating only; no request body authority field found | `features/auth/rbac.ts:3-100` and app layouts. |

Required conclusion: **CONFIRMED** — current requests supply browser-controlled actor identity. Whether the Backend ignores or validates these fields is an **OPEN QUESTION** because `/api/v2/*` is absent from the generated OpenAPI file.

Final status: **REQUIRES CHANGE**

Security/availability consequence: **P0 SECURITY RISK.** If accepted as authority, the fields permit reviewer impersonation or false audit attribution. Backend validation does not make the frontend behavior acceptable.

Required changes: remove actor fields from reviewer action contracts; Backend derives actor and role from session/JWT. Preserve only explicit, separately named admin assignment targets.

Required tests: cross-owner/cross-reviewer access, browser identity mutation, actor-field rejection/ignore tests, and explicit admin-assignment authorization.

Confidence: **high** that fields are sent; **insufficient evidence** on Backend handling.

## 9. Asynchronous run/progress architecture

### FE-04 decision record

Target decision: queued start returns a stable tracking ID; status survives navigation/reload; polling stops at all terminal states, backs off, respects visibility and `Retry-After`; retry/resume is dedicated and idempotent.

Current implementation:

- **CONFIRMED:** `useRunPolling` uses TanStack Query at a default 2.5-second interval and stops only for statuses outside `QUEUED`/`RUNNING` (`shared/run/useRunPolling.ts:8-52`).
- **CONFIRMED:** strategy status uses a route-carried run ID, so the ID survives reload (`app/(app)/app/campaigns/[campaignId]/strategy/runs/[strategyRunId]/page.tsx:15-26`).
- **SECURITY RISK / cost risk:** strategy retry calls `strategyRepository.startRun(campaignId)`, not the generated dedicated retry endpoint (`.../strategy/runs/[strategyRunId]/page.tsx:32-40`; dedicated route evidence at `src/generated/openapi.ts:384-399`).
- **CONTRACT MISMATCH:** the real strategy adapter needs `(campaignId, runId)` but the repository and polling page pass only `runId` (`shared/api/real/strategy.real.ts:18-20`, `shared/api/repositories/strategy.repo.ts:21-23`). Real status requests therefore construct an invalid path.
- **CONTRACT MISMATCH:** the adapter references non-existent generated types and expects `strategyRunId`; the generated schema uses `StrategyRunRequestResponseDto.runId`, returns HTTP 201, and exposes more statuses (`shared/api/real/strategy.real.ts:5-15`; `src/generated/openapi.ts:2633-2686,5452-5479`).
- **CONFIRMED:** local `RunStatus` supports only `QUEUED`, `RUNNING`, `SUCCEEDED`, and `FAILED` (`shared/types/common.ts:4`). It does not model cancelled, provider wait, review wait, repair, retryability, or action-required states.
- **CONFIRMED:** no backoff or `Retry-After` handling exists.
- **INFERRED:** hidden-tab behavior is ineffective. The visibility listener mutates a ref, but no state change triggers a render, leaving the interval callback with the prior `shouldPoll` value (`shared/run/useRunPolling.ts:22-49`).
- **INFERRED:** reconnect refetch uses TanStack Query defaults; no explicit reconnect policy or test exists.
- **CONFIRMED:** V2 wizard commit returns a typed result, but its success handler discards the result and navigates to overview (`shared/components/campaigns/CampaignWizardModal.tsx:3275-3311`). Campaign overview obtains a `pipelineRunId` from Backend state on mount but has no polling interval (`hooks/useCampaignRunWorkspace.ts:16-35`, `hooks/useOpsV2.ts:16-27`).
- **CONFIRMED:** there is no SSE/WebSocket implementation and no fake percentage calculation in the inspected frontend. The generated V1 schema contains a Backend `progress` field (`src/generated/openapi.ts:2414-2430`).

Final status: **REQUIRES CHANGE**

Consequence: users can lose live progress, unsupported states may stop polling or render incorrectly, the real V1 strategy status path is broken, and retry can create duplicate work and cost.

Required changes:

1. Use one generated, current run contract with campaign/run IDs correctly mapped.
2. Preserve the V2 commit tracking ID in the route and restore status from Backend state.
3. Model every Backend status and explicit terminality/retryability.
4. Add 2-second initial polling, bounded 5–10-second backoff, `Retry-After`, working visibility handling, reconnect, and one-poller-per-run behavior.
5. Replace “start again” retry with the Backend retry/resume operation and an idempotency guarantee.

Required tests: all async rows in section 15.

Confidence: **high** for current implementation; **insufficient evidence** for the live V2 status/start response because it is absent from generated schemas.

## 10. Upload and download architecture

### FE-05 decision record

Target upload: authenticated Backend multipart, approximately 25 MiB maximum, progress, cancellation, bounded concurrency, and server-generated object keys.
Target download: Backend ownership authorization followed by a short-lived presigned GET (approximately five minutes).

Current implementation:

- **CONFIRMED:** no `FormData`, multipart request, upload endpoint, file input flow, size/type validation, progress, cancellation, concurrency control, or direct-storage upload exists.
- **CONFIRMED:** campaign document download first calls `/v1/campaigns/{campaignId}/documents/{documentId}/download` (`shared/api/real/campaignDocuments.real.ts:124-141`).
- **CONFIRMED:** it accepts `url`/`signedUrl`/`downloadUrl` and optional expiry, keeps the result only in mutation memory, and navigates immediately (`shared/api/real/campaignDocuments.real.ts:112-121`; `shared/components/campaigns/CampaignFileHub.tsx:392-424`).
- **CONFIRMED:** no signed URL is persisted in local/session storage, deliberately logged, or sent to analytics by application code.
- **CONFIRMED:** each user click requests a fresh URL; there is no explicit expired-URL retry after navigation failure.
- **OPEN QUESTION:** actual lifetime, ownership enforcement, storage isolation, `Content-Disposition`, and cross-owner behavior require Backend/integration evidence.
- **CONTRACT MISMATCH:** the generated contract exposes artifact list/download at `/v1/campaigns/{id}/artifacts/{artifactId}/download`, while the active file hub uses an ungenerated documents route (`src/generated/openapi.ts:800-853,2821-2826,6026-6051`).
- **CONFIRMED EQUIVALENT IMPLEMENTATION:** admin output assembly downloads a Backend-returned blob rather than a presigned URL (`shared/api/real/opsV2.real.ts:278-307`). This avoids public object URLs but uses Backend bandwidth and is an admin-only output path, not the campaign-document path.

Final status: **PARTIAL**

Consequence: the download pattern is directionally secure, but upload requirements are wholly absent and download authorization/expiry cannot be verified.

Required changes: implement the approved Backend multipart flow with 25 MiB UX guidance, allowed-type feedback, progress, abort, bounded concurrency, and tests. Align document versus artifact routes with a generated contract and handle expired signed URLs by re-authorizing.

Confidence: **high** for frontend behavior; **low** for Backend ownership and URL lifetime.

## 11. Public configuration and secret-exposure analysis

### FE-06 decision record

Target decision: only deliberately public values enter the browser; UAT and Production receive runtime configuration so the same artifact is promoted.

Current browser-facing variables (six names):

1. `NEXT_PUBLIC_API_BASE_URL`
2. `NEXT_PUBLIC_API_URL` (legacy alias)
3. `NEXT_PUBLIC_DATA_SOURCE`
4. `NEXT_PUBLIC_API_MODE` (legacy alias)
5. `NEXT_PUBLIC_ENABLE_DEBUG_PANEL`
6. `NEXT_PUBLIC_ENABLE_API_LOGGING`

`OPENAPI_URL` is build tooling only (`scripts/generate-api-types.mjs:21-25`) and is not referenced by browser code.

**CONFIRMED:** the fresh browser build contained the configured Production API origin in one static file. No `.map` files were emitted.

**CONFIRMED:** the redacted scan found zero matches for prohibited variable names including database/Redis/JWT/refresh/AWS/provider/payment/webhook/encryption/tunnel secret names. It also found zero AWS access-key IDs, private-key headers, or compact JWT patterns.

**LIMITATION:** a pattern scan cannot prove absence of arbitrary or obfuscated secrets. No real secret value was printed or copied into these documents.

**CONFIRMED:** Vercel Analytics is globally enabled (`app/layout.tsx:4,48-60`). No Sentry/error-tracking integration or environment-specific analytics identifier is present.

Final status: **REQUIRES CHANGE**

Consequence: no confirmed browser secret exposure, but runtime promotion and environment isolation requirements are unmet. API logging is enabled in the working-copy staging config, and analytics environment/data-redaction controls are not documented.

Required changes:

1. Add an allowlisted runtime config mechanism or same-origin relative API paths that eliminate environment-specific browser origins.
2. Reject Production origins in UAT and UAT origins in Production at startup and in CI.
3. Remove legacy public aliases after migration and validate the allowlist.
4. Separate analytics environments and test redaction of auth headers, tokens, and signed URLs.
5. Keep browser source maps disabled or publish privately with an audited release process.

Confidence: **high** for source/build findings; **insufficient evidence** for deployed CDN/source-map and analytics project settings.

## 12. Production/UAT deployment compatibility

Production and UAT application origins are **EXTERNAL DECISION** values; they are not encoded as frontend application-origin assertions in the repository.

Current compatibility:

- API origin: different build-time absolute values.
- Same artifact: **not feasible**.
- Reverse proxy: no repository configuration or relative-origin use.
- Cookies: frontend is not cookie-auth compatible.
- UAT isolation: separate backend/storage/accounts are **OPEN QUESTION**.
- CI: generates API types from staging and builds a staging-specific artifact; no Production promotion job exists.

See `frontend-production-uat-parity.md` for the control design and checklist.

## 13. Backend contract mismatches

| ID | Frontend expectation | Repository contract evidence | Impact | Required owner/resolution |
|---|---|---|---|---|
| CM-01 | Login/refresh return both tokens; refresh token is posted in JSON. | Generated `AuthSessionDto` and `RefreshDto` agree with the old design (`src/generated/openapi.ts:2064-2096,4107-4149`), but this conflicts with the approved cookie/session-family decision. | Cookie-based reload/rotation cannot work; P0 token exposure persists. | Backend + Frontend: publish current auth schema, migrate to HttpOnly refresh cookie and memory access token. |
| CM-02 | Strategy start returns `strategyRunId`. | Generated schema has `runId`; adapter references a non-existent `StrategyRunResponseDto` (`shared/api/real/strategy.real.ts:5-15`; `src/generated/openapi.ts:2633-2639`). | Navigation uses `undefined`; type-check fails. | Frontend, with Backend schema owner: regenerate and map one canonical response. |
| CM-03 | Strategy status repository needs only a run ID. | Real adapter requires campaign and run IDs (`shared/api/real/strategy.real.ts:18-20`), but repository passes one (`shared/api/repositories/strategy.repo.ts:21-23`). | Real polling URL contains an undefined run segment. | Frontend: make repository and route signatures consistent. |
| CM-04 | Four run states are sufficient. | Generated V1 schema includes `CANCELLED`, `RETRIEVING`, `GENERATING`, `VALIDATING`, and `READY` (`src/generated/openapi.ts:2414-2430,2651-2686`). Approved V2 states are broader still. | Polling can stop early and UI cannot explain wait/review/cancel states. | Backend + Frontend: publish and consume a canonical state machine. |
| CM-05 | Starting strategy is the retry operation. | Generated API has `/v1/campaigns/{id}/runs/{runId}/retry` (`src/generated/openapi.ts:384-399`). | Duplicate billable work. | Frontend + Backend: use dedicated idempotent retry/resume. |
| CM-06 | Hand-written `/api/v2/*` payloads are authoritative. | Generated OpenAPI contains no `/api/v2/*`; generated file is dated 2026-01-27 and sourced from localhost (`src/generated/openapi.ts:1-8`). | Identity fields, status shapes, and response codes cannot be type-verified. | Backend contract owner: publish V2 spec; Frontend: regenerate and eliminate `unknown` adapters. |
| CM-07 | Campaign “documents” routes are current. | Generated schema only proves artifact list/download routes (`src/generated/openapi.ts:800-853,6026-6051`). | Download may 404 or drift silently. | Backend + Frontend: choose document/artifact naming and generate the client. |
| CM-08 | Build quality gates enforce generated compatibility. | Type-check fails; build skips types (`next.config.mjs:2-5`). | Broken contracts can ship in a green build. | Frontend/DevEx: block build on type-check and generated diff. |

## 14. Security findings

| Severity | Finding | Evidence |
|---|---|---|
| P0 | Access and refresh tokens in `localStorage` | `features/auth/auth.ts:13-56,132-140` |
| P0 | Browser-supplied reviewer/audit actor identity | `shared/components/ops/SectionReviewRunWorkspace.tsx:75-84,116-130`; reviewer detail/task pages listed in section 8 |
| P0 | Retry creates a new strategy run | `app/(app)/app/campaigns/[campaignId]/strategy/runs/[strategyRunId]/page.tsx:32-40` |
| P0 | No environment guard prevents UAT from being built/configured with the Production API origin | `lib/env.ts:21-33,66-81`; `.github/workflows/ci.yml:53-63` |
| P1 | Unvalidated login `next` navigation | `src/lib/auth-redirect.ts:58-89`; `app/(public)/auth/login/page.tsx:111-119` |
| P1 | Signed-download authorization and lifetime are untested | `shared/api/real/campaignDocuments.real.ts:135-141`; no relevant tests |
| P1 | Global analytics lacks repository-evidenced environment/redaction controls | `app/layout.tsx:4,60` |
| P1 | Client role/user object is tamperable and used for UI gating | `features/auth/auth.ts:73-100`; `features/auth/rbac.ts:90-100`. Backend checks mitigate server authorization only. |
| P1 | Type safety is bypassed in Production build | `next.config.mjs:2-5`; failed type-check |

No private credential or prohibited variable was detected in the compiled browser assets.

## 15. Required changes before UAT

1. Resolve all P0 findings in sections 6, 8, 9, and 14.
2. Publish/regenerate the current V2 and auth OpenAPI contract; make type-check mandatory.
3. Make API routing same-origin or enforce a reviewed separate-origin cookie/CORS/CSRF design.
4. Add runtime/environment origin validation so UAT cannot target Production.
5. Implement stable V2 run routing, complete states, dedicated retry/resume, and correct polling.
6. Implement upload if upload is in UAT scope; otherwise explicitly mark it unavailable and remove any implied UX.
7. Validate signed download ownership and expiry in a local/UAT integration environment.
8. Fix the lint toolchain and add all 44 Phase 0 tests below.
9. Validate and constrain post-login `next`.

### Required test and validation matrix

Status definitions: `PASS`/`FAIL` require an executed repository test. `MISSING` means no relevant automated test was found.

#### Authentication

| Test | Status |
|---|---|
| Login succeeds | MISSING |
| Access token expires and refresh succeeds | MISSING |
| Refresh token rotates | MISSING |
| Revoked session fails | MISSING |
| Logout removes access | MISSING |
| Logout-all removes all sessions | MISSING |
| Page reload restores valid session | MISSING |
| Refresh failure does not loop forever | MISSING |
| Multiple concurrent 401s result in one refresh | MISSING |
| Token is absent from localStorage/sessionStorage/IndexedDB | MISSING — current implementation would fail |
| Unauthorized route redirects safely | MISSING |

#### Identity and authorization

| Test | Status |
|---|---|
| Client A cannot access client B campaign | MISSING |
| Changing campaign ID does not bypass authorization | MISSING |
| Changing browser user ID does not impersonate another user | MISSING |
| Reviewer cannot access another reviewer’s assigned campaign | MISSING |
| Client cannot submit actor/role authority | MISSING — current review clients send actor IDs |
| Admin assignment workflows remain explicitly authorized | MISSING |

#### Async execution

| Test | Status |
|---|---|
| Start returns tracking ID | MISSING |
| Page reload resumes status | MISSING |
| Polling stops on completion | MISSING |
| Polling stops on permanent failure | MISSING |
| Hidden tab backs off | MISSING |
| Reconnect resumes | MISSING |
| Retry does not create duplicate run | MISSING — current strategy retry starts a new run |
| Waiting-for-review state renders correctly | MISSING |
| Cancelled state renders correctly | MISSING |

#### Upload/download

| Test | Status |
|---|---|
| Allowed 25 MiB upload succeeds | MISSING — upload absent |
| Oversize upload fails safely | MISSING |
| Disallowed file type fails | MISSING |
| Cancellation works | MISSING |
| Cross-owner upload fails | MISSING |
| Cross-owner download authorization fails | MISSING |
| Presigned URL expires | MISSING |
| Expired URL can be refreshed through authorization | MISSING |
| Signed URL is not stored or logged | MISSING |
| UAT cannot access Production objects | MISSING |

#### Configuration/security

| Test | Status |
|---|---|
| Same frontend artifact can run in UAT and Production | MISSING — current design would fail |
| UAT runtime config cannot point to Production | MISSING |
| Production runtime config cannot point to UAT | MISSING |
| Bundle contains no prohibited variable or credential | PASS for the assessed build’s redacted static scan; no automated repository test |
| Source maps do not expose secrets | PASS for assessed build: zero browser source maps; no automated repository test |
| Analytics contain no tokens or signed URLs | MISSING |
| Error reports redact authentication and signed URLs | MISSING |
| Only approved public variables are present | MISSING |

Summary: **42 matrix checks are missing** and 2 one-time bundle observations passed. No durable automated FE-01–FE-06 test exists, so all 44 scenarios still need repository automation.

## 16. Required changes before Production

In addition to every UAT requirement:

1. Promote the exact immutable UAT-approved artifact; inject only validated runtime public configuration.
2. Add automated UAT/Production origin and storage-separation policy checks.
3. Verify refresh cookie `HttpOnly`, `Secure`, host-only, Path, SameSite, expiry, rotation, replay response, and CSRF controls using deployed headers.
4. Verify logout-all, password reset, disabled-account, and revoked-family behavior.
5. Verify presigned URL lifetime is approximately five minutes and storage responses set safe disposition/type headers.
6. Separate analytics projects/environments and prove token/signed-URL redaction.
7. Confirm no public source maps or privately upload maps to a restricted error service.
8. Pin a supported Node/package-manager toolchain and make tests, type-check, lint, build, contract diff, and bundle scan blocking.

## 17. Open questions

1. What is the current authoritative Backend OpenAPI URL/version for authenticated V2 routes?
2. Does the Backend currently return refresh tokens in JSON, set an HttpOnly cookie, or temporarily support both?
3. What cookie attributes and CSRF checks are implemented?
4. Does Backend V2 ignore/reject `reviewerId` and `requestedByUserId`, or treat them as audit authority?
5. What are the canonical V2 start/status/retry/resume endpoints, response codes, and complete state enum?
6. Is V2 wizard commit idempotent, and does it return an existing run when one is active?
7. Is `/documents` newer than the generated `/artifacts` contract, and what is the signed URL lifetime?
8. What upload endpoint/types/limits are available?
9. Are UAT and Production reverse-proxy, Backend, storage, analytics, and accounts isolated outside this repository?
10. Are source maps published by deployment tooling despite not appearing in `.next/static`?
11. What analytics retention/redaction and environment-separation policies apply?
12. Is the app intended to deploy as a Node SSR service or a static export? No container/deployment evidence establishes this.

## 18. Evidence index

| Area | Primary evidence |
|---|---|
| Framework/build | `package.json:6-18,20-76`; `next.config.mjs:1-11`; build output on 2026-07-28 |
| CI/toolchain | `.github/workflows/ci.yml:9-63`; installed `node_modules/next/package.json` engine |
| Environment | `lib/env.ts:8-81`; ignored `.env*` key/value classifications; `.gitignore:20` |
| API clients | `shared/api/http.ts:8-66,145-262`; `src/lib/api/client.ts:34-90` |
| Auth storage/UI | `features/auth/auth.ts:13-140`; login page `:81-119`; app layout `:17-75`; AppShell `:73-81` |
| Redirects/RBAC | `src/lib/auth-redirect.ts:13-89`; `features/auth/rbac.ts:3-100` |
| Actor fields | `shared/types/opsV2.ts:166-184`; `shared/api/real/opsV2.real.ts:164-171,216-240`; components listed in section 8 |
| Polling/status | `shared/run/useRunPolling.ts:8-74`; `shared/types/common.ts:4`; strategy run page `:21-40` |
| V2 run recovery | `CampaignWizardModal.tsx:3275-3311`; `hooks/useCampaignRunWorkspace.ts:16-35`; `hooks/useOpsV2.ts:16-27` |
| Downloads | `campaignDocuments.real.ts:112-141`; `CampaignFileHub.tsx:392-424`; `opsV2.real.ts:278-307` |
| Generated contract | `src/generated/openapi.ts:1-8,2064-2096,2414-2430,2633-2695,2821-2826,5452-5479,6026-6051` |
| Analytics/debug | `app/layout.tsx:4,48-60`; `components/dev/api-debug-panel.tsx:23-54,113-181` |
| Tests | `tests/legal/legal-flow-utils.test.ts`; repository-wide test inventory |
| Bundle scan | fresh `.next/static` scan: 112 files, 0 maps, no detected prohibited names/common credential patterns |
