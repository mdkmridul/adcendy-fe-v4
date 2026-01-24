# API Integration Guide

This document describes the OpenAPI-based type generation and typed API client integration for AdCendy Frontend v4.

## Overview

The frontend now uses **openapi-typescript** and **openapi-fetch** to generate TypeScript types from the backend's OpenAPI specification and provide a fully type-safe API client.

## Architecture

### Type Generation Flow

```
Backend OpenAPI JSON → openapi-typescript → src/generated/openapi.ts → Type-safe client
```

### Data Flow

```
UI Components → Repositories → Adapters (mock/real) → Backend API
                                      ↑
                        Feature flag: NEXT_PUBLIC_DATA_SOURCE
```

## Setup

### 1. Environment Variables

Create `.env.local` for local development:

```bash
# Backend API base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Data source: 'mock' or 'real'
NEXT_PUBLIC_DATA_SOURCE=mock

# OpenAPI generation URL (for pnpm gen:api)
OPENAPI_URL=https://api-staging.adcendy.com/api/docs-json

# Feature flags (optional)
NEXT_PUBLIC_ENABLE_DEBUG_PANEL=true
NEXT_PUBLIC_ENABLE_API_LOGGING=true
```

### 2. Generate API Types

Generate TypeScript types from the backend OpenAPI specification:

```bash
# Generate from environment variable OPENAPI_URL
pnpm gen:api

# Or generate from staging
pnpm gen:api:staging

# Or generate from production
pnpm gen:api:production

# Or specify URL directly
OPENAPI_URL=http://localhost:3001/api/docs-json pnpm gen:api
```

This creates `src/generated/openapi.ts` with fully typed API definitions.

### 3. Run the Application

```bash
# Development with mock data (default)
pnpm dev

# Development with real backend
pnpm dev:real

# Production build
pnpm build
```

## Usage

### Option 1: Typed API Client (Recommended for new code)

```typescript
import { api } from '@/lib/api';

// Full type safety - TypeScript knows request and response types!
const campaigns = await api.execute(() => 
  api.client.GET('/campaigns')
);

// With parameters
const campaign = await api.execute(() =>
  api.client.GET('/campaigns/{id}', {
    params: { path: { id: 'campaign-123' } }
  })
);

// POST with body
const newCampaign = await api.execute(() =>
  api.client.POST('/campaigns', {
    body: {
      name: 'My Campaign',
      // TypeScript will validate this structure!
    }
  })
);
```

### Option 2: Generic HTTP Client (Existing code)

```typescript
import { http } from '@/shared/api';

// Less type-safe but works with existing code
const campaigns = await http<Campaign[]>('/campaigns');
const campaign = await http<Campaign>(`/campaigns/${id}`);
```

### Error Handling

```typescript
import { api } from '@/lib/api';
import type { ApiErrorResponse } from '@/lib/api';

try {
  const data = await api.execute(() => 
    api.client.GET('/campaigns')
  );
  // Use data...
} catch (error) {
  const apiError = error as ApiErrorResponse;
  console.error(`[${apiError.code}] ${apiError.message}`);
  console.error('Request ID:', apiError.requestId);
  console.error('Details:', apiError.details);
}
```

## Repository Pattern

All data access goes through repositories that route to mock or real adapters:

```typescript
// shared/api/repositories/campaigns.repo.ts
import ENV from '@/lib/env';

const adapter = ENV.API.isMock 
  ? campaignsMockAdapter 
  : campaignsRealAdapter;

export const campaignsRepository = {
  listCampaigns: () => adapter.listCampaigns(),
  // ...
};
```

## Feature Flags

### NEXT_PUBLIC_DATA_SOURCE

Controls whether to use mock data or real backend:

- `mock` - Use local mock data (default for development)
- `real` - Connect to actual backend API

**Important**: When set to `real`, the app will NOT fall back to mock on errors. This ensures you see real integration issues.

### NEXT_PUBLIC_ENABLE_DEBUG_PANEL

Shows a debug panel in the bottom-right corner (dev/staging only) with:
- API base URL
- Current data source
- Authentication state
- Feature flags status

### NEXT_PUBLIC_ENABLE_API_LOGGING

Enables request/response logging to browser console:
```
[API Request] { method: 'GET', url: '...', requestId: '...', hasAuth: true }
[API Response] { status: 200, url: '...', requestId: '...' }
```

## Migration Guide

### Migrating Existing Real Adapters to Typed Client

**Before** (generic http):
```typescript
import { http } from '@/shared/api';

export const campaignsRealAdapter = {
  async listCampaigns(): Promise<Campaign[]> {
    return http<Campaign[]>('/campaigns');
  },
};
```

**After** (typed client):
```typescript
import { api } from '@/lib/api';

export const campaignsRealAdapter = {
  async listCampaigns() {
    return api.execute(() => api.client.GET('/campaigns'));
  },
};
```

