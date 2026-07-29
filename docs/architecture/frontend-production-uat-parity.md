# Frontend Production/UAT Parity

> Wave 3 update (2026-07-29): the required parity model is implemented. API
> calls are relative, public values are runtime allowlisted, a standalone
> container and reference proxy contract exist, bundle and proxy checks run in
> CI, and the promotion gate requires identical immutable image digests. The
> “current status” and “current gap” passages below are retained as the
> pre-implementation assessment baseline. See
> `docs/architecture/frontend-wave-3-environment-safe-deployment.md` for the
> implemented state and remaining operational acceptance.

## 1. Must remain identical

The following should be byte-for-byte identical between an approved UAT candidate and Production:

- frontend image or immutable build artifact digest;
- application source, Next.js server/static output, and dependency tree;
- route set and reverse-proxy path rules;
- authentication, refresh, logout, CSRF, and authorization code;
- run state machine, polling/backoff, retry/resume semantics;
- upload/download client behavior and validation UX;
- public configuration schema and validation code;
- Content Security Policy and other frontend security headers, except host allowlist values that must be runtime data;
- source-map generation policy;
- tests and bundle-scanning rules.

Current status: **REQUIRES CHANGE.** CI builds a staging-bound `.next` artifact and there is no promotion workflow (`.github/workflows/ci.yml:53-63`).

## 2. Must remain different

These values/resources must be isolated by environment and supplied outside the immutable frontend artifact:

- application hostname: Production `https://app.adcendy.com`; UAT `https://uat.adcendy.com` (**EXTERNAL DECISION**);
- Backend, database, Redis, object storage, queues/workers, scheduler, and credentials;
- refresh-cookie host and signing/session material;
- Cloudflare Access protection for UAT;
- analytics project/environment;
- error-tracking environment/release routing;
- payment public key and all payment Backend accounts/webhooks;
- public release/environment labels where shown;
- deliberately environment-specific feature-flag values;
- support URL only if policy requires a different UAT destination.

No private value belongs in a browser runtime-config file.

## 3. Build-time versus runtime configuration

Current model:

- `lib/env.ts:8-43` reads six `NEXT_PUBLIC_*` names.
- Next.js substitutes those expressions during build.
- working-copy Production and staging files contain different absolute API origins.
- all `.env*` files are ignored by `.gitignore:20`, so they are not a deployable configuration contract.
- `validateEnvironment()` is defined but not called (`lib/env.ts:66-81`).

Required model:

1. Prefer no API-origin variable: use relative `/v1/*` and `/api/v2/*`.
2. For the remaining public values, use an allowlisted server-runtime source or a generated `/runtime-config.js`/JSON served at startup.
3. Validate schema, type, allowed hostname, environment, and absence of private names before serving traffic.
4. Expose only values deliberately classified as public.
5. Never fetch public config from a cross-environment shared bucket.

Suggested public schema:

```yaml
APP_ENV: production | uat
RELEASE_ID: immutable release identifier
API_BASE_URL: "" # preferably empty/same-origin
PUBLIC_ERROR_DSN: optional public DSN
RAZORPAY_KEY_ID: optional public payment key
PUBLIC_ANALYTICS_ID: environment-specific public identifier
FEATURE_FLAGS: deliberately public allowlisted flags
SUPPORT_URL: reviewed HTTPS URL
```

## 4. Same-image promotion feasibility

Current feasibility: **false**.

Evidence:

- CI injects a staging API origin while building and uploads `.next` (`.github/workflows/ci.yml:53-63`).
- a fresh local Production build embedded the Production API origin in one browser asset.
- no Dockerfile, runtime config loader, or server-side runtime config module exists.

Promotion exit criteria:

1. Build once with no environment-specific origin or identifier embedded.
2. Hash/archive the build or image.
3. Deploy that digest to UAT with UAT runtime public config.
4. Complete UAT approval.
5. Deploy the identical digest to Production with Production runtime public config.
6. Automatically compare digests and reject a rebuild disguised as promotion.

## 5. API-origin rules

Preferred:

- Browser request paths remain relative.
- Cloudflare/reverse proxy routes `/v1/*` and `/api/v2/*` to the environment-local Backend.
- All other paths route to the same environment’s frontend.
- Authentication is same-origin.
- Backend CORS can be disabled or narrowly restricted.

Mandatory runtime checks:

| Environment | Allowed browser origin | Allowed API target |
|---|---|---|
| UAT | `https://uat.adcendy.com` | same origin only, or an explicitly allowlisted UAT API host |
| Production | `https://app.adcendy.com` | same origin only, or an explicitly allowlisted Production API host |

Reject:

- UAT config containing a Production hostname;
- Production config containing UAT/staging/localhost;
- localhost fallback in any deployed mode;
- arbitrary scheme, credentials in URL, non-HTTPS, or private/internal hostnames in browser config;
- redirects/callbacks outside a same-origin relative-path allowlist.

Current gap: `ENV.API.baseURL` accepts any string and falls back to localhost (`lib/env.ts:21-33`); the unused validator checks only presence.

## 6. Authentication/cookie parity

UAT must exercise the exact Production auth code and cookie policy:

- access token stays in memory;
- refresh token is HttpOnly, Secure, host-only, and has the reviewed SameSite/Path/expiry;
- refresh endpoint receives the cookie and rotates the token;
- refresh replay revokes the correct family;
- logout revokes the current session;
- logout-all/password reset/account disable revokes all required sessions;
- Origin/Referer and CSRF behavior is identical;
- concurrent 401 handling is identical;
- cross-tab behavior is secure.

Only cookie host/domain values and Backend session stores differ.

