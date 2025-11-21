/**
 * Full Page Walkthrough Test
 * Tests the complete SSI Builders landing page - all sections, interactions, and demo links
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5180';

test.describe('SSI Builders - Complete Page Walkthrough', () => {
    test('Complete page walkthrough - all elements and interactions', async ({ page }) => {
        // Collect console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // === 1. LOAD PAGE ===
        console.log('Step 1: Loading page...');
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for all JS to initialize

        // Take screenshot
        await page.screenshot({ path: 'playwright-results/01-page-load.png', fullPage: true });

        // === 2. CHECK HERO SECTION ===
        console.log('Step 2: Checking hero section...');
        await expect(page.locator('.hero h1')).toContainText('SSI Builders');
        await expect(page.locator('.version-badge')).toContainText('v1.2.0');
        await expect(page.locator('.version-badge')).toContainText('Material Design 3');

        // === 3. CHECK STATS ===
        console.log('Step 3: Checking stats grid...');
        const stats = await page.locator('.stat-card');
        await expect(stats).toHaveCount(4);

        // === 4. CHECK SIDEBAR ===
        console.log('Step 4: Checking sidebar...');
        const sidebar = await page.locator('.sidebar-container');
        await expect(sidebar).toBeVisible();

        // Check sidebar header
        await expect(page.locator('.sidebar h2')).toContainText('SSI Builders');

        // Check main navigation items
        const navItems = ['Overview', 'Getting Started', 'All Builders', 'Icon System', 'Resources'];
        for (const item of navItems) {
            await expect(sidebar.locator(`text=${item}`)).toBeVisible();
        }

        // === 5. EXPAND SIDEBAR SECTIONS ===
        console.log('Step 5: Testing sidebar expandable sections...');

        // Expand "All Builders"
        await sidebar.locator('text=All Builders').first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'playwright-results/02-sidebar-all-builders-expanded.png' });

        // Check nested builder items
        const builders = ['ListBuilder', 'FormBuilder', 'ModalBuilder', 'ChartBuilder', 'TabBuilder', 'MenuBuilder', 'SidebarBuilder'];
        for (const builder of builders) {
            const builderItem = sidebar.locator(`text=${builder}`).first();
            await expect(builderItem).toBeVisible();
        }

        // Expand "Icon System"
        await sidebar.locator('text=Icon System').first().click();
        await page.waitForTimeout(500);
        await expect(sidebar.locator('text=Documentation')).toBeVisible();
        await expect(sidebar.locator('text=Weight Demo')).toBeVisible();

        // Expand "Resources"
        await sidebar.locator('text=Resources').first().click();
        await page.waitForTimeout(500);
        await expect(sidebar.locator('text=README.md')).toBeVisible();
        await expect(sidebar.locator('text=CHANGELOG.md')).toBeVisible();
        await expect(sidebar.locator('text=GitHub')).toBeVisible();

        await page.screenshot({ path: 'playwright-results/03-sidebar-all-sections-expanded.png' });

        // === 6. CHECK TABS ===
        console.log('Step 6: Testing tabs navigation...');
        const tabs = await page.locator('[role="tab"]');
        await expect(tabs).toHaveCount(3);

        // Check Overview tab (should be active by default)
        await expect(page.locator('[role="tab"]', { hasText: 'Overview' })).toBeVisible();
        await expect(page.locator('text=Was ist SSI Builders?')).toBeVisible();
        await page.screenshot({ path: 'playwright-results/04-tab-overview.png', fullPage: true });

        // === 7. TEST GETTING STARTED TAB ===
        console.log('Step 7: Testing Getting Started tab...');
        await page.locator('[role="tab"]', { hasText: 'Getting Started' }).click();
        await page.waitForTimeout(1000);

        await expect(page.locator('text=Quick Start')).toBeVisible();
        await expect(page.locator('text=Als Git Submodule einbinden')).toBeVisible();
        await expect(page.locator('text=Icon-System konfigurieren')).toBeVisible();
        await page.screenshot({ path: 'playwright-results/05-tab-getting-started.png', fullPage: true });

        // === 8. TEST ALL BUILDERS TAB ===
        console.log('Step 8: Testing All Builders tab with ListBuilder...');
        await page.locator('[role="tab"]', { hasText: 'All Builders' }).click();
        await page.waitForTimeout(3000); // Wait for ListBuilder to initialize

        // Check if ListBuilder rendered (with longer timeout)
        const listContainer = await page.locator('#buildersGrid .ssi-list-container');
        await expect(listContainer).toBeVisible({ timeout: 10000 });

        // Check if all 7 builders are in the list
        const builderRows = await page.locator('#buildersGrid tbody tr');
        await expect(builderRows).toHaveCount(7);

        // Check specific builder names
        await expect(page.locator('#buildersGrid').locator('text=ListBuilder')).toBeVisible();
        await expect(page.locator('#buildersGrid').locator('text=FormBuilder')).toBeVisible();
        await expect(page.locator('#buildersGrid').locator('text=ModalBuilder')).toBeVisible();
        await expect(page.locator('#buildersGrid').locator('text=ChartBuilder')).toBeVisible();

        await page.screenshot({ path: 'playwright-results/06-tab-all-builders-list.png', fullPage: true });

        // === 9. TEST SEARCH IN BUILDERS LIST ===
        console.log('Step 9: Testing search in builders list...');
        const searchInput = await page.locator('#buildersGrid input[type="search"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('Form');
            await page.waitForTimeout(500);

            // Should only show FormBuilder
            const filteredRows = await page.locator('#buildersGrid tbody tr:visible');
            await expect(filteredRows).toHaveCount(1);
            await expect(page.locator('#buildersGrid').locator('text=FormBuilder')).toBeVisible();

            await page.screenshot({ path: 'playwright-results/07-builders-list-search.png' });

            // Clear search
            await searchInput.clear();
            await page.waitForTimeout(500);
        }

        // === 10. TEST "LIVE DEMO" BUTTONS ===
        console.log('Step 10: Testing Live Demo buttons...');
        const demoButtons = await page.locator('#buildersGrid button:has-text("Live Demo")');
        await expect(demoButtons.first()).toBeVisible();

        // Click first demo button (should open in new tab)
        const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            demoButtons.first().click()
        ]);

        // Check if demo page loaded
        await newPage.waitForLoadState('networkidle');
        const newUrl = newPage.url();
        expect(newUrl).toContain('docs/demos/');
        await newPage.screenshot({ path: 'playwright-results/08-demo-page-opened.png', fullPage: true });
        await newPage.close();

        // === 11. GO BACK TO OVERVIEW TAB ===
        console.log('Step 11: Going back to Overview tab...');
        await page.locator('[role="tab"]', { hasText: 'Overview' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Was ist SSI Builders?')).toBeVisible();

        // === 12. CHECK FOOTER ===
        console.log('Step 12: Checking footer...');
        const footer = await page.locator('.footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText('SSI Solutions');
        await expect(footer).toContainText('2025');
        await expect(footer).toContainText('Version 1.2.0');

        // === 13. TEST MOBILE RESPONSIVE ===
        console.log('Step 13: Testing mobile responsive layout...');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(1000);

        // Hero should still be visible
        await expect(page.locator('.hero h1')).toBeVisible();

        // Stats should still work
        await expect(page.locator('.stat-card')).toHaveCount(4);

        await page.screenshot({ path: 'playwright-results/09-mobile-view.png', fullPage: true });

        // Go back to desktop
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(500);

        // === 14. FINAL SCREENSHOT ===
        await page.screenshot({ path: 'playwright-results/10-final-state.png', fullPage: true });

        // === 15. CHECK CONSOLE ERRORS ===
        console.log('Step 14: Checking for console errors...');
        const criticalErrors = consoleErrors.filter(err =>
            !err.includes('favicon') &&
            !err.includes('manifest') &&
            !err.includes('sw.js') &&
            !err.includes('DevTools')
        );

        if (criticalErrors.length > 0) {
            console.log('Console Errors Found:', criticalErrors);
        }

        expect(criticalErrors.length).toBe(0);

        console.log('✅ Full walkthrough completed successfully!');
    });

    test('Test all demo page links from sidebar', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const sidebar = await page.locator('.sidebar-container');

        // Expand "All Builders" section
        await sidebar.locator('text=All Builders').first().click();
        await page.waitForTimeout(500);

        const demoLinks = [
            { name: 'ListBuilder', expectedUrl: 'list-builder.html' },
            { name: 'FormBuilder', expectedUrl: 'form-builder.html' },
            { name: 'ModalBuilder', expectedUrl: 'modal-builder.html' },
            { name: 'ChartBuilder', expectedUrl: 'chart-builder.html' },
            { name: 'TabBuilder', expectedUrl: 'tab-builder.html' },
            { name: 'MenuBuilder', expectedUrl: 'menu-builder.html' },
            { name: 'SidebarBuilder', expectedUrl: 'sidebar-builder.html' }
        ];

        for (const link of demoLinks) {
            console.log(`Testing demo link: ${link.name}`);

            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                sidebar.locator(`text=${link.name}`).first().click()
            ]);

            await newPage.waitForLoadState('networkidle', { timeout: 10000 });
            const url = newPage.url();
            expect(url).toContain(link.expectedUrl);

            await newPage.close();
            await page.waitForTimeout(300);
        }

        console.log('✅ All demo links work correctly!');
    });

    test('Test Icon System demo links', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const sidebar = await page.locator('.sidebar-container');

        // Expand "Icon System" section
        await sidebar.locator('text=Icon System').first().click();
        await page.waitForTimeout(500);

        // Test Documentation link
        console.log('Testing Icon System Documentation link...');
        const [docPage] = await Promise.all([
            page.context().waitForEvent('page'),
            sidebar.locator('text=Documentation').first().click()
        ]);
        await docPage.waitForLoadState('networkidle');
        expect(docPage.url()).toContain('icon-system.html');
        await docPage.close();

        // Test Weight Demo link
        console.log('Testing Icon Weight Demo link...');
        const [weightPage] = await Promise.all([
            page.context().waitForEvent('page'),
            sidebar.locator('text=Weight Demo').first().click()
        ]);
        await weightPage.waitForLoadState('networkidle');
        expect(weightPage.url()).toContain('icon-weight-demo.html');
        await weightPage.close();

        console.log('✅ Icon System demo links work correctly!');
    });
});
