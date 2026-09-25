# Frontend Wave 3 — Environment-safe deployment

## Contract baseline

The pinned Backend contract (revision, version, checksums) lives only in
`config/deployment/backend-contract.json`; `npm run gen:api:check` verifies the
generated client against it. The origin a deployment serves from is runtime
configuration (`APP_ORIGIN`), supplied by the deployment, never compiled in.

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

The proxy that implements this contract is Caddy in the `adcendy-deployment`
repository (`proxy/Caddyfile`, `proxy/Caddyfile.tunnel`).

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

`APP_ENV` and `APP_ORIGIN` are always required and have no default. Deployed
environments also require `RELEASE_ID` and `SUPPORT_URL` (an HTTPS page or a single `mailto:`
address). API origins are deliberately absent. The validator rejects:

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
started with UAT or Production runtime values. Promoting that image by digest
(and refusing a rebuild disguised as promotion) belongs to the
`adcendy-deployment` repository.

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

Full `npm run typecheck`, the ESLint suppression baseline, and Chromium
integration tests against the Production build are also mandatory gates.
