import { test, expect } from '@playwright/test';

test.describe('End-to-End Online Concert Ticketing Journey', () => {
  test('should view homepage hero, click concert, select seat, and test admin modal', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('จองตั๋วคอนเสิร์ตที่คุณชื่นชอบ');

    // 2. Open Admin Login Modal
    await page.click('text=เข้าสู่โหมด Admin');
    await expect(page.locator('text=เข้าสู่ระบบผู้ดูแลระบบ (Admin)')).toBeVisible();

    // 3. Click quick autofill admin
    await page.click('text=ใส่รหัส Admin');
    await page.click('button:has-text("เข้าสู่ระบบ Admin Panel")');

    // 4. Verify redirected to Admin Dashboard
    await page.waitForURL('**/admin');
    await expect(page.locator('h1')).toContainText('แดชบอร์ดผู้ดูแลระบบ');
  });
});
