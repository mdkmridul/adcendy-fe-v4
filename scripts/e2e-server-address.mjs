// Where the E2E server listens. Shared by playwright.config.ts and
// start-e2e-server.mjs so the two cannot disagree; E2E_PORT overrides it.
export const E2E_HOST = '127.0.0.1';
export const E2E_PORT = process.env.E2E_PORT?.trim() || '34100';
export const E2E_BASE_URL = `http://${E2E_HOST}:${E2E_PORT}`;
