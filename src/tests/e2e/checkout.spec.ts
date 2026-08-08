import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('Complete E2E Checkout Flow', async ({ page }) => {
    // 1. Visit Homepage
    await page.goto('/');
    
    // 2. Navigate to Catalog
    await page.click('text=Explore Collection');
    await expect(page).toHaveURL(/.*#products/);
    
    // 3. Add first product to cart
    // Using nth(0) to get the first Add to Cart button
    const addToCartButton = page.locator('button[aria-label^="Add"]').first();
    await addToCartButton.waitFor({ state: 'visible' });
    await addToCartButton.click();
    
    // 4. Open Cart Sidebar
    await page.click('button[aria-label="Open cart"]');
    await expect(page.locator('text=Your Cart')).toBeVisible();
    
    // 5. Proceed to Checkout
    await page.click('text=Checkout');
    
    // Since NextAuth is used, checkout might redirect to login if unauthenticated
    // Expect login redirect
    await expect(page).toHaveURL(/.*\/account\/login/);
    
    // 6. Login as user
    await page.fill('input[name="email"]', 'test@mathuram.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect back to checkout
    await page.waitForURL('**/checkout');
    await expect(page.locator('text=Shipping Details')).toBeVisible();
    
    // 7. Fill Shipping Details
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="address1"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Chennai');
    await page.fill('input[name="postalCode"]', '600001');
    await page.fill('input[name="phone"]', '9876543210');
    
    // 8. Place Order
    await page.click('text=Place Order');
    
    // 9. Verify success page
    await expect(page).toHaveURL(/.*\/checkout\/success/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });
});
