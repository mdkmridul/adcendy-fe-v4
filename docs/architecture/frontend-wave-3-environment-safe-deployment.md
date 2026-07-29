# Frontend Wave 3 — Environment-safe deployment

## Status

Frontend implementation is complete and locally verified against the Backend
Wave 3 contract. This is implementation readiness; it is not UAT or Production
deployment sign-off.

FE-01 and FE-06 can be closed as implementation defects. Their operational
acceptance remains contingent on deploying the reference topology, approving
the UAT image, and promoting that exact image digest to Production.

## Contract baseline

- Backend revision: `65a37c342e763a7c23eb126c78eae380dd8b0fb6`
- OpenAPI version: `2.2.0`
- OpenAPI SHA-256:
  `f47bdda74803612e550cb21dd6c61e3793d5e64d10c0d0f3765615fb18694aa3`
- Package manager: npm with `package-lock.json`
- Frontend runtime: Node.js `22.14.0`, port `3000`
- UAT origin: `https://uat.adcendy.com`
- Production origin: `https://app.adcendy.com`

The pinned machine-readable contract is in
`config/deployment/backend-contract.json`. `npm run gen:api:check` verifies the
generated client against its recorded checksum.

## Implemented deployment model

Browser API calls are relative and same-origin:

- `/v1/*` routes to the environment-local Backend;
- `/api/v2/*` routes to the environment-local Backend;
- every other public path routes to the Frontend;
- the Backend path and query string are passed unchanged.

No API origin is compiled into the browser bundle. The proxy must preserve
methods, request bodies, authentication/cookie/origin/idempotency headers,
Backend status codes, and the response headers listed in
`config/deployment/frontend-proxy-contract.v1.json`. Backend health routes are
not public.

`deploy/nginx/adcendy.conf.template` is an executable reference implementation,
not a claim that the external ingress has been deployed. `npm run proxy:verify`
tests it against isolated Frontend and Backend mock containers.

## Runtime public configuration

`/runtime-config.js` is rendered at request time with `Cache-Control: no-store`
and is loaded before interactive application code. The exact allowlist is:

- `APP_ENV`
- `RELEASE_ID`
- `PUBLIC_ERROR_DSN`
- `RAZORPAY_KEY_ID`
- `PUBLIC_ANALYTICS_ID`
- `FEATURE_FLAGS`
- `SUPPORT_URL`

No item is required except `APP_ENV` and `RELEASE_ID` in deployed
environments. API origins are deliberately absent. The validator rejects:

- `NEXT_PUBLIC_*` values and unknown `PUBLIC_*` names;
- unknown or non-boolean feature flags;
- debug, API logging, or mock-data flags outside local development;
- non-HTTPS, credential-bearing, or localhost URLs when deployed;
- Production hostnames in UAT and UAT/staging hostnames in Production;
- live payment keys in UAT and test payment keys in Production;
- private-looking or malformed opaque public values;
- a UAT configuration served from the Production origin, or vice versa.

Run startup validation with:

```powershell
$env:APP_ENV = "uat"
$env:RELEASE_ID = "<immutable-release-id>"
npm run env:check
```

## Container and promotion

The multi-stage `Dockerfile` builds a Next.js standalone image on Node
`22.14.0-alpine`, runs as a non-root user, exposes port `3000`, and includes a
readiness health check. Startup fails before the server accepts traffic when
runtime configuration is invalid.

CI builds the application and container once. The same image can then be
started with UAT or Production runtime values. The promotion workflow accepts
only immutable `@sha256:` image references and rejects mutable tags, malformed
references, or unequal digests. It performs no rebuild.

Operational sequence:

1. Build and publish one immutable image.
2. Deploy that digest to UAT with UAT-only runtime configuration.
3. Record UAT approval against that digest.
4. Pass the approved UAT reference and Production candidate to the promotion
   gate.
5. Deploy the identical digest to Production with Production-only runtime
   configuration.

## Security and verification gates

CI performs:

- locked npm installation and a high-severity Production dependency audit;
- Backend contract checksum/drift verification;
- Wave 1–3 tests and scoped TypeScript checks;
- UAT and Production runtime validation;
- one immutable application build and a browser-bundle scan;
- proxy behavior verification;
- one container build, validated with both environment configurations;
- CycloneDX 1.5 Production dependency SBOM generation;
- release evidence publication.

Browser source maps are disabled. The bundle scan rejects build-time public
variable names, known environment API origins, Backend localhost origins,
private-key headers, compact JWTs, and AWS access-key identifiers.

The Production dependency tree has no known audit findings. The development
toolchain still reports transitive high-severity findings below
`openapi-typescript`/Redocly; those packages are not copied into the standalone
runtime image. Attempts to force incompatible transitive versions break
OpenAPI generation, so this remains an explicitly recorded development-only
dependency update.

Repository-wide TypeScript checking still includes pre-existing failures
outside the completed waves. `typecheck:wave1`, `typecheck:wave2`, and
`typecheck:wave3` are the scoped implementation gates.

## Local verification evidence

Verified on 2026-07-29:

| Gate | Result |
|---|---|
| `npm test` | PASS — 40 passed, 0 failed |
| Wave 1, Wave 2, and Wave 3 scoped TypeScript checks | PASS |
| `npm run gen:api:check` | PASS — revision, version, and SHA-256 matched |
| UAT and Production runtime fixtures | PASS |
| Production→UAT and UAT→localhost negative fixtures | PASS — rejected |
| `npm run build` | PASS — Next.js 16.2.12 |
| `npm run bundle:scan` | PASS — 442 browser-delivered files, 0 findings |
| `npm run proxy:verify` | PASS — routes, requests, responses, health privacy, and fallback |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run sbom:generate` | PASS — CycloneDX 1.5, 205 Production components |
| `docker build` | PASS — Linux/amd64 standalone image |
| Missing deployed runtime configuration | PASS — startup rejected |
| Same local image with UAT and Production config | PASS — both ready, same image ID |
| Runtime endpoint | PASS — HTTP 200, `no-store`, correct origin guard |
| `git diff --check` | PASS |

The locally built validation image ID was
`sha256:997303095477af242e0809c1c8db675b837f1d21cf9fda56cd91fd76a7bd0934`.
This is local evidence only, not a registry digest or a UAT-approved release.
