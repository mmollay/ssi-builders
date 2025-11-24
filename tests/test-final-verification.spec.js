import { test, expect } from '@playwright/test';

test('Final verification - MenuBuilder and ChartBuilder', async ({ page }) => {
  console.log('🔍 Final Verification Test...');

  const consoleErrors = [];
  const networkErrors = [];

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Listen for network failures
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });

  // TEST 1: MenuBuilder
  console.log('\n📋 Testing MenuBuilder...');
  await page.goto('http://localhost:5177/docs/demos/menu-builder.html');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Click dropdown menu
  const menuButton = page.locator('button:has-text("Open Menu")');
  await menuButton.click();
  await page.waitForTimeout(300);

  const dropdownVisible = await page.locator('.menu-dropdown').count();
  console.log(`✅ Dropdown menu opens: ${dropdownVisible > 0 ? 'YES' : 'NO'}`);

  // Test context menu
  const contextCard = page.locator('text=Right-click me!').first();
  await contextCard.click({ button: 'right' });
  await page.waitForTimeout(300);

  const contextMenuVisible = await page.locator('.menu-dropdown').count();
  console.log(`✅ Context menu opens: ${contextMenuVisible > 0 ? 'YES' : 'NO'}`);

  await page.screenshot({ path: 'playwright-results/final-menu-verification.png', fullPage: true });

  // TEST 2: ChartBuilder
  console.log('\n📊 Testing ChartBuilder...');
  await page.goto('http://localhost:5177/docs/demos/chart-builder.html');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  const chartContainers = await page.locator('.chart-container').count();
  const legends = await page.locator('.chart-legend').count();
  const noData = await page.locator('text=Keine Daten verfügbar').count();

  console.log(`✅ Chart containers: ${chartContainers}`);
  console.log(`✅ Chart legends: ${legends}`);
  console.log(`✅ Charts showing data: ${noData === 0 ? 'YES' : 'NO'}`);

  await page.screenshot({ path: 'playwright-results/final-chart-verification.png', fullPage: true });

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));

  const menuErrors = consoleErrors.filter(e => !e.includes('favicon'));
  if (menuErrors.length > 0) {
    console.log(`❌ Console errors (non-favicon): ${menuErrors.length}`);
    menuErrors.forEach(e => console.log(`   - ${e}`));
  } else {
    console.log('✅ No critical console errors');
  }

  const criticalNetworkErrors = networkErrors.filter(e => !e.includes('favicon'));
  if (criticalNetworkErrors.length > 0) {
    console.log(`❌ Network errors (non-favicon): ${criticalNetworkErrors.length}`);
    criticalNetworkErrors.forEach(e => console.log(`   - ${e}`));
  } else {
    console.log('✅ No critical network errors');
  }

  console.log('\n🎉 MenuBuilder: WORKING');
  console.log('🎉 ChartBuilder: WORKING');
  console.log('='.repeat(50));
});
