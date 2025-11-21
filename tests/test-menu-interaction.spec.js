import { test, expect } from '@playwright/test';

test('Test menu-builder interactions', async ({ page }) => {
  console.log('🔍 Testing menu-builder interactions...');

  // Listen for all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error(`❌ Console error: ${text}`);
    } else if (type === 'warning') {
      console.warn(`⚠️  Console warning: ${text}`);
    } else {
      console.log(`ℹ️  Console: ${text}`);
    }
  });

  // Navigate to menu-builder
  await page.goto('http://localhost:5178/docs/demos/menu-builder.html');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  console.log('Page loaded successfully');

  // Take initial screenshot
  await page.screenshot({ path: 'playwright-results/menu-before-click.png', fullPage: true });

  // Find all buttons/triggers on the page
  const buttons = await page.locator('button').count();
  console.log(`Found ${buttons} buttons on page`);

  // Try to find menu triggers
  const menuTriggers = await page.locator('[data-menu-trigger], .menu-trigger, button:has-text("Menu")').count();
  console.log(`Found ${menuTriggers} menu triggers`);

  // List all buttons
  const allButtons = await page.locator('button').all();
  for (let i = 0; i < allButtons.length; i++) {
    const text = await allButtons[i].textContent();
    const classes = await allButtons[i].getAttribute('class');
    console.log(`Button ${i + 1}: "${text}" (class: ${classes})`);
  }

  // Try clicking the first button
  if (buttons > 0) {
    console.log('Clicking first button...');
    const firstButton = page.locator('button').first();
    await firstButton.click();
    await page.waitForTimeout(1000);

    // Check if menu appeared
    const menu = await page.locator('.menu, .dropdown-menu, [role="menu"]').count();
    console.log(`Menus visible after click: ${menu}`);

    // Take screenshot after click
    await page.screenshot({ path: 'playwright-results/menu-after-click.png', fullPage: true });
  }

  console.log('✅ Test completed');
});
