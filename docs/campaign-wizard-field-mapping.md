# Campaign wizard fixture field mapping

Canonical sources inspected: frontend `CampaignWizardModal`, frontend wizard Zod schemas and real API adapter, backend `wizard-v2.schemas.ts`, `WizardV2Service.validateCommitStateV2`, the active C09 wizard seed/options, and the normalized-field mapping audit in `WizardV2Service`.

“Backend payload field” shows the raw v2 step field and, after `→`, its normalized destination where one exists. Option values are selected from the live DB-backed `/api/v2/wizard/options` response; fixture tokens are matched canonically so camelCase seed values and snake_case backend normalization retain the same meaning.

| Fixture JSON path | Wizard step | UI field | Input type | Mandatory / optional | Conditional visibility or rule | Backend payload field |
|---|---:|---|---|---|---|---|
| `wizard.step1.title` | 1 | Campaign title | Text | Optional | Auto-generated from focus/market when blank | `step1.title → strategy_focus.title` |
| `wizard.step1.marketingTargetType` | 1 | What is being marketed? | Card radio | Mandatory | Always | `step1.marketingTargetType → strategy_focus.marketing_target_type` |
| `wizard.step1.focusName` | 1 | Focus/business/product/launch name | Text | Mandatory | Label changes by marketing target | `step1.focusName → strategy_focus.focus_name` |
| `wizard.step1.sourceType` | 1 | Source to use | Card radio | Mandatory | Always | `step1.sourceType → strategy_focus.source_type` |
| `wizard.step1.primaryUrl` | 1 | Website/digital-presence URL | URL text | Conditional mandatory | Required unless `sourceType=manual_only`; hidden and empty for manual-only | `step1.primaryUrl → digital_presence_context.primary_url` |
| `wizard.step1.targetMarkets[]` | 1 | Target markets | Tag list | Mandatory, 1–4 | Always | `step1.targetMarkets → strategy_focus.target_markets` |
| `wizard.step1.primaryMarket` | 1 | Primary market | Dropdown | Conditional mandatory | Visible/required when more than one target market; must be one selected market | `step1.primaryMarket → strategy_focus.primary_market` |
| `wizard.step1.marketScope` | 1 | Market scope | Dropdown | Mandatory | Always | `step1.marketScope → strategy_focus.market_scope` |
| `wizard.step1.operationalLocations[]` | 1 | Operational locations | Tag list | Conditional mandatory | Visible/required for local or regional scope | `step1.operationalLocations → strategy_focus.operational_locations` |
| `wizard.step1.regionalLanguageExpansionEnabled` | 1 | Regional language expansion | Switch | Optional, default false | Regional-language expansion policy; currently rendered by UI | `step1.regionalLanguageExpansionEnabled → market_research_locale.india_regional_language_expansion_mode` |
| `wizard.step1.regionalLanguages[]` | 1 | Regional languages | Tag list | Conditional mandatory | Visible/required when expansion is enabled | `step1.regionalLanguages → market_research_locale.regional_languages` |
| `wizard.step1.marketLocation` | 1 | Legacy market alias | No direct control | Optional alias | Derived from primary/first target market | `step1.marketLocation → strategy_focus.target_markets` |
| `wizard.step2.businessName` | 2 | Business name | Text | Conditional mandatory | Required when focus is not whole business | `step2.businessName → client_context_seed.business_name` |
| `wizard.step2.industryCategory` | 2 | Industry category | DB-backed dropdown | Mandatory | Options come from active guidance fragments | `step2.industryCategory → client_context_seed.industry_category` |
| `wizard.step2.businessModel` | 2 | Business model | Dropdown | Mandatory | Always | `step2.businessModel → client_context_seed.business_model` |
| `wizard.step2.audienceModel` | 2 | Audience model | Dropdown | Mandatory | Drives Step 3 audience-segment requirement | `step2.audienceModel → client_context_seed.audience_model` |
| `wizard.step2.lifecycleStage` | 2 | Lifecycle stage | Dropdown | Mandatory | Always | `step2.lifecycleStage → taxonomy.values.lifecycle_stage` |
| `wizard.step2.businessDescription` | 2 | Business description | Text area | Mandatory | Always | `step2.businessDescription → client_context_seed.business_description` |
| `wizard.step2.productCategory` | 2 | Product category | Text | Mandatory | Always | `step2.productCategory → client_context_seed.product_category` |
| `wizard.step2.productsServices[]` | 2 | Product or service | Tag list | Mandatory | UI form alias is `productOrService`; adapter emits canonical `productsServices` | `step2.productsServices → client_context_seed.primary_offerings` |
| `wizard.step2.offerSummary` | 2 | Offer summary | Text area | Optional | Always | `step2.offerSummary → client_context_seed.offer_summary` |
| `wizard.step2.priceRange` | 2 | Price range | Text | Mandatory, unknown allowed | Always | `step2.priceRange → unit_economics.average_order_value_range` |
| `wizard.step2.differentiators[]` | 2 | Differentiators | Tag list | Optional | Intake claims, not proven facts | `step2.differentiators → client_context_seed.differentiators` |
| `wizard.step2.sensitiveCategoryFlags[]` | 2 | Sensitive category flags | DB-backed checkbox cards or tag fallback | Mandatory | Must include an applicable flag such as none/not-sure | `step2.sensitiveCategoryFlags → client_context_seed.sensitive_category_flags` |
| `wizard.step2.complianceSensitiveClaims[]` | 2 | Compliance sensitive claims | Tag list | Conditional mandatory | Required when a DB-configured regulated flag is selected | `step2.complianceSensitiveClaims → business_constraints.compliance_sensitive_claims` |
| `wizard.step3.primaryTargetSegment` | 3 | Primary target segment | Text (max 160) | Mandatory | Always | `step3.primaryTargetSegment → audience_context.primary_target_segment` |
| `wizard.step3.targetPersona` | 3 | Target persona | Text area (max 500) | Mandatory | Always | `step3.targetPersona → audience_context.target_persona` |
| `wizard.step3.targetAudience` | 3 | Broader target audience | Text area | Optional | Always | `step3.targetAudience → audience_context.target_audience` |
| `wizard.step3.audienceSegments[]` | 3 | Audience segments | Tag list | Conditional mandatory | Required for B2B2C, marketplace/two-sided, and multi-sided audience models | `step3.audienceSegments → audience_context.audience_segments` |
| `wizard.step3.language` | 3 | Language | Dropdown | Mandatory | Always | `step3.language → audience_context.language` |
| `wizard.step3.reportLanguage` | 3 | Report language | Dropdown | Optional | Auto-inferred when blank | `step3.reportLanguage → audience_context.report_language` |
| `wizard.step3.painPoints[]` | 3 | Pain points | Tag list | Mandatory | 3–5 is quality-recommended | `step3.painPoints → audience_context.pain_points` |
| `wizard.step3.desiredOutcome` | 3 | Desired outcome | Text area (max 300) | Mandatory | Always | `step3.desiredOutcome → audience_context.desired_outcome` |
| `wizard.step3.decisionProcess` | 3 | Decision process | Text area (max 500) | Mandatory | Committee-like text can require buyer roles | `step3.decisionProcess → audience_context.decision_process` |
| `wizard.step3.buyerRoles[]` | 3 | Buyer roles | Tag list | Conditional mandatory | Required for B2B and committee-like buying contexts | `step3.buyerRoles → audience_context.buyer_roles` |
| `wizard.step4.salesChannels[]` | 4 | Ranked sales channels | Repeatable section | Mandatory, at least one | Ranks must be unique and sequential from 1 | `step4.salesChannels → client_context_seed.sales_channels` |
| `wizard.step4.salesChannels[].channel` | 4 | Sales channel | Dropdown | Mandatory | Per repeated row | `step4.salesChannels[].channel` |
| `wizard.step4.salesChannels[].rank` | 4 | Rank | Number | Mandatory | Per repeated row; positive integer | `step4.salesChannels[].rank` |
| `wizard.step4.salesChannels[].customName` | 4 | Custom channel name | Text | Conditional optional | Visible for `channel=other` | `step4.salesChannels[].customName` |
| `wizard.step4.primaryConversionPath` | 4 | Primary conversion path | Dropdown | Mandatory | Always | `step4.primaryConversionPath → business_constraints.primary_conversion_path` |
| `wizard.step4.trustSignals[]` | 4 | Trust signals | Tag list | Conditional mandatory | Required for manual-only, absent, or thin website contexts | `step4.trustSignals → client_context_seed.trust_signals` |
| `wizard.step4.socialHandles[]` | 4 | Social handles | Repeatable section | Optional | Added only when supplied | `step4.socialHandles → digital_presence_context.social_handles` |
| `wizard.step4.socialHandles[].platform` | 4 | Social platform | Dropdown | Mandatory per row | Row exists when supplied | `step4.socialHandles[].platform` |
| `wizard.step4.socialHandles[].handle` | 4 | Social handle | Text | Mandatory per row | Row exists when supplied | `step4.socialHandles[].handle` |
| `wizard.step4.digitalPresenceLinks[]` | 4 | Digital presence links | Repeatable section | Optional | Added only when supplied | `step4.digitalPresenceLinks → digital_presence_context.digital_presence_links` |
| `wizard.step4.digitalPresenceLinks[].type` | 4 | Link type | Dropdown | Mandatory per row | Row exists when supplied | `step4.digitalPresenceLinks[].type` |
| `wizard.step4.digitalPresenceLinks[].url` | 4 | Link URL | URL text | Mandatory per row | Row exists when supplied | `step4.digitalPresenceLinks[].url` |
| `wizard.step4.digitalPresenceLinks[].label` | 4 | Link label | Text | Optional | Row exists when supplied | `step4.digitalPresenceLinks[].label` |
| `wizard.step4.googleAnalyticsConnected` | 4 | Google Analytics connected | Dropdown | Optional | True, false, unknown, or omitted | `step4.googleAnalyticsConnected → baseline_business_metrics.google_analytics_connected` |
| `wizard.step4.monthlyWebsiteTraffic` | 4 | Monthly website traffic | Dropdown | Optional | Unknown/omitted accepted | `step4.monthlyWebsiteTraffic → baseline_business_metrics.monthly_website_traffic_range` |
| `wizard.step4.emailListSize` | 4 | Email list size | Dropdown | Optional | Unknown/omitted accepted | `step4.emailListSize → baseline_business_metrics.email_list_size_range` |
| `wizard.step5.primaryGoal` | 5 | Primary goal | DB-backed dropdown | Mandatory | Always | `step5.primaryGoal → marketing_operating_context.primary_goal` |
| `wizard.step5.monthlyMarketingSpend` | 5 | Monthly marketing spend | Dropdown | Mandatory | Range or unknown-equivalent | `step5.monthlyMarketingSpend → business_constraints.monthly_marketing_budget_range` |
| `wizard.step5.paidMediaBudgetRange` | 5 | Paid media budget range | Text | Mandatory, unknown allowed | Always | `step5.paidMediaBudgetRange → business_constraints.paid_media_budget_range` |
| `wizard.step5.marketingHandler` | 5 | Who handles marketing? | DB-backed dropdown | Mandatory | Always | `step5.marketingHandler → marketing_operating_context.marketing_handler` |
| `wizard.step5.contentCapacity` | 5 | Content capacity | DB-backed dropdown | Mandatory | Always | `step5.contentCapacity → marketing_operating_context.content_capacity` |
| `wizard.step5.salesCapacity` | 5 | Sales capacity | Text | Conditional mandatory | Required for B2B or sales-led conversion paths | `step5.salesCapacity → marketing_operating_context.sales_capacity` |
| `wizard.step5.currentMarketingActivity[]` | 5 | Current marketing activity | Repeatable section | Optional, quality-recommended | Added only when supplied | `step5.currentMarketingActivity → current_marketing_activity` |
| `wizard.step5.currentMarketingActivity[].channel` | 5 | Activity channel | Text | Mandatory per row | Row exists when supplied | `step5.currentMarketingActivity[].channel` |
| `wizard.step5.currentMarketingActivity[].status` | 5 | Activity status | DB-backed dropdown | Mandatory per row | Active, paused, or discontinued | `step5.currentMarketingActivity[].status` |
| `wizard.step5.currentMarketingActivity[].workingAssessment` | 5 | Working assessment | DB-backed dropdown | Optional | Row exists when supplied | `step5.currentMarketingActivity[].workingAssessment` |
| `wizard.step5.currentMarketingActivity[].evidence` | 5 | Evidence | Text area | Optional | Quality-recommended | `step5.currentMarketingActivity[].evidence` |
| `wizard.step5.currentMarketingActivity[].monthlySpend` | 5 | Monthly spend | Text | Optional | Row exists when supplied | `step5.currentMarketingActivity[].monthlySpend` |
| `wizard.step5.currentMarketingActivity[].timeRunning` | 5 | Time running | Text | Optional | Row exists when supplied | `step5.currentMarketingActivity[].timeRunning` |
| `wizard.step5.currentMarketingActivity[].reasonStopped` | 5 | Reason stopped | Text | Optional | Relevant to paused/discontinued activity | `step5.currentMarketingActivity[].reasonStopped` |
| `wizard.step5.pastMarketing` | 5 | Past marketing | Text area | Optional legacy context | Always | `step5.pastMarketing → marketing_operating_context.past_marketing` |
| `wizard.step5.whatsWorking` | 5 | What's working? | Text area | Optional | Always | `step5.whatsWorking → marketing_operating_context.whats_working` |
| `wizard.step5.biggestFrustration` | 5 | Biggest frustration | Text area | Optional | Always | `step5.biggestFrustration → marketing_operating_context.biggest_frustration` |
| `wizard.step5.knownCompetitorStatus` | 5 | Known competitor status | DB-backed dropdown | Mandatory | Controls known-competitor list | `step5.knownCompetitorStatus → known_competitor_input_status_gate` |
| `wizard.step5.knownCompetitors[]` | 5 | Known competitors | Tag list | Conditional mandatory | Required when status is provided | `step5.knownCompetitors → known_competitor_input` |
| `wizard.step5.constraints[]` | 5 | Constraints | Tag list | Optional | Always | `step5.constraints → business_constraints.execution_constraints` |
| `wizard.step5.channelsToAvoid[]` | 5 | Channels to avoid | Tag list | Optional | Always | `step5.channelsToAvoid → business_constraints.channels_to_avoid` |
| `wizard.step5.channelsStronglyPreferred[]` | 5 | Channels strongly preferred | Tag list | Optional | Always | `step5.channelsStronglyPreferred → business_constraints.channels_strongly_preferred` |
| `wizard.step5.executionConstraints[]` | 5 | Execution constraints | Tag list | Optional | Always | `step5.executionConstraints → business_constraints.execution_constraints` |
| `wizard.step5.additionalContext` | 5 | Additional context | Text area | Optional | Always | `step5.additionalContext → marketing_operating_context.additional_context` |
| `wizard.step6.averageOrderValue` | 6 | Average order value | Text | Required-with-unknown alternative | At least AOV or ACV must be supplied; `not_sure` accepted | `step6.averageOrderValue → unit_economics.average_order_value_range` |
| `wizard.step6.averageContractValue` | 6 | Average contract value | Text | Required-with-unknown alternative | At least AOV or ACV must be supplied; `not_sure` accepted | `step6.averageContractValue → unit_economics.average_contract_value_range` |
| `wizard.step6.grossMarginPercentage` | 6 | Gross margin percentage | Text | Optional / recommended | Especially useful for commerce | `step6.grossMarginPercentage → unit_economics.gross_margin_percentage_range` |
| `wizard.step6.monthlyRevenue` | 6 | Monthly revenue | Text | Optional | Range or unknown | `step6.monthlyRevenue → unit_economics.monthly_revenue_range` |
| `wizard.step6.monthlyOrderVolume` | 6 | Monthly order volume | Text | Optional | Range or unknown | `step6.monthlyOrderVolume → unit_economics.monthly_order_volume_range` |
| `wizard.step6.productCost` | 6 | Product cost | Text | Optional | Range or unknown | `step6.productCost → unit_economics.product_cost_range` |
| `wizard.step6.monthlyOrdersPerSubscriber` | 6 | Monthly orders per subscriber | Text | Conditional recommended | Subscription businesses | `step6.monthlyOrdersPerSubscriber → unit_economics.monthly_orders_per_subscriber_range` |
| `wizard.step6.monthlyChurnRate` | 6 | Monthly churn rate | Text | Conditional recommended | SaaS/subscription businesses | `step6.monthlyChurnRate → unit_economics.monthly_churn_rate_range` |
| `wizard.step6.avgCustomerRetention` | 6 | Customer retention pattern | Dropdown | Optional | Always | `step6.avgCustomerRetention → unit_economics.avg_customer_retention` |
| `wizard.step6.repeatPurchaseFrequency` | 6 | Repeat purchase frequency | Dropdown | Optional | Always | `step6.repeatPurchaseFrequency → unit_economics.repeat_purchase_frequency` |
| `wizard.step6.salesCycleLength` | 6 | Sales cycle length | Text | Optional / B2B recommended | Always visible | `step6.salesCycleLength → unit_economics.sales_cycle_length` |
| `wizard.step7.confirmFocus` | 7 | Confirm focus setup | Checkbox | Mandatory for commit | Final review | `step7.confirmFocus → consent_and_commit_state.confirm_focus` |
| `wizard.step7.confirmBusiness` | 7 | Confirm business setup | Checkbox | Mandatory for commit | Final review | `step7.confirmBusiness → consent_and_commit_state.confirm_business` |
| `wizard.step7.confirmAudience` | 7 | Confirm audience setup | Checkbox | Mandatory for commit | Final review | `step7.confirmAudience → consent_and_commit_state.confirm_audience` |
| `wizard.step7.confirmGoals` | 7 | Confirm goals/context | Checkbox | Mandatory for commit | Final review | `step7.confirmGoals → consent_and_commit_state.confirm_goals` |
| `wizard.step7.confirmEconomics` | 7 | Confirm economics | Checkbox | Mandatory for commit | Final review | `step7.confirmEconomics → consent_and_commit_state.confirm_economics` |
| `wizard.step7.readyToGenerate` | 7 | Ready to generate | Checkbox | Mandatory for commit | Final review | `step7.readyToGenerate → consent_and_commit_state.ready_to_generate` |
| `wizard.step7.dataConsentOptIn` | 7 | Benchmark data consent | Checkbox | Optional storage consent | Does not block current v2 commit/run creation | `step7.dataConsentOptIn → consent_and_commit_state.data_consent_opt_in` |
| `wizard.step7.privacyProcessingConsent` | 7 | Privacy Processing consent | Checkbox | Mandatory for UI submission | Persisted through legal-consent API | `POST /api/v2/legal/consents/give` (`PRIVACY_PROCESSING`) |
| `wizard.step7.aiProcessingConsent` | 7 | AI Processing consent | Checkbox | Mandatory for UI submission | Persisted through legal-consent API | `POST /api/v2/legal/consents/give` (`AI_PROCESSING`) |

## Important implementation boundaries

- The frontend retains a legacy UI grouping (`Step1FormData`, `Step2FormData`, `Step3FormData`) but its real adapter emits the seven canonical v2 step payloads.
- `productOrService` is a UI alias only; v2 persistence and downstream normalization use `productsServices`.
- Commit validation occurs in `WizardV2Service`; warning-only quality rules do not weaken hard validation.
- Commit creates `wizard_intake_snapshot_v2`, `intake_normalization_record_v2`, and a pipeline run. `PipelineRunV2Service.startPipelineRunV2` attaches the frozen `config_snapshot_v2`.
- Current backend policy treats `dataConsentOptIn` as storage consent and still creates a run when false. Required Privacy/AI legal consents remain UI submission gates.