Current gap: both tokens are stored in `localStorage` (`features/auth/auth.ts:13-56`), and fetch never includes cookie credentials.

## 7. Feature-flag parity

- Flag names, types, defaults, evaluation code, and ownership must be identical.
- Differences in values must be explicit, time-bounded, and recorded.
- Security/authorization behavior must never depend only on a public flag.
- UAT-only debug UI must not be present in Production execution.
- Production candidate testing must include the intended Production flag set before promotion.

Current public flags:

- data source/mode aliases;
- debug panel;
- API logging.

Current gaps:

- aliases expand ambiguity;
- the working-copy staging config enables API logging;
- there is no runtime schema or flag manifest;
- `ApiDebugPanel` is globally mounted, although its `NODE_ENV` check prevents display in a normal production build (`app/layout.tsx:59`; `components/dev/api-debug-panel.tsx:23-54`).

## 8. Error/analytics environment separation

Required:

- distinct UAT and Production analytics projects/streams;
- distinct error-tracking environments, with a shared immutable release ID;
- no auth headers, access/refresh tokens, signed URLs, passwords, OTPs, or sensitive wizard payloads;
- URL/query redaction for tracking IDs and user-provided redirect parameters where policy requires;
- no UAT events in Production dashboards or Production events in UAT;
- sampling and retention policies explicitly approved.

Current status:

- Vercel Analytics is globally mounted (`app/layout.tsx:4,60`);
- no repository-visible analytics ID/environment selection exists;
- no error-tracking integration exists;
- redaction and deployed project routing are **OPEN QUESTIONS**.

## 9. Production/UAT secret-exposure controls

Build and deploy controls must:

1. Reject prohibited variable names in all `NEXT_PUBLIC_*`, runtime config, static files, and source maps.
2. Reject common credential formats and private/internal URLs without printing full values.
3. Compare only redacted fingerprints when checking environment inputs.
4. Treat public payment IDs and public DSNs as public, never their secrets.
5. Prevent `.env.local` from silently overriding release configuration.
6. Ensure runtime config responses are non-cacheable across hostnames or keyed safely by host.
7. Restrict source-map access or keep browser maps disabled.
8. Scan HTML, JS, CSS, manifests, maps, and server-rendered bootstrap payloads.

Assessed-build result:

- 112 `.next/static` files;
- zero source maps;
- zero detected prohibited variable names;
- zero detected AWS access-key IDs, private-key headers, or compact JWT patterns;
- Production API origin embedded as expected under the current build-time design.

This is a one-time observation, not a permanent guarantee.

## 10. Automatic parity checks

Add blocking CI/release checks:

1. `typecheck`, lint, unit, integration, and mocked/local E2E tests.
2. Generate OpenAPI from an immutable version or checked artifact; reject diffs.
3. Build once and record digest/SBOM.
4. Redacted bundle/source-map secret scan.
5. Enumerate public config keys and reject anything outside the allowlist.
6. Start the same artifact twice with UAT and Production fixture configs.
7. Assert UAT rejects Production API/storage/analytics values.
8. Assert Production rejects UAT/staging/localhost values.
9. Run auth cookie/header checks against isolated test services.
10. Run cross-owner campaign/upload/download tests.
11. Run run-resume/retry idempotency tests.
12. Compare route manifest and static asset hashes between promoted environments.
13. Verify UAT Cloudflare Access and Production public-access policy separately.
14. Verify analytics/error environment routing with synthetic, non-sensitive events.

## 11. Current repository gaps

- Absolute, build-time API origins; no relative proxy strategy.
- No runtime-config loader or schema.
- No Docker/deployment/reverse-proxy evidence.
- No UAT/Production origin deny rules.
- Cookie auth is not implemented.
- Generated OpenAPI is stale/incomplete for V2.
- Type-check fails; Production build ignores type errors.
- CI Node 18 is below the installed Next.js engine requirement.
- Lint script exists but ESLint is absent.
- Two package-manager lockfiles create reproducibility ambiguity.
- Upload is absent.
- Analytics environment/redaction controls are not evidenced.
- No Phase 0 test suite.

## 12. Approval checklist

### UAT

- [ ] FE-01 uses same-origin relative routes or an approved equivalent.
- [ ] UAT runtime validation rejects Production and localhost targets.
- [ ] FE-02 stores no access/refresh token in persistent browser storage.
- [ ] Refresh cookie attributes and CSRF controls pass automated checks.
- [ ] FE-03 sends no normal-action actor authority fields.
- [ ] Cross-owner and cross-reviewer negative tests pass.
- [ ] FE-04 V2 start returns and routes by a stable tracking ID.
- [ ] Complete status rendering, stop conditions, visibility/backoff, reconnect, and reload pass.
- [ ] Retry/resume is dedicated and idempotent.
- [ ] Upload implementation and tests pass, or upload is formally out of UAT scope.
- [ ] Download ownership, expiry, refresh, and non-persistence tests pass.
- [ ] Generated contract is current and type-check is green.
- [ ] Lint and all required tests are blocking.
- [ ] Bundle/public-config scan passes.
- [ ] UAT analytics/error destinations are isolated.

### Production promotion

- [ ] The UAT-approved artifact digest is unchanged.
- [ ] Production runtime config passes allowlist and rejects UAT/staging/localhost.
- [ ] Production uses isolated Backend/data/Redis/storage/accounts/credentials.
- [ ] Production refresh cookie is host-only for the Production app origin.
- [ ] Production analytics/error destinations and redaction are verified.
- [ ] Source-map publication policy is verified at CDN/deployment level.
- [ ] Rollback points to a previously approved immutable artifact and compatible runtime config.
- [ ] Security, Backend, Frontend, Infrastructure, and Product owners have signed off.
