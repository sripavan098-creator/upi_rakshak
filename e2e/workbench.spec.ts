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

  test('persists a local report and confirms it in the status line', async ({ page }) => {
    await page.getByRole('button', { name: 'Save local report' }).click();

    await expect(page.locator(".message-analysis__status")).toContainText('Saved on this device');

    const stored = await page.evaluate(() => localStorage.getItem('upi-rakshak-last-analysis'));
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).analysis.level).toBe('HIGH');
  });

  test('restores the last saved report on the next visit', async ({ page }) => {
    const textarea = page.getByLabel('Message or notification text');
    await textarea.fill('Payment reminder from your society.');
    await page.getByRole('button', { name: /Analyze message/ }).click();
    await page.getByRole('button', { name: 'Save local report' }).click();

    await page.reload();
    await page.locator('#message-analysis-title').scrollIntoViewIfNeeded();

    await expect(page.getByLabel('Message or notification text')).toHaveValue('Payment reminder from your society.');
    await expect(page.locator(".message-analysis__status")).toContainText('Restored your last saved report');
  });

  test('copies a plain-text report to the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.getByRole('button', { name: 'Copy report' }).click();
    await expect(page.locator(".message-analysis__status")).toContainText('Report copied to clipboard');

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('UPI Rakshak — Scam analysis report');
    expect(clipboard).toContain('Safe action:');
  });

  test('never restores a tampered report', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('upi-rakshak-last-analysis', '{"message":1,"analysis":{"level":"HACKED"}}'));
    await page.reload();
    await page.locator('#message-analysis-title').scrollIntoViewIfNeeded();

    await expect(page.locator('.message-analysis__result')).toContainText('HIGH RISK');
    await expect(page.getByLabel('Message or notification text')).toHaveValue(/electricity connection/);
    await expect(page.locator(".message-analysis__status")).toHaveText('');
  });
});
