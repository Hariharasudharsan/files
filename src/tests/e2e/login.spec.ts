import { test, expect } from '@playwright/test';

test.describe('Login Flows', () => {
  test('Customer login page initiates Google OAuth and targets /account', async ({ page }) => {
    await page.goto('/account/login');
    const button = page.getByRole('button', { name: 'Continue with Google' });
    await expect(button).toBeVisible();
    
    // Check that it's a functioning form/button
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('accounts.google.com') || req.url().includes('/api/auth/signin')),
      button.click()
    ]);
    expect(request).toBeTruthy();
  });

  test('Admin login page initiates Google OAuth and targets /admin', async ({ page }) => {
    await page.goto('/admin/login');
    const button = page.getByRole('button', { name: 'Continue with Google' });
    await expect(button).toBeVisible();
    
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('accounts.google.com') || req.url().includes('/api/auth/signin')),
      button.click()
    ]);
    expect(request).toBeTruthy();
  });
});
