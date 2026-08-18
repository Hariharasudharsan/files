import { test, expect } from '@playwright/test';

test.describe.skip('ERP Sync Admin Flow', () => {
  // Use admin storage state or login as admin
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@mathuram.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
  });

  test('Verify ERP Sync Dashboard', async ({ page }) => {
    // 1. Navigate to ERP Sync logs
    await page.click('text=ERP Sync');
    await expect(page).toHaveURL(/.*\/admin\/sync-logs/);
    
    // 2. Check for Sync Log table presence
    const syncTable = page.locator('table');
    await expect(syncTable).toBeVisible();
    
    // 3. Trigger manual sync (mocking the UI action)
    const syncButton = page.getByRole('button', { name: 'Trigger Full Sync' });
    if (await syncButton.isVisible()) {
      await syncButton.click();
      await expect(page.locator('text=Sync Job Queued')).toBeVisible();
    }
  });
  
  test('Verify Dead Letter Queues (DLQ)', async ({ page }) => {
    await page.click('text=Queues & DLQ');
    await expect(page).toHaveURL(/.*\/admin\/queues/);
    
    // Check if the FAILED jobs section exists
    await expect(page.locator('text=Failed Syncs (DLQ)')).toBeVisible();
  });
});
