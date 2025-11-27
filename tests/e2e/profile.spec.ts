import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test('should allow a user to update their profile', async ({ page }) => {
    // Mock login first (assuming login is already tested and working)
    // You would typically log in via UI or set a cookie here
    // For now, let's assume the user is already logged in for this test's scope
    await page.goto('/login'); // Navigate to login page
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('/dashboard'); // Assuming successful login redirects to dashboard

    await page.goto('/settings');
    await expect(page.locator('h1')).toHaveText('User Profile'); // Assuming a heading on the settings page

    // Fill the form fields
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="phoneNumber"]', '+1234567890');

    // Submit the form
    await page.click('button:has-text("Save Profile")');

    // Expect a success message or redirection
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // Verify the changes are persistent by reloading the page
    await page.reload();
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Jane');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe');
    await expect(page.locator('input[name="phoneNumber"]')).toHaveValue('+1234567890');
  });

  test('should display validation errors for invalid input', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toHaveText('User Profile'); // Assuming a heading on the settings page

    // Clear required fields
    await page.fill('input[name="firstName"]', '');
    await page.fill('input[name="lastName"]', '');

    // Submit the form
    await page.click('button:has-text("Save Profile")');

    // Expect validation error messages
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
  });
});