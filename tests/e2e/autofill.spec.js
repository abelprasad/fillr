const { test, expect, profileData } = require('./extension.js');

const FORM_URL = 'http://localhost:3001/test-form.html';

async function waitForFillNotification(page) {
  await page.waitForSelector('#fillr-notification', { timeout: 8000 });
}

test.describe('Autofill — basic fill flow', () => {
  test('fills all text fields from profile via Alt+F', async ({ context, injectScripts }) => {
    const page = await context.newPage();
    await page.goto(FORM_URL);
    await injectScripts(page);

    await page.focus('body');
    await page.keyboard.press('Alt+f');
    await waitForFillNotification(page);

    await expect(page.locator('#firstName')).toHaveValue(profileData.firstName);
    await expect(page.locator('#lastName')).toHaveValue(profileData.lastName);
    await expect(page.locator('#email')).toHaveValue(profileData.email);
    await expect(page.locator('#phone')).toHaveValue(profileData.phone);
    await expect(page.locator('#city')).toHaveValue(profileData.city);
    await expect(page.locator('#state')).toHaveValue(profileData.state);
    await expect(page.locator('#zip')).toHaveValue(profileData.zip);
    await expect(page.locator('#university')).toHaveValue(profileData.university);
    await expect(page.locator('#major')).toHaveValue(profileData.major);
    await expect(page.locator('#gpa')).toHaveValue(profileData.gpa);
    await expect(page.locator('#linkedin')).toHaveValue(profileData.linkedin);
    await expect(page.locator('#github')).toHaveValue(profileData.github);

    await page.close();
  });

  test('fills select dropdowns', async ({ context, injectScripts }) => {
    const page = await context.newPage();
    await page.goto(FORM_URL);
    await injectScripts(page);

    await page.focus('body');
    await page.keyboard.press('Alt+f');
    await waitForFillNotification(page);

    await expect(page.locator('#workAuthorization')).toHaveValue('citizen');
    await expect(page.locator('#sponsorship')).toHaveValue('no');

    await page.close();
  });

  test('fills textarea (cover letter)', async ({ context, injectScripts }) => {
    const page = await context.newPage();
    await page.goto(FORM_URL);
    await injectScripts(page);

    await page.focus('body');
    await page.keyboard.press('Alt+f');
    await waitForFillNotification(page);

    await expect(page.locator('#coverLetter')).toHaveValue(profileData.coverLetter);

    await page.close();
  });

  test('shows green highlight on filled fields', async ({ context, injectScripts }) => {
    const page = await context.newPage();
    await page.goto(FORM_URL);
    await injectScripts(page);

    await page.focus('body');
    await page.keyboard.press('Alt+f');
    await waitForFillNotification(page);

    const borderColor = await page.locator('#firstName').evaluate(el => el.style.border);
    expect(borderColor).toContain('rgb(16, 185, 129)');

    await page.close();
  });

  test('overwrites pre-existing field values', async ({ context, injectScripts }) => {
    const page = await context.newPage();
    await page.goto(FORM_URL);
    await injectScripts(page);

    await page.fill('#firstName', 'WrongName');
    await page.fill('#email', 'wrong@wrong.com');

    await page.focus('body');
    await page.keyboard.press('Alt+f');
    await waitForFillNotification(page);

    await expect(page.locator('#firstName')).toHaveValue(profileData.firstName);
    await expect(page.locator('#email')).toHaveValue(profileData.email);

    await page.close();
  });
});

test.describe('Preview mode', () => {
  test('highlights fields with purple border via Alt+P without filling them', async ({ context, injectScripts }) => {
    const page = await context.newPage();
    await page.goto(FORM_URL);
    await injectScripts(page);

    await page.focus('body');
    await page.keyboard.press('Alt+p');
    await page.waitForSelector('#fillr-clear-preview', { timeout: 8000 });

    const borderColor = await page.locator('#firstName').evaluate(el => el.style.border);
    expect(borderColor).toContain('rgb(139, 92, 246)');

    const tooltips = await page.locator('.fillr-preview-tooltip').count();
    expect(tooltips).toBeGreaterThan(0);

    await expect(page.locator('#firstName')).toHaveValue('');

    await page.close();
  });

  test('Escape key clears preview highlights', async ({ context, injectScripts }) => {
    const page = await context.newPage();
    await page.goto(FORM_URL);
    await injectScripts(page);

    await page.focus('body');
    await page.keyboard.press('Alt+p');
    await page.waitForSelector('#fillr-clear-preview', { timeout: 8000 });

    await page.keyboard.press('Escape');

    await expect(page.locator('#fillr-clear-preview')).toHaveCount(0);
    const borderColor = await page.locator('#firstName').evaluate(el => el.style.border);
    expect(borderColor).not.toContain('rgb(139, 92, 246)');

    await page.close();
  });
});

test.describe('Popup fill flow', () => {
  test('fills form via popup Fill button', async ({ context, extensionId, injectScripts }) => {
    const formPage = await context.newPage();
    await formPage.goto(FORM_URL);
    await injectScripts(formPage);

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);
    await popupPage.waitForLoadState('domcontentloaded');

    // Form page must be the "active" tab when popup queries chrome.tabs.query({ active: true })
    await formPage.bringToFront();

    await popupPage.click('#fillFormBtn');

    await popupPage.waitForSelector('.message.success', { timeout: 10000 });
    const msg = await popupPage.locator('.message.success').textContent();
    expect(msg).toMatch(/filled \d+ field/i);

    const firstName = await formPage.locator('#firstName').inputValue();
    expect(firstName).toBe(profileData.firstName);

    await formPage.close();
    await popupPage.close();
  });
});

test.describe('No profile — error handling', () => {
  test('shows warning notification when no profile is set', async ({ bareContext, bareWorker }) => {
    const page = await bareContext.newPage();
    await page.goto(FORM_URL);

    // Inject scripts manually (no profile in storage)
    const pageUrl = page.url();
    await bareWorker.evaluate(async (url) => {
      const tabs = await chrome.tabs.query({ url });
      if (!tabs?.length) throw new Error(`No tab found for ${url}`);
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['utils/fieldMatchers.js', 'content/content.js'],
      });
    }, pageUrl);
    await page.waitForFunction(
      () => document.documentElement.getAttribute('data-fillr-loaded') === '1',
      { timeout: 5000 }
    );

    await page.focus('body');
    await page.keyboard.press('Alt+f');

    await page.waitForSelector('#fillr-notification', { timeout: 5000 });
    const notifText = await page.locator('#fillr-notification').textContent();
    expect(notifText).toMatch(/profile/i);

    await page.close();
  });
});
