# Frontend Phase 0 Open Questions Resolution

| ID | Final status | Repository conclusion | Required action | Blocking level |
|---|---|---|---|---|
| FE-01 | REQUIRES CHANGE | The Frontend still uses a build-time absolute public API base. Same-origin routing and immutable UAT-to-Production artifact promotion are not implemented. | Use relative `/v1` and `/api/v2` routes behind the reverse proxy, or formally secure the separate-origin design. Add runtime origin allowlisting and parity tests. | P0 for routing isolation; P1 for runtime configuration |
| FE-02 | IMPLEMENTED — UAT PENDING | Access tokens and user state are memory-only; refresh is exclusively through the Backend-owned HttpOnly cookie. Cookie bootstrap, credentialed auth calls, logout-all, single-flight refresh, bounded `REFRESH_IN_PROGRESS` handling, terminal cleanup, and recoverable temporary failure UI are implemented. | Validate browser CORS, cookie attributes, rotation, reload bootstrap, logout-all, and failure cases once UAT exists. | Implementation complete; UAT evidence required for release sign-off |
| FE-03 | IMPLEMENTED — UAT PENDING | Reviewer mutation types and runtime serializers allow only operation-specific fields. Browser-supplied actor, role, ownership, organization, and tenant fields are discarded. Admin reviewer assignment is separately modeled as `{ assigneeUserId }`. | Validate authorization and negative tampering through the deployed browser/API boundary once UAT exists. | Implementation complete; UAT evidence required for release sign-off |
| FE-04 | REQUIRES CHANGE | V2 long-running operation recovery remains incomplete. Tracking, backoff, hidden-tab behavior, terminal-state coverage, and idempotent retry/resume still require work. | Adopt the final start/status/retry contracts and implement the complete recoverable state machine. | P0 for duplicate billable work; P1 for recovery gaps |
| FE-05 | PARTIAL | The download pattern exists, but upload is absent and document/artifact contract alignment still needs integration proof. | Implement the approved upload flow and validate download authorization and expiry. | P1 if uploads are in UAT scope |
| FE-06 | REQUIRES CHANGE | Public configuration is build-bound; the same artifact cannot yet be promoted unchanged between UAT and Production. | Introduce allowlisted runtime config or relative API routes, plus parity and browser-bundle scans. | P1, with FE-01 isolation tracked as P0 |

## Wave 1 evidence

- Backend revision: `e2e119fb2d0243192835014518afb4f4050a53a0`
- OpenAPI version: `2.0.0`
- OpenAPI SHA-256: `cf616243b26c19a24dad5bf1513066e4d45ad457001948190e7ba667aff328e9`
- Frontend tests: `16 passed, 0 failed`
- Wave 1 scoped typecheck: passed
- Frontend production build: passed
- UAT evidence: not available; no UAT environment currently exists

## Overall resolution

FE-02 and FE-03 implementation is complete and locally verified. Overall Phase 0 UAT approval remains blocked by FE-01, FE-04, and FE-06; FE-05 is partial.
