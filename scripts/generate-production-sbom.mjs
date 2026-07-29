import crypto from 'node:crypto';
import fs from 'node:fs';

const lock = JSON.parse(
  fs.readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'),
);
const root = lock.packages?.[''] ?? {};

function packageNameFromPath(packagePath) {
  const marker = 'node_modules/';
  const index = packagePath.lastIndexOf(marker);
  if (index < 0) return packagePath;
  const segments = packagePath.slice(index + marker.length).split('/');
  return segments[0]?.startsWith('@')
    ? `${segments[0]}/${segments[1]}`
    : segments[0];
}

function packageUrl(name, version) {
  const encodedName = name.startsWith('@')
    ? `${encodeURIComponent(name.split('/')[0])}/${encodeURIComponent(name.split('/')[1])}`
    : encodeURIComponent(name);
  return `pkg:npm/${encodedName}@${encodeURIComponent(version)}`;
}

const components = Object.entries(lock.packages ?? {})
  .filter(
    ([packagePath, metadata]) =>
      packagePath !== '' &&
      packagePath.includes('node_modules/') &&
      metadata.version &&
      metadata.dev !== true,
  )
  .map(([packagePath, metadata]) => {
    const name = packageNameFromPath(packagePath);
    return {
      type: 'library',
      name,
      version: metadata.version,
      purl: packageUrl(name, metadata.version),
      properties: [
        {
          name: 'adcendy:package-lock-path',
          value: packagePath,
        },
      ],
    };
  })
  .sort((left, right) =>
    `${left.name}@${left.version}`.localeCompare(
      `${right.name}@${right.version}`,
    ),
  );

const lockChecksum = crypto
  .createHash('sha256')
  .update(fs.readFileSync(new URL('../package-lock.json', import.meta.url)))
  .digest('hex');

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  version: 1,
  metadata: {
    component: {
      type: 'application',
      name: root.name ?? 'adcendy-frontend',
      version: root.version ?? '0.0.0',
    },
    properties: [
      {
        name: 'adcendy:package-lock-sha256',
        value: lockChecksum,
      },
      {
        name: 'adcendy:dependency-scope',
        value: 'production',
      },
    ],
  },
  components,
};

process.stdout.write(`${JSON.stringify(sbom, null, 2)}\n`);
