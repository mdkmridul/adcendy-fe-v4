# Environment Configuration Guide

## Overview

This project uses environment variables to configure different aspects of the application across development, production, and other environments.

## Environment Files

### `.env.example`
Template file showing all available environment variables. **Commit this to git** as documentation for other developers.

### `.env.local`
Local environment variables that override all other env files. **Do not commit** - this is for your personal local configuration.

### `.env.development`
Default variables for development mode (when running `pnpm dev`). **Can commit** if you want shared dev defaults.

### `.env.production`
Variables used when building and running in production mode. **Can commit** for shared production settings (but never commit secrets).

## Environment Variables

### `NEXT_PUBLIC_API_URL`
- **Description**: Base URL for backend API requests
- **Development**: `http://localhost:3001`
- **Production**: Your production API URL (e.g., `https://api.adcendy.com`)
- **Required**: Yes

### `NEXT_PUBLIC_API_MODE`
- **Description**: Controls whether to use mock data or real API calls
- **Options**: `mock` | `real`
- **Development**: `mock` (for local development without backend)
- **Production**: `real` (for live API connections)
- **Required**: Yes

## NPM Scripts

### Development

```bash
# Start dev server with default settings (uses .env.development or .env.local)
pnpm dev

# Start dev server with mock API (overrides env files)
pnpm dev:mock

# Start dev server with real API (overrides env files)
pnpm dev:real
```

### Production

```bash
# Build for production
pnpm build

# Build with explicit production settings
pnpm build:production

# Start production server
pnpm start

# Start with explicit production settings
pnpm start:production
```

### Utilities

```bash
# Check current environment variables
pnpm env:check

# Run linter
pnpm lint
```

## Environment Detection in Code

Use the centralized environment configuration:

```typescript
import ENV from '@/lib/env';

// Check environment
if (ENV.isDevelopment) {
  console.log('Running in development mode');
}

if (ENV.isProduction) {
  console.log('Running in production mode');
}

// Access API config
const apiUrl = ENV.API.baseURL;
const apiMode = ENV.API.mode;

// Check API mode
if (ENV.API.isMock) {
  console.log('Using mock API');
}

if (ENV.API.isReal) {
  console.log('Using real API');
}
```

## Environment Variable Loading Order

Next.js loads environment variables in this order (later sources override earlier ones):

1. `.env` - Base variables for all environments
2. `.env.development` or `.env.production` - Environment-specific
3. `.env.local` - Local overrides (always wins)
4. Environment variables from your system/hosting platform

## Setup Instructions

### Initial Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your settings:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_API_MODE=mock
   ```

3. Start development:
   ```bash
   pnpm dev
   ```

### Switching Between Mock and Real API

#### Option 1: Use npm scripts
```bash
pnpm dev:mock   # Force mock API
pnpm dev:real   # Force real API
```

#### Option 2: Edit .env.local
```bash
NEXT_PUBLIC_API_MODE=real  # or 'mock'
```

Then restart your dev server.

### Production Deployment

1. Set environment variables in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Docker: Use `.env.production` or pass via `-e` flags

2. Required variables for production:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.com
   NEXT_PUBLIC_API_MODE=real
   ```

## Troubleshooting

### Environment variables not updating

1. **Restart the dev server** - Changes to env files require a restart
2. Check file naming - Must be `.env.local` not `env.local`
3. Use `pnpm env:check` to verify loaded variables

### Variables undefined in browser

- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Other variables are only available in server-side code
- Check browser console for actual values

### Wrong API mode

1. Check `.env.local` - it overrides everything
2. Use `ENV.API.mode` in code to verify
3. Run `pnpm env:check` to see active configuration

## Security Notes

- **Never commit** `.env.local` or any file containing secrets
- **Do not** put API keys or passwords in `NEXT_PUBLIC_*` variables (they're exposed to browser)
- Use server-side variables (without `NEXT_PUBLIC_`) for sensitive data
- Add `.env*.local` to `.gitignore`

## Quick Reference

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env.example` | Template/Documentation | ✅ Yes |
| `.env.local` | Personal local config | ❌ No |
| `.env.development` | Dev defaults | ✅ Optional |
| `.env.production` | Prod defaults | ✅ Optional |

| Variable | Type | Values | Description |
|----------|------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | string | URL | Backend API base URL |
| `NEXT_PUBLIC_API_MODE` | string | `mock` \| `real` | API data source mode |
