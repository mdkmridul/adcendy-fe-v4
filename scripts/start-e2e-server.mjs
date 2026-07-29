import { spawn } from 'node:child_process';
import fs from 'node:fs';

const environment = { ...process.env };

const retiredPublicKeys = [
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_API_MODE',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_DATA_SOURCE',
  'NEXT_PUBLIC_ENABLE_API_LOGGING',
  'NEXT_PUBLIC_ENABLE_DEBUG_PANEL',
];

for (const key of retiredPublicKeys) {
  // A process-level blank value prevents Next.js from reloading the retired
  // key from a developer's ignored .env files. Blank values are not public
  // configuration and remain absent from the serialized runtime contract.
  environment[key] = '';
}

Object.assign(environment, {
  APP_ENV: 'local',
  DATA_SOURCE: 'mock',
  RELEASE_ID: 'e2e-local',
});

const productionMode = process.env.E2E_PRODUCTION === 'true';
let executable = process.execPath;
let argumentsForServer;

if (productionMode) {
  fs.cpSync('.next/static', '.next/standalone/.next/static', {
    recursive: true,
  });
  fs.cpSync('public', '.next/standalone/public', { recursive: true });
  Object.assign(environment, {
    HOSTNAME: '127.0.0.1',
    PORT: '34100',
  });
  argumentsForServer = ['.next/standalone/server.js'];
} else {
  argumentsForServer = [
    'node_modules/next/dist/bin/next',
    'dev',
    '--hostname',
    '127.0.0.1',
    '--port',
    '34100',
  ];
}

const child = spawn(
  executable,
  argumentsForServer,
  {
    env: environment,
    stdio: 'inherit',
  },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
