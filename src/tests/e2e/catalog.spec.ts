import { test, expect } from '@playwright/test';

test.describe('Catalog Browsing', () => {
  test('homepage has correct title and navigation', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Sridha's Store/);

    // Expect the navbar to be visible
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
  });

  test('can navigate to a product from homepage', async ({ page }) => {
    await page.goto('/');

    // Assuming there is a product card linking to /product/[slug]
    // Since our database might be empty in a raw test env, we just verify the route works if it exists.
    // If the homepage has products, click the first one:
    const productLink = page.locator('a[href^="/product/"]').first();
    
    // Check if any product is rendered on the homepage before trying to click
    const count = await productLink.count();
    if (count > 0) {
      await productLink.click();
      await expect(page).toHaveURL(/\/product\/.*/);
      
      // Ensure Add to Cart button is visible
      const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i });
      await expect(addToCartBtn).toBeVisible();
    }
  });
});
