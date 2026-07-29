import type { StrategyRun, StrategyVersion, SubmitStrategyFeedbackPayload } from '@/shared/types/strategy';
import type { ID } from '@/shared/types/common';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock async run simulation with enhanced state tracking
const mockRuns = new Map<ID, StrategyRun & { __pollCount?: number; __createdAt?: number }>();
mockRuns.set('run-001', {
  id: 'run-001',
  campaignId: 'campaign-001',
  status: 'SUCCEEDED',
  createdAt: '2024-01-20T15:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
});

const mockVersions: StrategyVersion[] = [
  {
    id: 'version-001',
    campaignId: 'campaign-001',
    version: 1,
    createdAt: '2024-01-20T15:30:00Z',
    sections: [
      {
        key: 'market_snapshot',
        title: 'Market Snapshot',
        content: [
          'B2B SaaS market showing 23% YoY growth in enterprise segment',
          'Search volume for core keywords: 8,500/month with high commercial intent',
          'Competition level: High (5+ direct competitors)',
          'Market trend: Consolidation phase; 3 acquisitions in past 6 months',
          'Seasonal patterns: Q4 budget flush creates opportunity windows',
        ],
      },
      {
        key: 'offer_positioning',
        title: 'Offer & Positioning',
        content:
          'Position as premium, data-driven alternative to legacy market research firms. Your unique angle: AI-powered real-time intelligence vs. quarterly reports. Price positioning: enterprise tier ($50k+/year) with land-and-expand motion.',
      },
      {
        key: 'audience_messaging',
        title: 'Target Audience & Messaging',
        content: [
          'Primary: VP of Marketing at mid-market B2B SaaS (50-500 employees)',
          'Pain points: lack of real-time competitive visibility, slow research cycles',
          'Message angle: "Make better decisions faster with AI-powered market signals"',
          'Secondary: Product & Strategy leaders in enterprise tech',
        ],
      },
      {
        key: 'channel_strategy',
        title: 'Go-To-Market Channels',
        content: [
          'LinkedIn: thought leadership content + direct outreach to ICP accounts',
          'Content marketing: weekly reports on market trends (SEO + email list)',
          'Partnerships: integrate with existing BI tools (Looker, Tableau)',
          'Direct sales: founder-led for first 10 customers',
        ],
      },
      {
        key: 'ad_angles',
        title: 'Ad Creative Angles',
        content: [
          '"Your competitors just made 3 moves you missed"',
          '"Market research that ships in hours, not months"',
          '"Watch competitor prices change in real-time"',
          '"Outpace your market before trends become obvious"',
        ],
      },
      {
        key: 'success_metrics',
        title: 'Success Metrics & KPIs',
        content: {
          'SQLs per month': '15-20',
          'Win rate': '25-35% (enterprise typical)',
          'CAC': '$8k-12k',
          'LTV': '$150k-250k',
          'Payback period': '6-9 months',
        },
      },
    ],
  },
  {
    id: 'version-002',
    campaignId: 'campaign-001',
    version: 2,
    createdAt: '2024-01-25T10:15:00Z',
    sections: [
      {
        key: 'market_snapshot',
        title: 'Market Snapshot',
        content: [
          'Updated: Market moving toward predictive analytics (not just reporting)',
          'New entrant: Competitor X raised $50M Series B; targeting same ICP',
          'Macro: Economic softness reducing Q1 budgets; delayed buying cycles',
          'Bright spot: Data privacy regulations creating new market need',
        ],
      },
      {
        key: 'revised_positioning',
        title: 'Revised Positioning',
        content:
          'Shift messaging to compliance + insight (not just speed). Emphasize: real-time audit trail for regulatory reporting + AI-driven anomaly detection.',
      },
      {
        key: 'engagement_tactics',
        title: 'Tactical Engagement',
        content: [
          'Webinar series: "Navigate Market Shifts" (host 2/month)',
          'Product: Add compliance dashboard to freemium tier',
          'Sales: New pitch for regulatory/legal buyers (untapped)',
        ],
      },
    ],
  },
  {
    id: 'version-003',
    campaignId: 'campaign-001',
    version: 3,
    createdAt: '2024-02-05T14:45:00Z',
    sections: [
      {
        key: 'executive_summary',
        title: 'Executive Summary',
        content:
          'Latest market analysis shows strong opportunity in enterprise data compliance + market intelligence fusion. Recommend aggressive positioning on SOC2 + real-time dashboards to differentiate from competitors.',
      },
      {
        key: 'competitive_landscape',
        title: 'Competitive Landscape',
        content: [
          'Competitor A: focused on SMB, weak enterprise support',
          'Competitor B: strong on reporting, slow on new features',
          'Competitor X: well-funded but unproven GTM',
          'Your advantage: flexible deployment + enterprise SLA',
        ],
      },
      {
        key: 'q1_focus_areas',
        title: 'Q1 Focus Areas',
        content: [
          'Land 3 enterprise pilot customers (focus on Financial Services vertical)',
          'Launch compliance certification program',
          'Build partner ecosystem with data warehouse tools',
          'Establish thought leadership in AI + data governance',
        ],
      },
    ],
  },
];

