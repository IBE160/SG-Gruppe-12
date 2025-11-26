// tests/e2e/work-experience.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Work Experience Management', () => {
  test('should allow a user to add, edit, and delete work experience', async ({ page }) => {
    // Mock API calls for authentication and CV data fetching
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, token: 'mock-token' }),
      });
    });

    await page.route('**/api/v1/cvs/mock-cv-id', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'mock-cv-id',
            userId: 'mock-user-id',
            personal_info: { firstName: 'Test', lastName: 'User' },
            education: [],
            experience: [],
            skills: [],
            languages: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    });

    // Go to the CV management page
    await page.goto('/dashboard/cv/manage'); // Assuming this is the correct path

    // Expect the page to load
    await expect(page.getByText('Manage Your CV')).toBeVisible();

    // --- Add Work Experience ---
    await page.getByLabel('Job Title').fill('Software Engineer');
    await page.getByLabel('Company').fill('Example Corp');
    await page.getByLabel('Location').fill('Remote');
    await page.getByLabel('Start Date').fill('2020-01-01');
    await page.getByLabel('End Date').fill('2023-12-31');
    await page.getByLabel('Description').fill('Developed and maintained software applications.');
    
    // Mock the add experience API call
    await page.route('**/api/v1/cvs/mock-cv-id/experience', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { /* return updated CV data */ },
        }),
      });
    });
    
    await page.getByRole('button', { name: 'Save Experience' }).click();
    await expect(page.getByText('Experience added.')).toBeVisible(); // Check toast message

    // --- Edit Work Experience ---
    // Assuming edit button is visible next to the added experience
    // For simplicity, we'll click the first edit button found
    await page.getByRole('button', { name: 'edit' }).first().click(); // Click edit button (lucide-react PencilIcon)

    // Edit a field
    await page.getByLabel('Job Title').fill('Senior Software Engineer');

    // Mock the update experience API call
    await page.route('**/api/v1/cvs/mock-cv-id/experience/0', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { /* return updated CV data */ },
        }),
      });
    });

    await page.getByRole('button', { name: 'Save Experience' }).click();
    await expect(page.getByText('Experience updated.')).toBeVisible(); // Check toast message
    
    // Expect the updated title to be visible in the list
    await expect(page.getByText('Senior Software Engineer at Example Corp')).toBeVisible();

    // --- Delete Work Experience ---
    page.on('dialog', dialog => dialog.accept()); // Automatically accept confirmation dialog

    // Mock the delete experience API call
    await page.route('**/api/v1/cvs/mock-cv-id/experience/0', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { /* return updated CV data */ },
        }),
      });
    });

    await page.getByRole('button', { name: 'trash' }).first().click(); // Click delete button (lucide-react TrashIcon)
    await expect(page.getByText('Experience deleted.')).toBeVisible(); // Check toast message

    // Expect the work experience entry to be removed from the document
    await expect(page.getByText('Senior Software Engineer at Example Corp')).not.toBeVisible();
  });
});
