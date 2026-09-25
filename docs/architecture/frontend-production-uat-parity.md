# Frontend Production/UAT Parity

The implemented model is described in
`docs/architecture/frontend-wave-3-environment-safe-deployment.md`. This
document holds the parity rules and the release checklist.

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

## 2. Must remain different

These values/resources must be isolated by environment and supplied outside the immutable frontend artifact:

- application origin (`APP_ORIGIN`, supplied by the deployment);
- Backend, database, Redis, object storage, queues/workers, scheduler, and credentials;
- refresh-cookie host and signing/session material;
- access protection for UAT;
- analytics project/environment;
- error-tracking environment/release routing;
- payment public key and all payment Backend accounts/webhooks;
- public release/environment labels where shown;
- deliberately environment-specific feature-flag values;
- support URL only if policy requires a different UAT destination.

No private value belongs in a browser runtime-config file.

## 3. Runtime configuration

1. No API-origin variable: browser calls use relative `/v1/*` and `/api/v2/*`.
2. Remaining public values come from the allowlisted `/runtime-config.js` (`shared/runtime-config/schema.ts`).
3. Schema, type, allowed hostname, environment, and absence of private names are validated before serving traffic.
4. Only values deliberately classified as public are exposed.
5. Public config is never fetched from a cross-environment shared bucket.

## 4. Same-image promotion

1. Build once with no environment-specific origin or identifier embedded.
2. Hash/archive the build or image.
3. Deploy that digest to UAT with UAT runtime public config.
4. Complete UAT approval.
5. Deploy the identical digest to Production with Production runtime public config.
6. Automatically compare digests and reject a rebuild disguised as promotion (owned by `adcendy-deployment`).

## 5. API-origin rules

- Browser request paths remain relative.
- The reverse proxy routes `/v1/*` and `/api/v2/*` to the environment-local Backend.
- All other paths route to the same environment’s frontend.
- Authentication is same-origin.
- Backend CORS can be disabled or narrowly restricted.

Reject:

- UAT config containing a Production hostname;
- Production config containing UAT/staging/localhost;
- localhost fallback in any deployed mode;
- arbitrary scheme, credentials in URL, non-HTTPS, or private/internal hostnames in browser config;
- redirects/callbacks outside a same-origin relative-path allowlist.

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

## 7. Feature-flag parity

- Flag names, types, defaults, evaluation code, and ownership must be identical.
- Differences in values must be explicit, time-bounded, and recorded.
- Security/authorization behavior must never depend only on a public flag.
- UAT-only debug UI must not be present in Production execution.
- Production candidate testing must include the intended Production flag set before promotion.

## 8. Error/analytics environment separation

- distinct UAT and Production analytics projects/streams;
- distinct error-tracking environments, with a shared immutable release ID;
- no auth headers, access/refresh tokens, signed URLs, passwords, OTPs, or sensitive wizard payloads;
- URL/query redaction for tracking IDs and user-provided redirect parameters where policy requires;
- no UAT events in Production dashboards or Production events in UAT;
- sampling and retention policies explicitly approved.

## 9. Secret-exposure controls

Build and deploy controls must:

1. Reject prohibited variable names in all `NEXT_PUBLIC_*`, runtime config, static files, and source maps.
2. Reject common credential formats and private/internal URLs without printing full values.
3. Compare only redacted fingerprints when checking environment inputs.
4. Treat public payment IDs and public DSNs as public, never their secrets.
5. Prevent `.env.local` from silently overriding release configuration.
6. Ensure runtime config responses are non-cacheable across hostnames or keyed safely by host.
7. Restrict source-map access or keep browser maps disabled.
8. Scan HTML, JS, CSS, manifests, maps, and server-rendered bootstrap payloads.

## 10. Approval checklist

### UAT

- [ ] Same-origin relative routes only.
- [ ] UAT runtime validation rejects Production and localhost targets.
- [ ] No access/refresh token in persistent browser storage.
- [ ] Refresh cookie attributes and CSRF controls pass automated checks.
- [ ] No actor/authority fields sent on normal actions.
- [ ] Cross-owner and cross-reviewer negative tests pass.
- [ ] Run start routes by a stable run ID.
- [ ] Complete status rendering, stop conditions, visibility/backoff, reconnect, and reload pass.
- [ ] Retry is dedicated and idempotent.
- [ ] Upload/download ownership, expiry, refresh, and non-persistence tests pass.
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
- [ ] Source-map publication policy is verified at deployment level.
- [ ] Rollback points to a previously approved immutable artifact and compatible runtime config.
- [ ] Security, Backend, Frontend, Infrastructure, and Product owners have signed off.
