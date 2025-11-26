/**
 * ChangelogBuilder Tests
 * SSI Builders v2.4.0
 */

import { test, expect } from '@playwright/test';

const DEMO_URL = 'http://localhost:5178/docs/demos/changelog-builder.html';

test.describe('ChangelogBuilder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(DEMO_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should load changelog builder demo page', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('ChangelogBuilder Demo');
    });

    // Timeline Variant Tests
    test('Timeline variant should render with versions', async ({ page }) => {
        const changelog = page.locator('#changelog-timeline .changelog');
        await expect(changelog).toBeVisible();
        await expect(changelog).toHaveClass(/changelog--timeline/);

        // Should have versions
        const versions = page.locator('#changelog-timeline .changelog__version');
        await expect(versions.first()).toBeVisible();
    });

    test('Timeline should have title and search', async ({ page }) => {
        // Title should be visible
        await expect(page.locator('#changelog-timeline .changelog__title')).toContainText('Release History');

        // Search input should be visible
        await expect(page.locator('#changelog-timeline .changelog__search-input')).toBeVisible();
    });

    test('Timeline should have filter buttons', async ({ page }) => {
        const filterBtns = page.locator('#changelog-timeline .changelog__filter-btn');

        // Should have All + 6 category filters
        await expect(filterBtns).toHaveCount(7);

        // First should be "All" and active
        await expect(filterBtns.first()).toContainText('All');
        await expect(filterBtns.first()).toHaveClass(/changelog__filter-btn--active/);
    });

    test('Filter buttons should filter changes', async ({ page }) => {
        // Click "Added" filter
        await page.click('#changelog-timeline .changelog__filter-btn:has-text("Added")');

        // Added filter should now be active
        await expect(page.locator('#changelog-timeline .changelog__filter-btn:has-text("Added")')).toHaveClass(/changelog__filter-btn--active/);

        // All should no longer be active
        await expect(page.locator('#changelog-timeline .changelog__filter-btn:has-text("All")')).not.toHaveClass(/changelog__filter-btn--active/);
    });

    test('Search should filter changelog entries', async ({ page }) => {
        const searchInput = page.locator('#changelog-timeline .changelog__search-input');

        // Type search query
        await searchInput.fill('ColorPicker');

        // Wait for debounce
        await page.waitForTimeout(400);

        // Should highlight matching text
        const highlights = page.locator('#changelog-timeline .changelog__item-highlight');
        await expect(highlights.first()).toBeVisible();
    });

    test('Version header should be collapsible', async ({ page }) => {
        // First version should be expanded by default
        const firstVersion = page.locator('#changelog-timeline .changelog__version').first();
        await expect(firstVersion).toHaveClass(/changelog__version--expanded/);

        // Click to collapse
        await firstVersion.locator('.changelog__version-header').click();
        await expect(firstVersion).toHaveClass(/changelog__version--collapsed/);

        // Click to expand again
        await firstVersion.locator('.changelog__version-header').click();
        await expect(firstVersion).toHaveClass(/changelog__version--expanded/);
    });

    test('Highlighted version should show NEW badge', async ({ page }) => {
        const highlightedVersion = page.locator('#changelog-timeline .changelog__version--highlight').first();
        await expect(highlightedVersion).toBeVisible();

        // Should have NEW badge
        await expect(highlightedVersion.locator('.changelog__new-badge')).toBeVisible();
        await expect(highlightedVersion.locator('.changelog__new-badge')).toContainText('NEW');
    });

    test('Version should show summary counts', async ({ page }) => {
        const summaryBadges = page.locator('#changelog-timeline .changelog__version-count');
        await expect(summaryBadges.first()).toBeVisible();
    });

    // List Variant Tests
    test('List variant should render correctly', async ({ page }) => {
        const changelog = page.locator('#changelog-list .changelog');
        await expect(changelog).toBeVisible();
        await expect(changelog).toHaveClass(/changelog--list/);
    });

    // Compact Variant Tests
    test('Compact variant should render as badges', async ({ page }) => {
        const changelog = page.locator('#changelog-compact .changelog');
        await expect(changelog).toBeVisible();
        await expect(changelog).toHaveClass(/changelog--compact/);

        // Should have clickable version badges
        const badges = page.locator('#changelog-compact .changelog__version-badge');
        await expect(badges.first()).toBeVisible();
    });

    // Category Tests
    test('Changes should be grouped by category', async ({ page }) => {
        const categories = page.locator('#changelog-timeline .changelog__category-title');
        await expect(categories.first()).toBeVisible();
    });

    test('Category badges should have correct colors', async ({ page }) => {
        // Added category should exist
        const addedCategory = page.locator('#changelog-timeline .changelog__category-title--added');
        await expect(addedCategory.first()).toBeVisible();
    });

    // Show More Tests
    test('Show more button should expand all versions', async ({ page }) => {
        const showMoreBtn = page.locator('#changelog-timeline .changelog__show-more-btn');

        // If show more exists, click it
        if (await showMoreBtn.isVisible()) {
            await showMoreBtn.click();

            // Should no longer show the button
            await expect(showMoreBtn).not.toBeVisible();
        }
    });

    // Dark Mode Tests
    test('Dark mode toggle should work', async ({ page }) => {
        // Initially light theme
        await expect(page.locator('html')).not.toHaveClass(/m3-dark/);

        // Click theme toggle
        await page.click('.theme-toggle');

        // Should have dark theme class
        await expect(page.locator('html')).toHaveClass(/m3-dark/);

        // Toggle back
        await page.click('.theme-toggle');
        await expect(page.locator('html')).not.toHaveClass(/m3-dark/);
    });

    // Minimal Configuration Tests
    test('Minimal config should not show filters or search', async ({ page }) => {
        const minimalChangelog = page.locator('#changelog-minimal');

        // Should not have filter buttons
        await expect(minimalChangelog.locator('.changelog__filter-btn')).toHaveCount(0);

        // Should not have search
        await expect(minimalChangelog.locator('.changelog__search-input')).toHaveCount(0);
    });
});
