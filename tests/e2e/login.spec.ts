// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Login Flow', () => {
  test('should allow a registered user to log in and then log out', async ({ page }) => {
    // 1. Mock successful login API call
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': [
            'access_token=mockAccessToken; HttpOnly; Path=/; Max-Age=900; SameSite=Strict',
            'refresh_token=mockRefreshToken; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict',
          ],
        },
        body: JSON.stringify({
          success: true,
          data: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
          message: 'Logged in successfully',
        }),
      });
    });

    // 2. Mock /dashboard content (since we redirect there)
    await page.route('**/dashboard', async route => {
      await route.fulfill({ status: 200, body: '<h1>Welcome to Dashboard</h1>' });
    });

    // Go to the login page
    await page.goto('/login');

    // Fill out the login form
    await page.getByLabel('Email').fill('john.doe@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');

    // Click the Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Expect a success toast message
    await expect(page.getByText('Login Successful!')).toBeVisible();
    
    // Expect to be redirected to the dashboard page
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome to Dashboard' })).toBeVisible();

    // 3. Mock successful logout API call
    await page.route('**/api/v1/auth/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': [
            'access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
            'refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
          ],
        },
        body: JSON.stringify({ success: true, message: 'Logged out successfully' }),
      });
    });

    // 4. Perform logout (assuming a logout button or similar mechanism on dashboard)
    // For this test, we'll simulate a direct logout call or a button click
    // This requires extending the mock for the dashboard itself, or assuming a global logout button
    // For simplicity, we'll call the logout API directly if it's not a visible element
    // A real app would have a button in the nav bar.
    // For now, let's assume a button click is simulated
    await page.evaluate(async () => {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
    });

    // Expect to be redirected to the login page after logout
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Logged Out')).toBeVisible(); // Check for toast
  });

  test('should display error message for invalid credentials', async ({ page }) => {
    // Mock failed login API call
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid credentials',
        }),
      });
    });

    // Go to the login page
    await page.goto('/login');

    // Fill out the login form with invalid data
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');

    // Click the Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Expect an error toast message
    await expect(page.getByText('Login Failed')).toBeVisible();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });
});
