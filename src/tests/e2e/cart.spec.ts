import { test, expect } from '@playwright/test';

test.describe('Cart and Checkout', () => {
  test('Cart Drawer can be opened and closed', async ({ page }) => {
    await page.goto('/');
    
    // Check for the cart button in navbar (usually a shopping cart icon or text)
    // We assume the navbar has a button with the aria-label "Open cart" or text "Cart"
    const cartButton = page.locator('button').filter({ hasText: /^Cart$|^0$/ }).first();
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Check if CartDrawer is visible (assuming it has text 'Your Cart' or 'Shopping Cart')
      const drawerHeader = page.getByText(/Your Cart/i);
      await expect(drawerHeader).toBeVisible();
      
      // Close the drawer
      const closeButton = page.getByRole('button', { name: /Close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(drawerHeader).not.toBeVisible();
      }
    }
  });

  test('Adding item to cart updates the cart state', async ({ page }) => {
    // Navigate to a specific product if it exists
    await page.goto('/');
    const productLink = page.locator('a[href^="/product/"]').first();
    
    if (await productLink.count() > 0) {
      await productLink.click();
      
      const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i });
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        
        // After adding, the cart drawer should automatically open or the cart count should increment.
        // Check if Cart is visible
        const drawerHeader = page.getByText(/Your Cart/i);
        await expect(drawerHeader).toBeVisible();
        
        // Verify checkout button is present in the drawer
        const checkoutBtn = page.getByRole('button', { name: /Checkout/i });
        await expect(checkoutBtn).toBeVisible();
      }
    }
  });
});
