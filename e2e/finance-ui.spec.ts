import { expect, test } from '@playwright/test';

test.describe('Cash-flow ruler', () => {
  test('starts safe and collapses the runway as the hypothetical EMI grows', async ({ page }) => {
    await page.goto('/#cash-flow');

    const slider = page.getByRole('slider').first();
    await expect(slider).toBeVisible();

    const runwayAt = async (emi: string) => {
      await slider.fill(emi);
      const text = await page.locator('#cash-flow').getByText(/\d+ days/).first().innerText();
      return Number(text.match(/(\d+) days/)![1]);
    };

    const noLoan = await runwayAt('0');
    const maxLoan = await runwayAt('15000');

    expect(noLoan).toBeGreaterThan(maxLoan);
    await expect(page.getByText('Manageable')).toBeVisible();
  });

  test('hides the runway verdict when the EMI is zero', async ({ page }) => {
    await page.goto('/#cash-flow');

    await page.getByRole('slider').first().fill('0');

    await expect(page.getByText('Danger Zone')).toHaveCount(0);
    await expect(page.getByText('Manageable')).toHaveCount(0);
  });

  test('still surfaces a verdict once any EMI is applied', async ({ page }) => {
    await page.goto('/#cash-flow');

    await page.getByRole('slider').first().fill('500');

    await expect(page.getByText('Manageable')).toBeVisible();
  });
});

test.describe('Loan receipt', () => {
  test('renders the computed cost of the instant loan', async ({ page }) => {
    await page.goto('/#loans');

    const receipt = page.locator('#loans');
    await expect(receipt).toContainText(/EMI/);
    await expect(receipt).toContainText(/₹/);
  });
});
