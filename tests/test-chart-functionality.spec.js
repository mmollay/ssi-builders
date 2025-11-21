import { test, expect } from '@playwright/test';

test('Test ChartBuilder functionality', async ({ page }) => {

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

  // Take initial screenshot
  await page.screenshot({ path: 'playwright-results/chart-initial.png', fullPage: true });

  // Check for page-header
  const pageHeader = page.locator('.page-header');
  const headerExists = await pageHeader.count();

  // Check for sidebar
  const sidebar = page.locator('#sidebar-container');
  const sidebarExists = await sidebar.count();

  // Check for chart containers
  const chartContainers = await page.locator('.chart-container').count();

  // Check for canvas elements (actual charts)
  const canvasElements = await page.locator('canvas').count();

  // Check for chart legends
  const legends = await page.locator('.chart-legend').count();

  // Check if charts have content (not "Keine Daten verfügbar")
  const noDataMessages = await page.locator('text=Keine Daten verfügbar').count();
  expect(noDataMessages).toBe(0);

  // Check specific chart examples
  const barChartSection = page.locator('text=1. Bar Chart').first();
  const barChartExists = await barChartSection.count();

  const lineChartSection = page.locator('text=2. Line Chart').first();
  const lineChartExists = await lineChartSection.count();

  const pieChartSection = page.locator('text=3. Pie Chart').first();
  const pieChartExists = await pieChartSection.count();

  const donutChartSection = page.locator('text=4. Donut Chart').first();
  const donutChartExists = await donutChartSection.count();

  // Take final screenshot
  await page.screenshot({ path: 'playwright-results/chart-all-charts.png', fullPage: true });

  // Verify no console errors
  expect(consoleErrors.length).toBe(0);
});
