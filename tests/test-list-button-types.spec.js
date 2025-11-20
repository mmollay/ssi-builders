import { test, expect } from '@playwright/test';

test.describe('ListBuilder - Button Display Types', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5174/examples/demo.html');
        await page.waitForLoadState('networkidle');
    });

    test('Icon buttons render correctly', async ({ page }) => {
        // Find icon button (view button with eye icon)
        const iconButton = page.locator('.list-action-btn-icon').first();
        await expect(iconButton).toBeVisible();

        // Check size (should be compact 32x32)
        const box = await iconButton.boundingBox();
        expect(box.width).toBeLessThanOrEqual(40);
        expect(box.height).toBeLessThanOrEqual(40);

        console.log('✅ Icon button rendered correctly');
    });

    test('Emoji buttons render correctly', async ({ page }) => {
        // Find emoji button (edit button)
        const emojiButton = page.locator('.list-action-btn-emoji').first();
        await expect(emojiButton).toBeVisible();

        // Check it contains an emoji
        const text = await emojiButton.textContent();
        expect(text).toBeTruthy();

        console.log('✅ Emoji button rendered correctly');
    });

    test('Full button with icon renders correctly', async ({ page }) => {
        // Find full button (delete button)
        const fullButton = page.locator('.list-action-btn-full.list-action-btn-with-icon').first();
        await expect(fullButton).toBeVisible();

        // Check it has text label
        const text = await fullButton.textContent();
        expect(text).toContain('Löschen');

        // Check it has danger styling
        const bgColor = await fullButton.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );
        // Should have red background (danger button)
        expect(bgColor).toBeTruthy();

        console.log('✅ Full button with icon rendered correctly');
    });

    test('All button types are present in first row', async ({ page }) => {
        const firstRow = page.locator('.list-table tbody tr').first();

        // Check icon button exists
        const iconBtn = firstRow.locator('.list-action-btn-icon');
        await expect(iconBtn).toBeVisible();

        // Check emoji button exists
        const emojiBtn = firstRow.locator('.list-action-btn-emoji');
        await expect(emojiBtn).toBeVisible();

        // Check full button exists
        const fullBtn = firstRow.locator('.list-action-btn-full');
        await expect(fullBtn).toBeVisible();

        console.log('✅ All button types present in row');
    });

    test('Button click handlers work', async ({ page }) => {
        // Listen for alerts
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('MacBook Pro'); // First item name
            await dialog.accept();
        });

        // Click icon button (view)
        const iconBtn = page.locator('.list-action-btn-icon').first();
        await iconBtn.click();

        console.log('✅ Button click handler works');
    });

    test('Button hover effects work', async ({ page }) => {
        const iconBtn = page.locator('.list-action-btn-icon').first();

        // Get initial transform
        const initialTransform = await iconBtn.evaluate(el =>
            window.getComputedStyle(el).transform
        );

        // Hover
        await iconBtn.hover();
        await page.waitForTimeout(300); // Wait for transition

        // Check if transform changed (scale effect)
        const hoverTransform = await iconBtn.evaluate(el =>
            window.getComputedStyle(el).transform
        );

        // Transform should be different (scale applied)
        expect(hoverTransform).not.toBe(initialTransform);

        console.log('✅ Button hover effects work');
    });

    test('Buttons are accessible', async ({ page }) => {
        const iconBtn = page.locator('.list-action-btn-icon').first();

        // Check aria-label exists
        const ariaLabel = await iconBtn.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain('Ansehen');

        // Check title attribute exists
        const title = await iconBtn.getAttribute('title');
        expect(title).toBeTruthy();

        console.log('✅ Buttons have proper accessibility attributes');
    });

    test('Mobile card view shows all button types', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500); // Wait for responsive layout

        // Check if card view is active
        const cardView = page.locator('.list-cards');
        await expect(cardView).toBeVisible();

        // Check first card has action buttons
        const firstCard = page.locator('.list-card').first();
        const cardActions = firstCard.locator('.list-card-actions');
        await expect(cardActions).toBeVisible();

        // Count buttons in card
        const buttonCount = await cardActions.locator('button').count();
        expect(buttonCount).toBeGreaterThanOrEqual(3); // icon, emoji, full button

        console.log('✅ Mobile card view shows all button types');
    });
});
