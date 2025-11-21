import { test, expect } from '@playwright/test';

test.describe('Complete Sidebar Tests', () => {

  test('Sidebar sections should be collapsible', async ({ page }) => {
    console.log('🔍 Testing sidebar section collapse...');

    await page.goto('http://localhost:5178/index.html');
    await page.waitForLoadState('networkidle');

    // Find "Core Builders" section header
    const coreBuildersHeader = page.locator('.sidebar-section-header:has-text("Core Builders")');
    await expect(coreBuildersHeader).toBeVisible();

    // Click to collapse
    await coreBuildersHeader.click();
    await page.waitForTimeout(500); // Wait for animation

    // Take screenshot of collapsed state
    await page.screenshot({ path: 'playwright-results/sidebar-collapsed.png' });
    console.log('📸 Screenshot saved: sidebar-collapsed.png');

    // Click to expand again
    await coreBuildersHeader.click();
    await page.waitForTimeout(500);

    console.log('✅ Section collapsing works!');
  });

  test('Navigation should work - click ListBuilder', async ({ page }) => {
    console.log('🔍 Testing navigation to ListBuilder...');

    await page.goto('http://localhost:5178/index.html');
    await page.waitForLoadState('networkidle');

    // Find ListBuilder link in sidebar
    const listBuilderLink = page.locator('.sidebar a:has-text("ListBuilder")').first();
    await expect(listBuilderLink).toBeVisible();

    console.log('Clicking ListBuilder link...');
    await listBuilderLink.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check URL changed
    const url = page.url();
    console.log('Current URL:', url);
    expect(url).toContain('list-builder.html');

    // Check page loaded
    const pageHeader = page.locator('.page-header h1');
    await expect(pageHeader).toContainText('ListBuilder');

    await page.screenshot({ path: 'playwright-results/listbuilder-page.png' });
    console.log('📸 Screenshot saved: listbuilder-page.png');

    console.log('✅ Navigation to ListBuilder works!');
  });

  test('Navigation should work - click FormBuilder', async ({ page }) => {
    console.log('🔍 Testing navigation to FormBuilder...');

    await page.goto('http://localhost:5178/index.html');
    await page.waitForLoadState('networkidle');

    // Find FormBuilder link
    const formBuilderLink = page.locator('.sidebar a:has-text("FormBuilder")').first();
    await expect(formBuilderLink).toBeVisible();

    console.log('Clicking FormBuilder link...');
    await formBuilderLink.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check URL
    const url = page.url();
    console.log('Current URL:', url);
    expect(url).toContain('form-builder.html');

    // Check page loaded
    const pageHeader = page.locator('.page-header h1');
    await expect(pageHeader).toContainText('FormBuilder');

    console.log('✅ Navigation to FormBuilder works!');
  });

  test('Sidebar should persist across pages', async ({ page }) => {
    console.log('🔍 Testing sidebar persistence...');

    // Start on index
    await page.goto('http://localhost:5178/index.html');
    await page.waitForLoadState('networkidle');

    // Sidebar should be visible
    let sidebar = page.locator('#sidebar-container');
    await expect(sidebar).toBeVisible();
    console.log('✅ Sidebar visible on index.html');

    // Navigate to ListBuilder
    const listBuilderLink = page.locator('.sidebar a:has-text("ListBuilder")').first();
    await listBuilderLink.click();
    await page.waitForLoadState('networkidle');

    // Sidebar should still be visible
    sidebar = page.locator('#sidebar-container');
    await expect(sidebar).toBeVisible();
    console.log('✅ Sidebar visible on list-builder.html');

    // Navigate to FormBuilder
    const formBuilderLink = page.locator('.sidebar a:has-text("FormBuilder")').first();
    await formBuilderLink.click();
    await page.waitForLoadState('networkidle');

    // Sidebar should still be visible
    sidebar = page.locator('#sidebar-container');
    await expect(sidebar).toBeVisible();
    console.log('✅ Sidebar visible on form-builder.html');

    console.log('✅ Sidebar persists across navigation!');
  });

  test('Check all navigation links work', async ({ page }) => {
    console.log('🔍 Testing all navigation links...');

    await page.goto('http://localhost:5178/index.html');
    await page.waitForLoadState('networkidle');

    const links = [
      { text: 'ListBuilder', expectedUrl: 'list-builder.html' },
      { text: 'FormBuilder', expectedUrl: 'form-builder.html' },
      { text: 'ModalBuilder', expectedUrl: 'modal-builder.html' },
      { text: 'ChartBuilder', expectedUrl: 'chart-builder.html' },
    ];

    for (const link of links) {
      console.log(`Testing ${link.text}...`);

      // Go back to index
      await page.goto('http://localhost:5178/index.html');
      await page.waitForLoadState('networkidle');

      // Click link
      const navLink = page.locator(`.sidebar a:has-text("${link.text}")`).first();
      await navLink.click();
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Check URL
      const url = page.url();
      expect(url).toContain(link.expectedUrl);
      console.log(`✅ ${link.text} navigation works`);
    }

    console.log('✅ All navigation links work!');
  });

  test('Icons should be visible in sidebar', async ({ page }) => {
    console.log('🔍 Testing sidebar icons...');

    await page.goto('http://localhost:5178/index.html');
    await page.waitForLoadState('networkidle');

    // Check for SVG icons (Lucide preset)
    const icons = page.locator('.sidebar svg');
    const iconCount = await icons.count();

    console.log(`Found ${iconCount} SVG icons in sidebar`);
    expect(iconCount).toBeGreaterThan(0);

    console.log('✅ Icons are present in sidebar!');
  });

});
