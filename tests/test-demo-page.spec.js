import { test, expect } from '@playwright/test';

test.describe('SSI Builders Demo Page', () => {
    test('Demo page loads and shows all sections', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check hero section
        await expect(page.locator('h1')).toContainText('Builder System');

        // Check stats cards
        await expect(page.locator('.stat-value')).toHaveCount(4);

        // Check all 7 builder cards are present
        const builderCards = page.locator('.builder-card');
        await expect(builderCards).toHaveCount(7);

        // Check documentation section
        await expect(page.locator('text=Documentation')).toBeVisible();
        await expect(page.locator('a:has-text("Quick Guide")')).toBeVisible();

        console.log('✅ Demo page loaded successfully');
    });

    test('Navigation links work', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        const builders = [
            { name: 'ListBuilder', href: '#listbuilder' },
            { name: 'FormBuilder', href: '#formbuilder' },
            { name: 'ModalBuilder', href: '#modalbuilder' },
            { name: 'ChartBuilder', href: '#chartbuilder' },
            { name: 'TabBuilder', href: '#tabbuilder' },
            { name: 'MenuBuilder', href: '#menubuilder' },
            { name: 'SidebarBuilder', href: '#sidebarbuilder' }
        ];

        for (const builder of builders) {
            // Scroll to top first
            await page.evaluate(() => window.scrollTo(0, 0));

            // Click the builder card
            await page.locator(`a[href="${builder.href}"]`).first().click({ force: true });
            await page.waitForTimeout(500);

            // Check if section is visible
            const sectionVisible = await page.locator(builder.href).isVisible();
            expect(sectionVisible).toBe(true);

            console.log(`✅ ${builder.name} navigation works`);
        }
    });

    test('ListBuilder renders', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        // Wait for ListBuilder to render
        await page.waitForSelector('#demoList .list-table', { timeout: 5000 });

        // Check if table has rows
        const rows = await page.locator('#demoList .list-table tbody tr').count();
        expect(rows).toBeGreaterThan(0);

        console.log(`✅ ListBuilder rendered with ${rows} rows`);
    });

    test('FormBuilder renders', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        // Wait for FormBuilder to render
        await page.waitForSelector('#demoForm form', { timeout: 5000 });

        // Check if form has fields
        const fields = await page.locator('#demoForm input, #demoForm select, #demoForm textarea').count();
        expect(fields).toBeGreaterThan(0);

        console.log(`✅ FormBuilder rendered with ${fields} fields`);
    });

    test('Charts render', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        // Wait for charts to render
        await page.waitForSelector('#demoChart1 canvas', { timeout: 5000 });

        // Check if all 4 charts are present
        const charts = await page.locator('canvas').count();
        expect(charts).toBeGreaterThanOrEqual(4);

        console.log(`✅ ${charts} charts rendered`);
    });

    test('Modal buttons work', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        // Scroll to modal section
        await page.locator('#modalbuilder').scrollIntoViewIfNeeded();

        // Click confirm button
        await page.locator('button:has-text("Confirm Dialog")').click({ force: true });

        // Wait for modal to appear
        await page.waitForSelector('.modal', { timeout: 3000 });

        // Check if modal is visible
        const modalVisible = await page.locator('.modal').isVisible();
        expect(modalVisible).toBe(true);

        console.log('✅ Modal opened successfully');

        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
    });

    test('Tabs render', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        // Wait for tabs to render
        await page.waitForSelector('#demoTabs .tabs', { timeout: 5000 });

        // Check if tabs are present
        const tabs = await page.locator('#demoTabs .tab-button').count();
        expect(tabs).toBeGreaterThan(0);

        console.log(`✅ TabBuilder rendered with ${tabs} tabs`);
    });

    test('Sidebar renders', async ({ page }) => {
        await page.goto('http://localhost:5177/examples/demo.html');

        // Wait for sidebar to render
        await page.waitForSelector('#demoSidebar .sidebar', { timeout: 5000 });

        // Check if sidebar is visible
        const sidebarVisible = await page.locator('#demoSidebar .sidebar').isVisible();
        expect(sidebarVisible).toBe(true);

        console.log('✅ SidebarBuilder rendered');
    });

    test('No console errors', async ({ page }) => {
        const consoleErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('http://localhost:5177/examples/demo.html');
        await page.waitForLoadState('networkidle');

        // Wait a bit for any lazy-loaded content
        await page.waitForTimeout(2000);

        if (consoleErrors.length > 0) {
            console.log('❌ Console errors found:');
            consoleErrors.forEach(err => console.log(`  - ${err}`));
        } else {
            console.log('✅ No console errors');
        }

        expect(consoleErrors.length).toBe(0);
    });
});
