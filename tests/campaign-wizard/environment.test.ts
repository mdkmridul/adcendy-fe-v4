import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveCampaignTarget,
  shouldSubmitCampaign,
} from '../../e2e/campaign-wizard/environment.ts';

function withEnvironment(
  patch: Record<string, string | undefined>,
  run: () => void,
) {
  const previous = Object.fromEntries(
    Object.keys(patch).map((key) => [key, process.env[key]]),
  );
  try {
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test('defaults campaign execution to local review-only mode', () => {
  withEnvironment(
    {
      ADCENDY_TARGET_ENV: undefined,
      ADCENDY_BASE_URL: undefined,
      SUBMIT_CAMPAIGN: undefined,
    },
    () => {
      assert.deepEqual(resolveCampaignTarget(), {
        baseURL: 'https://adcendy.localhost',
        environment: 'local',
      });
      assert.equal(shouldSubmitCampaign(), false);
    },
  );
});

test('rejects production and non-local targets', () => {
  withEnvironment(
    {
      ADCENDY_TARGET_ENV: 'uat',
      ADCENDY_BASE_URL: 'https://app.adcendy.com',
    },
    () => assert.throws(resolveCampaignTarget, /refuses production target/),
  );
  withEnvironment(
    {
      ADCENDY_TARGET_ENV: 'local',
      ADCENDY_BASE_URL: 'https://uat.example.test',
    },
    () => assert.throws(resolveCampaignTarget, /only permits localhost/),
  );
});

test('submits only for the explicit true token', () => {
  withEnvironment({ SUBMIT_CAMPAIGN: 'TRUE' }, () => {
    assert.equal(shouldSubmitCampaign(), true);
  });
  withEnvironment({ SUBMIT_CAMPAIGN: '1' }, () => {
    assert.equal(shouldSubmitCampaign(), false);
  });
});
