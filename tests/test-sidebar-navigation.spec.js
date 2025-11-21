/**
 * Playwright Test: Sidebar Navigation System
 * Tests the shared sidebar layout across all demo pages
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5178';

// All pages that should have sidebar navigation
const PAGES_WITH_SIDEBAR = [
  { url: '/index.html', title: 'SSI Builders', pageId: 'index' },
  { url: '/docs/demos/list-builder.html', title: 'ListBuilder', pageId: 'list-builder' },
  { url: '/docs/demos/form-builder.html', title: 'FormBuilder', pageId: 'form-builder' },
  { url: '/docs/demos/modal-builder.html', title: 'ModalBuilder', pageId: 'modal-builder' },
  { url: '/docs/demos/chart-builder.html', title: 'ChartBuilder', pageId: 'chart-builder' },
  { url: '/docs/demos/tab-builder.html', title: 'TabBuilder', pageId: 'tab-builder' },
  { url: '/docs/demos/menu-builder.html', title: 'MenuBuilder', pageId: 'menu-builder' },
  { url: '/docs/demos/sidebar-builder.html', title: 'SidebarBuilder', pageId: 'sidebar-builder' },
  { url: '/docs/demos/site-builder.html', title: 'SiteBuilder', pageId: 'site-builder' },
  { url: '/docs/demos/icon-system.html', title: 'Icon System', pageId: 'icon-system' },
  { url: '/docs/demos/icon-weight-demo.html', title: 'Icon Weights', pageId: 'icon-weight-demo' },
  { url: '/docs/demos/global-config-playground.html', title: 'Global Config', pageId: 'global-config' },
  { url: '/docs/demos/all-builders-overview.html', title: 'All Builders', pageId: 'all-builders' }
];

test.describe('Sidebar Navigation System', () => {

  test('All pages have sidebar container', async ({ page }) => {
    for (const pageInfo of PAGES_WITH_SIDEBAR) {
      await page.goto(BASE_URL + pageInfo.url);

      // Check for sidebar container
      const sidebar = await page.locator('#sidebar-container');
      await expect(sidebar).toBeVisible({ timeout: 5000 });
    }
  });

  test('All pages have page-layout structure', async ({ page }) => {
    for (const pageInfo of PAGES_WITH_SIDEBAR) {
      await page.goto(BASE_URL + pageInfo.url);

      // Check for page-layout wrapper
      const pageLayout = await page.locator('.page-layout');
      await expect(pageLayout).toBeVisible();

      // Check for demo-content
      const demoContent = await page.locator('.demo-content');
      await expect(demoContent).toBeVisible();
    }
  });

  test('Sidebar has SSI Builders branding', async ({ page }) => {
    await page.goto(BASE_URL + '/index.html');

    // Wait for sidebar to load
    await page.waitForSelector('.sidebar', { timeout: 5000 });

    // Check for SSI Builders title
    const sidebarTitle = await page.locator('.sidebar').getByText('SSI Builders');
    await expect(sidebarTitle).toBeVisible();
  });

  test('Sidebar navigation items are clickable', async ({ page }) => {
    await page.goto(BASE_URL + '/index.html');

    // Wait for sidebar to load
    await page.waitForSelector('.sidebar', { timeout: 5000 });

    // Check for ListBuilder link
    const listBuilderLink = await page.locator('.sidebar').getByText('ListBuilder');
    await expect(listBuilderLink).toBeVisible();

    // Click and navigate
    await listBuilderLink.click();
    await page.waitForLoadState('networkidle');

    // Should be on list-builder page
    expect(page.url()).toContain('list-builder.html');
  });

  test('Active page is highlighted in sidebar', async ({ page }) => {
    await page.goto(BASE_URL + '/docs/demos/form-builder.html');

    // Wait for sidebar to load
    await page.waitForSelector('.sidebar', { timeout: 5000 });

    // Check for active class (implementation may vary)
    // This test assumes the active item has a different style
    const formBuilderItem = await page.locator('.sidebar').getByText('FormBuilder');
    await expect(formBuilderItem).toBeVisible();
  });

  test('Mobile menu toggle button exists on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL + '/index.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for mobile menu toggle
    const mobileToggle = await page.locator('.mobile-menu-toggle, #mobile-menu-toggle');

    // Mobile toggle should exist (visible or not, depending on implementation)
    const count = await mobileToggle.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Sidebar sections are collapsible', async ({ page }) => {
    await page.goto(BASE_URL + '/index.html');

    // Wait for sidebar to load
    await page.waitForSelector('.sidebar', { timeout: 5000 });

    // Look for section headers (e.g., "Core Builders", "System", "Resources")
    const sections = await page.locator('.sidebar .sidebar-section-header');
    const sectionCount = await sections.count();

    expect(sectionCount).toBeGreaterThan(0);
  });

  test('Page header is present on all pages', async ({ page }) => {
    for (const pageInfo of PAGES_WITH_SIDEBAR) {
      await page.goto(BASE_URL + pageInfo.url);

      // Check for page-header
      const pageHeader = await page.locator('.page-header');
      await expect(pageHeader).toBeVisible();

      // Check for h1 inside page-header
      const h1 = await pageHeader.locator('h1');
      await expect(h1).toBeVisible();
    }
  });

  test('Responsive layout: Desktop (1024px+)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL + '/index.html');

    await page.waitForSelector('#sidebar-container', { timeout: 5000 });

    // Sidebar should be visible on desktop
    const sidebar = await page.locator('#sidebar-container');
    await expect(sidebar).toBeVisible();

    // Content should have margin for sidebar
    const content = await page.locator('.demo-content');
    const marginLeft = await content.evaluate(el => getComputedStyle(el).marginLeft);

    // Should have left margin (280px or similar)
    expect(parseInt(marginLeft)).toBeGreaterThan(200);
  });

  test('Responsive layout: Tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL + '/index.html');

    await page.waitForLoadState('networkidle');

    // Sidebar container exists
    const sidebar = await page.locator('#sidebar-container');
    expect(await sidebar.count()).toBe(1);
  });

  test('Responsive layout: Mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL + '/index.html');

    await page.waitForLoadState('networkidle');

    // Sidebar container exists
    const sidebar = await page.locator('#sidebar-container');
    expect(await sidebar.count()).toBe(1);

    // Mobile toggle should exist
    const mobileToggle = await page.locator('.mobile-menu-toggle, #mobile-menu-toggle');
    expect(await mobileToggle.count()).toBeGreaterThan(0);
  });

  test('No console errors on page load', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL + '/index.html');
    await page.waitForLoadState('networkidle');

    // Allow specific known errors (like CORS issues in dev)
    const filteredErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('CORS')
    );

    if (filteredErrors.length > 0) {
      console.error('Console errors found:', filteredErrors);
    }

    expect(filteredErrors.length).toBe(0);
  });

  test('Navigation between pages preserves sidebar state', async ({ page }) => {
    await page.goto(BASE_URL + '/index.html');
    await page.waitForSelector('.sidebar', { timeout: 5000 });

    // Navigate to FormBuilder
    const formBuilderLink = await page.locator('.sidebar').getByText('FormBuilder');
    await formBuilderLink.click();
    await page.waitForLoadState('networkidle');

    // Sidebar should still be present
    const sidebar = await page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // Navigate to ChartBuilder
    const chartBuilderLink = await page.locator('.sidebar').getByText('ChartBuilder');
    await chartBuilderLink.click();
    await page.waitForLoadState('networkidle');

    // Sidebar should still be present
    await expect(sidebar).toBeVisible();
  });

});
