import fs from 'node:fs';
import path from 'node:path';

const packageJson = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const expectedNode = packageJson.engines.node.replace('.x', '.0');
const expectedNpm = packageJson.packageManager.replace('npm@', '');
const actualNode = process.version.replace(/^v/, '');
const npmUserAgent = process.env.npm_config_user_agent ?? '';
const npmExecPath = process.env.npm_execpath;
let actualNpm = null;

if (npmExecPath) {
  try {
    const npmPackage = JSON.parse(
      fs.readFileSync(
        path.resolve(path.dirname(npmExecPath), '../package.json'),
        'utf8',
      ),
    );
    if (npmPackage.name === 'npm') actualNpm = npmPackage.version;
  } catch {
    // Fall back to the user-agent below.
  }
}

actualNpm ??= npmUserAgent.match(/\bnpm\/([^\s]+)/)?.[1] ?? null;

const failures = [];

if (actualNode !== expectedNode) {
  failures.push(`Node ${expectedNode} is required; found ${actualNode}.`);
}

if (!actualNpm) {
  failures.push(
    'Run this check through npm so the package-manager version can be verified.',
  );
} else if (actualNpm !== expectedNpm) {
  failures.push(`npm ${expectedNpm} is required; found ${actualNpm}.`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Toolchain verified: Node ${actualNode}, npm ${actualNpm}.`);
