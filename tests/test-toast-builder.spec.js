/**
 * ToastBuilder Tests
 */

import { test, expect } from '@playwright/test';

const DEMO_URL = 'http://localhost:5177/docs/demos/toast-builder.html';

test.describe('ToastBuilder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(DEMO_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should show success toast', async ({ page }) => {
        await page.click('text=Success');
        
        const toast = page.locator('.ssi-toast.success');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Success');
        await expect(toast).toContainText('Data saved successfully!');
    });

    test('should show error toast', async ({ page }) => {
        await page.click('text=Error');
        
        const toast = page.locator('.ssi-toast.error');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Error');
        await expect(toast).toContainText('Failed to save data.');
    });

    test('should show warning toast', async ({ page }) => {
        await page.click('text=Warning');
        
        const toast = page.locator('.ssi-toast.warning');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Warning');
    });

    test('should show info toast', async ({ page }) => {
        await page.click('text=Info');
        
        const toast = page.locator('.ssi-toast.info');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Info');
    });

    test('should support different positions', async ({ page }) => {
        // Top Right (Default)
        await page.click('text=Top Right');
        await expect(page.locator('.ssi-toast-container.top-right')).toBeVisible();
        await expect(page.locator('.ssi-toast-container.top-right .ssi-toast')).toBeVisible();

        // Top Left
        await page.click('text=Top Left');
        await expect(page.locator('.ssi-toast-container.top-left')).toBeVisible();
        await expect(page.locator('.ssi-toast-container.top-left .ssi-toast')).toBeVisible();

        // Bottom Right
        await page.click('text=Bottom Right');
        await expect(page.locator('.ssi-toast-container.bottom-right')).toBeVisible();
        await expect(page.locator('.ssi-toast-container.bottom-right .ssi-toast')).toBeVisible();
    });

    test('should close on click', async ({ page }) => {
        await page.click('text=Success');
        const toast = page.locator('.ssi-toast.success');
        await expect(toast).toBeVisible();

        await toast.locator('.ssi-toast-close').click();
        await expect(toast).not.toBeVisible();
    });
});
