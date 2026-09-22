import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const THEMES = ['light', 'dark'] as const;

for (const theme of THEMES) {
  test.describe(`Accessibility (${theme})`, () => {
    test('landing page has no critical a11y violations', async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('scanner exposes an accessible verdict after analysis', async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/#scanner');

      await page.locator('#scenario-btn-safe-kirana').click();
      await expect(page.locator('#scanner-status-indicator')).toContainText('SAFE TRANSACTION');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });
}

test('primary navigation is a labelled landmark', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});

test('the EMI slider is associated with its label', async ({ page }) => {
  await page.goto('/#cash-flow');

  await expect(page.getByRole('slider', { name: 'Monthly EMI:' })).toBeVisible();
});
