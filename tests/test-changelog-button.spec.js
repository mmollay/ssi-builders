import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5177';

test.describe('Changelog Page Verification', () => {
    test('Changelog button navigates to HTML page', async ({ page }) => {
        await page.goto(BASE_URL + '/index.html');

        // Wait for sidebar to load
        await page.waitForSelector('.sidebar', { timeout: 5000 });

        // Check for Changelog link
        const changelogLink = await page.locator('.sidebar').getByText('Changelog');
        await expect(changelogLink).toBeVisible();

        // Check attributes - should NOT be target _blank anymore
        const linkElement = await page.locator('.sidebar a[href*="changelog.html"]');
        await expect(linkElement).toBeVisible();
        await expect(linkElement).not.toHaveAttribute('target', '_blank');

        // Click and navigate
        await changelogLink.click();
        await page.waitForLoadState('networkidle');

        // Verify URL
        expect(page.url()).toContain('/docs/changelog.html');

        // Verify content rendering
        // Wait for markdown to be fetched and rendered
        await page.waitForSelector('.changelog-content h1', { timeout: 5000 });

        // Check for expected content from CHANGELOG.md
        const content = await page.locator('.changelog-content');
        await expect(content).toContainText('Changelog');
        await expect(content).toContainText('1.2.1');

        console.log('✓ Changelog HTML page verified');
    });
});
