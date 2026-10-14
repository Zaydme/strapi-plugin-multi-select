import { defineConfig, devices } from '@playwright/test';

import { ADMIN_STATE, BASE_URL } from './tests/e2e/helpers';

export default defineConfig({
  testDir: 'tests/e2e',
  // Tests share one Strapi instance
  workers: 1,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'admin.setup.ts',
    },
    {
      name: 'plugin',
      testMatch: ['api.spec.ts', 'content-manager.spec.ts'],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: ADMIN_STATE },
    },
    {
      // Saving a schema restarts Strapi, so this runs last
      name: 'content-type-builder',
      testMatch: 'content-type-builder.spec.ts',
      dependencies: ['plugin'],
      use: { ...devices['Desktop Chrome'], storageState: ADMIN_STATE },
    },
  ],
  webServer: {
    command: 'node tests/e2e/scripts/start-app.mjs',
    url: `${BASE_URL}/_health`,
    timeout: 5 * 60_000,
    reuseExistingServer: false,
    stdout: process.env.CI ? 'pipe' : 'ignore',
  },
});
