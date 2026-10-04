import { defineConfig, devices } from '@playwright/test';

const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? '4321');
const previewURL = `http://127.0.0.1:${previewPort}`;
const previewDirectory = process.env.PLAYWRIGHT_DIST_DIR;
const quoteShell = (value: string) =>
  "'" + value.replaceAll("'", "'\"'\"'") + "'";
const previewDirectoryArgument = previewDirectory
  ? ` --outDir ${quoteShell(previewDirectory)}`
  : '';

export default defineConfig({
  testDir: './tests',
  testMatch: process.env.JOURNAL_FIXTURE_TESTS
    ? '**/journal.spec.ts'
    : '**/website.spec.ts',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: previewURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL,
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${previewPort} --ignore-lock${previewDirectoryArgument}`,
    url: previewURL,
    reuseExistingServer: !process.env.CI,
  },
});
