import { test, expect } from '@playwright/test';

test('Check padding on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5188/');
    await page.waitForTimeout(2000);
    
    const result = await page.evaluate(() => {
        const siteContent = document.querySelector('.site-content');
        const listBuilder = document.querySelector('.list-builder');
        
        if (!siteContent) return { error: '.site-content not found' };
        
        const siteContentStyles = window.getComputedStyle(siteContent);
        const siteContentRect = siteContent.getBoundingClientRect();
        
        const listBuilderRect = listBuilder ? listBuilder.getBoundingClientRect() : null;
        
        return {
            siteContent: {
                padding: siteContentStyles.padding,
                paddingLeft: siteContentStyles.paddingLeft,
                paddingRight: siteContentStyles.paddingRight,
                left: siteContentRect.left,
                right: siteContentRect.right,
                width: siteContentRect.width
            },
            listBuilder: listBuilderRect ? {
                left: listBuilderRect.left,
                right: listBuilderRect.right,
                width: listBuilderRect.width
            } : null,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    });
    
    console.log(JSON.stringify(result, null, 2));
    
    await page.screenshot({ path: 'mobile.png', fullPage: true });
});
