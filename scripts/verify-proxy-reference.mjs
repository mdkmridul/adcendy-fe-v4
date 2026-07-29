import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const containerName = 'adcendy-fe-proxy-contract-check';
const upstreamContainerName = 'adcendy-fe-proxy-upstream-check';
const networkName = 'adcendy-fe-proxy-contract-network';
const proxyPort = 39000;
const backendPort = 39001;

function docker(args, options = {}) {
  return spawnSync('docker', args, {
    encoding: 'utf8',
    ...options,
  });
}

async function waitForProxy() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${proxyPort}/`);
      if (response.ok) return;
    } catch {
      // Container is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Nginx proxy did not become ready.');
}

let temporaryDirectory;
try {
  const template = fs.readFileSync(
    new URL('../deploy/nginx/adcendy.conf.template', import.meta.url),
    'utf8',
  );
  const rendered = template
    .replaceAll('${PUBLIC_HOST}', 'app.adcendy.com')
    .replaceAll('${PUBLIC_SCHEME}', 'https')
    .replaceAll(
      '${BACKEND_UPSTREAM}',
      `http://${upstreamContainerName}:${backendPort}`,
    )
    .replaceAll(
      '${FRONTEND_UPSTREAM}',
      `http://${upstreamContainerName}:${backendPort}`,
    );
  temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'adcendy-proxy-contract-'),
  );
  const nginxConfigPath = path.join(temporaryDirectory, 'nginx.conf');
  fs.writeFileSync(
    nginxConfigPath,
    `events {}\nhttp {\n${rendered}\n}`,
    'utf8',
  );

  docker(['rm', '-f', containerName, upstreamContainerName]);
  docker(['network', 'rm', networkName]);
  const network = docker(['network', 'create', networkName]);
  if (network.status !== 0) {
    throw new Error(network.stderr || 'Unable to create proxy test network.');
  }

  const mockServer = [
    'const http=require("node:http");',
    `http.createServer((request,response)=>{`,
    `if(request.url==="/runtime-config.js"){response.writeHead(200,{"Content-Type":"text/plain"});response.end("frontend");return;}`,
    'const chunks=[];request.on("data",chunk=>chunks.push(chunk));request.on("end",()=>{',
    'response.writeHead(202,{"Content-Type":"application/json","Cache-Control":"no-store","Retry-After":"7","X-Request-Id":"backend-request-id","Set-Cookie":"adcendy_refresh=opaque; HttpOnly; Secure; Path=/v1/auth; SameSite=Lax","Content-Disposition":"attachment; filename=\\"contract.json\\"","Location":"/api/v2/pipeline/runs/run-1"});',
    'response.end(JSON.stringify({method:request.method,url:request.url,body:Buffer.concat(chunks).toString("utf8"),headers:request.headers}));',
    `});}).listen(${backendPort},"0.0.0.0");`,
  ].join('');
  const upstream = docker([
    'run',
    '--detach',
    '--name',
    upstreamContainerName,
    '--network',
    networkName,
    'node:22-alpine',
    'node',
    '-e',
    mockServer,
  ]);
  if (upstream.status !== 0) {
    throw new Error(upstream.stderr || 'Unable to start mock upstream.');
  }

  const started = docker([
    'run',
    '--detach',
    '--name',
    containerName,
    '--network',
    networkName,
    '--publish',
    `${proxyPort}:8080`,
    '--volume',
    `${nginxConfigPath}:/etc/nginx/nginx.conf:ro`,
    'nginx:alpine',
  ]);
  if (started.status !== 0) {
    throw new Error(started.stderr || 'Unable to start Nginx.');
  }

  await waitForProxy();

  const response = await fetch(
    `http://127.0.0.1:${proxyPort}/api/v2/contract-check?mode=active`,
    {
      method: 'POST',
      headers: {
        Host: 'app.adcendy.com',
        Authorization: 'Bearer memory-only-token',
        Cookie: 'adcendy_refresh=opaque',
        Origin: 'https://app.adcendy.com',
        Referer: 'https://app.adcendy.com/app',
        'Idempotency-Key': 'adcendy-contract-check-123',
        'X-Request-Id': 'frontend-request-id',
        'CF-Connecting-IP': '203.0.113.10',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaignId: 'campaign-1' }),
      redirect: 'manual',
    },
  );
  const echoed = await response.json();

  assert.equal(response.status, 202);
  assert.equal(response.headers.get('retry-after'), '7');
  assert.equal(response.headers.get('x-request-id'), 'backend-request-id');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('location'), '/api/v2/pipeline/runs/run-1');
  assert.match(response.headers.get('set-cookie') ?? '', /adcendy_refresh=/);
  assert.equal(echoed.method, 'POST');
  assert.equal(echoed.url, '/api/v2/contract-check?mode=active');
  assert.equal(echoed.headers.authorization, 'Bearer memory-only-token');
  assert.equal(echoed.headers.cookie, 'adcendy_refresh=opaque');
  assert.equal(echoed.headers.origin, 'https://app.adcendy.com');
  assert.equal(echoed.headers.referer, 'https://app.adcendy.com/app');
  assert.equal(echoed.headers['idempotency-key'], 'adcendy-contract-check-123');
  assert.equal(echoed.headers['x-forwarded-proto'], 'https');
  assert.equal(echoed.headers['x-forwarded-host'], 'app.adcendy.com');
  assert.equal(echoed.headers['x-forwarded-for'], '203.0.113.10');
  assert.equal(echoed.headers.forwarded, undefined);

  const privateProbe = await fetch(
    `http://127.0.0.1:${proxyPort}/v1/health/ready`,
    { headers: { Host: 'app.adcendy.com' } },
  );
  assert.equal(privateProbe.status, 404);

  const frontendResponse = await fetch(
    `http://127.0.0.1:${proxyPort}/runtime-config.js`,
    { headers: { Host: 'app.adcendy.com' } },
  );
  assert.equal(await frontendResponse.text(), 'frontend');

  console.log(
    JSON.stringify({
      valid: true,
      statusPreserved: true,
      headersPreserved: true,
      requestPreserved: true,
      healthRoutesPrivate: true,
      frontendFallback: true,
    }),
  );
} finally {
  docker(['rm', '-f', containerName, upstreamContainerName]);
  docker(['network', 'rm', networkName]);
  if (temporaryDirectory) {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}
