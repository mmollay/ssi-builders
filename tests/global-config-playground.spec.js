import { test, expect } from '@playwright/test';

test.describe('GlobalConfig Playground', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5177/docs/demos/global-config-playground.html');
        await page.waitForLoadState('networkidle');
    });

    test('should render all control sections', async ({ page }) => {
        // Check all section headers exist
        await expect(page.locator('h3:has-text("🎨 Theme & Appearance")')).toBeVisible();
        await expect(page.locator('h3:has-text("🎨 Theme Colors")')).toBeVisible();
        await expect(page.locator('h3:has-text("📋 List Settings")')).toBeVisible();
        await expect(page.locator('h3:has-text("🔘 Button Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("🪟 Modal Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("📝 Form Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("📊 Chart Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("📑 Tab Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("🗂️ Sidebar Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("🍞 Toast Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("💬 Tooltip Defaults")')).toBeVisible();
        await expect(page.locator('h3:has-text("💻 CodeSnippet Defaults")')).toBeVisible();
    });

    test('should render icon preview', async ({ page }) => {
        const iconPreview = page.locator('#iconPreview');
        await expect(iconPreview).toBeVisible();

        // Check that icons are rendered
        const iconItems = page.locator('.icon-item');
        const count = await iconItems.count();
        expect(count).toBeGreaterThan(10); // Should have multiple icons
    });

    test('should render button preview', async ({ page }) => {
        const buttonPreview = page.locator('#buttonPreview');
        await expect(buttonPreview).toBeVisible();

        // Check that buttons are rendered
        const buttons = buttonPreview.locator('button');
        const count = await buttons.count();
        expect(count).toBeGreaterThanOrEqual(4); // Primary, Success, Danger, Secondary
    });

    test('should render list preview', async ({ page }) => {
        const listPreview = page.locator('#listPreview');
        await expect(listPreview).toBeVisible();

        // Wait a bit for ListBuilder to render
        await page.waitForTimeout(1000);

        // Check that list items exist
        const listItems = listPreview.locator('table tbody tr');
        const count = await listItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should generate complete config code', async ({ page }) => {
        const generatedCode = page.locator('#generatedCode');
        await expect(generatedCode).toBeVisible();

        // Wait for CodeSnippetBuilder to render
        await page.waitForTimeout(500);

        const codeText = await page.locator('#generatedCode code').textContent();

        // Check that all new v2.2+ config sections are present
        expect(codeText).toContain('buttons:');
        expect(codeText).toContain('modals:');
        expect(codeText).toContain('forms:');
        expect(codeText).toContain('charts:');
        expect(codeText).toContain('tabs:');
        expect(codeText).toContain('sidebar:');
        expect(codeText).toContain('toasts:');
        expect(codeText).toContain('tooltips:');
        expect(codeText).toContain('codeSnippets:');
    });

    test('should update config when changing icon preset', async ({ page }) => {
        // Change icon preset
        await page.selectOption('#iconPreset', 'emoji');

        // Wait for update (CodeSnippetBuilder needs time to re-render)
        await page.waitForTimeout(1000);

        // Check that current preset label updated
        const currentPreset = await page.locator('#currentIconPreset').textContent();
        expect(currentPreset).toBe('Emoji');

        // Check generated code updated (look inside code element)
        const codeText = await page.locator('#generatedCode code').textContent();
        expect(codeText).toContain("iconPreset: 'emoji'");
    });

    test('should update config when changing colors', async ({ page }) => {
        // Change primary color
        await page.fill('#primaryColor', '#ff0000');

        // Wait for update
        await page.waitForTimeout(1000);

        // Check generated code updated
        const codeText = await page.locator('#generatedCode code').textContent();
        expect(codeText).toContain("primary: '#ff0000'");
    });

    test('should update config when toggling checkboxes', async ({ page }) => {
        // Toggle form auto-save (click the label since checkbox is hidden)
        await page.locator('label:has(#formAutoSave)').click();

        // Wait for update
        await page.waitForTimeout(1000);

        // Check generated code updated
        const codeText = await page.locator('#generatedCode code').textContent();
        expect(codeText).toContain('autoSave: true');
    });

    test('should have dark mode toggle', async ({ page }) => {
        // Dark mode toggle is hidden in toggle-switch, click the label
        const toggleLabel = page.locator('label:has(#darkModeToggle)');
        await expect(toggleLabel).toBeVisible();

        // Toggle dark mode by clicking the label
        await toggleLabel.click();

        // Wait for transition
        await page.waitForTimeout(300);

        // Check body has dark-mode class
        const bodyClass = await page.locator('body').getAttribute('class');
        expect(bodyClass).toContain('dark-mode');
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
});
