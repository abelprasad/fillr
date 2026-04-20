const { defineConfig } = require('@playwright/test');
const path = require('path');

const extensionPath = path.resolve(__dirname);

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  // Extensions require headed mode. For CI use Xvfb: `xvfb-run npx playwright test`
  use: {
    headless: false,
    launchOptions: {
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    },
  },
  webServer: {
    command: 'node tests/e2e/server.js',
    port: 3001,
    reuseExistingServer: true,
  },
});
