import { test } from '@playwright/test';

test('Visual check of icon-system.html code snippets', async ({ page }) => {
    await page.goto('http://localhost:5177/docs/demos/icon-system.html');
    await page.waitForLoadState('networkidle');

    // Wait for code snippets to load
    await page.waitForTimeout(2000);

    // Scroll to first code snippet
    const firstSnippet = page.locator('.code-snippet-wrapper').first();
    await firstSnippet.scrollIntoViewIfNeeded();

    // Wait a bit for rendering
    await page.waitForTimeout(500);

    // Take screenshot of first code snippet
    await firstSnippet.screenshot({
        path: '/tmp/icon-system-code-snippet-1.png'
    });

    console.log('Screenshot 1 saved to /tmp/icon-system-code-snippet-1.png');

    // Scroll to second code snippet (custom icons)
    const secondSnippet = page.locator('.code-snippet-wrapper').nth(1);
    await secondSnippet.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await secondSnippet.screenshot({
        path: '/tmp/icon-system-code-snippet-2.png'
    });

    console.log('Screenshot 2 saved to /tmp/icon-system-code-snippet-2.png');

    // Full page screenshot
    await page.screenshot({
        path: '/tmp/icon-system-full-page.png',
        fullPage: true
    });

    console.log('Full page screenshot saved to /tmp/icon-system-full-page.png');
});
