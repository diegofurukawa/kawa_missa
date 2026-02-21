import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login form is visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Check if still on login page
    expect(page.url()).toContain('/login');
  });

  test('should redirect to select-tenant on successful login', async ({ page }) => {
    // This test assumes there's a test user in the database
    // In a real scenario, you'd set up test data before running
    
    await page.goto('/login');
    
    // Fill in valid credentials (adjust based on your test setup)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation();
    
    // Should redirect to select-tenant or dashboard
    expect(page.url()).toMatch(/\/(select-tenant|dashboard)/);
  });
});

test.describe('Public Pages', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Kawa Missa|Missas/);
  });

  test('should display offline page when offline', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);
    
    await page.goto('/offline');
    
    // Check if offline message is visible
    const offlineMessage = page.locator('text=/offline|sem conexão/i');
    await expect(offlineMessage).toBeVisible();
    
    // Restore online mode
    await context.setOffline(false);
  });
});
