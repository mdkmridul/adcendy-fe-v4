# API Infrastructure Documentation

## Overview

This document describes the three-layer API architecture:

1. **HTTP Layer** (`/shared/api/http.ts`) - Native fetch wrapper with auth & error normalization
2. **Repository Layer** (`/shared/api/repositories/`) - Business logic with mock/real adapter switching
3. **React Layer** (`/hooks/`) - SWR hooks for UI integration

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         React Components/Pages           │
└──────────────────┬──────────────────────┘
                   │ uses
                   ▼
┌─────────────────────────────────────────┐
│   SWR Hooks (/hooks/use*.ts)            │
│   - useCampaigns()                       │
│   - useWizardStep()                      │
│   - etc.                                 │
└──────────────────┬──────────────────────┘
                   │ calls
                   ▼
┌─────────────────────────────────────────┐
│   Repositories (/api/repositories/)     │
│   - campaignsRepository                  │
│   - wizardRepository                     │
│   - etc.                                 │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │ NEXT_PUBLIC_API_MODE│
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼ "mock"      "real" ▼
┌──────────────────┐  ┌────────────────────┐
│ Mock Adapters    │  │ Real Adapters      │
│ (/api/mock/)     │  │ (/api/real/)       │
│ - in-memory data │  │ - HTTP calls       │
│ - fixtures       │  │ - json parse       │
│ - delays         │  │ - error handling   │
└──────────────────┘  └────────┬───────────┘
                               │ uses
                               ▼
                        ┌────────────────────┐
                        │ HTTP Client        │
                        │ (/api/http.ts)     │
                        │ - fetch wrapper    │
                        │ - request IDs      │
                        │ - auth headers     │
                        │ - error normal.    │
                        └────────────────────┘
                               │
                               ▼
                        Backend API (real mode only)
```

## Layer Breakdown

### 1. HTTP Layer (`/shared/api/http.ts`)

**Purpose:** Provide a thin fetch wrapper with consistent error handling and request tracing.

**Key Features:**
- Automatic request ID generation (crypto.randomUUID or fallback)
- Auth token injection from store
- Error normalization (401→Auth, 404→NotFound, etc.)
- Query parameter builder
- JSON serialization/parsing
- Rate-limit header detection (Retry-After)

**Usage:**
```typescript
import { http } from '@/shared/api/index';

const data = await http<Campaign>('/campaigns/123');
const created = await http<Campaign>('/campaigns', {
  method: 'POST',
  body: { name: 'My Campaign' }
});
```

### 2. Repository Layer (`/shared/api/repositories/`)

**Purpose:** Abstract domain-specific business logic and switch between mock/real adapters seamlessly.

**Pattern:**
```typescript
// campaignsRepository.ts
const apiMode = process.env.NEXT_PUBLIC_API_MODE || 'mock';
const adapter = apiMode === 'mock' ? campaignsMockAdapter : campaignsRealAdapter;

