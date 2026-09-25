import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

const proxyContract = JSON.parse(
  read('config/deployment/frontend-proxy-contract.v1.json'),
);

test('pins the current Backend working tree and OpenAPI checksum', () => {
  const backendContract = JSON.parse(
    read('config/deployment/backend-contract.json'),
  );
  assert.equal(
    backendContract.backendRevision,
    'working-tree@69a3fabe61a64979478971b6c7501622bc381213',
  );
  assert.equal(backendContract.openApiVersion, '2.5.0');
  assert.equal(
    backendContract.openApiSha256,
    '47562440e21a0a7d0434ab1b6f03cfc74b0e761368345c90e64c3c193394c6a4',
  );
  assert.match(
    read('src/generated/openapi.ts'),
    new RegExp(backendContract.openApiSha256),
  );
});

test('routes both API prefixes unchanged and all other traffic to FE', () => {
  assert.deepEqual(proxyContract.externalRoutes, [
    { path: '/v1/*', upstream: 'backend', upstreamPath: 'unchanged' },
    { path: '/api/v2/*', upstream: 'backend', upstreamPath: 'unchanged' },
    { path: '/monitoring/errors', upstream: 'error-reporting', upstreamPath: 'configured-envelope-endpoint' },
    { path: '/*', upstream: 'frontend', upstreamPath: 'unchanged' },
  ]);
  assert.equal(proxyContract.errorReporting.forwardCookie, false);
  assert.equal(proxyContract.errorReporting.forwardAuthorization, false);
  assert.deepEqual(proxyContract.errorReporting.methods, ['POST']);
});

test('requires forwarding, cookie, idempotency, and response preservation', () => {
  assert.equal(proxyContract.requestPreservation.cookie, true);
  assert.equal(proxyContract.requestPreservation.origin, true);
  assert.equal(proxyContract.requestPreservation.referer, true);
  assert.equal(proxyContract.requestPreservation.idempotencyKey, true);
  assert.equal(
    proxyContract.requestPreservation.automaticMutationRetries,
    false,
  );
  for (const header of ['Set-Cookie', 'Retry-After', 'X-Request-Id']) {
    assert.ok(proxyContract.responsePreservation.headers.includes(header));
  }
  assert.equal(proxyContract.responsePreservation.streaming, true);
});

test('keeps Backend probes private and runtime config non-cacheable', () => {
  assert.deepEqual(proxyContract.privateRoutes, [
    '/v1/health/live',
    '/v1/health/ready',
  ]);
  assert.equal(proxyContract.runtimeConfig.path, '/runtime-config.js');
  assert.equal(proxyContract.runtimeConfig.cacheControl, 'no-store');
});

test('handwritten and generated API clients use same-origin paths', () => {
  const httpClient = read('shared/api/http.ts');
  const typedClient = read('src/lib/api/client.ts');
  assert.match(httpClient, /fetch\('\/v1\/auth\/refresh'/);
  assert.match(httpClient, /let url = path;/);
  assert.doesNotMatch(httpClient, /API\.baseURL/);
  assert.match(typedClient, /baseUrl: ''/);
});

test('standalone container starts only after runtime validation', () => {
  const nextConfig = read('next.config.mjs');
  const dockerfile = read('Dockerfile');
  assert.match(nextConfig, /output: 'standalone'/);
  assert.match(nextConfig, /productionBrowserSourceMaps: false/);
  assert.match(nextConfig, /Content-Security-Policy/);
  assert.match(nextConfig, /connect-src 'self'/);
  assert.match(dockerfile, /^ARG NODE_VERSION=22\.14\.0$/m);
  assert.match(dockerfile, /FROM node:\$\{NODE_VERSION\}-alpine AS runner/);
  assert.match(dockerfile, /USER nextjs/);
  assert.match(dockerfile, /validate-runtime-config\.ts/);
  assert.match(dockerfile, /\/health\/ready/);
});
