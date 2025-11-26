// tests/e2e/signup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Signup Flow', () => {
  test('should allow a new user to register successfully', async ({ page }) => {
    // Mock successful registration API call
    await page.route('**/api/v1/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
          message: 'User registered successfully. Please check your email for verification (if enabled).',
        }),
      });
    });

    // Go to the signup page
    await page.goto('/signup');

    // Fill out the registration form
    await page.getByLabel('Name').fill('John Doe');
    await page.getByLabel('Email').fill('john.doe@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    await page.getByLabel('Confirm Password').fill('SecurePassword123!');
    
    // Check consent checkboxes if desired
    // await page.getByLabel('Allow AI training').check();
    // await page.getByLabel('Receive marketing').check();

    // Click the Sign Up button
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Expect a success toast message
    await expect(page.getByText('Registration Successful!')).toBeVisible();
    
    // Expect to be redirected to the login page
    await expect(page).toHaveURL('/login');
  });

  test('should display validation errors for invalid input', async ({ page }) => {
    await page.goto('/signup');

    // Attempt to submit an empty form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Expect validation messages to be visible
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Invalid email address')).toBeVisible();
    await expect(page.getByText('Password must be at least 12 characters')).toHaveCount(2); // For both password fields
  });

  test('should display error message for failed registration', async ({ page }) => {
    // Mock failed registration API call
    await page.route('**/api/v1/auth/register', async route => {
      await route.fulfill({
        status: 409, // Conflict for example
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Email already exists',
        }),
      });
    });

    await page.goto('/signup');

    // Fill out a valid form that will then trigger a mocked failure
    await page.getByLabel('Name').fill('John Doe');
    await page.getByLabel('Email').fill('john.doe@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    await page.getByLabel('Confirm Password').fill('SecurePassword123!');

    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Expect an error toast message
    await expect(page.getByText('Registration Failed')).toBeVisible();
    await expect(page.getByText('Email already exists')).toBeVisible();
    // Should remain on signup page
    await expect(page).toHaveURL('/signup');
  });
});
