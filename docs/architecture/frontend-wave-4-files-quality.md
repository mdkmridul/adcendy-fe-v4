# Frontend Wave 4 — Files and quality gates

Status: implementation complete; environment sign-off remains external.

## Contract baseline

- Backend revision: `79324473cab50871875fc8c7472c440125b277a9`
- Files contract version: `1.0.0`
- OpenAPI SHA-256: `2f93209434783f443f28be35068661c123ee37e402bb0671b43dcd133fe128da`
- Vendored contract:
  `contracts/backend/files-v1/1.0.0/adcendy-files.openapi.json`
- Generated client: `src/generated/files-v1.ts`
- Contract manifest: `config/deployment/files-contract.json`

The files client is generated independently from the authentication/V2
client. Contract drift checks validate both immutable Backend artifacts and
both generated outputs.

## Implemented file behavior

- The Client File Hub lists documents and generated artifacts using only
  `documentId`, `artifactId`, and `downloadUrl`.
- Client UI does not expose upload or manual PDF generation.
- Reviewer and Admin workspaces expose multipart document upload.
- Uploads are limited to one active request, report progress, support
  cancellation, validate the 25 MiB/type UX boundary, include credentials and
  the in-memory access token, and are never retried automatically.
- Reviewer assignment and Admin authorization remain Backend-enforced.
- Downloads request a new authorization for every click, never persist or log
  signed URLs, reject unsafe URL protocols/credentials, and re-authorize once
  when the first authorization is expired or near expiry.
- Document and artifact authorization routes always include both the campaign
  ID and child resource ID; Backend owns the authoritative ownership check.
- Browser navigation preserves object-storage `Content-Disposition` and binary
  response handling.
- Manual PDF generation is exposed only in the Admin campaign workspace,
  queues against an optional selected run, and is not part of the normal
  Client File Hub.

## Accepted Backend precedence

Three product-level recommendations are intentionally resolved in favor of
the published Backend contracts:

1. Refresh cookie scope is `Path=/v1/auth`, not `/`.
2. The public Wave 2 state machine is exactly `QUEUED`, `RUNNING`,
   `BLOCKED_AWAITING_REVIEW`, `COMPLETED`, and `FAILED`; there is no public
   cancel or resume operation.
3. Frontend uses the absolute `expiresAt` returned by Backend and does not
   assume a fixed signed-URL lifetime. Deployment should set
   `DOCUMENT_DOWNLOAD_TTL_SECONDS=300` and
   `ARTIFACT_DOWNLOAD_TTL_SECONDS=300` to meet the approximately five-minute
   product target. Backend defaults remain seven days if those values are not
   supplied.

## Security and release-quality changes

- Safe GET requests may replay once after access-token refresh.
- POST/PUT/PATCH/DELETE requests do not replay automatically unless a stable
  `Idempotency-Key` is present or the caller explicitly opts into a
  Backend-guaranteed replay-safe operation.
- Analytics property sanitization removes authorization, cookie, token,
  signed-URL, download-URL, storage-key, secret, and structured values.
- Analytics page paths are stripped of query strings and fragments.
- Runtime configuration rejects UAT analytics IDs marked as Production and
  Production IDs marked as UAT/staging/test/development.
- Node is pinned to `22.14.0`, npm to `10.9.2`, and `package-lock.json` is the
  sole authoritative lockfile.
- Full TypeScript, ESLint, unit and browser tests, production build, contract drift, bundle
  secret scan, reverse-proxy verification, production dependency audit,
  runtime configuration, SBOM generation, and container gates are active.
- `next.config.mjs` no longer permits TypeScript build errors.

## Verification evidence

Local verification completed on 2026-07-29:

- Contract drift: PASS for Auth/V2 `2.2.0` and Files `1.0.0`
- Unit/contract/security tests: 57 passed, 0 failed
- Chromium integration tests: 3 passed, 0 failed
- TypeScript: PASS
- ESLint: PASS with 0 unsuppressed errors or warnings; new violations fail
- Production build: PASS
- Production dependency audit: 0 vulnerabilities
- Browser bundle scan: 442 files, 0 findings
- Reverse-proxy contract: PASS
- Production runtime configuration: PASS
- UAT runtime configuration: PASS
- Missing deployed runtime configuration: rejected as expected
- SBOM generation: PASS
- Container build: PASS
- UAT-configured container readiness response: HTTP 200 / ready

No UAT environment exists, so this report does not claim UAT or Production
sign-off.

## Remaining external configuration

The analytics provider and its real UAT/Production destination IDs have not
been supplied. The repository now provides redaction and runtime mismatch
guards, but analytics emission remains disabled until the provider-specific
integration and two distinct destination IDs are approved. This does not
block the files implementation or FE-05 code closure; it does block analytics
environment sign-off.

## Superseding files contract 2.0.0 (2026-08-01)

The files slice now exposes only campaign documents. The unused
`StrategyArtifact` single-PDF routes, client adapters, File Hub query, and
manual artifact generator were retired. Complete-kit PDFs are published as
ordinary campaign documents and therefore use the same list and download
operations as uploaded files.

- Current immutable contract:
  `contracts/backend/files-v1/2.0.0/adcendy-files.openapi.json`
- Current operations: list documents, upload a document, and authorize a
  document download.
- Historical contract 1.0.0 remains vendored for auditability but is no
  longer generated or consumed.
