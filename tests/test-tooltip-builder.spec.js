import { test, expect } from '@playwright/test';

test.describe('TooltipBuilder', () => {
  test('should update position on scroll', async ({ page }) => {
    // Navigate to the demo page
    await page.goto('http://localhost:5177/docs/demos/tooltip-builder.html');

    // Find the target button for the top tooltip
    const targetButton = page.locator('#tooltip-top');
    await expect(targetButton).toBeVisible();

    // Hover over the button to show the tooltip
    await targetButton.hover();

    // Wait for the show delay
    await page.waitForTimeout(300);

    // Get the tooltip ID from the target's aria-describedby attribute
    const tooltipId = await targetButton.getAttribute('aria-describedby');
    expect(tooltipId).not.toBeNull();

    // Get the tooltip element using its specific ID
    const tooltip = page.locator(`#${tooltipId}`);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText('Dies ist ein Top Tooltip');

    // Get the initial position
    const initialBox = await tooltip.boundingBox();
    expect(initialBox).not.toBeNull();

    // Scroll the page down
    await page.evaluate(() => window.scrollBy(0, 200));

    // Wait for the scroll to be processed and position to be updated
    await page.waitForTimeout(100);

    // Get the new position
    const newBox = await tooltip.boundingBox();
    expect(newBox).not.toBeNull();

    // Assert that the tooltip has moved (its top position should have changed significantly)
    expect(newBox.y).not.toBeCloseTo(initialBox.y, 1); // Use a small delta
    
    // Also check that it's still in the correct relative position to the button
    const targetBox = await targetButton.boundingBox();
    expect(newBox.y).toBeLessThan(targetBox.y);
  });
});