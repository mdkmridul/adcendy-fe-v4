# Frontend Wave 4 — Files and quality gates

## Contract baseline

The files contract is pinned in `config/deployment/files-contract.json`
(version, checksums, and the vendored spec under `contracts/backend/files-v1/`);
the generated client is `src/generated/files-v1.ts`. It is generated
independently from the authentication/V2 client, and `npm run gen:api:check`
validates both.

The files slice exposes only campaign documents: list, upload, and authorize a
download. Complete-kit PDFs are published as ordinary campaign documents.

## Implemented file behavior

- The Client File Hub lists documents using only `documentId` and
  `downloadUrl`.
- Client UI does not expose upload or manual PDF generation.
- Reviewer and Admin workspaces expose multipart document upload.
- Uploads are limited to one active request, report progress, support
  cancellation, validate the 25 MiB/type UX boundary, include credentials and
  the in-memory access token, and are never retried automatically.
- Reviewer assignment and Admin authorization remain Backend-enforced.
- Downloads request a new authorization for every click, never persist or log
  signed URLs, reject unsafe URL protocols/credentials, and re-authorize once
  when the first authorization is expired or near expiry.
- Document authorization routes always include both the campaign ID and the
  document ID; Backend owns the authoritative ownership check.
- Browser navigation preserves object-storage `Content-Disposition` and binary
  response handling.

## Accepted Backend precedence

Three product-level recommendations are intentionally resolved in favor of
the published Backend contracts:

1. Refresh cookie scope is `Path=/v1/auth`, not `/`.
2. The public Wave 2 state machine is exactly `QUEUED`, `RUNNING`,
   `BLOCKED_AWAITING_REVIEW`, `COMPLETED`, and `FAILED`; there is no public
   cancel or resume operation.
3. Frontend uses the absolute `expiresAt` returned by Backend and does not
   assume a fixed signed-URL lifetime; the TTL is Backend deployment
   configuration.

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
- Node and npm versions are pinned in `package.json` (enforced by
  `npm run toolchain:check`), and `package-lock.json` is the sole lockfile.
- `next.config.mjs` does not permit TypeScript build errors.
- Analytics emission stays disabled until a provider and distinct
  UAT/Production destination IDs are approved; redaction and mismatch guards
  are already active.
