import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const nvmrc = readFileSync('.nvmrc', 'utf8').trim();

test('.nvmrc is the one Node version: engines, Dockerfile and workflows follow it', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.engines.node.replace('.x', '.0'), nvmrc);

  const dockerfile = readFileSync('Dockerfile', 'utf8');
  assert.match(dockerfile, new RegExp(`^ARG NODE_VERSION=${nvmrc.replaceAll('.', '\\.')}$`, 'm'));
  assert.doesNotMatch(dockerfile, /FROM node:\d/, 'every stage uses ${NODE_VERSION}');

  const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
  assert.doesNotMatch(ci, /node-version:\s*\d/, 'ci.yml pins Node inline');
  assert.match(ci, /node-version-file: \.nvmrc/);
});

test('the container health check follows PORT instead of a fixed port', () => {
  const dockerfile = readFileSync('Dockerfile', 'utf8');
  assert.match(dockerfile, /127\.0\.0\.1:\$\{PORT\}\/health\/ready/);
});
