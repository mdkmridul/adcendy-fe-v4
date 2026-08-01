# Local/UAT-only bulk campaign creation proposal

## Existing capability assessment

No internal endpoint or runner currently bulk-creates campaign wizard submissions.

The existing benchmark routes:

- `GET /campaigns/:id/benchmarks/current`
- `POST /campaigns/:id/benchmarks/refresh`

operate on benchmark buckets for an already-created campaign. `BenchmarkService` reads campaign/category/weekly-performance data and the benchmark queue recomputes aggregate metrics; neither creates a campaign nor executes Wizard v2.

The repository does have all authoritative primitives needed for a safe internal runner:

- `CampaignsService.createCampaign`
- `WizardV2Service.saveWizardStepV2`
- `WizardV2Service.commitWizardV2`
- backend v2 step Zod schemas and DB-backed C09 options/policy
- `PipelineRunV2Service.startPipelineRunV2`, which creates and freezes the run config snapshot
- idempotency support at the public wizard commit controller

## Recommended implementation: CLI runner, not an HTTP endpoint

Add `scripts/campaign-batch-v2.ts` in the backend and execute it only with an explicit environment guard:

```powershell
APP_ENV=local npm.cmd run campaign:batch:v2 -- --fixtures <directory> --owner-email <dedicated-test-account>
APP_ENV=uat npm.cmd run campaign:batch:v2 -- --fixtures <directory> --owner-email <dedicated-test-account>
```

The runner should refuse:

- `APP_ENV=production`;
- an unrecognized environment;
- a production database host or production API origin;
- fixtures without a stable idempotency key;
- owners that are not an enabled dedicated test client;
- commit unless `--submit` is explicitly supplied.

## Service composition

For each fixture:

1. Parse the fixture transport envelope.
2. Validate every `wizard.stepN` with the existing `wizardStepSchemasV2`; do not define another campaign or normalized schema.
3. Load active C09 wizard options and the merged system settings used by `WizardV2Service`.
4. In dry-run mode, invoke a public validation-only method extracted from `WizardV2Service.validateCommitStateV2` without writing.
5. Create the draft through `CampaignsService.createCampaign` for the dedicated owner.
6. Call `WizardV2Service.saveWizardStepV2` sequentially for steps 1–7, passing the returned optimistic-lock version each time.
7. If `--submit` is absent, stop after step 7 and report the campaign ID.
8. If `--submit` is present, call the same idempotent commit orchestration used by `WizardV2Controller`.
9. Record campaign ID, wizard snapshot ID, normalization record ID, pipeline-run ID, config-snapshot ID, status, and errors in a JSONL batch report.

The runner must not insert `wizard_state_v2`, snapshots, normalization records, pipeline runs, or config snapshots directly. Calling the services preserves:

- canonical step parsing and aliases;
- commit-time conditional validation;
- taxonomy/context review routing;
- normalized-contract meanings;
- atomic wizard commit claim;
- frozen configuration behavior;
- phase-execution lineage and dispatch.

## Idempotency and recovery

Use a batch key plus fixture slug, for example `campaign-batch-v2:<batch-id>:<slug>`. Persist a small local checkpoint file containing fixture hash, campaign ID, last saved step/version, commit result, and timestamps. On retry:

- identical completed fixtures are reported, not recreated;
- an incomplete draft resumes at the next step;
- a changed fixture hash requires `--replace-draft` and never mutates an already committed snapshot;
- failed commits retain the draft and exact validation issues.

## Optional internal endpoint

Only if remote orchestration is later required, expose `POST /api/v2/internal/campaign-batches` behind all of:

- a module registered only for `local`/`uat`;
- startup failure if the module is enabled in production;
- ADMIN authentication plus a dedicated internal permission;
- feature flag `pipeline_v2.internal_campaign_batch_enabled`;
- rate and batch-size limits;
- audit records and idempotency key;
- async job status endpoint with no credentials or raw secrets in payload/logs.

The controller should enqueue the same runner service. It must not contain its own validation, normalization, snapshot, or run-creation logic, and it must be absent from the production OpenAPI document and production module graph.
