# API Integration Status

## ✅ Completed

### Authentication (NEW)
- **Files Created:**
  - `shared/api/mock/auth.mock.ts` - Mock authentication adapter
  - `shared/api/real/auth.real.ts` - Real API authentication adapter
  - `shared/api/repositories/auth.repo.ts` - Auth repository with auto-switching

- **Updated Files:**
  - `app/(public)/auth/login/page.tsx` - Now uses `authRepository.login()`
  - `app/(public)/auth/signup/page.tsx` - Now uses `authRepository.signup()`
  - `shared/api/repositories/index.ts` - Exports `authRepository`

- **API Endpoints:**
  - `POST /v1/auth/login` - User login
  - `POST /v1/auth/register` - User signup
  - `GET /v1/auth/protected/me` - Get current user
  - `POST /v1/auth/logout` - Logout
  - `POST /v1/auth/refresh` - Refresh token

- **Environment Control:**
  ```bash
  # Use mock authentication (default)
  NEXT_PUBLIC_DATA_SOURCE=mock pnpm dev

  # Use real backend API
  NEXT_PUBLIC_DATA_SOURCE=real pnpm dev
  NEXT_PUBLIC_API_BASE_URL=https://api.adcendy.com
  ```

- **Features:**
  - ✅ Automatic error handling with user-friendly messages
  - ✅ Loading states during API calls
  - ✅ Token storage in localStorage
  - ✅ Automatic mock/real switching based on `NEXT_PUBLIC_DATA_SOURCE`
  - ✅ Type-safe requests and responses

---

## ✅ Already Integrated (Using Repository Pattern)

### Campaigns
- **Repository:** `shared/api/repositories/campaigns.repo.ts`
- **Mock:** `shared/api/mock/campaigns.mock.ts`
- **Real:** `shared/api/real/campaigns.real.ts`
- **Operations:** List, Get, Create, Update, Delete
- **API Ready:** ✅ Yes

### Intelligence Reports
- **Repository:** `shared/api/repositories/intelligence.repo.ts`
- **Mock:** `shared/api/mock/intelligence.mock.ts`
- **Real:** `shared/api/real/intelligence.real.ts`
- **Operations:** List, Get, Generate
- **API Ready:** ✅ Yes

### Strategy Reports
- **Repository:** `shared/api/repositories/strategy.repo.ts`
- **Mock:** `shared/api/mock/strategy.mock.ts`
- **Real:** `shared/api/real/strategy.real.ts`
- **Operations:** List, Get, Generate
- **API Ready:** ✅ Yes

### Weekly Reports
- **Repository:** `shared/api/repositories/weekly.repo.ts`
- **Mock:** `shared/api/mock/weekly.mock.ts`
- **Real:** `shared/api/real/weekly.real.ts`
- **Operations:** List, Get, Generate
- **API Ready:** ✅ Yes

### Campaign Wizard
- **Repository:** `shared/api/repositories/wizard.repo.ts`
- **Mock:** `shared/api/mock/wizard.mock.ts`
- **Real:** `shared/api/real/wizard.real.ts`
- **Operations:** Submit campaign setup
- **API Ready:** ✅ Yes

### Background Jobs (Admin)
- **Repository:** `shared/api/repositories/jobs.repo.ts`
- **Mock:** `shared/api/mock/jobs.mock.ts`
- **Real:** `shared/api/real/jobs.real.ts`
- **Operations:** List jobs, Get job details
- **API Ready:** ✅ Yes

### AI Usage Analytics (Admin)
- **Repository:** `shared/api/repositories/aiUsage.repo.ts`
- **Mock:** `shared/api/mock/aiUsage.mock.ts`
- **Real:** `shared/api/real/aiUsage.real.ts`
- **Operations:** Get usage stats
- **API Ready:** ✅ Yes

---

## 🔄 How It Works

### Automatic Mock/Real Switching

All repositories automatically switch between mock and real data based on `NEXT_PUBLIC_DATA_SOURCE`:

```typescript
// Example from campaigns.repo.ts
import { campaignsMockAdapter } from '../mock/campaigns.mock';
import { campaignsRealAdapter } from '../real/campaigns.real';
import ENV from '@/lib/env';

const adapter = ENV.API.isMock ? campaignsMockAdapter : campaignsRealAdapter;

export const campaignsRepository = {
  listCampaigns: async () => adapter.listCampaigns(),
  // ... other methods
};
```

### Using Repositories in Components

```typescript
import { authRepository } from '@/shared/api/repositories';

// Login
const { accessToken, user } = await authRepository.login({
  email: 'user@example.com',
  password: 'password123',
});

// Signup
const { accessToken, user } = await authRepository.signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
});

// Get current user
const user = await authRepository.getMe();
```

