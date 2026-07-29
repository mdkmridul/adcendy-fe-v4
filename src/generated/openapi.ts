/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated from: ..\adcendy-be-v4\docs\openapi\v2\adcendy-api.openapi.json
 * Source SHA-256: f47bdda74803612e550cb21dd6c61e3793d5e64d10c0d0f3765615fb18694aa3
 *
 * To regenerate, run: npm run gen:api -- <openapi-source>
 */

export interface paths {
    "/api/v2/admin/campaigns/{campaignId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCampaignV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/campaigns/{campaignId}/reviewer-assignment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["assignCampaignReviewerV2"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/campaigns/{campaignId}/runs/recreate-latest-commit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["recreateRunFromLatestCommitV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/campaigns/{campaignId}/triggers/intelligence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["triggerIntelligenceV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/campaigns/{campaignId}/triggers/output": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["triggerOutputV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/campaigns/{campaignId}/triggers/pipeline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["triggerPipelineV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/campaigns/{campaignId}/triggers/sections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["triggerSectionsV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/campaigns/{campaignId}/triggers/strategy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["triggerStrategyV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/legal/document-versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createLegalDocumentVersionV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/legal/document-versions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["updateLegalDocumentVersionV2"];
        trace?: never;
    };
    "/api/v2/admin/legal/signed-documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listSignedDocumentsV2"];
        put?: never;
        post: operations["createSignedDocumentMetadataV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listRunsV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/runs/{runId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getRunV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/admin/runs/{runId}/internal-output/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["assembleInternalDraftOutputForRunV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/campaigns": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/campaigns/{campaignId}/runs/recovery": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCampaignRecoveryV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["assembleClientContextV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/discovery/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runDiscoverySprintV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/discovery/competitive-grounding/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runCompetitiveGroundingV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/discovery/gap-analysis/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runGapAnalysisV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/discovery/gap-analysis/diagnostic/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runDiagnosticCheckpointV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/discovery/gap-analysis/diagnostic/channels/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runChannelSelectionV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/discovery/gap-analysis/diagnostic/channels/manifest/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runIntelligenceManifestAssemblyV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/intelligence/client-context/discovery/serp-competitors/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runSerpCompetitorIdentificationV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/legal/consents/give": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["giveConsentV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/legal/consents/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["myConsentStateV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/legal/consents/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["withdrawConsentV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/legal/documents/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["acceptLegalDocumentsV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/legal/documents/active": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getActiveLegalDocumentsV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/pipeline-runs/{runId}/output": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getOutputForRunV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/pipeline-runs/{runId}/output/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["assembleOutputForRunV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/pipeline/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["startRunV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/pipeline/runs/{runId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getRunStatusV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/pipeline/runs/{runId}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["retryRunV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/reviewer-tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listReviewerTasksV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/reviewer-tasks/{taskId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getReviewerTaskV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/reviewer-tasks/{taskId}/respond": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["respondReviewerTaskV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listSectionReviewTasksV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/revision-impact/{analysisId}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["confirmSectionRevisionImpactV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/tasks/{sectionReviewTaskId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getSectionReviewTaskV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/{runId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listSectionReviewsForRunV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/{runId}/start-review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["startReviewForRunV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/{runId}/workspace": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getStrategyWorkspaceForRunV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/{sectionReviewTaskId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["approveSectionReviewTaskV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/{sectionReviewTaskId}/request-revision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["requestSectionRevisionV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/section-reviews/{sectionReviewTaskId}/revision-impact/analyze": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["analyzeSectionRevisionImpactV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/strategy/narrative/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runNarrativeStage0V2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/strategy/sections/formatter/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runSectionFormatterV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/strategy/sections/generation/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runSectionGenerationV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/strategy/sections/selection/assemble": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["runSectionSelectionV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/telemetry/admin/campaign-health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCampaignHealthCheckV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/telemetry/admin/costs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCostByProviderAndPhaseV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/telemetry/admin/reviewer-outcomes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getReviewerAndRevisionOutcomesV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/telemetry/runs/{runId}/aggregate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getRunTelemetryAggregateV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/telemetry/runs/{runId}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listRunTelemetryEventsV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/telemetry/runs/{runId}/phase-rollups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getPhaseExecutionRollupsForRunV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/wizard/commit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["commitV2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/wizard/options": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getOptionsV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/wizard/state/{campaignId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getStateV2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/wizard/steps/{stepNumber}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["saveStepV2"];
        trace?: never;
    };
    "/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["logoutAll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/password/forgot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["forgotPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/password/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/protected/admin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["admin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/protected/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["meV1AuthProtectedMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/protected/reviewer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["reviewer"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/signup/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["startSignup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/signup/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["verifySignup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AdminReviewerAssignmentEnvelopeV2: {
            data: components["schemas"]["AdminReviewerAssignmentResponseV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        AdminReviewerAssignmentResponseV2: {
            activeRunCount: number;
            assigneeUserId: string | null;
            campaignId: string;
            reviewerTaskCount: number;
            sectionReviewTaskCount: number;
        };
        AdminReviewerAssignmentV2: {
            assigneeUserId: string | null;
        };
        AnalyzeSectionRevisionImpactEnvelopeV2: {
            data: components["schemas"]["AnalyzeSectionRevisionImpactV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        AnalyzeSectionRevisionImpactV2: {
            instruction: string;
            reviewerNotes?: string;
        };
        ApprovalGateV2: {
            allSelectedSectionsApproved: boolean;
            approvedSectionCount: number;
            outputAssemblyBlocked: boolean;
            selectedSectionCount: number;
        };
        ApproveSectionReviewEnvelopeV2: {
            data: components["schemas"]["ApproveSectionReviewV2Response"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        ApproveSectionReviewV2: {
            reviewerNotes?: string;
        };
        ApproveSectionReviewV2Response: {
            allSelectedSectionsApproved: boolean;
            outputAssemblyBlocked: boolean;
            sectionReviewTaskId: string;
            /** @enum {string} */
            status: "APPROVED";
        };
        /** @enum {string} */
        AuthErrorCode: "INVALID_CREDENTIALS" | "AUTHENTICATION_REQUIRED" | "INVALID_REFRESH_TOKEN" | "REFRESH_TOKEN_EXPIRED" | "REFRESH_TOKEN_REUSED" | "REFRESH_IN_PROGRESS" | "SESSION_REVOKED" | "SESSION_FAMILY_REVOKED" | "ACCOUNT_DISABLED" | "ORIGIN_NOT_ALLOWED" | "SECURE_TRANSPORT_REQUIRED";
        AuthSession: {
            accessToken: string;
            user: components["schemas"]["AuthUser"];
        };
        AuthSessionEnvelope: {
            data: components["schemas"]["AuthSession"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        AuthUser: {
            /** Format: date-time */
            createdAt: string;
            /** Format: email */
            email: string;
            id: string;
            /** @enum {string} */
            role: "CLIENT" | "REVIEWER" | "ADMIN";
        };
        AuthUserEnvelope: {
            data: components["schemas"]["AuthUser"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        CampaignRunRecoveryEnvelopeV2: {
            data: components["schemas"]["CampaignRunRecoveryV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        CampaignRunRecoveryV2: {
            run: components["schemas"]["PipelineRunStatusResponseV2"] | null;
        };
        ConfirmSectionRevisionImpactEnvelopeV2: {
            data: components["schemas"]["ConfirmSectionRevisionImpactQueuedV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        ConfirmSectionRevisionImpactQueuedV2: {
            jobId: string;
            /** @enum {string} */
            jobName: "section-revision-impact-confirm-v2";
            pipelineRunId: string;
            /** @enum {string} */
            status: "queued";
            statusUrl: string;
            telemetryUrl: string;
        };
        ConfirmSectionRevisionImpactV2: {
            /** @enum {string} */
            decision: "confirm_apply" | "cancel";
            selectedScopeKeys?: string[];
        };
        EmptyObject: Record<string, never>;
        ErrorEnvelope: {
            details: unknown;
            errorCode: string;
            message: string;
            requestId: string | null;
            statusCode: number;
        };
        ForgotPasswordRequest: {
            /** Format: email */
            email: string;
        };
        GenericRequest: {
            [key: string]: unknown;
        };
        GenericSuccessEnvelope: {
            data: unknown;
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        LoginRequest: {
            /** Format: email */
            email: string;
            /** Format: password */
            password: string;
        };
        LogoutEnvelope: {
            data: {
                /** @enum {boolean} */
                loggedOut: true;
            };
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        PasswordResetEnvelope: {
            data: {
                /** @enum {boolean} */
                ok: true;
            };
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        PasswordResetRequest: {
            /** Format: password */
            newPassword: string;
            otp: string;
            resetId: string;
        };
        PasswordResetStartEnvelope: {
            data: {
                /** Format: date-time */
                expiresAt: string;
                resetId: string;
            };
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        PipelineRunCapabilitiesV2: {
            /**
             * @description V2 cancellation is not supported.
             * @enum {boolean}
             */
            canCancel: false;
            /**
             * @description Reviewer responses resume automatically. No public resume endpoint exists.
             * @enum {boolean}
             */
            canResume: false;
            canRetry: boolean;
        };
        /** @enum {string} */
        PipelineRunErrorCodeV2: "IDEMPOTENCY_KEY_REQUIRED" | "IDEMPOTENCY_KEY_CONFLICT" | "RUN_EXECUTION_IN_PROGRESS" | "CAMPAIGN_NOT_FOUND" | "RUN_NOT_FOUND" | "RUN_ACCESS_DENIED" | "RUN_ALREADY_ACTIVE" | "RUN_NOT_RETRYABLE" | "RUN_TRANSITION_CONFLICT" | "RUN_REVIEW_REQUIRED" | "RUN_START_FAILED" | "RUN_TEMPORARILY_UNAVAILABLE" | "RUN_STATUS_RATE_LIMITED";
        PipelineRunErrorV2: {
            code: string;
            details: {
                [key: string]: unknown;
            } | null;
            failedPhase: string | null;
            message: string;
            /** Format: date-time */
            occurredAt: string | null;
            retryable: boolean;
        } | null;
        PipelineRunProgressV2: {
            completedUnits: number;
            percent: number | null;
            /** @description Null until Backend can determine a stable total from the frozen run plan. */
            totalUnits: number | null;
        };
        /** @enum {string} */
        PipelineRunRequiredActionV2: "WAIT" | "REVIEW_REQUIRED" | "RETRY_AVAILABLE" | "CONTACT_SUPPORT" | "NONE";
        PipelineRunRetryEnvelopeV2: {
            data: components["schemas"]["PipelineRunRetryV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        PipelineRunRetryV2: components["schemas"]["PipelineRunStartV2"] & {
            resumedFromPhase: string | null;
        };
        PipelineRunStartEnvelopeV2: {
            data: components["schemas"]["PipelineRunStartV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        PipelineRunStartV2: {
            attemptNumber: number;
            campaignId: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            queuedAt: string;
            runId: string;
            status: components["schemas"]["PipelineRunStatusV2"];
            statusUrl: string;
        };
        PipelineRunStatusEnvelopeV2: {
            data: components["schemas"]["PipelineRunStatusResponseV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        PipelineRunStatusResponseV2: {
            attemptNumber: number;
            /** Format: date-time */
            blockedAt: string | null;
            campaignId: string;
            capabilities: components["schemas"]["PipelineRunCapabilitiesV2"];
            /** Format: date-time */
            completedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            currentPhase: string | null;
            error: components["schemas"]["PipelineRunErrorV2"];
            /** Format: date-time */
            failedAt: string | null;
            /** @description Use this Backend-derived delay. Typical values are 2000, 5000, and 15000 milliseconds. */
            pollAfterMs: number;
            progress: components["schemas"]["PipelineRunProgressV2"];
            /** Format: date-time */
            queuedAt: string;
            /** @enum {string} */
            referenceStatus: "ACTIVE" | "STALE";
            requiredAction: components["schemas"]["PipelineRunRequiredActionV2"];
            retryable: boolean;
            runId: string;
            shouldPoll: boolean;
            /** Format: date-time */
            startedAt: string | null;
            status: components["schemas"]["PipelineRunStatusV2"];
            /** Format: date-time */
            updatedAt: string;
        };
        /** @enum {string} */
        PipelineRunStatusV2: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "BLOCKED_AWAITING_REVIEW";
        ProtectedEnvelope: {
            data: {
                /** @enum {boolean} */
                ok: true;
            };
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        RequestSectionRevisionEnvelopeV2: {
            data: components["schemas"]["RequestSectionRevisionQueuedV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        RequestSectionRevisionQueuedV2: {
            jobId: string;
            /** @enum {string} */
            jobName: "section-revision-request-v2";
            pipelineRunId: string;
            /** @enum {string} */
            status: "queued";
            statusUrl: string;
            telemetryUrl: string;
        };
        RequestSectionRevisionV2: {
            instruction: string;
            reviewerNotes?: string;
        };
        ResponseMeta: {
            requestId: string | null;
            /** Format: date-time */
            timestamp: string;
        };
        ReviewerTaskCampaignSummaryV2: {
            businessName: string | null;
            campaignCurrentStep: number;
            campaignId: string;
            campaignStatus: string;
            campaignTitle: string;
            primaryMarket: string | null;
        };
        ReviewerTaskDetailEnvelopeV2: {
            data: components["schemas"]["ReviewerTaskDetailV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        ReviewerTaskDetailV2: {
            /** Format: date-time */
            answeredAt: string | null;
            attemptNumber: number;
            audienceId: string | null;
            campaign: components["schemas"]["ReviewerTaskCampaignSummaryV2"];
            /** Format: date-time */
            closedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            currentValuesToFix: {
                [key: string]: unknown;
            } | null;
            failureMode: string;
            feedback: {
                [key: string]: unknown;
            };
            id: string;
            marketId: string | null;
            phaseName: string;
            pipelineRestartPhase: string;
            pipelineRunCurrentPhase: string | null;
            pipelineRunId: string;
            pipelineRunStatus: components["schemas"]["PipelineRunStatusV2"];
            questionPayload: {
                [key: string]: unknown;
            };
            questionTemplate: string;
            questionTemplateId: string;
            renderedQuestion: string;
            resumeOutcome: string | null;
            resumeStrategy: string;
            /** Format: date-time */
            resumedAt: string | null;
            reviewerId: string | null;
            status: string;
            submittedAnswer: {
                [key: string]: unknown;
            } | null;
            whatWentWrong: string;
            whereAnswerWillBeApplied: string;
        };
        ReviewerTaskListEnvelopeV2: {
            data: components["schemas"]["ReviewerTaskListV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        ReviewerTaskListItemV2: {
            /** Format: date-time */
            answeredAt: string | null;
            campaign: components["schemas"]["ReviewerTaskCampaignSummaryV2"];
            /** Format: date-time */
            createdAt: string;
            failureMode: string;
            id: string;
            marketId: string | null;
            phaseName: string;
            pipelineRunId: string;
            questionPayload: {
                [key: string]: unknown;
            };
            questionTemplateId: string;
            /** Format: date-time */
            resumedAt: string | null;
            reviewerId: string | null;
            status: string;
        };
        ReviewerTaskListV2: {
            items: components["schemas"]["ReviewerTaskListItemV2"][];
        };
        ReviewerTaskRespondEnvelopeV2: {
            data: components["schemas"]["ReviewerTaskRespondV2Response"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        ReviewerTaskRespondV2: {
            answer: {
                [key: string]: unknown;
            };
        };
        ReviewerTaskRespondV2Response: {
            jobId: string;
            /** @enum {string} */
            jobName: "reviewer-task-response-v2";
            pipelineRunId: string;
            /** @enum {string} */
            status: "queued";
            statusUrl: string;
            telemetryUrl: string;
        };
        SectionReviewForRunItemV2: {
            answerSchema: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            approvedAt: string | null;
            audienceId: string | null;
            /** Format: date-time */
            createdAt: string;
            id: string;
            marketId: string | null;
            pipelineRunId: string;
            questionTemplateId: string;
            renderedQuestion: string;
            reviewerId: string | null;
            reviewerNotes: string | null;
            revisionCount: number;
            revisionRequests: {
                /** Format: date-time */
                completedAt: string | null;
                /** Format: date-time */
                createdAt: string;
                id: string;
                instruction: string;
                previousSectionGenerationRecordId: string;
                resultingSectionGenerationRecordId: string | null;
                /** @enum {string} */
                status: "PENDING" | "COMPLETED" | "FAILED";
            }[];
            sectionGenerationRecordId: string;
            sectionId: string;
            sectionTitle: string | null;
            /** @enum {string} */
            status: "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
            /** Format: date-time */
            submittedAt: string | null;
        };
        SectionReviewTaskDetailEnvelopeV2: {
            data: components["schemas"]["SectionReviewTaskDetailV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        SectionReviewTaskDetailV2: {
            answerSchema: {
                [key: string]: unknown;
            };
            approvalGate: components["schemas"]["ApprovalGateV2"];
            /** Format: date-time */
            approvedAt: string | null;
            audienceId: string | null;
            campaignCurrentStep: number;
            campaignId: string;
            campaignStatus: string;
            campaignTitle: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            generatedAt: string;
            generationAttempt: number;
            generationOutputConstraintOutcome: string | null;
            generationRedundancyOutcome: string | null;
            generationValidationOutcomes: {
                [key: string]: unknown;
            } | null;
            generationValidationStatus: string;
            id: string;
            isCurrentApprovedGeneration: boolean;
            marketId: string | null;
            pipelineRunCurrentPhase: string | null;
            pipelineRunId: string;
            pipelineRunStatus: components["schemas"]["PipelineRunStatusV2"];
            questionTemplate: string;
            questionTemplateId: string;
            renderedQuestion: string;
            resumeStrategy: string;
            reviewerId: string | null;
            reviewerNotes: string | null;
            revisionCount: number;
            revisionRequests: components["schemas"]["SectionRevisionDetailV2"][];
            sectionContent: string;
            sectionGenerationRecordId: string;
            sectionId: string;
            sectionTitle: string | null;
            /** @enum {string} */
            status: "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
            /** Format: date-time */
            submittedAt: string | null;
        };
        SectionReviewTaskListEnvelopeV2: {
            data: components["schemas"]["SectionReviewTaskListV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        SectionReviewTaskListItemV2: {
            /** Format: date-time */
            approvedAt: string | null;
            audienceId: string | null;
            campaignCurrentStep: number;
            campaignId: string;
            campaignStatus: string;
            campaignTitle: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            generatedAt: string;
            generationOutputConstraintOutcome: string | null;
            generationRedundancyOutcome: string | null;
            generationValidationStatus: string;
            id: string;
            latestRevisionRequest: components["schemas"]["SectionRevisionSummaryV2"] | null;
            marketId: string | null;
            pipelineRunCurrentPhase: string | null;
            pipelineRunId: string;
            pipelineRunStatus: components["schemas"]["PipelineRunStatusV2"];
            reviewerId: string | null;
            reviewerNotes: string | null;
            revisionCount: number;
            sectionGenerationRecordId: string;
            sectionId: string;
            sectionTitle: string | null;
            /** @enum {string} */
            status: "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
            /** Format: date-time */
            submittedAt: string | null;
        };
        SectionReviewTaskListV2: {
            items: components["schemas"]["SectionReviewTaskListItemV2"][];
        };
        SectionReviewsForRunEnvelopeV2: {
            data: components["schemas"]["SectionReviewsForRunV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        SectionReviewsForRunV2: {
            allSelectedSectionsApproved: boolean;
            approvedSectionCount: number;
            items: components["schemas"]["SectionReviewForRunItemV2"][];
            outputAssemblyBlocked: boolean;
            pipelineRunId: string;
            selectedSectionCount: number;
        };
        SectionRevisionDetailV2: {
            /** Format: date-time */
            completedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            id: string;
            instruction: string;
            previousSectionGenerationRecordId: string;
            requestedByUserId: string;
            resultingSectionGenerationRecordId: string | null;
            /** @enum {string} */
            status: "PENDING" | "COMPLETED" | "FAILED";
        };
        SectionRevisionImpactCandidateV2: {
            audienceId: string | null;
            /** @enum {string} */
            confidence: "high" | "medium";
            /** @enum {string} */
            impactType: "direct" | "potential";
            marketId: string | null;
            reason: string;
            scopeKey: string;
            sectionId: string;
            sectionTitle: string;
        };
        SectionRevisionSummaryV2: {
            /** Format: date-time */
            completedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            id: string;
            /** @enum {string} */
            status: "PENDING" | "COMPLETED" | "FAILED";
        };
        SignupStartEnvelope: {
            data: {
                /** Format: date-time */
                expiresAt: string;
                verificationId: string;
            };
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        SignupStartRequest: {
            /** Format: email */
            email: string;
            name?: string;
            /** Format: password */
            password: string;
        };
        SignupVerifyRequest: {
            otp: string;
            verificationId: string;
        };
        StartPipelineRunRequestV2: {
            campaignId: string;
        };
        StartSectionReviewEnvelopeV2: {
            data: components["schemas"]["StartSectionReviewV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        StartSectionReviewV2: {
            assignedTaskCount?: number;
            assignmentApplied: boolean;
            assignmentRequired: boolean;
            pipelineRunId: string;
            reason?: string;
            reviewerUserId: string;
            totalSectionReviewTaskCount?: number;
        };
        StrategyWorkspaceEnvelopeV2: {
            data: components["schemas"]["StrategyWorkspaceV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        StrategyWorkspaceSectionV2: {
            /** Format: date-time */
            approvedAt: string | null;
            audienceId: string | null;
            availableActions: {
                approve: {
                    enabled: boolean;
                    /** @enum {string} */
                    method: "POST";
                    path: string;
                };
                requestRevision: {
                    enabled: boolean;
                    /** @enum {string} */
                    method: "POST";
                    path: string;
                    payloadContract: {
                        optionalFields: string[];
                        requiredFields: string[];
                    };
                };
            };
            /** Format: date-time */
            createdAt: string | null;
            /** Format: date-time */
            generatedAt: string | null;
            generationAttempt: number | null;
            generationOutputConstraintOutcome: string | null;
            generationRedundancyOutcome: string | null;
            generationValidationOutcomes: {
                [key: string]: unknown;
            } | null;
            generationValidationStatus: string | null;
            marketId: string | null;
            reviewerId: string | null;
            reviewerNotes: string | null;
            revisionCount: number;
            revisionRequests: components["schemas"]["SectionRevisionDetailV2"][];
            sectionContent: string | null;
            sectionGenerationRecordId: string | null;
            sectionId: string;
            /** @enum {string|null} */
            sectionReviewStatus: "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | null;
            sectionReviewTaskId: string | null;
            sectionTitle: string;
            /** Format: date-time */
            submittedAt: string | null;
        };
        StrategyWorkspaceV2: {
            inputTab: {
                intakeNormalization: {
                    intakeNormalizationRecordId: string;
                    /** Format: date-time */
                    normalizedAt: string;
                    normalizedInput: {
                        [key: string]: unknown;
                    };
                    schemaVersion: string;
                    status: string;
                    validationIssues: unknown;
                } | null;
                wizardIntakeSnapshot: {
                    commitState: {
                        [key: string]: unknown;
                    };
                    /** Format: date-time */
                    committedAt: string;
                    dataConsentOptIn: boolean;
                    schemaVersion: string;
                    wizardInput: {
                        [key: string]: unknown;
                    };
                    wizardIntakeSnapshotId: string;
                } | null;
            };
            permissions: {
                canApproveSections: boolean;
                canRequestSectionRevision: boolean;
                /** @enum {string} */
                viewerRole: "CLIENT" | "REVIEWER" | "ADMIN";
            };
            pipelineRun: {
                campaignCurrentStep: number;
                campaignId: string;
                campaignStatus: string;
                campaignTitle: string;
                /** Format: date-time */
                completedAt: string | null;
                /** Format: date-time */
                createdAt: string;
                currentPhaseName: string | null;
                errorCode: string | null;
                errorMessage: string | null;
                pipelineRunId: string;
                primaryMarket: string | null;
                /** Format: date-time */
                startedAt: string;
                status: components["schemas"]["PipelineRunStatusV2"];
                targetMarkets: string[];
                /** Format: date-time */
                updatedAt: string;
            };
            sectionsTab: {
                actions: {
                    approveEndpointTemplate: string;
                    requestRevisionEndpointTemplate: string;
                };
                allSelectedSectionsApproved: boolean;
                approvedSectionCount: number;
                items: components["schemas"]["StrategyWorkspaceSectionV2"][];
                outputAssemblyBlocked: boolean;
                selectedSectionCount: number;
            };
        };
        WizardCommitEnvelopeV2: {
            data: components["schemas"]["WizardCommitResponseV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        WizardCommitRequestV2: {
            campaignId: string;
            step7?: {
                dataConsentOptIn?: boolean;
                readyToGenerate?: boolean;
            };
            version?: number;
        };
        WizardCommitResponseV2: {
            /** @enum {boolean} */
            commitAccepted: true;
            generationTriggered: boolean;
            pipelineRunId: string | null;
            pipelineStatus: components["schemas"]["PipelineRunStatusV2"] | null;
            run: components["schemas"]["WizardRunReferenceV2"];
        } & {
            [key: string]: unknown;
        };
        WizardRunReferenceV2: {
            campaignId: string;
            runId: string;
            status: components["schemas"]["PipelineRunStatusV2"];
            statusUrl: string;
        } | null;
        WizardStateEnvelopeV2: {
            data: components["schemas"]["WizardStateResponseV2"];
            meta: components["schemas"]["ResponseMeta"];
            /** @enum {boolean} */
            success: true;
        };
        WizardStateResponseV2: {
            campaignId: string;
            run: components["schemas"]["WizardStateRunRecoveryV2"];
            status: string;
            version: number;
        } & {
            [key: string]: unknown;
        };
        WizardStateRunRecoveryV2: {
            attemptNumber: number;
            runId: string;
            status: components["schemas"]["PipelineRunStatusV2"];
            statusUrl: string;
            /** Format: date-time */
            updatedAt: string;
        } | null;
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getCampaignV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    assignCampaignReviewerV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminReviewerAssignmentV2"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminReviewerAssignmentEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    recreateRunFromLatestCommitV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    triggerIntelligenceV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    triggerOutputV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    triggerPipelineV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    triggerSectionsV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    triggerStrategyV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    createLegalDocumentVersionV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    updateLegalDocumentVersionV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    listSignedDocumentsV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    createSignedDocumentMetadataV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    listRunsV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    assembleInternalDraftOutputForRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getCampaignRecoveryV2: {
        parameters: {
            query?: {
                /** @description Select the active run or the latest run. */
                mode?: "active" | "latest";
            };
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CampaignRunRecoveryEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Run or campaign not found */
            404: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Run-status polling rate exceeded */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Seconds before the client should retry. */
                    "Retry-After"?: number;
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    assembleClientContextV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runDiscoverySprintV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runCompetitiveGroundingV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runGapAnalysisV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runDiagnosticCheckpointV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runChannelSelectionV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runIntelligenceManifestAssemblyV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runSerpCompetitorIdentificationV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    giveConsentV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    myConsentStateV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    withdrawConsentV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    acceptLegalDocumentsV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getActiveLegalDocumentsV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getOutputForRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    assembleOutputForRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    startRunV2: {
        parameters: {
            query?: never;
            header: {
                /** @description Required mutation key. Retained for seven days; same key and request replays the response, while a changed request returns 409. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StartPipelineRunRequestV2"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PipelineRunStartEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Run or campaign not found */
            404: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Idempotency or run-state conflict */
            409: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Run prerequisites or queue preparation unavailable */
            503: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getRunStatusV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PipelineRunStatusEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Run or campaign not found */
            404: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Run-status polling rate exceeded */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Seconds before the client should retry. */
                    "Retry-After"?: number;
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    retryRunV2: {
        parameters: {
            query?: never;
            header: {
                /** @description Required mutation key. Retained for seven days; same key and request replays the response, while a changed request returns 409. */
                "Idempotency-Key": string;
            };
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["EmptyObject"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PipelineRunRetryEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Run or campaign not found */
            404: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Idempotency or run-state conflict */
            409: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    listReviewerTasksV2: {
        parameters: {
            query?: {
                /** @description Reviewer-task status token. Omit to return visible non-closed tasks. */
                status?: string;
                /** @description Limit results to one pipeline run. */
                pipelineRunId?: string;
                /** @description Limit results to one market identifier. */
                marketId?: string;
                /** @description Maximum number of results requested. Values above 200 are capped at 200. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewerTaskListEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getReviewerTaskV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                taskId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewerTaskDetailEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    respondReviewerTaskV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                taskId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewerTaskRespondV2"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewerTaskRespondEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    listSectionReviewTasksV2: {
        parameters: {
            query?: {
                /** @description Section-review status filter. */
                status?: "pending_review" | "changes_requested" | "approved";
                /** @description Limit results to one pipeline run. */
                pipelineRunId?: string;
                /** @description Limit results to one market identifier. */
                marketId?: string;
                /** @description Maximum number of results requested. Values above 200 are capped at 200. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SectionReviewTaskListEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    confirmSectionRevisionImpactV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                analysisId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmSectionRevisionImpactV2"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfirmSectionRevisionImpactEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getSectionReviewTaskV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sectionReviewTaskId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SectionReviewTaskDetailEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    listSectionReviewsForRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SectionReviewsForRunEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    startReviewForRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["EmptyObject"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StartSectionReviewEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getStrategyWorkspaceForRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StrategyWorkspaceEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    approveSectionReviewTaskV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sectionReviewTaskId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApproveSectionReviewV2"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApproveSectionReviewEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    requestSectionRevisionV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sectionReviewTaskId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestSectionRevisionV2"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestSectionRevisionEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    analyzeSectionRevisionImpactV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sectionReviewTaskId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnalyzeSectionRevisionImpactV2"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnalyzeSectionRevisionImpactEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runNarrativeStage0V2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runSectionFormatterV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runSectionGenerationV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    runSectionSelectionV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getCampaignHealthCheckV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getCostByProviderAndPhaseV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getReviewerAndRevisionOutcomesV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getRunTelemetryAggregateV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    listRunTelemetryEventsV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getPhaseExecutionRollupsForRunV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                runId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    commitV2: {
        parameters: {
            query?: never;
            header: {
                /** @description Required mutation key. Retained for seven days; same key and request replays the response, while a changed request returns 409. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WizardCommitRequestV2"];
            };
        };
        responses: {
            /** @description Successful response */
            202: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WizardCommitEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Idempotency or run-state conflict */
            409: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getOptionsV2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getStateV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                campaignId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WizardStateEnvelopeV2"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    saveStepV2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                stepNumber: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenericRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericSuccessEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required for browser requests that create, rotate, or clear the refresh cookie. Referer may be used when Origin is unavailable. */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description adcendy_refresh=<redacted>; Path=/v1/auth; HttpOnly; Secure in UAT/Production; SameSite=Lax; no Domain attribute. */
                    "Set-Cookie"?: string;
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthSessionEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required for browser requests that create, rotate, or clear the refresh cookie. Referer may be used when Origin is unavailable. */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["EmptyObject"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Clears adcendy_refresh using the same Path, HttpOnly, Secure, and SameSite attributes. */
                    "Set-Cookie"?: string;
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogoutEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    logoutAll: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required for browser requests that create, rotate, or clear the refresh cookie. Referer may be used when Origin is unavailable. */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["EmptyObject"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Clears adcendy_refresh using the same Path, HttpOnly, Secure, and SameSite attributes. */
                    "Set-Cookie"?: string;
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogoutEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthUserEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    forgotPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetStartEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    admin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtectedEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    meV1AuthProtectedMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthUserEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    reviewer: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtectedEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required for browser requests that create, rotate, or clear the refresh cookie. Referer may be used when Origin is unavailable. */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["EmptyObject"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description adcendy_refresh=<redacted>; Path=/v1/auth; HttpOnly; Secure in UAT/Production; SameSite=Lax; no Domain attribute. */
                    "Set-Cookie"?: string;
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthSessionEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Another refresh is already in progress */
            409: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    startSignup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignupStartRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            201: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SignupStartEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    verifySignup: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required for browser requests that create, rotate, or clear the refresh cookie. Referer may be used when Origin is unavailable. */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignupVerifyRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description adcendy_refresh=<redacted>; Path=/v1/auth; HttpOnly; Secure in UAT/Production; SameSite=Lax; no Domain attribute. */
                    "Set-Cookie"?: string;
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthSessionEnvelope"];
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Temporary service failure */
            500: {
                headers: {
                    /** @description Authenticated and application responses are not cacheable by browsers, reverse proxies, or CDNs. */
                    "Cache-Control"?: "no-store";
                    /** @description Request correlation identifier generated or validated by Backend. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
}
