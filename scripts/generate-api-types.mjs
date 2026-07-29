#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import openapiTS, { astToString } from 'openapi-typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiUrl =
  process.env.OPENAPI_URL || process.argv[2];
if (!openapiUrl) {
  throw new Error(
    'Provide an immutable OpenAPI file path or an explicitly approved OPENAPI_URL.',
  );
}
const outputArgument = process.env.OPENAPI_OUTPUT || process.argv[3];
const outputPath = outputArgument
  ? path.resolve(process.cwd(), outputArgument)
  : path.resolve(__dirname, '../src/generated/openapi.ts');
const outputDir = path.dirname(outputPath);

async function readContract(source) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`OpenAPI download failed with HTTP ${response.status}`);
    }
    return await response.text();
  }

  return fs.readFileSync(path.resolve(process.cwd(), source), 'utf8');
}

/**
 * OpenAPI requires operationId values to be unique. Some compatibility aliases
 * intentionally share a controller method and therefore arrive with the same
 * operationId. Keep the wire contract intact while assigning stable generated
 * type identifiers to later duplicates.
 */
function makeOperationIdsUnique(document) {
  const seen = new Set();
  const methods = new Set([
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
  ]);
  let duplicateCount = 0;

  for (const [route, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!methods.has(method) || !operation?.operationId) continue;
      const original = operation.operationId;
      if (!seen.has(original)) {
        seen.add(original);
        continue;
      }

      const suffix = route
        .replace(/[{}]/g, '')
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, value) => value.toUpperCase())
        .replace(/^[^a-zA-Z_]+/, '');
      let candidate = `${original}${suffix || 'Alias'}`;
      let sequence = 2;
      while (seen.has(candidate)) {
        candidate = `${original}${suffix || 'Alias'}${sequence}`;
        sequence += 1;
      }

      operation.operationId = candidate;
      seen.add(candidate);
      duplicateCount += 1;
    }
  }

  return duplicateCount;
}

console.log('Generating API types from OpenAPI contract...');
console.log(`Source: ${openapiUrl}`);

fs.mkdirSync(outputDir, { recursive: true });
const temporaryInput = path.join(
  outputDir,
  `.openapi-input-${crypto.randomUUID()}.json`,
);

try {
  const rawContract = await readContract(openapiUrl);
  const checksum = crypto
    .createHash('sha256')
    .update(rawContract)
    .digest('hex');
  const contract = JSON.parse(rawContract);
  const duplicateCount = makeOperationIdsUnique(contract);

  if (duplicateCount > 0) {
    console.warn(
      `Normalized ${duplicateCount} duplicate operationId value(s) for TypeScript generation.`,
    );
  }

  fs.writeFileSync(temporaryInput, JSON.stringify(contract));
  const generatedContent = astToString(
    await openapiTS(pathToFileURL(temporaryInput)),
  );
  const header = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated from: ${openapiUrl}
 * Source SHA-256: ${checksum}
 *
 * To regenerate, run: npm run gen:api -- <openapi-source> <output-path>
 */

`;
  fs.writeFileSync(outputPath, header + generatedContent);

  console.log(`Generated: ${outputPath}`);
  console.log(`Source SHA-256: ${checksum}`);
} catch (error) {
  console.error('Failed to generate API types:', error.message);
  process.exitCode = 1;
} finally {
  if (fs.existsSync(temporaryInput)) {
    fs.unlinkSync(temporaryInput);
  }
}
