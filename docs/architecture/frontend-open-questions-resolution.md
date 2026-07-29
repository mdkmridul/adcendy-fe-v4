# Frontend FE-01–FE-06 Resolution

Status: local implementation complete; UAT execution pending.

| ID | Local code status | Repository conclusion | Remaining release evidence |
|---|---|---|---|
| FE-01 | IMPLEMENTED | Browser API traffic is same-origin and relative. The checked-in proxy contract preserves auth, cookies, idempotency, status, and required response headers. | Deploy the reference topology and execute the browser/proxy checks in UAT. |
| FE-02 | IMPLEMENTED | Access tokens and users are memory-only. Refresh is an HttpOnly-cookie bootstrap with credentialed auth calls, single-flight rotation handling, logout-all, and terminal/recoverable failure behavior. | Validate real cookie attributes, rotation, reload, revocation, and Origin/Referer handling in UAT. |
| FE-03 | IMPLEMENTED | Reviewer mutations discard actor/authority fields; the Backend principal is authoritative. Admin assignment sends only `assigneeUserId`. | Run deployed negative authorization and tampering tests. |
| FE-04 | IMPLEMENTED | Canonical start/status/retry/recovery operations, stable run IDs, all five public states, idempotency, visibility/offline recovery, `Retry-After`, and bounded backoff are implemented. | Exercise real asynchronous transitions and reconnect behavior in UAT. |
| FE-05 | IMPLEMENTED | Generated file contracts cover upload, document/artifact lists, signed-download authorization, expiry/re-authorization, cancellation, progress, role UI, and replay rules. | Validate Backend ownership denial, object-store expiry/disposition, and the configured five-minute TTL in UAT. |
| FE-06 | IMPLEMENTED | Runtime public configuration is allowlisted and host-bound; one standalone image is configurable for UAT or Production and promotion requires the identical digest. | Build/publish one digest, approve it in UAT, and promote that exact digest. |

## Immutable Backend baselines

- Auth/Wave 1: `e2e119fb2d0243192835014518afb4f4050a53a0`
- Runs/Wave 2: `c8eeb46eaef989febaa26bc59a4bdaaad6945904`
- Deployment/Wave 3 OpenAPI: Backend revision
  `65a37c342e763a7c23eb126c78eae380dd8b0fb6`, version `2.2.0`,
  SHA-256
  `f47bdda74803612e550cb21dd6c61e3793d5e64d10c0d0f3765615fb18694aa3`
- Files/Wave 4: `79324473cab50871875fc8c7472c440125b277a9`,
  files contract `1.0.0`

## First UAT scope decisions

- Analytics emission is excluded until a provider and distinct UAT/Production
  destination IDs are approved. Privacy redaction and mismatch guards remain
  active.
- Legacy weekly, anomaly, tweak, and tweak-approval workspaces are disabled by
  default. They require a deliberate `legacyPerformanceWorkspaces` runtime
  flag after their Backend contracts are pinned and browser-tested.
- No UAT or Production sign-off is claimed because no UAT environment exists.

## Current local gates

- Unit/contract/security tests
- Chromium integration tests against the Production build
- Full TypeScript
- ESLint with a committed suppression baseline that rejects new violations
- Auth/V2 and files contract drift
- UAT and Production runtime validation
- Production build and browser-bundle secret scan
- Reverse-proxy behavior
- Production dependency audit and SBOM
- Standalone container and same-digest promotion policy

The repository is a local UAT candidate. Release approval begins only after
the external environment, real Backend, object storage, ingress, and UAT
evidence exist.
