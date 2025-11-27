import { test, expect } from '@playwright/test';

test.describe('GlobalConfig Playground', () => {
    test.beforeEach(async ({ page }) => {
        // Server runs on port 5177 or 5178 depending on availability
        const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5178';
        await page.goto(`${baseUrl}/docs/demos/global-config-playground.html`);
        await page.waitForLoadState('networkidle');
        // Wait for M3DropdownMenu components to initialize
        await page.waitForTimeout(500);
    });

    test('should render all control sections', async ({ page }) => {
        // Check all section headers exist (now using IconManager icons, not emojis)
        await expect(page.locator('h3:has-text("Icon System")')).toBeVisible();
        await expect(page.locator('h3:has-text("Theme Colors")')).toBeVisible();
        await expect(page.locator('h3:has-text("List Settings")')).toBeVisible();
        await expect(page.locator('h3:has-text("Button Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("Modal Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("Form Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("Toast Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("Sidebar Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("Chart Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("CodeSnippet Defaults")')).toBeVisible();
    });

    test('should render icon preview', async ({ page }) => {
        const iconPreview = page.locator('#iconPreview');
        await expect(iconPreview).toBeVisible();

        // Check that icons are rendered (8 icons shown)
        const iconItems = page.locator('.icon-item');
        const count = await iconItems.count();
        expect(count).toBe(8);
    });

    test('should render button preview', async ({ page }) => {
        const buttonPreview = page.locator('#buttonPreview');
        await expect(buttonPreview).toBeVisible();

        // Check that buttons are rendered (3 button variants)
        const buttons = buttonPreview.locator('button');
        const count = await buttons.count();
        expect(count).toBe(3);
    });

    test('should render color preview', async ({ page }) => {
        const colorPreview = page.locator('#colorPreview');
        await expect(colorPreview).toBeVisible();

        // Check that color swatches are rendered (4 colors)
        const swatches = colorPreview.locator('.color-swatch');
        const count = await swatches.count();
        expect(count).toBe(4);
    });

    test('should generate complete config code', async ({ page }) => {
        const generatedCode = page.locator('#generatedCode');
        await expect(generatedCode).toBeVisible();

        // Wait for CodeSnippetBuilder to render
        await page.waitForTimeout(500);

        const codeText = await page.locator('#generatedCode code').textContent();

        // Check that all config sections are present
        expect(codeText).toContain('iconPreset:');
        expect(codeText).toContain('iconWeight:');
        expect(codeText).toContain('theme:');
        expect(codeText).toContain('buttons:');
        expect(codeText).toContain('modals:');
        expect(codeText).toContain('forms:');
        expect(codeText).toContain('lists:');
        expect(codeText).toContain('charts:');
        expect(codeText).toContain('sidebar:');
        expect(codeText).toContain('toasts:');
        expect(codeText).toContain('codeSnippets:');
    });

    test('should update config when changing icon preset via M3DropdownMenu', async ({ page }) => {
        // M3DropdownMenu - click the field to open
        const iconPresetDropdown = page.locator('#dropdown-iconPreset .m3-dropdown__field');
        await iconPresetDropdown.click();

        // Wait for menu to open
        await page.waitForTimeout(200);

        // Select "Emoji (Colored)" option specifically from the icon preset dropdown
        await page.locator('#dropdown-iconPreset .m3-dropdown__option:has-text("Emoji (Colored)")').click();

        // Wait for update
        await page.waitForTimeout(500);

        // Check that current preset label updated
        const currentPreset = await page.locator('#currentIconPreset').textContent();
        expect(currentPreset).toBe('Emoji');

        // Check generated code updated
        const codeText = await page.locator('#generatedCode code').textContent();
        expect(codeText).toContain("iconPreset: 'emoji'");
    });

    test('should update config when changing colors', async ({ page }) => {
        // Change primary color
        await page.fill('#primaryColor', '#ff0000');

        // Trigger input event
        await page.dispatchEvent('#primaryColor', 'input');

        // Wait for update
        await page.waitForTimeout(500);

        // Check generated code updated
        const codeText = await page.locator('#generatedCode code').textContent();
        expect(codeText).toContain("primary: '#ff0000'");
    });

    test('should update config when toggling checkboxes', async ({ page }) => {
        // Expand Forms section first (it's collapsed by default)
        await page.click('#section-forms .config-section-header');
        await page.waitForTimeout(200);

        // Toggle form auto-save (M3 switch style - click the track, not the hidden checkbox)
        const autoSaveSwitch = page.locator('label:has(#formAutoSave) .m3-switch-track');
        await autoSaveSwitch.click();

        // Wait for update
        await page.waitForTimeout(500);

        // Check generated code updated
        const codeText = await page.locator('#generatedCode code').textContent();
        expect(codeText).toContain('autoSave: true');
    });

    test('should have collapsible sections', async ({ page }) => {
        // Modal section starts collapsed
        const modalSection = page.locator('#section-modals');
        await expect(modalSection).toHaveClass(/collapsed/);

        // Click to expand
        await page.click('#section-modals .config-section-header');
        await page.waitForTimeout(200);

        // Should no longer be collapsed
        await expect(modalSection).not.toHaveClass(/collapsed/);

        // Content should be visible
        await expect(page.locator('#dropdown-modalSize')).toBeVisible();
    });

    test('should not have horizontal overflow', async ({ page }) => {
        // Get viewport and document width
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);

        // Document width should not exceed viewport width (allowing 1px tolerance)
        expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });

    test('should have M3DropdownMenu components for all dropdowns', async ({ page }) => {
        // Verify all dropdowns are M3DropdownMenu instances
        const dropdownContainers = [
            '#dropdown-iconPreset',
            '#dropdown-iconWeight',
            '#dropdown-listActionDisplay',
            '#dropdown-itemsPerPage',
            '#dropdown-buttonSize',
            '#dropdown-buttonType'
        ];

        for (const container of dropdownContainers) {
            const dropdown = page.locator(`${container} .m3-dropdown`);
            await expect(dropdown).toBeVisible();
        }
    });
});
