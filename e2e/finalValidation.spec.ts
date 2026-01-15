import {expect, test} from '@playwright/test';

test.describe('Final Application Validation', () => {
    test('should display imported data correctly in application pages', async ({page}) => {
        // Navigate to the main dashboard
        await page.goto('http://localhost:5173');

        // Wait for the application to load
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', {name: 'Settings'}).click();
        await page.waitForLoadState('networkidle');

        const positionsFileInput = page.locator('input[type="file"][id="importPositions"]');
        await positionsFileInput.setInputFiles('e2e/files/vote-counter-positions-2025-10-17T13_26_01.670Z.json');

        const votesFileInput = page.locator('input[type="file"][id="importVotes"]');
        await votesFileInput.setInputFiles('e2e/files/vote-counter-ballots-2025-10-17T13_26_03.095Z.json');

        // Navigate to Results page where imported vote data should be visible
        await page.getByRole('button', {name: 'Results'}).click();

        // Verify that the imported vote data is displayed in Results page
        // This confirms that our test data was properly loaded and processed
        const pageContent = await page.content();
        expect(pageContent.includes('Person 01')).toBeTruthy();
        expect(pageContent.includes('Person 03')).toBeTruthy();
        expect(pageContent.includes('Person 06')).toBeTruthy();
        expect(pageContent.includes('Person 11')).toBeTruthy();

        // Verify that the electoral divisor is displayed (shows data processing)
        await expect(page.getByText('Electoral Divisor').first()).toBeVisible();

        // Navigate to Positions page to verify imported positions
        await page.getByRole('button', {name: 'Positions'}).click();

        // Verify that the expected positions from our test file are displayed
        await expect(page.getByText('Scriba').first()).toBeVisible();
        await expect(page.getByText('Vz. Diaconie').first()).toBeVisible();
        await expect(page.getByText('Ouderling').first()).toBeVisible();
        await expect(page.getByText('Diaken').first()).toBeVisible();
    });
});
