# CI/CD Configuration Guide

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to main/develop branches.

**Steps:**
1. ✅ Install dependencies
2. ✅ Generate API types from staging OpenAPI spec
3. ✅ Run TypeScript type checking
4. ✅ Verify generated types are committed
5. ✅ Run linting
6. ✅ Build application

### Setting Up

#### Required Repository Secrets

Add these secrets to your GitHub repository:

1. **STAGING_OPENAPI_URL** (optional)
   - Value: `https://api-staging.adcendy.com/api/docs-json`
   - If not set, defaults to the value in the workflow

2. **PRODUCTION_OPENAPI_URL** (optional)
   - Value: `https://api.adcendy.com/api/docs-json`

#### Adding Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

### Local CI Simulation

Test CI checks locally before pushing:

```bash
# Install dependencies
pnpm install

# Generate types (must match what CI does)
pnpm gen:api:staging

# Type check
pnpm typecheck

# Check for uncommitted changes
git status src/generated/

# Lint
pnpm lint

# Build
pnpm build
```

## Pre-commit Hooks (Optional)

### Using Husky

Install husky for git hooks:

```bash
pnpm add -D husky
npx husky install
```

Add pre-commit hook:

```bash
npx husky add .husky/pre-commit "pnpm typecheck"
```

### Pre-commit Script

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Type check
echo "📝 Type checking..."
pnpm typecheck || exit 1

# Lint staged files
echo "🎨 Linting..."
pnpm lint --fix || exit 1

echo "✅ Pre-commit checks passed!"
```

## Deployment Workflows

### Staging Deployment

Trigger on push to `develop` branch:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm gen:api:staging
      - run: pnpm build
        env:
          NEXT_PUBLIC_API_BASE_URL: https://api-staging.adcendy.com
          NEXT_PUBLIC_DATA_SOURCE: real
          NEXT_PUBLIC_ENABLE_DEBUG_PANEL: true
      
      # Deploy to Vercel/Netlify/etc.
      - name: Deploy to staging
        run: # Your deployment command
```

### Production Deployment

Trigger on push to `main` branch or release tags:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm gen:api:production
      - run: pnpm build
        env:
          NEXT_PUBLIC_API_BASE_URL: https://api.adcendy.com
          NEXT_PUBLIC_DATA_SOURCE: real
          NEXT_PUBLIC_ENABLE_DEBUG_PANEL: false
          NEXT_PUBLIC_ENABLE_API_LOGGING: false
      
      # Deploy to production
      - name: Deploy to production
        run: # Your deployment command
```

## Enforcement Rules

### Branch Protection

Recommended branch protection rules for `main` and `develop`:

1. ✅ Require status checks to pass before merging
   - `Type Check & Build`
2. ✅ Require branches to be up to date before merging
3. ✅ Require linear history (optional)
4. ✅ Include administrators

### Required Checks

- TypeScript compilation (`pnpm typecheck`)
- Build succeeds (`pnpm build`)
- Generated types are committed
- Linting passes (optional)

## Troubleshooting CI

### "Generated types are out of sync"

```bash
# Regenerate and commit
pnpm gen:api:staging
git add src/generated/openapi.ts
git commit -m "chore: update generated API types"
```

### "Type check failed"

Fix TypeScript errors locally:
```bash
pnpm typecheck
```

### "Build failed"

Test build locally:
```bash
pnpm build
```

### OpenAPI URL not accessible in CI

Check:
1. Backend staging environment is running
2. OpenAPI endpoint is publicly accessible
3. No authentication required for OpenAPI spec
4. URL is correct in workflow file

## Monitoring

### GitHub Actions Dashboard

Monitor workflow runs:
- Go to **Actions** tab in your repository
- View recent runs, logs, and artifacts

### Notifications

Configure notifications for failed workflows:
1. GitHub → **Settings** → **Notifications**
2. Enable **Actions** notifications

## Best Practices

1. ✅ Always run `pnpm typecheck` before committing
2. ✅ Regenerate types after backend API changes
3. ✅ Commit generated types with API changes
4. ✅ Use feature branches and pull requests
5. ✅ Review generated type changes in PRs
6. ✅ Test both mock and real modes before merging
7. ✅ Keep staging environment up to date
