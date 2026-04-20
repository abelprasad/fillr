// Playwright fixture that loads the extension and exposes helpers
const { test: base, chromium } = require('@playwright/test');
const { readFileSync, existsSync, mkdtempSync } = require('fs');
const path = require('path');
const os = require('os');

// Load .env if present (for GROQ_API_KEY in local dev)
const envPath = path.resolve(__dirname, '../../.env');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=');
    const v = rest.join('=');
    if (k && v && !process.env[k.trim()]) process.env[k.trim()] = v.trim();
  });
}

// Chrome's --load-extension flag requires forward slashes even on Windows
const extensionPath = path.resolve(__dirname, '../..').replace(/\\/g, '/');
const profileData = JSON.parse(readFileSync(path.resolve(__dirname, '../fixtures/profile.json'), 'utf-8'));

async function launchExtensionContext() {
  const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'fillr-test-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  // The service worker fires during launch — wait for Chrome to settle, then query
  await new Promise(resolve => setTimeout(resolve, 2000));
  const workers = context.serviceWorkers();
  if (!workers.length) throw new Error('Extension service worker not found after 2s');

  const worker = workers[0];
  const extensionId = worker.url().split('/')[2];
  return { context, worker, extensionId };
}

// Inject profile (and optional API key) via the popup page which has chrome.* access
async function injectStoragePayload(context, extensionId, payload) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async (data) => {
    await new Promise((resolve) => chrome.storage.sync.set(data, resolve));
  }, payload);
  await page.close();
}

const test = base.extend({
  // Launched context with the extension loaded
  context: [async ({}, use) => {
    const { context, worker, extensionId } = await launchExtensionContext();

    const storagePayload = { profile: profileData };
    if (process.env.GROQ_API_KEY) storagePayload.groqApiKey = process.env.GROQ_API_KEY;
    await injectStoragePayload(context, extensionId, storagePayload);

    await use(context);
    await context.close();
  }, { scope: 'test' }],

  // The extension's service worker instance (for scripting injection)
  worker: async ({ context }, use) => {
    const workers = context.serviceWorkers();
    await use(workers[0]);
  },

  // Resolves the extension ID
  extensionId: async ({ context }, use) => {
    const workers = context.serviceWorkers();
    await use(workers[0].url().split('/')[2]);
  },

  // Helper function: injects content scripts into a page via the service worker.
  // Auto-injection into localhost doesn't always work in Playwright; this replicates
  // what popup.js does on Fill click (chrome.scripting.executeScript).
  injectScripts: async ({ worker }, use) => {
    await use(async (page) => {
      const pageUrl = page.url();
      await worker.evaluate(async (url) => {
        const tabs = await chrome.tabs.query({ url });
        if (!tabs || tabs.length === 0) throw new Error(`No tab found for ${url}`);
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['utils/fieldMatchers.js', 'content/content.js'],
        });
      }, pageUrl);
      // Wait for the DOM attribute set by content.js (DOM is shared across JS worlds)
      await page.waitForFunction(
        () => document.documentElement.getAttribute('data-fillr-loaded') === '1',
        { timeout: 5000 }
      );
    });
  },

  // Context without any profile (for error-handling tests)
  bareContext: [async ({}, use) => {
    const { context } = await launchExtensionContext();
    await use(context);
    await context.close();
  }, { scope: 'test' }],

  // injectScripts for bareContext tests
  bareWorker: async ({ bareContext }, use) => {
    const workers = bareContext.serviceWorkers();
    await use(workers[0]);
  },
});

const { expect } = require('@playwright/test');
module.exports = { test, expect, profileData };
