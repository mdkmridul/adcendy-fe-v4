# Campaign wizard Playwright workflow

This workflow drives the real seven-step campaign wizard through the same UI and API adapters used by clients. It does not call wizard step endpoints directly from the test.

## Safety and credentials

- `ADCENDY_TARGET_ENV` defaults to `local`; supported values are `local` and `uat`.
- `ADCENDY_BASE_URL` defaults to `https://adcendy.localhost`.
- Local mode accepts only localhost hosts.
- UAT requires HTTPS and a hostname containing `uat`, `staging`, or `test`. An opaque UAT hostname must be explicitly listed in `ADCENDY_UAT_HOST_ALLOWLIST`.
- Known production hosts and hostnames containing `prod` or `production` are always rejected.
- `ADCENDY_TEST_EMAIL` and `ADCENDY_TEST_PASSWORD` must identify a dedicated `CLIENT` test account. They are read only from the environment.
- `SUBMIT_CAMPAIGN` defaults to `false`. Any value other than the case-insensitive string `true` leaves the campaign on final review.

Authenticated cookie state is created once per Playwright run under ignored `test-results/campaign-wizard-auth/` and reused by the single campaign worker.

## Fixtures

Campaign input JSON lives in `e2e/fixtures/campaigns`. Each fixture is validated before Playwright starts. Validation reports:

- missing or invalid fields with JSON paths;
- unknown keys as unsupported wizard fields;
- conditional-rule failures;
- unresolved `REPLACE_WITH_` values in a fixture marked `ready`.

The six checked-in fixtures are intentionally marked `placeholder`. Replace the placeholder values with verified intake, choose an industry value exposed by the target environment, and change `fixtureStatus` to `ready`.

The fixture validator is an E2E transport adapter. Backend `wizard-v2.schemas.ts`, DB-backed wizard options, and `WizardV2Service` commit validation remain authoritative; the test does not introduce a normalized campaign schema.

## Commands

```powershell
# Validate all fixture files without launching a browser
npm.cmd run test:e2e:campaign:validate

# Run one fixture
npm.cmd run test:e2e:campaign:fixture -- fuzzy-ai

# Run every ready fixture
npm.cmd run test:e2e:campaign:all
```

Example local review-only run:

```powershell
$env:ADCENDY_TARGET_ENV='local'
$env:ADCENDY_BASE_URL='https://adcendy.localhost'
$env:ADCENDY_TEST_EMAIL='campaign.test@example.test'
$env:ADCENDY_TEST_PASSWORD='<secret>'
$env:SUBMIT_CAMPAIGN='false'
npm.cmd run test:e2e:campaign:fixture -- fuzzy-ai
```

For UAT, set `ADCENDY_TARGET_ENV=uat` and the UAT origin. Set `SUBMIT_CAMPAIGN=true` only when creation is intended.

## Output

Each selected fixture writes `e2e/results/campaigns/<slug>.json`. A completed report includes environment, submission mode, status, campaign ID, pipeline-run ID, strategy ID when returned, final URL, screenshot path, validation failures, and unsupported fields.

- Review-only screenshot: `<slug>-final-review.png`
- Submitted screenshot: `<slug>-submitted.png`
- Failure screenshot: `<slug>-failure.png`
- Playwright trace/video/screenshot: retained in `e2e/results/campaigns/artifacts` on failure
- HTML and JSON Playwright reports: `e2e/results/campaigns/html` and `playwright-report.json`

## Workflow behavior

The reusable `CampaignWizardPage`:

1. opens the campaign list using the authenticated state;
2. creates a draft through the UI;
3. fills text, card, select, switch, checkbox, tag-list, and repeatable record controls;
4. verifies every control after entry;
5. waits for each exact wizard-step PATCH response before continuing;
6. verifies key values on final review and checks all confirmation/consent gates;
7. captures final review without committing by default;
8. when submission is enabled, confirms the destructive review dialog, validates `commitAccepted`, captures returned identifiers, verifies the campaign URL, and takes a screenshot.

No positional selectors, arbitrary sleeps, or direct database writes are used.
