import { test, expect } from '@playwright/test';

test('Test menu-builder page', async ({ page }) => {

  // Listen for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('❌ Console error:', msg.text());
    }
  });

  // Navigate to menu-builder
  await page.goto('http://localhost:5178/docs/demos/menu-builder.html');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Take screenshot
  await page.screenshot({ path: 'playwright-results/menu-builder-page.png', fullPage: true });

  // Check for page-header
  const pageHeader = page.locator('.page-header');
  const headerExists = await pageHeader.count();

  // Check for sidebar
  const sidebar = page.locator('#sidebar-container');
  const sidebarExists = await sidebar.count();

  // Verify no console errors
  expect(consoleErrors.length).toBe(0);
});
