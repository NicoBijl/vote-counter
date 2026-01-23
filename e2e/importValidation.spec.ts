import {expect, test} from '@playwright/test';

test.describe('Import Validation', () => {
    test('should validate imported positions and votes data using Playwright file upload', async ({page}) => {
        // Navigate to the main application
        await page.goto('http://localhost:5173');

        // Go to Settings page where import functionality is located
        await page.getByRole('button', {name: 'Settings'}).click();

        // Wait for Settings page to load properly
        await expect(page.getByRole('heading', {name: 'settings', exact: false})).toBeVisible();

        // Import Positions file using Playwright's file upload functionality
        const positionsFileInput = page.locator('input[type="file"][id="importPositions"]');

        // Use Playwright's setInputFiles method to simulate file selection
        await positionsFileInput.setInputFiles('e2e/files/vote-counter-positions-2025-10-17T13_26_01.670Z.json');

        // Import Votes file using Playwright's file upload functionality
        const votesFileInput = page.locator('input[type="file"][id="importVotes"]');

        // Use Playwright's setInputFiles method to simulate file selection
        await votesFileInput.setInputFiles('e2e/files/vote-counter-ballots-2025-10-17T13_26_03.095Z.json');

        // Navigate to Results page to verify imported data
        await page.getByRole('button', {name: 'Results'}).click();

        // Verify that the imported vote data is displayed in Results page
        await expect(page.getByText('Person 01')).toBeVisible();
        await expect(page.getByText('Person 03')).toBeVisible();
        await expect(page.getByText('Person 06')).toBeVisible();
        await expect(page.getByText('Person 11')).toBeVisible();

        // Verify that the electoral divisor is displayed (shows data processing)
        await expect(page.getByText('Electoral Divisor').first()).toBeVisible();

        // Navigate to Positions page to verify imported positions
        await page.getByRole('button', {name: 'Positions'}).click();

        // Verify that the expected positions from our test file are displayed
        await expect(page.getByText('Scriba').first()).toBeVisible();
        await expect(page.getByText('Vz. Diaconie').first()).toBeVisible();
        await expect(page.getByText('Ouderling').first()).toBeVisible();
        await expect(page.getByText('Diaken').first()).toBeVisible();

        // Additional verification - check that we have the correct number of ballots imported
        // The test file contains 87 ballots (based on how many ballot objects are in the file)
        // This should be confirmed in the results display
    });
});