### Error Handling

All repositories throw `ApiError` with helpful messages:

```typescript
try {
  const response = await authRepository.login(credentials);
  // Success
} catch (error) {
  // error.message contains user-friendly error message
  // error.statusCode contains HTTP status code
  // error.requestId contains unique request ID for debugging
}
```

---

## 🚀 Switching from Mock to Real Backend

### Step 1: Set Environment Variables

Create or update `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://api.adcendy.com

# Enable real API mode
NEXT_PUBLIC_DATA_SOURCE=real

# Optional: Enable API logging for debugging
NEXT_PUBLIC_ENABLE_API_LOGGING=true
```

### Step 2: Restart Dev Server

```bash
pnpm dev
```

### Step 3: Verify

Open browser console and look for:
```
[Auth Repository] Using adapter: real
[Campaign Repository] Using adapter: real
```

### Step 4: Test Authentication

1. Go to `/auth/signup`
2. Fill out the form
3. Submit - **now makes real API call to backend**
4. Check Network tab for POST request to backend

---

## 📊 Landing Page Sections (Currently Static)

These sections on the landing page (`app/page.tsx`) are **static content** and don't need API calls:

### Static Sections:
- ✅ **MarketingNav** - Navigation bar (static links)
- ✅ **StarfieldHero** - Hero with starfield animation (static)
- ✅ **HowItWorks** - Explanation section (static content)
- ✅ **WhatYouGet** - Features overview (static content)
- ✅ **ScrollTellingSection** - Interactive scroll section (static content)
- ✅ **Pricing** - Pricing plans (static content, could be dynamic if pricing comes from backend)
- ✅ **FAQ** - Frequently asked questions (static content)
- ✅ **StickyFooterCTA** - Call-to-action footer (static)

**Note:** These sections are intentionally static. Marketing/landing pages typically use static content for SEO and performance. If you want dynamic content (e.g., pulling FAQs from CMS), you would need to create new repositories for that data.

---

## 📋 Testing Checklist

### Mock Mode (Default)
- [ ] Login with any email/password works
- [ ] Signup creates mock user
- [ ] Campaign list shows mock data
- [ ] Intelligence reports show mock data
- [ ] No network requests to backend

### Real API Mode
- [ ] Login requires valid credentials from backend
- [ ] Signup creates real user in database
- [ ] Campaign list fetches from backend API
- [ ] Intelligence reports fetch from backend
- [ ] Network tab shows actual API requests
- [ ] Auth tokens are properly sent in headers
- [ ] Error messages from backend are displayed

---

## 🔧 Troubleshooting

### No API Calls Happening
**Problem:** Signup/login doesn't make network requests

**Solution:** Check environment variables:
```bash
pnpm env:check
```

Should output:
```
NODE_ENV: development
API_URL: https://api.adcendy.com
DATA_SOURCE: real
```

If `DATA_SOURCE: mock`, change `.env.local`:
```bash
NEXT_PUBLIC_DATA_SOURCE=real
```

### CORS Errors
**Problem:** Browser blocks requests with CORS error

**Solution:** Backend must allow your origin:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

### 401 Unauthorized
**Problem:** Protected endpoints return 401

**Solution:** Ensure token is being sent:
1. Check localStorage has token: `localStorage.getItem('adcendy_token')`
2. Check Network tab headers: `Authorization: Bearer <token>`
3. Verify token hasn't expired

### Network Request Failed
**Problem:** "Failed to fetch" or network error

**Solution:**
1. Check `NEXT_PUBLIC_API_BASE_URL` is correct
2. Verify backend is running
3. Try accessing `${API_URL}/health` directly in browser

---

## 📚 Additional Resources

- **API Documentation:** `API_INTEGRATION.md`
- **Environment Setup:** `ENVIRONMENT.md`
- **Quick Reference:** `QUICK_REFERENCE.md`
- **OpenAPI Types:** `README_OPENAPI.md`

---

## Summary

**✅ What's Done:**
- Auth repository created with mock and real adapters
- Login page updated to use API
- Signup page updated to use API
- All other repositories (campaigns, intelligence, strategy, weekly, etc.) already have mock/real support
- Automatic switching based on `NEXT_PUBLIC_DATA_SOURCE`

**🎯 Next Steps to Use Real Backend:**
1. Get backend URL from your team
2. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Set `NEXT_PUBLIC_DATA_SOURCE=real`
4. Restart dev server
5. Test signup/login - should now call backend!

**🚀 Everything is ready!** Just flip the environment variable to `real` when backend is available.
