import { test, expect } from '@playwright/test';

test('ModalBuilder.form() should display values and use M3 styling', async ({ page }) => {
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    await page.goto('http://localhost:5177/test-modal-form-bug.html');
    await page.waitForTimeout(1000);

    // Click test button
    await page.click('#testBtn');
    await page.waitForTimeout(2000);

    // Check if modal is visible
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();
    console.log('✅ Modal is visible');

    // Check for M3 filled inputs
    const filledInputs = page.locator('.form-field-filled');
    const count = await filledInputs.count();
    console.log(`M3 Filled Inputs found: ${count}`);

    // Also check for field layout class
    const formFields = page.locator('.form-field');
    const totalFields = await formFields.count();
    console.log(`Total form fields: ${totalFields}`);

    // Check if Name field has value
    const nameInput = page.locator('input[name="name"]');
    const nameValue = await nameInput.inputValue();
    console.log(`Name input value: "${nameValue}"`);

    // Take screenshot
    await page.screenshot({ path: 'modal-form-bug-test.png', fullPage: true });
    console.log('📸 Screenshot saved');

    // Print relevant console logs
    console.log('\n=== Console Logs ===');
    consoleLogs.forEach(log => console.log(log));

    // Assertions
    expect(count).toBeGreaterThan(0); // Should have M3 inputs
    expect(nameValue).toBe('Test Name'); // Should have the value
});
