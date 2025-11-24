import { test, expect } from '@playwright/test';

test.describe('Icon System Layout', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/icon-system.html');
        await page.waitForLoadState('networkidle');
    });

    test('should not have horizontal overflow', async ({ page }) => {
        // Get viewport and document width
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);

        console.log(`Viewport width: ${viewportWidth}px`);
        console.log(`Document scroll width: ${documentWidth}px`);

        // Document width should not exceed viewport width (allowing 1px tolerance)
        expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });

    test('should have responsive grid on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Wait for layout to settle
        await page.waitForTimeout(500);

        // Check no horizontal overflow
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(documentWidth).toBeLessThanOrEqual(375 + 1);
    });

    test('should render icon playground correctly', async ({ page }) => {
        // Check playground is visible
        const playground = page.locator('.playground-controls');
        await expect(playground).toBeVisible();

        // Check preset buttons are present (they use data-preset attribute)
        const presetButtons = page.locator('button[data-preset]');
        const count = await presetButtons.count();
        expect(count).toBeGreaterThan(0);
        console.log(`Found ${count} preset buttons`);
    });

    test('should render icon comparison section', async ({ page }) => {
        // Check comparison section exists
        const comparison = page.locator('.comparison');
        await expect(comparison).toBeVisible();

        // Check comparison items
        const items = page.locator('.comparison-item');
        const count = await items.count();
        expect(count).toBeGreaterThan(0);
        console.log(`Found ${count} comparison items`);
    });

    test('should have properly positioned copy button in code snippets', async ({ page }) => {
        // Find first code snippet with copy button
        const codeSnippet = page.locator('.code-snippet-wrapper').first();
        await expect(codeSnippet).toBeVisible();

        // Check copy button exists (correct class name)
        const copyButton = codeSnippet.locator('.code-copy-btn');
        await expect(copyButton).toBeVisible();

        // Get button position
        const buttonBox = await copyButton.boundingBox();
        const snippetBox = await codeSnippet.boundingBox();

        // Button should be in top-right corner
        expect(buttonBox).toBeTruthy();
        expect(snippetBox).toBeTruthy();

        // Button should be within snippet bounds
        expect(buttonBox.x).toBeGreaterThanOrEqual(snippetBox.x);
        expect(buttonBox.y).toBeGreaterThanOrEqual(snippetBox.y);
        expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(snippetBox.x + snippetBox.width + 1);

        console.log(`Copy button at (${buttonBox.x}, ${buttonBox.y})`);
        console.log(`Code snippet at (${snippetBox.x}, ${snippetBox.y})`);
    });
});
