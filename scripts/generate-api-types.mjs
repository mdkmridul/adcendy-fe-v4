#!/usr/bin/env node
/**
 * OpenAPI Type Generation Script
 * 
 * Fetches OpenAPI JSON from the backend and generates TypeScript types
 * Usage:
 *   node scripts/generate-api-types.mjs [openapi-url]
 *   
 * Environment variables:
 *   OPENAPI_URL - URL to fetch OpenAPI JSON from (overrides CLI arg)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to local dev if not specified
const DEFAULT_OPENAPI_URL = 'http://localhost:3001/api/docs-json';

// Determine OpenAPI URL (priority: env var > CLI arg > default)
const openapiUrl = process.env.OPENAPI_URL || process.argv[2] || DEFAULT_OPENAPI_URL;

if (!openapiUrl) {
  console.error('❌ Error: OpenAPI URL is required');
  console.error('Usage: node scripts/generate-api-types.mjs <openapi-url>');
  console.error('   or: OPENAPI_URL=<url> node scripts/generate-api-types.mjs');
  console.error('   or: Set OPENAPI_URL in .env.local');
  process.exit(1);
}

console.log('🔄 Generating API types from OpenAPI spec...');
console.log(`📍 Source: ${openapiUrl}`);

const outputPath = path.resolve(__dirname, '../src/generated/openapi.ts');
const outputDir = path.dirname(outputPath);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  // Run openapi-typescript CLI
  const command = `npx openapi-typescript "${openapiUrl}" --output "${outputPath}"`;
  
  console.log('⚙️  Running:', command);
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ API types generated successfully!');
  console.log(`📄 Output: ${outputPath}`);
  
  // Add header comment to generated file
  const generatedContent = fs.readFileSync(outputPath, 'utf8');
  const header = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * 
 * Generated from: ${openapiUrl}
 * Generated at: ${new Date().toISOString()}
 * 
 * To regenerate, run: pnpm gen:api
 */

`;
  fs.writeFileSync(outputPath, header + generatedContent);
  
  console.log('✨ Done!');
} catch (error) {
  console.error('❌ Failed to generate API types:', error.message);
  process.exit(1);
}
