import { test, expect } from '@playwright/test';

test('Test ChartBuilder functionality', async ({ page }) => {
  console.log('🔍 Testing ChartBuilder functionality...');

  // Listen for console messages
  const consoleErrors = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleErrors.push(text);
      console.error(`❌ Console error: ${text}`);
    } else if (type === 'warning') {
      console.warn(`⚠️  Console warning: ${text}`);
    }
  });

  // Navigate to chart-builder
  await page.goto('http://localhost:5178/docs/demos/chart-builder.html');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  console.log('✅ Page loaded successfully');

  // Take initial screenshot
  await page.screenshot({ path: 'playwright-results/chart-initial.png', fullPage: true });

  // Check for page-header
  const pageHeader = page.locator('.page-header');
  const headerExists = await pageHeader.count();
  console.log(`Page header exists: ${headerExists > 0}`);

  // Check for sidebar
  const sidebar = page.locator('#sidebar-container');
  const sidebarExists = await sidebar.count();
  console.log(`Sidebar exists: ${sidebarExists > 0}`);

  // Check for chart containers
  const chartContainers = await page.locator('.chart-container').count();
  console.log(`Chart containers found: ${chartContainers}`);

  // Check for canvas elements (actual charts)
  const canvasElements = await page.locator('canvas').count();
  console.log(`Canvas elements found: ${canvasElements}`);

  // Check for chart legends
  const legends = await page.locator('.chart-legend').count();
  console.log(`Chart legends found: ${legends}`);

  // Check if charts have content (not "Keine Daten verfügbar")
  const noDataMessages = await page.locator('text=Keine Daten verfügbar').count();
  console.log(`"Keine Daten verfügbar" messages: ${noDataMessages}`);

  if (noDataMessages > 0) {
    console.log('❌ Some charts show "Keine Daten verfügbar"');
  } else {
    console.log('✅ All charts have data');
  }

  // Check specific chart examples
  const barChartSection = page.locator('text=1. Bar Chart').first();
  const barChartExists = await barChartSection.count();
  console.log(`Bar Chart section exists: ${barChartExists > 0}`);

  const lineChartSection = page.locator('text=2. Line Chart').first();
  const lineChartExists = await lineChartSection.count();
  console.log(`Line Chart section exists: ${lineChartExists > 0}`);

  const pieChartSection = page.locator('text=3. Pie Chart').first();
  const pieChartExists = await pieChartSection.count();
  console.log(`Pie Chart section exists: ${pieChartExists > 0}`);

  const donutChartSection = page.locator('text=4. Donut Chart').first();
  const donutChartExists = await donutChartSection.count();
  console.log(`Donut Chart section exists: ${donutChartExists > 0}`);

  // Take final screenshot
  await page.screenshot({ path: 'playwright-results/chart-all-charts.png', fullPage: true });

  // Print console errors
  if (consoleErrors.length > 0) {
    console.log(`\n❌ Found ${consoleErrors.length} console errors:`);
    consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  } else {
    console.log('✅ No console errors!');
  }

  console.log('✅ Test completed');
});
