import { test, expect } from '@playwright/test';

test('Quick sidebar test', async ({ page }) => {
  console.log('🔍 Testing sidebar on index.html...');

  // Navigate to index page
  await page.goto('http://localhost:5177/index.html');

  // Wait for page to load
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Take screenshot
  await page.screenshot({ path: 'playwright-results/sidebar-test.png', fullPage: true });
  console.log('📸 Screenshot saved to playwright-results/sidebar-test.png');

  // Check if sidebar container exists
  const sidebar = page.locator('#sidebar-container');
  const sidebarExists = await sidebar.count();
  console.log(`Sidebar container count: ${sidebarExists}`);

  if (sidebarExists === 0) {
    console.error('❌ FEHLER: Sidebar container nicht gefunden!');
    throw new Error('Sidebar container not found');
  }

  // Check if sidebar is visible
  const isVisible = await sidebar.isVisible();
  console.log(`Sidebar visible: ${isVisible}`);

  if (!isVisible) {
    console.error('❌ FEHLER: Sidebar ist nicht sichtbar!');
    throw new Error('Sidebar not visible');
  }

  // Get sidebar content
  const sidebarText = await sidebar.textContent();
  console.log('Sidebar content length:', sidebarText.length);
  console.log('Sidebar contains "ListBuilder":', sidebarText.includes('ListBuilder'));
  console.log('Sidebar contains "FormBuilder":', sidebarText.includes('FormBuilder'));

  // Check for specific navigation items
  const listBuilder = page.locator('text=ListBuilder');
  const listBuilderCount = await listBuilder.count();
  console.log(`ListBuilder links found: ${listBuilderCount}`);

  // Check for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  if (consoleErrors.length > 0) {
    console.log('⚠️ Console errors:', consoleErrors);
  } else {
    console.log('✅ No console errors');
  }

  console.log('✅ Sidebar test completed successfully!');
});