export const campaignsRepository = {
  async listCampaigns() {
    return adapter.listCampaigns();
  },
  // ... other methods delegate to adapter
};
```

**Benefits:**
- Feature code never knows about mock vs real
- Easy to switch modes via env var
- Consistent API surface across adapters
- Type-safe with TypeScript interfaces

### 3. Mock Adapters (`/shared/api/mock/`)

**Purpose:** Simulate backend behavior with fixtures and realistic delays for local development.

**Features:**
- In-memory persistence (per session)
- Artificial delays (200-300ms per call)
- Realistic error handling
- Async run simulation (RUNNING → SUCCEEDED transitions)
- Deterministic IDs for testing

**Example:**
```typescript
// strategy.mock.ts - runs simulate async processing
export const strategyMockAdapter = {
  async getRun(id: ID) {
    await delay(150);
    const run = mockRuns.get(id);
    
    // Simulate RUNNING -> SUCCEEDED transition after 3 polls
    if (run.status === 'RUNNING' && pollCount > 2) {
      run.status = 'SUCCEEDED';
    }
    
    return run;
  }
};
```

### 4. Real Adapters (`/shared/api/real/`)

**Purpose:** Call actual HTTP endpoints on the backend.

**Pattern:**
```typescript
// campaigns.real.ts
export const campaignsRealAdapter = {
  async listCampaigns(): Promise<Campaign[]> {
    return http<Campaign[]>('/campaigns');
  },
  
  async createCampaign(payload: CreateCampaignPayload) {
    return http<Campaign>('/campaigns', {
      method: 'POST',
      body: payload
    });
  }
};
```

### 5. React Hooks (`/hooks/`)

**Purpose:** Bridge repositories to React components with SWR client-side caching.

**Key Features:**
- SWR for automatic caching and revalidation
- Optimistic updates
- Error handling
- Automatic refetching on focus
- Deduplication across components

**Example:**
```typescript
export function useCampaigns() {
  const { data, error, mutate } = useSWR(
    'campaigns',
    () => campaignsRepository.listCampaigns(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  );
  
  return {
    campaigns: data || [],
    isLoading: !error && !data,
    error,
    refetch: mutate
  };
}
```

## Request Flow Example

### Mock Mode: Getting Campaigns

```
User clicks "Campaigns" page
  ↓
Component calls useCampaigns()
  ↓
SWR checks cache (miss first time)
  ↓
SWR calls campaignsRepository.listCampaigns()
  ↓
Repository reads NEXT_PUBLIC_API_MODE = 'mock'
  ↓
Repository calls campaignsMockAdapter.listCampaigns()
  ↓
Mock adapter simulates 250ms network delay
  ↓
Mock adapter returns [campaign-001, campaign-002] from mockState
  ↓
Component renders list
  ↓
SWR caches result for 60s (dedupingInterval)
  ↓
User navigates away and back → data served from cache instantly
```

### Real Mode: Creating Campaign

```
User submits form
  ↓
Component calls useCreateCampaign().create(payload)
  ↓
Repository calls campaignsRealAdapter.createCampaign(payload)
  ↓
Real adapter calls http<Campaign>('/campaigns', { method: 'POST', body })
  ↓
HTTP client:
  - Generates request ID
  - Adds auth token from store
  - Adds X-Request-Id header
  - Serializes body to JSON
  ↓
fetch('/campaigns', { method: 'POST', headers: { ... }, body: '{}' })
  ↓
Backend processes request → responds 200 with campaign
  ↓
HTTP client parses JSON response
  ↓
Repository returns campaign
  ↓
Component receives created campaign
  ↓
Hook triggers SWR revalidation of campaigns list
  ↓
campaignsRepository.listCampaigns() called again
  ↓
New list fetched → UI updated
```

## Type Safety

All layers are fully typed:

```typescript
// Types defined in /shared/types/
export interface Campaign {
  id: ID;
  name: string;
  city: string;
  niche: string;
  website?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// Repository has typed methods
export const campaignsRepository = {
  async listCampaigns(): Promise<Campaign[]> { ... },
  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> { ... }
};

// Hooks are typed
export function useCampaigns(): {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```

## Error Handling

All errors normalize to consistent shape:

```typescript
throw new ApiError('NotFound', 'Campaign not found', {
  status: 404,
  requestId: 'uuid-123',
});

// Catch and handle
try {
  const campaign = await campaignsRepository.getCampaign('invalid-id');
} catch (err) {
  if (err instanceof ApiError) {
    if (err.kind === 'NotFound') {
      // Show 404 UI
    } else if (err.kind === 'Auth') {
      // Redirect to login
    }
  }
}
```

## Adding New Features

### To add a new domain (e.g., "Reports"):

1. **Create types** in `/shared/types/reports.ts`:
   ```typescript
   export interface Report { ... }
   ```

2. **Create repository** in `/shared/api/repositories/reports.repo.ts`:
   ```typescript
   export interface ReportsRepository { ... }
   export const reportsRepository = { ... }
   ```

3. **Create mock adapter** in `/shared/api/mock/reports.mock.ts`:
   ```typescript
   export const reportsMockAdapter = { ... }
   ```

4. **Create real adapter** in `/shared/api/real/reports.real.ts`:
   ```typescript
   export const reportsRealAdapter = { ... }
   ```

5. **Create hooks** in `/hooks/useReports.ts`:
   ```typescript
   export function useReports() { ... }
   ```

Done! Feature works in both mock and real modes.

## Debugging

### Enable request logging:

Add to HTTP client before return:
```typescript
console.log(`[API] ${method} ${path} → ${status}`);
```

### Check mock state:

```typescript
// In browser console
import { campaignsMockAdapter } from '@/shared/api/mock/campaigns.mock';
await campaignsMockAdapter.listCampaigns();
```

### Verify mode:

```typescript
console.log(process.env.NEXT_PUBLIC_API_MODE); // 'mock' or 'real'
```

---

For environment setup, see `/.env.local.example`.
