// tests/e2e/cv-versioning.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CV Versioning Functionality', () => {
  const mockCvId = 'mock-cv-id';
  let currentCvData = {
    personal_info: { firstName: 'Initial', lastName: 'User', email: 'initial@user.com' },
    experience: [{ title: 'Initial Job', company: 'Initial Co', startDate: '2020-01-01' }],
    education: [],
    skills: [],
    languages: [],
  };

  test.beforeEach(async ({ page }) => {
    // Mock the initial CV data fetch
    await page.route(`**/api/v1/cvs/${mockCvId}`, async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: currentCvData }) });
    });

    // Mock API calls for creating/updating CV components
    await page.route(`**/api/v1/cvs/${mockCvId}/experience/**`, async route => {
        // Simulate update on the currentCvData
        const requestData = route.request().postDataJSON();
        currentCvData = { ...currentCvData, experience: [{ ...currentCvData.experience[0], ...requestData }] };
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: currentCvData }) });
    });

    // Mock version creation
    await page.route(`**/api/v1/cvs/${mockCvId}/versions`, async route => {
        if (route.request().method() === 'POST') {
            // Simulate creation of a new version. The actual delta is managed backend-side.
            // For this E2E test, we just need to ensure the API call goes through.
            await route.fulfill({ status: 201, body: JSON.stringify({ success: true }) });
        } else if (route.request().method() === 'GET') {
            // Simulate listing versions
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    success: true,
                    data: [
                        { versionNumber: 1, createdAt: '2023-01-01T10:00:00Z' },
                        { versionNumber: 2, createdAt: '2023-01-01T11:00:00Z' },
                    ],
                }),
            });
        }
    });

    // Mock version details retrieval
    await page.route(`**/api/v1/cvs/${mockCvId}/versions/1`, async route => {
        // Simulate returning data for version 1
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: { ...initialCvData, experience: [{ title: 'Job V1' }] } }) });
    });
    await page.route(`**/api/v1/cvs/${mockCvId}/versions/2`, async route => {
        // Simulate returning data for version 2
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: { ...initialCvData, experience: [{ title: 'Job V2' }] } }) });
    });


    // Mock restore version
    await page.route(`**/api/v1/cvs/${mockCvId}/restore-version/1`, async route => {
        // Simulate restoring version 1
        currentCvData = { ...initialCvData, experience: [{ title: 'Job V1' }] };
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: currentCvData }) });
    });


    // Navigate to the manage page
    await page.goto('/dashboard/cv/manage');
    await expect(page.getByText('Manage Your CV')).toBeVisible();
  });

  test('should allow user to view and restore a previous CV version', async ({ page }) => {
    // --- Verify initial state ---
    const jobTitleInput = page.getByLabel('Job Title').first();
    await expect(jobTitleInput).toHaveValue('Initial Job');
    await expect(page.getByText('Initial Co')).toBeVisible();

    // --- Make a change to create a new version ---
    await page.getByRole('button', { name: /edit/i }).first().click(); // Open edit form
    await jobTitleInput.fill('Updated Job Title');
    await page.getByRole('button', { name: 'Save Experience' }).click(); // Submit the form
    await page.waitForTimeout(500); // Give time for save and autosave to trigger version

    // Expect the preview to show the updated title
    await expect(page.locator('h3', { hasText: 'Updated Job Title' })).toBeVisible();


    // --- View Version History ---
    await page.getByRole('heading', { name: 'CV Version History' }).click(); // Ensure section is visible

    // List versions should be mocked already, so just check UI presence
    await expect(page.getByText('Version 1')).toBeVisible();
    await expect(page.getByText('Version 2')).toBeVisible();


    // --- View an older version (Version 1) ---
    await page.locator('div').filter({ hasText: 'Version 1' }).getByRole('button', { name: 'View' }).click();
    
    // Assert preview reflects version 1 data
    await expect(page.locator('h1', { hasText: 'Job V1' })).toBeVisible(); // Preview shows version 1's title
    // Expect the form fields to *not* immediately reflect the viewed version, as View is preview-only
    await expect(jobTitleInput).toHaveValue('Updated Job Title');


    // --- Restore an older version (Version 1) ---
    page.on('dialog', dialog => dialog.accept()); // Automatically accept confirmation dialog

    await page.locator('div').filter({ hasText: 'Version 1' }).getByRole('button', { name: 'Restore' }).click();
    
    // Assert that the form fields now reflect the restored version
    await expect(jobTitleInput).toHaveValue('Job V1');
    // And the preview too
    await expect(page.locator('h1', { hasText: 'Job V1' })).toBeVisible();
  });
});
