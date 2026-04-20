// Minimal debug test — bypasses all fixtures to isolate the issue
const { test, expect, chromium } = require('@playwright/test');
const { mkdtempSync } = require('fs');
const path = require('path');
const os = require('os');

const extensionPath = path.resolve(__dirname, '../..').replace(/\\/g, '/');

test('debug: extension loads and content script injects', async () => {
  const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'fillr-dbg-'));

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  try {
    // Wait for Chrome to settle
    await new Promise(r => setTimeout(r, 2000));

    // Step 1: Check service workers
    const workers = context.serviceWorkers();
    console.log('Service workers found:', workers.length);
    for (const w of workers) console.log(' -', w.url());

    // Step 2: Check chrome://extensions to see if extension loaded
    const extPage = await context.newPage();
    await extPage.goto('chrome://extensions/');
    await extPage.waitForLoadState('domcontentloaded');
    const extPageTitle = await extPage.title();
    console.log('Extensions page title:', extPageTitle);
    await extPage.screenshot({ path: 'test-results/debug-extensions.png' });

    // Try to read extension IDs from DOM
    const ids = await extPage.evaluate(() => {
      const manager = document.querySelector('extensions-manager');
      if (!manager) return ['no manager found'];
      const items = manager.shadowRoot?.querySelectorAll('extensions-item');
      if (!items || items.length === 0) return ['no items found'];
      return Array.from(items).map(item => ({
        id: item.getAttribute('id'),
        name: item.shadowRoot?.querySelector('#name')?.textContent?.trim()
      }));
    });
    console.log('Extension items:', JSON.stringify(ids));
    await extPage.close();

    // Step 3: Navigate to test form and check if content script injects
    const page = await context.newPage();
    await page.goto('http://localhost:3001/test-form.html');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/debug-form.png' });

    // Wait a bit for auto content scripts
    await new Promise(r => setTimeout(r, 2000));

    const fillrLoaded = await page.evaluate(() => typeof window.__fillrLoaded);
    const fieldMatchersLoaded = await page.evaluate(() => typeof window.FieldMatchers);
    console.log('window.__fillrLoaded (auto):', fillrLoaded);
    console.log('window.FieldMatchers (auto):', fieldMatchersLoaded);

    // Try manual injection via service worker (like popup does)
    const worker = context.serviceWorkers()[0];
    const pageUrl = page.url();
    console.log('Injecting scripts manually for URL:', pageUrl);
    try {
      await worker.evaluate(async (url) => {
        const tabs = await chrome.tabs.query({ url });
        console.log('Tabs found:', tabs.length, tabs.map(t => t.id));
        if (!tabs || tabs.length === 0) throw new Error('No tab for URL: ' + url);
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['utils/fieldMatchers.js', 'content/content.js'],
        });
        return 'injected';
      }, pageUrl);
      console.log('Manual injection succeeded');
    } catch (e) {
      console.log('Manual injection error:', e.message);
    }

    await new Promise(r => setTimeout(r, 500));
    // Check DOM attribute (shared between JS worlds, so visible to page.evaluate)
    const domAttr = await page.evaluate(() => document.documentElement.getAttribute('data-fillr-loaded'));
    console.log('data-fillr-loaded attr:', domAttr);

    await page.close();

    // Assertions
    expect(domAttr).toBe('1');

  } finally {
    await context.close();
  }
});
