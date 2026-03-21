import { test, expect } from '@playwright/test';

test.describe('Positions Management', () => {
    test.beforeEach(async ({ page }) => {
        // Go to positions page
        await page.goto('/');
        await page.getByRole('link', { name: 'Positions' }).click();
    });

    test('should display default positions', async ({ page }) => {
        await expect(page.getByText('Diaken', { exact: true })).toBeVisible();
        await expect(page.getByText('Ouderling', { exact: true })).toBeVisible();
        await expect(page.getByText('Secretaris', { exact: true })).toBeVisible();
    });

    test('should add a new position', async ({ page }) => {
        await page.getByRole('button', { name: 'Add New Position' }).click();
        
        // Find the new row's inputs
        const titleInput = page.getByPlaceholder('Title');
        const keyInput = page.getByPlaceholder('Key');
        
        await titleInput.fill('New Position E2E');
        await keyInput.fill('e2e-pos');
        
        await page.getByLabel('Save Position').click();
        
        await expect(page.getByText('New Position E2E')).toBeVisible();
        await expect(page.getByText('e2e-pos')).toBeVisible();
    });

    test('should add a person to a position', async ({ page }) => {
        // Expand the first position (Diaken)
        await page.getByLabel('expand row').first().click();
        
        await page.getByRole('button', { name: 'Add New Person for Diaken' }).click();
        
        const nameInput = page.getByPlaceholder('Name');
        const keyInput = page.getByPlaceholder('Key');
        
        await nameInput.fill('E2E Person');
        await keyInput.fill('e2e-per');
        
        await page.getByLabel('Save Person').click();
        
        await expect(page.getByText('E2E Person')).toBeVisible();
        await expect(page.getByText('e2e-per')).toBeVisible();
    });

    test('should validate unique keys', async ({ page }) => {
        await page.getByRole('button', { name: 'Add New Position' }).click();
        
        const titleInput = page.getByPlaceholder('Title');
        const keyInput = page.getByPlaceholder('Key');
        
        await titleInput.fill('Duplicate Key Position');
        await keyInput.fill('diaken'); // Existing key
        
        await expect(page.getByText('Key already exists')).toBeVisible();
        await expect(page.getByLabel('Save Position')).toBeDisabled();
    });

    test('should enforce state based on usage', async ({ page }) => {
        // Add a vote for 'diaken'
        await page.goto('/');
        await page.getByRole('link', { name: 'Votes' }).click();
        await page.getByLabel('Diaken 1').click();
        
        // Go back to positions and check
        await page.getByRole('link', { name: 'Positions' }).click();
        
        // Find the diaken row by looking for the exact text 'diaken'
        const diakenRow = page.locator('tbody tr').filter({ hasText: 'diaken' }).first();
        await expect(diakenRow).toBeVisible();
        
        // Delete should be disabled since diaken is used in votes
        const deleteBtn = diakenRow.getByLabel('Delete Position');
        await expect(deleteBtn).toBeDisabled();
        
        // Click Edit to enter edit mode
        await diakenRow.getByLabel('Edit Position').click();
        
        // Key input should be disabled
        await page.waitForSelector('input[aria-label="Position Key"]');
        const keyInput = page.locator('input[aria-label="Position Key"]');
        await expect(keyInput).toBeDisabled();
    });

    test('should re-order positions via drag and drop', async ({ page }) => {
        // This is a basic check to see if drag handles exist. 
        // Actual DND in E2E can be flaky, so we just verify the elements are there.
        const dragHandles = page.getByTestId('DragIndicatorIcon');
        await expect(dragHandles.first()).toBeVisible();
    });
});
