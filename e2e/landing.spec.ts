import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads with the hero and primary navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /Stop the scam/i })).toBeVisible();
    await expect(page).toHaveTitle(/Rakshak/i);

    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'Live scanner' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Cash flow' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Loan receipt' })).toBeVisible();
  });

  test('routes to each section anchor from the navigation', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Live scanner' }).click();
    await expect(page.locator('#scanner')).toBeInViewport();

    await page.getByRole('link', { name: 'Cash flow' }).click();
    await expect(page.locator('#cash-flow')).toBeInViewport();

    await page.getByRole('link', { name: 'Loan receipt' }).click();
    await expect(page.locator('#loans')).toBeInViewport();
  });

  test('exposes the rules-engine status without needing a backend', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/LOCAL RULES READY|OFFLINE MODE/)).toBeVisible();
  });
});
