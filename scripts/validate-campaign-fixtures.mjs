import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  campaignFixtureSchema,
  formatFixtureIssues,
} from '../e2e/campaign-wizard/campaign-fixture-schema.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDirectory = path.join(repositoryRoot, 'e2e', 'fixtures', 'campaigns');
const reportDirectory = path.join(repositoryRoot, 'e2e', 'results', 'campaigns');

function findPlaceholderPaths(value, currentPath = []) {
  if (typeof value === 'string' && value.includes('REPLACE_WITH_')) {
    return [currentPath.join('.')];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findPlaceholderPaths(item, [...currentPath, String(index)]));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      findPlaceholderPaths(item, [...currentPath, key]),
    );
  }
  return [];
}

function writeValidationReport(result) {
  fs.mkdirSync(reportDirectory, { recursive: true });
  const reportPath = path.join(reportDirectory, `${result.slug}.json`);
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        fixture: result.slug,
        displayName: result.displayName,
        status: result.status,
        phase: 'fixture-validation',
        fixturePath: result.fixturePath,
        validation: {
          valid: result.valid,
          issues: result.issues,
          placeholderPaths: result.placeholderPaths,
        },
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  return reportPath;
}

export function validateCampaignFixtures({ fixtureSlug } = {}) {
  const allFiles = fs
    .readdirSync(fixtureDirectory)
    .filter((file) => file.endsWith('.json'))
    .sort();
  const requestedFiles = fixtureSlug
    ? allFiles.filter((file) => path.basename(file, '.json') === fixtureSlug)
    : allFiles;

  if (fixtureSlug && requestedFiles.length === 0) {
    throw new Error(
      `Campaign fixture "${fixtureSlug}" was not found in ${fixtureDirectory}. Available fixtures: ${allFiles
        .map((file) => path.basename(file, '.json'))
        .join(', ')}`,
    );
  }

  const results = requestedFiles.map((file) => {
    const fixturePath = path.join(fixtureDirectory, file);
    const fallbackSlug = path.basename(file, '.json');
    let rawFixture;
    try {
      rawFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    } catch (error) {
      const result = {
        slug: fallbackSlug,
        displayName: fallbackSlug,
        fixturePath,
        status: 'invalid',
        valid: false,
        issues: [{ path: '', code: 'invalid_json', message: error.message }],
        placeholderPaths: [],
      };
      result.reportPath = writeValidationReport(result);
      return result;
    }

    const parsed = campaignFixtureSchema.safeParse(rawFixture);
    const placeholderPaths = findPlaceholderPaths(rawFixture);
    const readyWithPlaceholders =
      rawFixture.fixtureStatus === 'ready' && placeholderPaths.length > 0;
    const issues = parsed.success
      ? readyWithPlaceholders
        ? placeholderPaths.map((placeholderPath) => ({
            path: placeholderPath,
            code: 'unresolved_placeholder',
            message: 'Ready fixtures cannot contain REPLACE_WITH_ placeholder values',
          }))
        : []
      : formatFixtureIssues(parsed.error.issues);
    const valid = parsed.success && !readyWithPlaceholders;
    const status = !valid
      ? 'invalid'
      : parsed.data.fixtureStatus === 'placeholder'
        ? 'placeholder'
        : 'ready';
    const result = {
      slug: parsed.success ? parsed.data.slug : fallbackSlug,
      displayName: parsed.success ? parsed.data.displayName : rawFixture.displayName ?? fallbackSlug,
      fixturePath,
      fixture: parsed.success ? parsed.data : null,
      status,
      valid,
      issues,
      placeholderPaths,
    };
    result.reportPath = writeValidationReport(result);
    return result;
  });

  return {
    fixtureDirectory,
    results,
    invalid: results.filter((result) => !result.valid),
    ready: results.filter((result) => result.status === 'ready'),
    placeholders: results.filter((result) => result.status === 'placeholder'),
  };
}

function readFixtureSlug(argv) {
  const fixtureFlag = argv.indexOf('--fixture');
  if (fixtureFlag === -1) {
    return undefined;
  }
  const slug = argv[fixtureFlag + 1];
  if (!slug) {
    throw new Error('--fixture requires a fixture slug');
  }
  return slug;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const summary = validateCampaignFixtures({
      fixtureSlug: readFixtureSlug(process.argv.slice(2)),
    });
    process.stdout.write(
      `${JSON.stringify(
        {
          fixtureDirectory: summary.fixtureDirectory,
          total: summary.results.length,
          ready: summary.ready.map((result) => result.slug),
          placeholders: summary.placeholders.map((result) => result.slug),
          invalid: summary.invalid.map((result) => ({
            slug: result.slug,
            issues: result.issues,
          })),
          reports: summary.results.map((result) => result.reportPath),
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = summary.invalid.length > 0 ? 1 : 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