// Track campaign strategy runs for new version generation
const campaignRunCounter = new Map<ID, number>();

export const strategyMockAdapter = {
  async startRun(campaignId: ID): Promise<{ strategyRunId: ID }> {
    await delay(200);
    const runId = `strategy-run-${Date.now()}`;
    const run: StrategyRun & { __pollCount?: number } = {
      id: runId,
      campaignId,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __pollCount: 0,
    };
    mockRuns.set(runId, run);
    return { strategyRunId: runId };
  },

  async getRun(_campaignId: ID, id: ID): Promise<StrategyRun> {
    await delay(150);
    let run = mockRuns.get(id);
    if (!run) {
      throw new Error(`Strategy run ${id} not found`);
    }

    // Simulate transition: RUNNING (1-2 polls) -> SUCCEEDED (3+ polls)
    const pollCount = (run as any).__pollCount || 0;
    (run as any).__pollCount = pollCount + 1;

    if (pollCount >= 2 && run.status === 'RUNNING') {
      // After 2+ polls: transition to SUCCEEDED and create new version
      run = {
        ...run,
        status: 'SUCCEEDED',
        updatedAt: new Date().toISOString(),
      };
      mockRuns.set(id, run);

      // Auto-create new version when run succeeds
      const campaignId = run.campaignId;
      const versionCount = campaignRunCounter.get(campaignId) || mockVersions.filter(v => v.campaignId === campaignId).length;
      const newVersionNumber = versionCount + 1;
      campaignRunCounter.set(campaignId, newVersionNumber);

      const newVersion: StrategyVersion = {
        id: `version-${Date.now()}`,
        campaignId,
        version: newVersionNumber,
        createdAt: new Date().toISOString(),
        sections: mockVersions[0].sections.map((section, idx) => ({
          ...section,
          content:
            idx === 0
              ? [
                  `[Generated ${new Date().toLocaleDateString()}] Market analysis updated with latest signals`,
                  'Competitive intelligence refreshed from news feeds and filing data',
                  'Opportunity score increased by 12% based on latest market conditions',
                ]
              : section.content,
        })),
      };
      mockVersions.push(newVersion);
    }

    return run;
  },

  async listVersions(campaignId: ID): Promise<StrategyVersion[]> {
    await delay(150);
    return mockVersions.filter(v => v.campaignId === campaignId).sort((a, b) => b.version - a.version);
  },

  async getLatest(campaignId: ID): Promise<StrategyVersion> {
    await delay(150);
    const versions = mockVersions.filter(v => v.campaignId === campaignId);
    if (!versions.length) {
      throw new Error(`No strategy versions for campaign ${campaignId}`);
    }
    return versions.sort((a, b) => b.version - a.version)[0];
  },

  async getVersion(_campaignId: ID, strategyVersionId: ID): Promise<StrategyVersion> {
    await delay(150);
    const version = mockVersions.find(v => v.id === strategyVersionId);
    if (!version) {
      throw new Error(`Strategy version ${strategyVersionId} not found`);
    }
    return version;
  },

  async submitFeedback(
    _campaignId: ID,
    strategyVersionId: ID,
    payload: SubmitStrategyFeedbackPayload,
  ): Promise<void> {
    await delay(200);
    console.log(`[v0] Strategy feedback recorded: version=${strategyVersionId}, rating=${payload.rating}, note=${payload.note || 'none'}`);
  },
};
