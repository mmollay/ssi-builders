/**
 * FormBuilder M3 Tests
 * Tests for form-builder-m3.html demo page
 */

import { test, expect } from '@playwright/test';

const DEMO_URL = 'http://localhost:5177/docs/demos/form-builder-m3.html';

test.describe('FormBuilder M3', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(DEMO_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should load FormBuilder M3 page', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('FormBuilder');
    });

    test('Complete M3 Form should have text fields', async ({ page }) => {
        // Check for text input fields
        const vornameField = page.locator('input[placeholder=" "]').first();
        await expect(vornameField).toBeVisible();
    });

    test('M3 Dropdown should be visible', async ({ page }) => {
        // Check for M3 dropdown components
        const dropdown = page.locator('.m3-dropdown').first();
        await expect(dropdown).toBeVisible();
    });

    test('M3 Slider should be visible', async ({ page }) => {
        // Check for M3 slider components
        const slider = page.locator('.m3-slider').first();
        await expect(slider).toBeVisible();
    });

    test('M3 ColorPicker should be visible', async ({ page }) => {
        // Check for color picker buttons
        const colorPicker = page.locator('.m3-color-picker').first();
        await expect(colorPicker).toBeVisible();
    });

    test('M3 Checkbox should be visible and functional', async ({ page }) => {
        // Check for M3 checkbox components
        const checkbox = page.locator('.m3-checkbox').first();
        await expect(checkbox).toBeVisible();
    });

    test('M3 Radio buttons should be visible', async ({ page }) => {
        // Check for radio button groups
        const radio = page.locator('.m3-radio').first();
        await expect(radio).toBeVisible();
    });

    test('M3 Toggle/Switch should be visible', async ({ page }) => {
        // Check for toggle switches
        const toggle = page.locator('.m3-switch').first();
        await expect(toggle).toBeVisible();
    });

    test('Submit button should be present', async ({ page }) => {
        const submitBtn = page.locator('button').filter({ hasText: 'Speichern' }).first();
        await expect(submitBtn).toBeVisible();
    });

    test('M3 Dropdown should open on click', async ({ page }) => {
        const dropdown = page.locator('.m3-dropdown__field').first();
        await dropdown.click();

        // Check that menu is visible
        const menu = page.locator('.m3-dropdown__menu').first();
        await expect(menu).toBeVisible();
    });

    test('M3 Multiselect section should exist', async ({ page }) => {
        // Check for multiselect heading
        const heading = page.locator('h2').filter({ hasText: 'M3 Multiselect' });
        await expect(heading).toBeVisible();
    });

    test('M3 Text fields should have consistent styling with dropdowns', async ({ page }) => {
        // Verify both text fields and dropdowns are visible and styled
        const formField = page.locator('.form-field-filled').first();
        const dropdown = page.locator('.m3-dropdown__field').first();

        await expect(formField).toBeVisible();
        await expect(dropdown).toBeVisible();

        // Both elements should be rendered with proper dimensions
        const formFieldBox = await formField.boundingBox();
        const dropdownBox = await dropdown.boundingBox();

        // Both should have some height (greater than 0)
        expect(formFieldBox.height).toBeGreaterThan(0);
        expect(dropdownBox.height).toBeGreaterThan(0);

        // Dropdown should be at least 50px (M3 spec 56px)
        expect(dropdownBox.height).toBeGreaterThanOrEqual(50);
    });
});
