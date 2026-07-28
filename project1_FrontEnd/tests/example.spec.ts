import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:5173';

test.describe('HomeService Platform E2E Flows', () => {

  test.beforeEach(async () => {
    // Reset database state for booking payments before every test browser run
    try {
      const workspaceRoot = 'c:/LuanVan/LuanVanTotNghiep';
      execSync('docker compose exec -T payment-service php artisan db:seed --class=DatabaseSeeder', { cwd: workspaceRoot, stdio: 'ignore' });
      execSync('docker compose exec -T order-service php artisan db:seed --class=BookingSeeder', { cwd: workspaceRoot, stdio: 'ignore' });
    } catch (err) {
      console.error('Failed to reset database state in beforeEach:', err);
    }
  });

  test('Should perform Register Flow successfully with valid parameters', async ({ page }) => {
    // 1. Navigate to the registration page (using Hash Routing)
    await page.goto(`${BASE_URL}/#/dang-ky`);
    await expect(page).toHaveURL(/.*#\/dang-ky/);

    // Generate a completely unique email and phone to avoid database collisions in consecutive test runs
    const uniqueEmail = `testuser_${Math.floor(Math.random() * 1000000)}_${Date.now()}@example.com`;
    const random8Digits = Math.floor(10000000 + Math.random() * 90000000).toString();
    const uniquePhone = `09${random8Digits}`;

    // 2. Fill the Registration form fields
    await page.fill('input[name="fullName"]', 'Nguyen Van A Test');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="phone"]', uniquePhone);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');

    // 3. Agree to terms and conditions checkbox
    await page.check('input[name="agreeTerms"]');

    // 4. Click Submit button to request account creation
    await page.click('button[type="submit"]');

    // 5. Verification: wait up to 20 seconds for redirect to login screen
    await expect(page).toHaveURL(/.*#\/dang-nhap/, { timeout: 20000 });
  });

  test('Should perform Login Flow successfully and redirect based on role', async ({ page }) => {
    // 1. Navigate to the login page (using Hash Routing)
    await page.goto(`${BASE_URL}/#/dang-nhap`);
    await expect(page).toHaveURL(/.*#\/dang-nhap/);

    // 2. Input valid credentials matching seeded database user
    await page.fill('input[name="email"]', 'customer@gmail.com');
    await page.fill('input[name="password"]', 'Customer123'); // Password satisfies uppercase rule

    // 3. Click the submit button
    await page.click('button[type="submit"]');

    // 4. Validation: Verify successful redirect away from login screen after session establishment
    await expect(page).not.toHaveURL(/.*#\/dang-nhap/, { timeout: 20000 });
  });

  test('Should perform E2E VNPay Sandbox checkout flow redirect successfully', async ({ page }) => {
    // 1. Log in first as customer5@gmail.com who has a pending unpaid booking
    await page.goto(`${BASE_URL}/#/dang-nhap`);
    await page.fill('input[name="email"]', 'customer5@gmail.com');
    await page.fill('input[name="password"]', 'Customer123');
    await page.click('button[type="submit"]');

    // Wait for authentication redirect
    await expect(page).not.toHaveURL(/.*#\/dang-nhap/, { timeout: 20000 });

    // 2. Navigate to Booking History page where the unpaid booking resides
    await page.goto(`${BASE_URL}/#/lich-su-dat-lich`);
    await expect(page).toHaveURL(/.*#\/lich-su-dat-lich/);

    // 3. Locate the pending, unpaid booking row (BK-20260705-005) and click "Thanh toán"
    const row = page.locator('tr', { hasText: 'BK-20260705-005' });
    await row.locator('button:has-text("Thanh toán")').click();

    // 4. Choose payment method VNPay inside the modal
    await page.click('button:has-text("VNPay")');

    // 5. Submit validation and request payment url redirection
    await page.click('button:has-text("Thanh toán qua VNPay")');

    // 6. Verification: Wait up to 25 seconds to ensure we are successfully redirected to VNPay Sandbox
    await page.waitForURL(/.*vnpayment.vn.*/, { timeout: 25000 });
    await expect(page.url()).toContain('vnpayment.vn');
  });

});