Benefits:
- ✅ No manual type annotations needed
- ✅ TypeScript catches wrong paths at compile-time
- ✅ Parameter validation
- ✅ Response type inference

## Authentication

### Token Storage

Tokens are stored in localStorage as `adcendy_token` (client-side only).

```typescript
import { setAuth, clearAuth, getToken } from '@/features/auth/auth';

// After successful login
setAuth(token, user);

// Check auth state
const token = getToken();

// Logout
clearAuth();
```

### Automatic Token Injection

The API client automatically adds `Authorization: Bearer <token>` header to all requests if a token exists.

## Core API Flows

The following flows are wired to the real API:

1. **Authentication**
   - `POST /auth/login` - Login
   - `POST /auth/signup` - Signup
   - `GET /auth/me` - Get current user

2. **Campaign Management**
   - `GET /campaigns` - List campaigns
   - `POST /campaigns` - Create campaign
   - `GET /campaigns/{id}` - Get campaign
   - `PATCH /campaigns/{id}` - Update campaign
   - `DELETE /campaigns/{id}` - Delete campaign

3. **Wizard Flow**
   - `GET /campaigns/{id}/wizard/{step}` - Get step state
   - `POST /campaigns/{id}/wizard/{step}` - Save step
   - `GET /campaigns/{id}/wizard/preview` - Preview
   - `POST /campaigns/{id}/wizard/commit` - Commit and generate

4. **Strategy Management**
   - `GET /strategy-runs/{id}` - Get run status (polling)
   - `GET /campaigns/{id}/strategy/versions` - List versions
   - `GET /campaigns/{id}/strategy/latest` - Get latest version
   - `POST /strategy-versions/{id}/feedback` - Submit feedback

5. **Weekly Submissions**
   - `POST /campaigns/{id}/weekly/{week}` - Create/update submission
   - `GET /campaigns/{id}/weekly` - List submissions

6. **Intelligence**
   - `GET /campaigns/{id}/intelligence/latest` - Latest snapshot
   - `GET /campaigns/{id}/intelligence` - List snapshots
   - `POST /campaigns/{id}/intelligence/refresh` - Refresh

7. **Admin**
   - `POST /admin/jobs/trigger` - Trigger job
   - `GET /admin/jobs` - List jobs
   - `GET /admin/ai-usage` - AI usage summary

## CI/CD Integration

### Type Check in CI

Add to your CI pipeline:

```yaml
- name: Generate API types
  run: pnpm gen:api
  env:
    OPENAPI_URL: ${{ secrets.STAGING_OPENAPI_URL }}

- name: Type check
  run: pnpm typecheck

- name: Verify no uncommitted changes
  run: |
    git diff --exit-code src/generated/openapi.ts || \
    (echo "Error: Generated types are out of date. Run 'pnpm gen:api' and commit." && exit 1)
```

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm gen:api:staging
      - run: pnpm typecheck
      - run: pnpm build
```

## Troubleshooting

### Types are out of date

```bash
# Regenerate types from latest OpenAPI spec
pnpm gen:api:staging
```

### Mock/real toggle not working

1. Check environment variable is set:
   ```bash
   pnpm env:check
   ```

2. Verify `.env.local` exists with correct values

3. Restart dev server after changing env vars

### API requests failing with CORS

Ensure backend allows your frontend origin in CORS configuration.

### TypeScript errors after generation

1. Ensure backend OpenAPI spec is valid
2. Check for breaking changes in API
3. Update consuming code to match new types

## Development Tools

### Debug Panel

Press the gear icon in bottom-right corner (dev/staging only) to see:
- Current API configuration
- Auth state
- Feature flags
- Request logging toggle

### Console Logging

When `NEXT_PUBLIC_ENABLE_API_LOGGING=true`:
```javascript
// Every request logs:
[API Request] { method: 'GET', url: '/campaigns', requestId: 'req_abc123', hasAuth: true }

// Every response logs:
[API Response] { status: 200, url: '/campaigns', requestId: 'req_abc123' }

// Errors log:
[API Error] { status: 400, code: 'VALIDATION_ERROR', message: '...', requestId: 'req_abc123' }
```

## Smoke Test Checklist

After setup, verify these work:

- [ ] `pnpm gen:api` generates types without errors
- [ ] `pnpm typecheck` passes
- [ ] App builds successfully: `pnpm build`
- [ ] Mock mode works: `pnpm dev` (DATA_SOURCE=mock)
- [ ] Real mode works: `pnpm dev:real` (DATA_SOURCE=real)
- [ ] Debug panel appears in dev mode
- [ ] Login flow stores token correctly
- [ ] Authenticated requests include Bearer token
- [ ] Error responses are normalized correctly
- [ ] At least one real API call works end-to-end

## References

- [openapi-typescript docs](https://openapi-ts.pages.dev/)
- [openapi-fetch docs](https://openapi-ts.pages.dev/openapi-fetch/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
