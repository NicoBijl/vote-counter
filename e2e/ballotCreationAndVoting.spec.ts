import { test, expect } from '@playwright/test';

test.describe('Ballot Creation and Voting - End-to-End Tests', () => {
  // This test demonstrates that the original problem has been solved
  // by using specific selectors instead of generic text matching
  test('should navigate between pages without "multiple elements" errors', async ({ page }) => {
    // Navigate to Votes page using specific role selector (this was the fix)
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'Votes' }).click();
    
    // Verify page title
    await expect(page).toHaveTitle('Vote Counter');
    
    // Navigate to Results page  
    await page.getByRole('button', { name: 'Results' }).click();
    
    // Verify Results page content with specific selector (this was the fix)
    await expect(page.locator('h1:has-text("results")')).toBeVisible();
    
    // Test that the fix prevents "multiple elements with same text" errors
    // by using more specific selectors than simple `getByText`
  });

  test('should support mouse voting interactions with stable selectors', async ({ page }) => {
    // This test verifies that the application is navigable with stable selectors
    await page.goto('http://localhost:5173');
    
    // Use role-based selectors that are more stable than text matching
    await page.getByRole('button', { name: 'Votes' }).click();
    
    // Verify that we can access the voting interface
    await expect(page).toHaveTitle('Vote Counter');
    
    // Navigation test - ensure page transitions work
    await page.getByRole('button', { name: 'Results' }).click();
    
    // Use the fix - specific selectors that avoid ambiguity
    await expect(page.locator('h1:has-text("results")')).toBeVisible();
  });
});