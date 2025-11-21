/**
 * Playwright Test: Root Index Page (Meta-Approach)
 * Tests the new landing page built with SSI Builders components
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5180';

test.describe('SSI Builders Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('Page loads and displays hero section', async ({ page }) => {
        // Check hero title
        const heroTitle = await page.locator('.hero h1').textContent();
        expect(heroTitle).toContain('SSI Builders');

        // Check version badge
        const versionBadge = await page.locator('.version-badge').textContent();
        expect(versionBadge).toContain('v1.2.0');
        expect(versionBadge).toContain('Material Design 3');
    });

    test('Stats grid displays correct numbers', async ({ page }) => {
        const stats = await page.locator('.stat-card');

        // Should have 4 stat cards
        await expect(stats).toHaveCount(4);

        // Check specific stats
        const statTexts = await stats.allTextContents();
        expect(statTexts.join(' ')).toContain('7');  // 7 Builders
        expect(statTexts.join(' ')).toContain('15+'); // 15+ Icons
        expect(statTexts.join(' ')).toContain('100%'); // 100% MD3
    });

    test('Sidebar navigation renders correctly', async ({ page }) => {
        // Check sidebar exists
        const sidebar = await page.locator('.sidebar-container');
        await expect(sidebar).toBeVisible();

        // Check sidebar title
        const sidebarTitle = await sidebar.locator('text=SSI Builders').first();
        await expect(sidebarTitle).toBeVisible();

        // Check main navigation items exist
        await expect(sidebar.locator('text=Overview')).toBeVisible();
        await expect(sidebar.locator('text=Getting Started')).toBeVisible();
        await expect(sidebar.locator('text=All Builders')).toBeVisible();
        await expect(sidebar.locator('text=Icon System')).toBeVisible();
    });

    test('Tabs navigation works', async ({ page }) => {
        // Check tabs exist
        const tabs = await page.locator('[role="tab"]');
        await expect(tabs).toHaveCount(3);

        // Check tab labels
        await expect(page.locator('[role="tab"]', { hasText: 'Overview' })).toBeVisible();
        await expect(page.locator('[role="tab"]', { hasText: 'Getting Started' })).toBeVisible();
        await expect(page.locator('[role="tab"]', { hasText: 'All Builders' })).toBeVisible();

        // Click "Getting Started" tab
        await page.locator('[role="tab"]', { hasText: 'Getting Started' }).click();
        await page.waitForTimeout(500); // Wait for tab transition

        // Check if content changed
        await expect(page.locator('text=Quick Start')).toBeVisible();
        await expect(page.locator('text=Als Git Submodule einbinden')).toBeVisible();
    });

    test('Builders grid loads when clicking "All Builders" tab', async ({ page }) => {
        // Click "All Builders" tab
        await page.locator('[role="tab"]', { hasText: 'All Builders' }).click();
        await page.waitForTimeout(1000); // Wait for ListBuilder to initialize

        // Check if ListBuilder grid appeared
        const listContainer = await page.locator('#buildersGrid .ssi-list-container');
        await expect(listContainer).toBeVisible();

        // Check if builder cards are visible
        const builderRows = await page.locator('#buildersGrid tbody tr');
        await expect(builderRows).toHaveCount(7); // 7 builders

        // Check specific builders
        await expect(page.locator('text=ListBuilder')).toBeVisible();
        await expect(page.locator('text=FormBuilder')).toBeVisible();
        await expect(page.locator('text=ModalBuilder')).toBeVisible();
    });

    test('Sidebar "All Builders" section has nested items', async ({ page }) => {
        // Click to expand "All Builders" section in sidebar
        const buildersSection = await page.locator('.sidebar-container').locator('text=All Builders').first();
        await buildersSection.click();
        await page.waitForTimeout(300);

        // Check if nested items are visible
        await expect(page.locator('.sidebar-container').locator('text=ListBuilder')).toBeVisible();
        await expect(page.locator('.sidebar-container').locator('text=FormBuilder')).toBeVisible();
        await expect(page.locator('.sidebar-container').locator('text=ModalBuilder')).toBeVisible();
    });

    test('Icon System section in sidebar works', async ({ page }) => {
        // Click to expand "Icon System" section
        const iconSection = await page.locator('.sidebar-container').locator('text=Icon System').first();
        await iconSection.click();
        await page.waitForTimeout(300);

        // Check nested items
        await expect(page.locator('.sidebar-container').locator('text=Documentation')).toBeVisible();
        await expect(page.locator('.sidebar-container').locator('text=Weight Demo')).toBeVisible();
    });

    test('Resources section in sidebar opens external links', async ({ page }) => {
        // Click to expand "Resources" section
        const resourcesSection = await page.locator('.sidebar-container').locator('text=Resources').first();
        await resourcesSection.click();
        await page.waitForTimeout(300);

        // Check nested items exist
        await expect(page.locator('.sidebar-container').locator('text=README.md')).toBeVisible();
        await expect(page.locator('.sidebar-container').locator('text=CHANGELOG.md')).toBeVisible();
        await expect(page.locator('.sidebar-container').locator('text=GitHub')).toBeVisible();
    });

    test('No console errors on page load', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for all JS to execute

        // Check for critical errors (ignore minor warnings)
        const criticalErrors = errors.filter(err =>
            !err.includes('favicon') && // Ignore favicon errors
            !err.includes('manifest') && // Ignore manifest errors
            !err.includes('sw.js') // Ignore service worker errors
        );

        expect(criticalErrors.length).toBe(0);
    });

    test('Footer is present', async ({ page }) => {
        const footer = await page.locator('.footer');
        await expect(footer).toBeVisible();

        const footerText = await footer.textContent();
        expect(footerText).toContain('SSI Solutions');
        expect(footerText).toContain('2025');
        expect(footerText).toContain('Version 1.2.0');
    });

    test('Responsive layout works on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 812 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Sidebar should still be visible (but might be stacked differently)
        const sidebar = await page.locator('.sidebar-container');
        await expect(sidebar).toBeVisible();

        // Hero should still be visible
        const hero = await page.locator('.hero h1');
        await expect(hero).toBeVisible();

        // Stats grid should adapt
        const stats = await page.locator('.stat-card');
        await expect(stats).toHaveCount(4);
    });
});
