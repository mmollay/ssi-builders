/**
 * M3 Components Tests
 * SSI Builders v2.4.0
 */

import { test, expect } from '@playwright/test';

const DEMO_URL = 'http://localhost:5178/docs/demos/m3-components.html';

test.describe('M3 Components', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(DEMO_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should load M3 components page', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Material Design 3 Components');
    });

    test('M3 Buttons should render all variants', async ({ page }) => {
        // Filled button
        await expect(page.locator('.m3-button--filled').first()).toBeVisible();

        // Outlined button
        await expect(page.locator('.m3-button--outlined').first()).toBeVisible();

        // Text button
        await expect(page.locator('.m3-button--text').first()).toBeVisible();

        // Elevated button
        await expect(page.locator('.m3-button--elevated').first()).toBeVisible();

        // Tonal button
        await expect(page.locator('.m3-button--tonal').first()).toBeVisible();
    });

    test('M3 Text Fields should render with floating labels', async ({ page }) => {
        // Filled text field
        const filledInput = page.locator('.m3-text-field--filled .m3-text-field__input').first();
        await expect(filledInput).toBeVisible();

        // Outlined text field
        const outlinedInput = page.locator('.m3-text-field--outlined .m3-text-field__input').first();
        await expect(outlinedInput).toBeVisible();

        // Test floating label on focus
        await filledInput.click();
        await filledInput.fill('Test value');
        await expect(page.locator('.m3-text-field--filled .m3-text-field__label').first()).toBeVisible();
    });

    test('M3 Dropdown should open and close', async ({ page }) => {
        const dropdown = page.locator('#dropdown-filled .m3-dropdown').first();
        const menu = page.locator('#dropdown-filled .m3-dropdown__menu').first();

        // Initially closed
        await expect(dropdown).not.toHaveClass(/m3-dropdown--open/);

        // Click to open
        await dropdown.click();
        await expect(dropdown).toHaveClass(/m3-dropdown--open/);

        // Menu should be visible
        await expect(menu).toBeVisible();
    });

    test('M3 Dropdown should select an option', async ({ page }) => {
        const dropdown = page.locator('#dropdown-filled .m3-dropdown').first();

        // Open dropdown
        await dropdown.click();

        // Select Germany
        await page.click('#dropdown-filled .m3-dropdown__option[data-value="de"]');

        // Check value updated
        await expect(page.locator('#filled-value')).toContainText('Germany');

        // Hidden input should have value
        const hiddenInput = page.locator('#dropdown-filled input[type="hidden"]');
        await expect(hiddenInput).toHaveValue('de');
    });

    test('M3 Dropdown keyboard navigation', async ({ page }) => {
        const dropdown = page.locator('#dropdown-filled .m3-dropdown').first();

        // Focus dropdown
        await dropdown.focus();

        // Press Enter to open
        await page.keyboard.press('Enter');
        await expect(dropdown).toHaveClass(/m3-dropdown--open/);

        // Press ArrowDown to move focus
        await page.keyboard.press('ArrowDown');

        // Press Enter to select
        await page.keyboard.press('Enter');

        // Dropdown should close
        await expect(dropdown).not.toHaveClass(/m3-dropdown--open/);
    });

    test('M3 Checkbox should toggle', async ({ page }) => {
        const checkbox = page.locator('.m3-checkbox__input').first();

        // Initially unchecked
        await expect(checkbox).not.toBeChecked();

        // Click to check
        await checkbox.click();
        await expect(checkbox).toBeChecked();

        // Click to uncheck
        await checkbox.click();
        await expect(checkbox).not.toBeChecked();
    });

    test('M3 Switch should toggle', async ({ page }) => {
        const switchInput = page.locator('.m3-switch__input').first();

        // Initially unchecked
        await expect(switchInput).not.toBeChecked();

        // Click switch track to toggle
        await page.locator('.m3-switch__track').first().click();
        await expect(switchInput).toBeChecked();
    });

    test('Theme toggle should work', async ({ page }) => {
        // Initially light theme
        await expect(page.locator('html')).not.toHaveClass(/m3-dark/);

        // Click theme toggle
        await page.click('button:has-text("Theme")');

        // Should have dark theme class
        await expect(page.locator('html')).toHaveClass(/m3-dark/);

        // Toggle back
        await page.click('button:has-text("Theme")');
        await expect(page.locator('html')).not.toHaveClass(/m3-dark/);
    });

    test('Complete form should be functional', async ({ page }) => {
        // Fill in form fields
        await page.fill('#form-firstname', 'Max');
        await page.fill('#form-lastname', 'Mustermann');
        await page.fill('#form-email', 'max@example.com');
        await page.fill('#form-password', 'SecurePass123');

        // Select country from dropdown
        await page.locator('#form-country .m3-dropdown').click();
        await page.click('#form-country .m3-dropdown__option[data-value="at"]');

        // Accept terms
        await page.locator('form .m3-checkbox__input').click();

        // Verify all fields are filled
        await expect(page.locator('#form-firstname')).toHaveValue('Max');
        await expect(page.locator('#form-lastname')).toHaveValue('Mustermann');
        await expect(page.locator('#form-email')).toHaveValue('max@example.com');
    });

    test('Outlined dropdown should have pre-selected value', async ({ page }) => {
        // Outlined dropdown should show Austria as default
        await expect(page.locator('#outlined-value')).toContainText('Austria');

        // The dropdown value should show Austria
        await expect(page.locator('#dropdown-outlined .m3-dropdown__value')).toContainText('Austria');
    });

    test('Disabled dropdown should not be interactive', async ({ page }) => {
        const disabledDropdown = page.locator('#dropdown-disabled .m3-dropdown');

        // Should have disabled class
        await expect(disabledDropdown).toHaveClass(/m3-dropdown--disabled/);

        // Should have aria-disabled
        await expect(disabledDropdown).toHaveAttribute('aria-disabled', 'true');
    });

    test('Error state dropdown should show error styling', async ({ page }) => {
        const errorDropdown = page.locator('#dropdown-error .m3-dropdown');

        // Should have error class
        await expect(errorDropdown).toHaveClass(/m3-dropdown--error/);

        // Error text should be visible
        await expect(page.locator('#dropdown-error .m3-dropdown__supporting-text--error')).toBeVisible();
        await expect(page.locator('#dropdown-error .m3-dropdown__supporting-text--error')).toContainText('required');
    });

    // M3 Slider Tests
    test('M3 Slider should render continuous slider', async ({ page }) => {
        const slider = page.locator('#slider-continuous .m3-slider');
        await expect(slider).toBeVisible();

        // Label should be visible
        await expect(page.locator('#slider-continuous .m3-slider__label')).toContainText('Brightness');

        // Thumb should be visible
        await expect(page.locator('#slider-continuous .m3-slider__thumb')).toBeVisible();
    });

    test('M3 Slider should render discrete slider with ticks', async ({ page }) => {
        const slider = page.locator('#slider-discrete .m3-slider');
        await expect(slider).toBeVisible();

        // Should have discrete class
        await expect(slider).toHaveClass(/m3-slider--discrete/);

        // Ticks should be visible
        await expect(page.locator('#slider-discrete .m3-slider__ticks')).toBeVisible();
    });

    test('M3 Slider disabled state should not be interactive', async ({ page }) => {
        const disabledSlider = page.locator('#slider-disabled .m3-slider');

        // Should have disabled class
        await expect(disabledSlider).toHaveClass(/m3-slider--disabled/);

        // Should have aria-disabled
        await expect(disabledSlider).toHaveAttribute('aria-disabled', 'true');
    });

    // M3 ColorPicker Tests
    test('M3 ColorPicker should render basic picker', async ({ page }) => {
        const picker = page.locator('#colorpicker-basic .m3-color-picker');
        await expect(picker).toBeVisible();

        // Trigger button should be visible
        await expect(page.locator('#colorpicker-basic .m3-color-picker__trigger')).toBeVisible();

        // Swatch should show color
        await expect(page.locator('#colorpicker-basic .m3-color-picker__swatch')).toBeVisible();
    });

    test('M3 ColorPicker should open panel on click', async ({ page }) => {
        const trigger = page.locator('#colorpicker-basic .m3-color-picker__trigger');
        const panel = page.locator('#colorpicker-basic .m3-color-picker__panel');

        // Click to open
        await trigger.click();

        // Panel should be visible
        await expect(panel).toBeVisible();

        // Color area should be visible
        await expect(page.locator('#colorpicker-basic .m3-color-picker__area')).toBeVisible();

        // Hue slider should be visible
        await expect(page.locator('#colorpicker-basic .m3-color-picker__hue')).toBeVisible();
    });

    test('M3 ColorPicker with alpha should show alpha slider', async ({ page }) => {
        const trigger = page.locator('#colorpicker-alpha .m3-color-picker__trigger');

        // Open picker
        await trigger.click();

        // Alpha slider should be visible
        await expect(page.locator('#colorpicker-alpha .m3-color-picker__alpha')).toBeVisible();
    });

    test('M3 ColorPicker presets should be clickable', async ({ page }) => {
        const trigger = page.locator('#colorpicker-basic .m3-color-picker__trigger');

        // Open picker
        await trigger.click();

        // Presets should be visible
        const presets = page.locator('#colorpicker-basic .m3-color-picker__preset');
        await expect(presets.first()).toBeVisible();

        // Click a preset
        await presets.first().click();

        // Swatch color should update (panel closes on selection)
        await expect(page.locator('#colorpicker-basic .m3-color-picker__swatch')).toBeVisible();
    });

    test('M3 ColorPicker disabled state should not be interactive', async ({ page }) => {
        const disabledPicker = page.locator('#colorpicker-disabled .m3-color-picker');

        // Should have disabled class
        await expect(disabledPicker).toHaveClass(/m3-color-picker--disabled/);

        // Trigger should be disabled
        await expect(page.locator('#colorpicker-disabled .m3-color-picker__trigger')).toBeDisabled();
    });
});
