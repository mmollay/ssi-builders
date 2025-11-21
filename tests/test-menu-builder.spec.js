import { test, expect } from '@playwright/test';

test('Test menu-builder page', async ({ page }) => {
  console.log('🔍 Testing menu-builder.html...');

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
  console.log('📸 Screenshot saved');

  // Check for page-header
  const pageHeader = page.locator('.page-header');
  const headerExists = await pageHeader.count();
  console.log(`Page header exists: ${headerExists > 0}`);

  // Check for sidebar
  const sidebar = page.locator('#sidebar-container');
  const sidebarExists = await sidebar.count();
  console.log(`Sidebar exists: ${sidebarExists > 0}`);

  // Print console errors
  if (consoleErrors.length > 0) {
    console.log(`\n❌ Found ${consoleErrors.length} console errors:`);
    consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  } else {
    console.log('✅ No console errors!');
  }
});
