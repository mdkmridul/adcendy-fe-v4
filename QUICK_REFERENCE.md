# OpenAPI Integration - Quick Reference

## 🚀 Commands

```bash
# Type Generation
pnpm gen:api                    # Generate from OPENAPI_URL env var
pnpm gen:api:staging            # Generate from staging backend
pnpm gen:api:production         # Generate from production backend

# Development
pnpm dev                        # Run with mock data (default)
pnpm dev:real                   # Run with real backend
pnpm dev:mock                   # Explicitly run with mock data

# Quality Checks
pnpm typecheck                  # TypeScript type checking
pnpm lint                       # ESLint
pnpm build                      # Production build

# Utilities
pnpm env:check                  # Display current environment variables
```

## 🔧 Environment Variables

```bash
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_DATA_SOURCE=mock|real

# Optional (Generation)
OPENAPI_URL=https://api-staging.adcendy.com/api/docs-json

# Optional (Debug)
NEXT_PUBLIC_ENABLE_DEBUG_PANEL=true
NEXT_PUBLIC_ENABLE_API_LOGGING=true
```

## 📝 Code Examples

### Using Typed API Client

```typescript
import { api } from '@/lib/api';

// GET request
const campaigns = await api.execute(() => 
  api.client.GET('/campaigns')
);

// GET with path params
const campaign = await api.execute(() =>
  api.client.GET('/campaigns/{id}', {
    params: { path: { id: 'campaign-123' } }
  })
);

// POST with body
const newCampaign = await api.execute(() =>
  api.client.POST('/campaigns', {
    body: { name: 'My Campaign', budget: 10000 }
  })
);

// PATCH update
const updated = await api.execute(() =>
  api.client.PATCH('/campaigns/{id}', {
    params: { path: { id: 'campaign-123' } },
    body: { status: 'active' }
  })
);

// DELETE
await api.execute(() =>
  api.client.DELETE('/campaigns/{id}', {
    params: { path: { id: 'campaign-123' } }
  })
);
```

### Error Handling

```typescript
import type { ApiErrorResponse } from '@/lib/api';

try {
  const data = await api.execute(() => 
    api.client.GET('/campaigns')
  );
} catch (error) {
  const apiError = error as ApiErrorResponse;
  console.error(`[${apiError.code}] ${apiError.message}`);
  // apiError.status - HTTP status code
  // apiError.requestId - For debugging
  // apiError.details - Additional error info
}
```

### Authentication

```typescript
import { setAuth, clearAuth, getToken, isAuthenticated } from '@/features/auth/auth';

// After login/signup
setAuth(token, user);

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Get current token
const token = getToken();

// Logout
clearAuth();
```

### Using Generic HTTP Client (Existing Code)

```typescript
import { http } from '@/shared/api';

// Still works! No need to change existing code immediately
const campaigns = await http<Campaign[]>('/campaigns');
const campaign = await http<Campaign>(`/campaigns/${id}`);
const created = await http<Campaign>('/campaigns', {
  method: 'POST',
  body: data
});
```

## 🎯 Typical Workflow

1. **Backend API Changes**
   ```bash
   # Backend developer updates OpenAPI spec
   # Frontend: regenerate types
   pnpm gen:api:staging
   ```

2. **Review Generated Changes**
   ```bash
   git diff src/generated/openapi.ts
   ```

3. **Update Consuming Code**
   - TypeScript will show errors if API changed
   - Update code to match new types
   - Run `pnpm typecheck` to verify

4. **Test**
   ```bash
   # Test with mock data first
   pnpm dev
   
   # Then test with real backend
   pnpm dev:real
   ```

5. **Commit**
   ```bash
   git add src/generated/openapi.ts
   git commit -m "feat: update API types for new endpoints"
   ```

## 🐛 Debugging

### Enable Debug Panel
```bash
# Add to .env.local
NEXT_PUBLIC_ENABLE_DEBUG_PANEL=true
```
Click gear icon in bottom-right corner

### Enable API Logging
```bash
# Add to .env.local
NEXT_PUBLIC_ENABLE_API_LOGGING=true
```
See request/response logs in browser console

### Check Environment
```bash
pnpm env:check
```

### Verify Token
```javascript
// In browser console
localStorage.getItem('adcendy_token')
```

## 🔍 Common Issues

### Types Out of Date
```bash
pnpm gen:api:staging
```

### Build Fails with Type Errors
```bash
# Check if types need regeneration
pnpm gen:api
pnpm typecheck
```

### API Requests Failing
1. Check `NEXT_PUBLIC_API_BASE_URL` is correct
2. Check `NEXT_PUBLIC_DATA_SOURCE` is set properly
3. Enable logging: `NEXT_PUBLIC_ENABLE_API_LOGGING=true`
4. Check debug panel for auth state

### Not Using Real Backend
```bash
# Verify environment
pnpm env:check

# Should show:
# DATA_SOURCE: real
# API_URL: <your-backend-url>

# Restart dev server after changing env vars
```

## 📦 File Structure

```
scripts/
  generate-api-types.mjs        # Type generation script

src/
  generated/
    openapi.ts                   # Generated types (auto-generated)
  lib/
    api/
      client.ts                  # Typed API client
      index.ts                   # Exports
      typed-services.example.ts  # Usage examples

features/
  auth/
    auth.ts                      # Token management

shared/
  api/
    http.ts                      # Generic HTTP client
    repositories/                # Repository layer
      *.repo.ts                  # Route to mock/real
    real/                        # Real API adapters
      *.real.ts                  # Use http() client
    mock/                        # Mock adapters
      *.mock.ts                  # Local data

components/
  dev/
    api-debug-panel.tsx          # Debug panel
```

## 📚 Documentation

- **API_INTEGRATION.md** - Complete integration guide
- **CI_SETUP.md** - CI/CD configuration
- **IMPLEMENTATION_SUMMARY.md** - What was done
- **QUICK_REFERENCE.md** - This file

## 🎓 Learning Resources

- [openapi-typescript docs](https://openapi-ts.pages.dev/)
- [openapi-fetch docs](https://openapi-ts.pages.dev/openapi-fetch/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ✅ Acceptance Checklist

- [ ] `pnpm gen:api` generates types without errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] Mock mode works (`pnpm dev`)
- [ ] Real mode works (`pnpm dev:real`)
- [ ] Debug panel appears (when enabled)
- [ ] Login stores token correctly
- [ ] API requests include Bearer token
- [ ] Errors are normalized properly
- [ ] At least one typed API call works end-to-end

---

**Need help?** Check the full guides:
- Setup issues → **API_INTEGRATION.md**
- CI/CD → **CI_SETUP.md**
- What's new → **IMPLEMENTATION_SUMMARY.md**
