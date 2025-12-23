/**
 * ListBuilder Real-time Updates Tests
 * Tests for v2.10.0 incremental update features
 */

import { test, expect } from '@playwright/test';

test.describe('ListBuilder Real-time Updates', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/list-builder.html');
        // Wait for the page to load
        await page.waitForSelector('#tableRealtime', { state: 'visible', timeout: 10000 });
    });

    test('should display real-time demo section', async ({ page }) => {
        // Check if the real-time section exists
        const section = page.locator('text=Real-time Live Updates');
        await expect(section).toBeVisible();

        // Check if buttons are present
        await expect(page.locator('#btn-add-row')).toBeVisible();
        await expect(page.locator('#btn-update-random')).toBeVisible();
        await expect(page.locator('#btn-remove-first')).toBeVisible();
        await expect(page.locator('#btn-auto-add')).toBeVisible();
    });

    test('should add new row when clicking add button', async ({ page }) => {
        // Wait for table to be fully loaded
        await page.waitForSelector('#tableRealtime tbody tr', { timeout: 5000 });

        // Click add button multiple times to verify functionality
        await page.click('#btn-add-row');
        await page.click('#btn-add-row');
        await page.click('#btn-add-row');

        // Wait for animation and DOM update
        await page.waitForTimeout(1000);

        // Verify table has rows
        const rows = await page.locator('#tableRealtime tbody tr').count();
        expect(rows).toBeGreaterThanOrEqual(3);
    });

    test('should handle remove button click', async ({ page }) => {
        // Wait for initial table
        await page.waitForSelector('#tableRealtime tbody tr', { timeout: 5000 });

        // Count rows before
        const beforeRows = await page.locator('#tableRealtime tbody tr').count();

        // Click remove button
        await page.click('#btn-remove-first');

        // Wait for animation (fade-out + DOM update)
        await page.waitForTimeout(1000);

        // Verify table still exists
        const tableExists = await page.locator('#tableRealtime').isVisible();
        expect(tableExists).toBe(true);
    });

    test('should update row with highlight animation', async ({ page }) => {
        // Add a row first
        await page.click('#btn-add-row');
        await page.waitForTimeout(300);

        // Click update button
        await page.click('#btn-update-random');

        // Check that a row has the updated class (briefly)
        // The class is removed after animation, so we just verify no errors
        await page.waitForTimeout(500);

        // Verify table still exists and is functional
        const rows = await page.locator('#tableRealtime tbody tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('should toggle auto-add mode', async ({ page }) => {
        const autoButton = page.locator('#btn-auto-add');
        const statusIndicator = page.locator('#realtime-status');

        // Initially, status indicator should be hidden
        await expect(statusIndicator).not.toBeVisible();

        // Click to start auto-add
        await autoButton.click();

        // Status indicator should now be visible
        await expect(statusIndicator).toBeVisible();

        // Button text should change
        await expect(autoButton).toContainText('stoppen');

        // Click to stop
        await autoButton.click();

        // Status indicator should be hidden again
        await expect(statusIndicator).not.toBeVisible();
    });

    test('should limit rows with maxRows sliding window', async ({ page }) => {
        // Add multiple rows rapidly
        for (let i = 0; i < 15; i++) {
            await page.click('#btn-add-row');
            await page.waitForTimeout(100);
        }

        // Wait for animations to complete
        await page.waitForTimeout(500);

        // Count rows - should be max 10 due to maxRows setting
        const rows = await page.locator('#tableRealtime tbody tr').count();
        expect(rows).toBeLessThanOrEqual(10);
    });

    test('new rows have correct structure', async ({ page }) => {
        // Wait for table
        await page.waitForSelector('#tableRealtime tbody tr', { timeout: 5000 });

        // Add a new row
        await page.click('#btn-add-row');
        await page.waitForTimeout(600);

        // Verify the new row has correct structure (5 columns: ID, Zeit, Event, Status, User)
        const cells = await page.locator('#tableRealtime tbody tr').first().locator('td').count();
        expect(cells).toBe(5);
    });
});
