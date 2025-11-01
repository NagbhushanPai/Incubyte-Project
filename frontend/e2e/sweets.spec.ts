import { test, expect } from '@playwright/test';

test.describe('Sweets App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('register and login flow', async ({ page }) => {
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'testpass123';

    // Go to register
    await page.click('text=Register');
    await page.fill('input[placeholder="Name"]', 'Test User');
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // Should redirect to dashboard
    await page.waitForURL('http://localhost:5173/');
    await expect(page.locator('text=Sweets')).toBeVisible();
  });

  test('admin login and create sweet', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[placeholder="Email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'adminpass');
    await page.click('button:has-text("Sign in")');

    // Wait for dashboard
    await page.waitForURL('http://localhost:5173/');
    await expect(page.locator('text=ADMIN')).toBeVisible();

    // Click Add sweet
    await page.click('button:has-text("Add sweet")');
    await page.fill('input[placeholder="Name"]', 'E2E Chocolate');
    await page.fill('input[placeholder="Category"]', 'Chocolate');
    await page.fill('input[placeholder="Price"]', '2.99');
    await page.fill('input[placeholder="Quantity"]', '10');
    await page.click('button:has-text("Create")');

    // Sweet should appear
    await expect(page.locator('text=E2E Chocolate')).toBeVisible();
  });

  test('user can purchase sweet', async ({ page }) => {
    // Register first
    const email = `buyer+${Date.now()}@example.com`;
    await page.click('text=Register');
    await page.fill('input[placeholder="Name"]', 'Buyer');
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[type="password"]', 'pass');
    await page.click('button:has-text("Create account")');
    await page.waitForURL('http://localhost:5173/');

    // Should see sweets (seeded or created earlier)
    const purchase = page.locator('button:has-text("Purchase")').first();
    if (await purchase.isVisible()) {
      await purchase.click();
      // Alert should appear
      page.once('dialog', dialog => dialog.accept());
      await page.waitForTimeout(500);
    }
  });

  test('logout and login again', async ({ page }) => {
    await page.click('text=Login');
    await page.fill('input[placeholder="Email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'adminpass');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('http://localhost:5173/');

    // Logout
    await page.click('button:has-text("Logout")');
    
    // Should see login/register links
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Register')).toBeVisible();
  });
});
