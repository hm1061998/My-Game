import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Hosted CI runners render without a GPU (~30 fps vs ~60 locally); the journey needs more wall time there.
  timeout: process.env.CI ? 480_000 : 180_000,
  expect: { timeout: 12_000 },
  outputDir: '../../test-results/e2e',
  reporter: [['line'], ['html', { open: 'never', outputFolder: '../../playwright-report' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5174',
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 12_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    launchOptions: { slowMo: 20 },
  },
  projects: [{ name: 'chromium-headed', use: { ...devices['Desktop Chrome'] } }],
})
