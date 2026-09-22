import { expect, test } from '@playwright/test';

test.describe('Message analysis workbench', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#message-analysis-title').scrollIntoViewIfNeeded();
  });

  test('flags the sample scam message as high risk with an evidence trail', async ({ page }) => {
    const result = page.locator('.message-analysis__result');

    await expect(result).toContainText('HIGH RISK');
    await expect(result).toContainText('EVIDENCE TRAIL');
    await expect(result).toContainText('DO NOT');
  });

  test('downgrades a harmless message when re-run', async ({ page }) => {
    const textarea = page.getByLabel('Message or notification text');

    await textarea.fill('Hi, dinner at 8pm? I will pay you back tomorrow for the movie ticket.');
    await page.getByRole('button', { name: /Analyze message/ }).click();

    await expect(page.locator('.message-analysis__result')).toContainText('NO SIGNALS FOUND');
    await expect(page.locator('.message-analysis__engine')).toContainText('RUN COMPLETE');
  });

  test('marks the result stale after an edit and clears the flag on re-run', async ({ page }) => {
    const textarea = page.getByLabel('Message or notification text');
    const engine = page.locator('.message-analysis__engine');

    await textarea.fill('Payment reminder from your society.');
    await expect(engine).toContainText('EDITED / RUN AGAIN');

    await page.getByRole('button', { name: /Analyze message/ }).click();
    await expect(engine).toContainText('RUN COMPLETE');
  });

  test('persists a local report for the current analysis', async ({ page }) => {
    await page.getByRole('button', { name: 'Save local report' }).click();

    await expect(page.getByRole('button', { name: 'Saved on this device' })).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem('upi-rakshak-last-analysis'));
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).analysis.level).toBe('HIGH');
  });
});
