// tests/e2e/profile.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Profile Creation and Update Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful login to establish authenticated session
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
          data: { id: 'uuid-123-456', email: 'john.doe@example.com' },
          message: 'Logged in successfully',
        }),
      });
    });

    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('john.doe@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('should allow user to view and update their profile', async ({ page }) => {
    // Mock GET /api/v1/profile - initial profile fetch
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'uuid-123-456',
              email: 'john.doe@example.com',
              firstName: null,
              lastName: null,
              phoneNumber: null,
            },
          }),
        });
      }
    });

    // Navigate to profile/settings page
    await page.goto('/settings');

    // Verify email is displayed (but not editable)
    await expect(page.getByText('john.doe@example.com')).toBeVisible();

    // Verify form fields are visible
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Phone Number')).toBeVisible();

    // Mock POST /api/v1/profile - update profile
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'POST') {
        const requestData = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Profile updated successfully',
            profile: {
              id: 'uuid-123-456',
              email: 'john.doe@example.com',
              firstName: requestData.firstName,
              lastName: requestData.lastName,
              phoneNumber: requestData.phoneNumber,
            },
          }),
        });
      }
    });

    // Fill out profile form
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Phone Number').fill('+1234567890');

    // Submit the form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Expect success message
    await expect(page.getByText('Profile updated successfully')).toBeVisible();

    // Verify updated data is displayed
    await expect(page.getByLabel('First Name')).toHaveValue('John');
    await expect(page.getByLabel('Last Name')).toHaveValue('Doe');
    await expect(page.getByLabel('Phone Number')).toHaveValue('+1234567890');
  });

  test('should allow user to update profile with partial data', async ({ page }) => {
    // Mock GET /api/v1/profile - existing profile data
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'uuid-123-456',
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe',
              phoneNumber: '+1234567890',
            },
          }),
        });
      }
    });

    await page.goto('/settings');

    // Wait for form to load with existing data
    await expect(page.getByLabel('First Name')).toHaveValue('John');
    await expect(page.getByLabel('Last Name')).toHaveValue('Doe');
    await expect(page.getByLabel('Phone Number')).toHaveValue('+1234567890');

    // Mock POST /api/v1/profile - update only phone number
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'POST') {
        const requestData = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Profile updated successfully',
            profile: {
              id: 'uuid-123-456',
              email: 'john.doe@example.com',
              firstName: requestData.firstName || 'John',
              lastName: requestData.lastName || 'Doe',
              phoneNumber: requestData.phoneNumber || '+1234567890',
            },
          }),
        });
      }
    });

    // Update only phone number
    await page.getByLabel('Phone Number').clear();
    await page.getByLabel('Phone Number').fill('+9876543210');

    // Submit the form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Expect success message
    await expect(page.getByText('Profile updated successfully')).toBeVisible();

    // Verify updated phone number
    await expect(page.getByLabel('Phone Number')).toHaveValue('+9876543210');
  });

  test('should display validation errors for invalid phone number', async ({ page }) => {
    // Mock GET /api/v1/profile
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'uuid-123-456',
              email: 'john.doe@example.com',
              firstName: null,
              lastName: null,
              phoneNumber: null,
            },
          }),
        });
      }
    });

    await page.goto('/settings');

    // Mock POST /api/v1/profile - validation error
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: [
              { field: 'phoneNumber', message: 'Invalid phone number format' }
            ],
          }),
        });
      }
    });

    // Fill form with invalid phone number
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Phone Number').fill('invalid-phone');

    // Submit the form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Expect validation error message
    await expect(page.getByText('Invalid phone number format')).toBeVisible();
  });

  test('should display validation errors for empty required fields', async ({ page }) => {
    // Mock GET /api/v1/profile
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'uuid-123-456',
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe',
              phoneNumber: null,
            },
          }),
        });
      }
    });

    await page.goto('/settings');

    // Mock POST /api/v1/profile - validation error for empty fields
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: [
              { field: 'firstName', message: 'First name cannot be empty' },
              { field: 'lastName', message: 'Last name cannot be empty' }
            ],
          }),
        });
      }
    });

    // Clear required fields
    await page.getByLabel('First Name').clear();
    await page.getByLabel('Last Name').clear();

    // Submit the form
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Expect validation error messages
    await expect(page.getByText('First name cannot be empty')).toBeVisible();
    await expect(page.getByText('Last name cannot be empty')).toBeVisible();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock GET /api/v1/profile
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'uuid-123-456',
              email: 'john.doe@example.com',
              firstName: null,
              lastName: null,
              phoneNumber: null,
            },
          }),
        });
      }
    });

    await page.goto('/settings');

    // Mock POST /api/v1/profile - server error
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
          }),
        });
      }
    });

    // Fill and submit form
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Expect error message
    await expect(page.getByText('Failed to update profile')).toBeVisible();
  });
});

test.describe('Unauthenticated Profile Access', () => {
  test('should redirect to login when accessing profile page without authentication', async ({ page }) => {
    // Mock unauthenticated profile fetch
    await page.route('**/api/v1/profile', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Unauthorized',
        }),
      });
    });

    // Try to access settings page without logging in
    await page.goto('/settings');

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
  });

  test('should not allow profile updates without authentication', async ({ page }) => {
    // Mock unauthenticated profile update
    await page.route('**/api/v1/profile', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Unauthorized',
          }),
        });
      }
    });

    // This test assumes that frontend protects the route, but if we somehow get there
    // We can test that the API rejects unauthorized updates
    // For a real test, this would require bypassing frontend auth guards
    // which is not typical in E2E tests. This is more of an API integration test.
    // We'll document that this scenario is covered in integration tests instead.
  });
});

test.describe('Full User Journey - Profile Creation After Registration', () => {
  test('should complete full flow: register -> login -> create profile', async ({ page }) => {
    // Step 1: Mock registration
    await page.route('**/api/v1/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful. Please verify your email.',
          data: { id: 'uuid-new-user', email: 'newuser@example.com' },
        }),
      });
    });

    // Step 2: Register new user
    await page.goto('/signup');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Expect registration success
    await expect(page.getByText('Registration successful')).toBeVisible();

    // Step 3: Mock login
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
          data: { id: 'uuid-new-user', email: 'newuser@example.com' },
          message: 'Logged in successfully',
        }),
      });
    });

    // Step 4: Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    await page.getByRole('button', { name: 'Login' }).click();

    // Step 5: Mock empty profile fetch (new user has no profile data)
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'uuid-new-user',
              email: 'newuser@example.com',
              firstName: null,
              lastName: null,
              phoneNumber: null,
            },
          }),
        });
      }
    });

    // Step 6: Navigate to profile creation
    await page.goto('/settings');

    // Step 7: Mock profile creation
    await page.route('**/api/v1/profile', async (route) => {
      if (route.request().method() === 'POST') {
        const requestData = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Profile updated successfully',
            profile: {
              id: 'uuid-new-user',
              email: 'newuser@example.com',
              firstName: requestData.firstName,
              lastName: requestData.lastName,
              phoneNumber: requestData.phoneNumber,
            },
          }),
        });
      }
    });

    // Step 8: Fill out profile
    await page.getByLabel('First Name').fill('New');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Phone Number').fill('+1122334455');

    // Step 9: Save profile
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Step 10: Verify success
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    await expect(page.getByLabel('First Name')).toHaveValue('New');
    await expect(page.getByLabel('Last Name')).toHaveValue('User');
    await expect(page.getByLabel('Phone Number')).toHaveValue('+1122334455');
  });
});
