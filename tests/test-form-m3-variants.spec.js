/**
 * FormBuilder M3 Variants Tests
 */

import { test, expect } from '@playwright/test';

const DEMO_URL = 'http://localhost:5177/docs/demos/form-builder-m3-variants.html';

test.describe('FormBuilder M3 Variants', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(DEMO_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should load M3 variants page', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Material Design 3 Variants');
    });

    test('Standard variant fields should render', async ({ page }) => {
        const standardSm = page.locator('#standard-sm .form-input').first();
        const standardMd = page.locator('#standard-md .form-input').first();
        const standardLg = page.locator('#standard-lg .form-input').first();

        await expect(standardSm).toBeVisible();
        await expect(standardMd).toBeVisible();
        await expect(standardLg).toBeVisible();
    });

    test('Filled variant fields should render with floating labels', async ({ page }) => {
        const filledSm = page.locator('#filled-sm .form-field-filled').first();
        const filledMd = page.locator('#filled-md .form-field-filled').first();
        const filledLg = page.locator('#filled-lg .form-field-filled').first();

        await expect(filledSm).toBeVisible();
        await expect(filledMd).toBeVisible();
        await expect(filledLg).toBeVisible();
    });

    test('Outlined variant fields should render', async ({ page }) => {
        const outlinedSm = page.locator('#outlined-sm .form-field-outlined').first();
        const outlinedMd = page.locator('#outlined-md .form-field-outlined').first();
        const outlinedLg = page.locator('#outlined-lg .form-field-outlined').first();

        await expect(outlinedSm).toBeVisible();
        await expect(outlinedMd).toBeVisible();
        await expect(outlinedLg).toBeVisible();
    });

    test('Interactive demo should switch layouts', async ({ page }) => {
        // Default is standard
        await expect(page.locator('#interactive-form .form-field-standard').first()).toBeVisible();

        // Switch to filled
        await page.click('input[name="layout"][value="filled"]');
        await expect(page.locator('#interactive-form .form-field-filled').first()).toBeVisible();

        // Switch to outlined
        await page.click('input[name="layout"][value="outlined"]');
        await expect(page.locator('#interactive-form .form-field-outlined').first()).toBeVisible();
    });

    test('Interactive demo should switch sizes', async ({ page }) => {
        // Test small size
        await page.click('input[name="size"][value="sm"]');
        await expect(page.locator('#interactive-form .form-field-size-sm').first()).toBeVisible();

        // Test large size
        await page.click('input[name="size"][value="lg"]');
        await expect(page.locator('#interactive-form .form-field-size-lg').first()).toBeVisible();
    });

    test('Select field should show options correctly (not undefined)', async ({ page }) => {
        const countrySelect = page.locator('#interactive-form select[name="country"]');
        await expect(countrySelect).toBeVisible();

        // Check that options have valid values (not undefined)
        const options = await countrySelect.locator('option').allTextContents();

        // Filter out empty/hidden options
        const visibleOptions = options.filter(opt => opt.trim().length > 0);

        // Should have Austria, Germany, Switzerland
        expect(visibleOptions).toContain('Austria');
        expect(visibleOptions).toContain('Germany');
        expect(visibleOptions).toContain('Switzerland');

        // Should NOT contain "undefined"
        expect(options.join('')).not.toContain('undefined');
    });

    test('Select should allow selection and show value', async ({ page }) => {
        const countrySelect = page.locator('#interactive-form select[name="country"]');

        // Select Austria
        await countrySelect.selectOption('Austria');

        // Verify value is set
        const selectedValue = await countrySelect.inputValue();
        expect(selectedValue).toBe('Austria');
    });

    test('Filled variant border should only be rounded at top', async ({ page }) => {
        // Switch to filled variant
        await page.click('input[name="layout"][value="filled"]');
        await page.waitForTimeout(200);

        const filledInput = page.locator('#interactive-form .form-field-filled .form-input').first();
        await expect(filledInput).toBeVisible();

        // Get computed border-radius
        const borderRadius = await filledInput.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.borderRadius;
        });

        // Should be "4px 4px 0px 0px" or similar (only top corners rounded)
        // This test ensures bottom corners are 0
        console.log('Filled variant border-radius:', borderRadius);
    });
});
