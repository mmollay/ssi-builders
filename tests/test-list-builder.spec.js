import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5178';

test.describe('ListBuilder Demo Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/docs/demos/list-builder.html`);
    });

    test('Page loads and displays title', async ({ page }) => {
        await expect(page).toHaveTitle(/ListBuilder/);
        await expect(page.locator('h1')).toContainText('ListBuilder');
    });

    test('Basic List renders correctly', async ({ page }) => {
        const demo1 = page.locator('#demo1');
        await expect(demo1).toBeVisible();

        // Check headers
        await expect(demo1.locator('th').filter({ hasText: 'Name' })).toBeVisible();
        await expect(demo1.locator('th').filter({ hasText: 'E-Mail' })).toBeVisible();

        // Check data
        await expect(demo1.locator('td').filter({ hasText: 'Max Mustermann' })).toBeVisible();
    });

    test('List with Actions renders correctly', async ({ page }) => {
        const demo2 = page.locator('#demo2');
        await expect(demo2).toBeVisible();

        // Check action column header alignment
        const actionHeader = demo2.locator('th.list-table-actions');
        await expect(actionHeader).toBeVisible();
        await expect(actionHeader).toHaveCSS('text-align', 'right');

        // Check action buttons
        const actionButtons = demo2.locator('.list-action-btn');
        await expect(actionButtons.first()).toBeVisible();

        // Check specific actions exist
        await expect(demo2.locator('button[title="Ansehen"]')).toBeVisible();
        await expect(demo2.locator('button[title="Bearbeiten"]')).toBeVisible();
        await expect(demo2.locator('button[title="Löschen"]')).toBeVisible();
    });

    test('Action buttons have correct styling', async ({ page }) => {
        const demo2 = page.locator('#demo2');
        const deleteBtn = demo2.locator('button[title="Löschen"]').first();

        // Check it's right aligned in the cell
        const actionCell = deleteBtn.locator('..'); // Parent td
        await expect(actionCell).toHaveCSS('text-align', 'right');
    });
});
