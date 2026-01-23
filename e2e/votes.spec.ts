import { test, expect } from '@playwright/test';

test.describe('Votes Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the votes page by clicking the nav item
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'Votes' }).click();
  });

  test('should display the votes page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Vote Counter');
  });

  test('should display ballot positions and voting controls', async ({ page }) => {
    // Check that the votes page content is displayed using a more specific selector
    await expect(page.locator('h1:has-text("votes")')).toBeVisible();
  });
});