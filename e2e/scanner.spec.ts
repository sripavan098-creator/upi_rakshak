import { expect, test } from '@playwright/test';

test.describe('Live QR scanner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#scanner');
  });

  test('defaults to the high-risk scenario and shows the fraud verdict', async ({ page }) => {
    const status = page.locator('#scanner-status-indicator');
    await expect(status).toBeVisible();
    await expect(status).toContainText('CRITICAL FRAUD RISK');
    await expect(status).toContainText('CRITICAL FRAUD WARNING');
  });

  test('clears the verdict when a safe merchant QR is selected', async ({ page }) => {
    const status = page.locator('#scanner-status-indicator');

    await page.locator('#scenario-btn-safe-kirana').click();

    await expect(status).toContainText('SAFE TRANSACTION');
    await expect(status).not.toContainText('CRITICAL FRAUD RISK');
  });

  test('flags the reversed payment trap scenario', async ({ page }) => {
    await page.locator('#scenario-btn-scam-lottery').click();

    await expect(page.locator('#scanner-status-indicator')).toContainText('CRITICAL FRAUD RISK');
  });

  test('analyses a pasted VPA and warns on a lookalike handle', async ({ page }) => {
    const status = page.locator('#scanner-status-indicator');

    await page.getByPlaceholder(/Paste custom UPI URI/).fill('upi://pay?pa=paytm.kyc.verify@okhdfcbank&pn=Paytm%20KYC&am=1&tn=verify%20kyc%20urgent');
    await page.locator('#btn-analyze-custom').click();

    await expect(status).not.toContainText('SAFE TRANSACTION');
  });

  test('keeps a standard grocery payment safe', async ({ page }) => {
    const status = page.locator('#scanner-status-indicator');

    await page.getByPlaceholder(/Paste custom UPI URI/).fill('upi://pay?pa=sharmastore@okhdfcbank&pn=Sharma%20General%20Store&am=185&tn=Grocery&mc=5411');
    await page.locator('#btn-analyze-custom').click();

    await expect(status).toContainText('SAFE TRANSACTION');
  });

  test('handles garbage input without crashing the page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.getByPlaceholder(/Paste custom UPI URI/).fill('!!!! not a upi payload !!!!');
    await page.locator('#btn-analyze-custom').click();

    // Non-UPI text falls back to the "unrecognised payload" caution state.
    await expect(page.locator('#scanner-status-indicator')).toContainText('SUSPICIOUS / CAUTION');
    expect(errors).toEqual([]);
  });

  test('reports scan latency once analysis has run', async ({ page }) => {
    await expect(page.locator('#scan-frame-latency-overlay')).toBeVisible();
    await expect(page.locator('#scan-frame-latency-overlay')).toContainText('ms');
  });
});
