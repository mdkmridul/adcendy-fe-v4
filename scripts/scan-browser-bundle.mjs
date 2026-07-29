import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(moduleDirectory, '../.next');
const browserManifestNames = new Set([
  'app-build-manifest.json',
  'build-manifest.json',
  'prerender-manifest.json',
  'react-loadable-manifest.json',
  'routes-manifest.json',
]);

const prohibitedPatterns = [
  { label: 'NEXT_PUBLIC variable', pattern: /NEXT_PUBLIC_[A-Z0-9_]+/g },
  {
    label: 'environment-bound API origin',
    pattern: /https?:\/\/api(?:-staging|-uat)?\.adcendy\.com/gi,
  },
  {
    label: 'Backend localhost origin',
    pattern: /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):3001/gi,
  },
  {
    label: 'private key',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    label: 'compact JWT',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    label: 'AWS access-key ID',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
  },
];

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

export function scanBrowserBundle(root = defaultRoot) {
  const files = listFiles(root).filter((file) => {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (
      relative.startsWith('static/') &&
      /\.(?:js|css|html|json|map)$/i.test(relative)
    ) {
      return true;
    }
    if (
      /^server\/(?:app|pages)\/.*\.(?:html|rsc)$/i.test(relative)
    ) {
      return true;
    }
    return !relative.includes('/') && browserManifestNames.has(relative);
  });
  const findings = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const { label, pattern } of prohibitedPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        findings.push({
          file: path.relative(root, file),
          category: label,
        });
      }
    }
  }

  return { root, filesScanned: files.length, findings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = scanBrowserBundle(
    process.argv[2] ? path.resolve(process.argv[2]) : defaultRoot,
  );
  console.log(
    JSON.stringify({
      filesScanned: result.filesScanned,
      findingCount: result.findings.length,
      findings: result.findings,
    }),
  );
  if (result.findings.length > 0) process.exitCode = 1;
}
