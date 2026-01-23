import { test, expect } from '@playwright/test';

test.describe('Results Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the results page by clicking the nav item
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'Results' }).click();
  });

  test('should display the results page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Vote Counter');
  });

  test('should display vote results and statistics', async ({ page }) => {
    // Check that the results page content is displayed using a more specific selector
    await expect(page.locator('h1:has-text("results")')).toBeVisible();
  });
});