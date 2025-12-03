import { test, expect } from '@playwright/test';

test.describe('Spacing Presets', () => {
    test('Compact spacing should be 16px', async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/spacing-demo.html');
        await page.waitForTimeout(2000);

        // Click Compact button
        await page.click('#btn-compact');
        await page.waitForTimeout(1000);

        const result = await page.evaluate(() => {
            const container = document.querySelector('#app .site-content-inner');
            if (!container) return { error: 'container not found' };

            const styles = window.getComputedStyle(container);
            return {
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight
            };
        });

        console.log('Compact Spacing:', result);
        expect(result.paddingLeft).toBe('16px');
        expect(result.paddingRight).toBe('16px');
    });

    test('Normal spacing should be 40px', async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/spacing-demo.html');
        await page.waitForTimeout(2000);

        // Normal is default, check immediately
        const result = await page.evaluate(() => {
            const container = document.querySelector('#app .site-content-inner');
            if (!container) return { error: 'container not found' };

            const styles = window.getComputedStyle(container);
            return {
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight
            };
        });

        console.log('Normal Spacing:', result);
        expect(result.paddingLeft).toBe('40px');
        expect(result.paddingRight).toBe('40px');
    });

    test('Spacious spacing should be 64px', async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/spacing-demo.html');
        await page.waitForTimeout(2000);

        // Click Spacious button
        await page.click('#btn-spacious');
        await page.waitForTimeout(1000);

        const result = await page.evaluate(() => {
            const container = document.querySelector('#app .site-content-inner');
            if (!container) return { error: 'container not found' };

            const styles = window.getComputedStyle(container);
            return {
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight
            };
        });

        console.log('Spacious Spacing:', result);
        expect(result.paddingLeft).toBe('64px');
        expect(result.paddingRight).toBe('64px');
    });

    test('Switch between all spacing variants', async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/spacing-demo.html');
        await page.waitForTimeout(2000);

        // Test Normal (default)
        let padding = await page.evaluate(() => {
            return window.getComputedStyle(document.querySelector('#app .site-content-inner')).paddingLeft;
        });
        expect(padding).toBe('40px');

        // Switch to Compact
        await page.click('#btn-compact');
        await page.waitForTimeout(1000);
        padding = await page.evaluate(() => {
            return window.getComputedStyle(document.querySelector('#app .site-content-inner')).paddingLeft;
        });
        expect(padding).toBe('16px');

        // Switch to Spacious
        await page.click('#btn-spacious');
        await page.waitForTimeout(1000);
        padding = await page.evaluate(() => {
            return window.getComputedStyle(document.querySelector('#app .site-content-inner')).paddingLeft;
        });
        expect(padding).toBe('64px');

        // Switch back to Normal
        await page.click('#btn-normal');
        await page.waitForTimeout(1000);
        padding = await page.evaluate(() => {
            return window.getComputedStyle(document.querySelector('#app .site-content-inner')).paddingLeft;
        });
        expect(padding).toBe('40px');
    });

    test('Visual screenshots of spacing variants', async ({ page }) => {
        await page.setViewportSize({ width: 1400, height: 900 });
        await page.goto('http://localhost:5177/docs/demos/spacing-demo.html');
        await page.waitForTimeout(2000);

        // Screenshot Normal (default)
        await page.screenshot({ path: 'screenshot-normal.png', fullPage: false });

        // Screenshot Compact
        await page.click('#btn-compact');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshot-compact.png', fullPage: false });

        // Screenshot Spacious
        await page.click('#btn-spacious');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshot-spacious.png', fullPage: false });
    });
});
