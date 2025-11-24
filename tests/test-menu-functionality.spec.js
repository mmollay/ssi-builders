import { test, expect } from '@playwright/test';

test('Test MenuBuilder functionality', async ({ page }) => {
  console.log('🔍 Testing MenuBuilder functionality...');

  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error(`❌ Console error: ${text}`);
    } else if (type === 'warning') {
      console.warn(`⚠️  Console warning: ${text}`);
    }
  });

  // Navigate to menu-builder
  await page.goto('http://localhost:5177/docs/demos/menu-builder.html');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  console.log('✅ Page loaded successfully');

  // Take initial screenshot
  await page.screenshot({ path: 'playwright-results/menu-initial.png', fullPage: true });

  // Find the "Open Menu" button (not the sidebar toggle)
  const menuButton = page.locator('button:has-text("Open Menu")');
  const menuButtonExists = await menuButton.count();
  console.log(`Menu button exists: ${menuButtonExists > 0}`);

  if (menuButtonExists > 0) {
    console.log('📌 Clicking "Open Menu" button...');
    await menuButton.click();
    await page.waitForTimeout(500);

    // Check if dropdown menu appeared
    const dropdown = page.locator('.menu-dropdown, .menu-container');
    const dropdownVisible = await dropdown.count();
    console.log(`Dropdown visible after click: ${dropdownVisible > 0}`);

    // Take screenshot after click
    await page.screenshot({ path: 'playwright-results/menu-dropdown-open.png', fullPage: true });

    if (dropdownVisible > 0) {
      console.log('✅ Menu opened successfully!');

      // Check menu items
      const menuItems = await page.locator('.menu-item').count();
      console.log(`Menu items found: ${menuItems}`);
    } else {
      console.log('❌ Menu did not open');
    }
  }

  // Test context menu
  console.log('📌 Testing context menu...');
  const contextCard = page.locator('text=Right-click me!').first();
  const contextCardExists = await contextCard.count();

  if (contextCardExists > 0) {
    await contextCard.click({ button: 'right' });
    await page.waitForTimeout(500);

    const contextMenu = page.locator('.menu-dropdown, .menu-container');
    const contextMenuVisible = await contextMenu.count();
    console.log(`Context menu visible: ${contextMenuVisible > 0}`);

    await page.screenshot({ path: 'playwright-results/menu-context-open.png', fullPage: true });
  }

  console.log('✅ Test completed');
});
