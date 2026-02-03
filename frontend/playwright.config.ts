import { defineConfig, devices } from '@playwright/test'
import { OrtoniReportConfig } from 'ortoni-report'
import * as os from 'os'

const ortoniConfig: OrtoniReportConfig = {
  open: process.env.CI ? 'never' : 'on-failure',
  folderPath: 'playwright-report',
  filename: 'index.html',
  title: 'Churn Assistant – UI Tests',
  projectName: 'Churn Assistant',
  testType: 'Functional',
  authorName: os.userInfo().username,
  meta: {
    platform: os.type(),
  },
}

export default defineConfig({
  testDir: './tests/ui/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['ortoni-report', ortoniConfig],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  timeout: 15000,
  expect: { timeout: 10000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: 'test-results',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { VITE_E2E: 'true' },
  },
})
