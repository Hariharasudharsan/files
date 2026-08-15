import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should allow a user to add a product to cart and open cart drawer', async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto('/');
    
    // Ensure homepage loaded
    await expect(page.locator('text=Sridha\'s Store')).toBeVisible();

    // 2. Navigate to a Category (e.g. Appalams)
    await page.click('text=Appalams');
    await expect(page).toHaveURL(/.*\/category\/appalam/);

    // 3. Hover over a product and click Quick View
    const productCard = page.locator('.group.relative').first();
    await productCard.hover();
    
    const quickViewBtn = productCard.locator('button[aria-label="Quick View"]');
    await quickViewBtn.click();

    // 4. Verify Quick View Modal opens
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // 5. Add to Cart from within the modal
    const addToCartBtn = modal.locator('button:has-text("Add to Cart")');
    await addToCartBtn.click();

    // 6. Verify Cart Drawer opens automatically (or manually check cart state)
    const cartDrawer = page.locator('div[role="dialog"]').filter({ hasText: 'Shopping Cart' });
    // Assuming cart drawer opens automatically upon adding. If not, click cart icon.
    // await page.click('button[aria-label="Open Cart"]');
    await expect(cartDrawer).toBeVisible();

    // Verify item is in cart
    const cartItems = cartDrawer.locator('li');
    await expect(cartItems).toHaveCount(1);
    
    // Verify checkout button exists
    const checkoutBtn = cartDrawer.locator('button:has-text("Checkout")');
    await expect(checkoutBtn).toBeVisible();
  });
});
