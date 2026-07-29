import { buildRuntimePublicConfig } from '../shared/runtime-config/schema.ts';

try {
  const config = buildRuntimePublicConfig(process.env);
  console.log(
    JSON.stringify({
      valid: true,
      appEnvironment: config.APP_ENV,
      releaseId: config.RELEASE_ID,
      publicKeys: Object.keys(config).sort(),
    }),
  );
} catch (error) {
  console.error(
    error instanceof Error
      ? `Runtime configuration rejected: ${error.message}`
      : 'Runtime configuration rejected.',
  );
  process.exitCode = 1;
}
