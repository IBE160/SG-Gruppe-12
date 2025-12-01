// frontend/src/components/features/cv-management/WorkExperienceForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkExperienceForm } from './WorkExperienceForm';
import { ExperienceEntry } from '@/types/cv';

// We will use the actual react-hook-form and zodResolver for a more realistic test
// by wrapping the component in a test-specific provider if necessary,
// or just by rendering it directly as it's self-contained.

describe('WorkExperienceForm Component', () => {
  const mockOnSubmit = jest.fn();

  const initialData: ExperienceEntry = {
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    start_date: '2020-01-01', // Changed from startDate to start_date
    end_date: '2022-12-31',   // Changed from endDate to end_date
    description: 'Developed amazing things.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for adding a new experience', () => {
    render(<WorkExperienceForm cvId="1" onSubmit={mockOnSubmit} isLoading={false} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add experience/i }));

    expect(screen.getByLabelText('Job Title')).toHaveValue('');
    expect(screen.getByLabelText('Company')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Save All Work Experiences' })).toBeInTheDocument();
  });

  it('renders with initial data for editing an experience', () => {
    render(<WorkExperienceForm cvId="1" onSubmit={mockOnSubmit} initialExperiences={[initialData]} isLoading={false} />);

    expect(screen.getByLabelText('Job Title')).toHaveValue(initialData.title);
    expect(screen.getByLabelText('Company')).toHaveValue(initialData.company);
    expect(screen.getByLabelText('Description')).toHaveValue(initialData.description);
  });

  it('calls onSubmit with form data when submitted with valid data', async () => {
    render(<WorkExperienceForm cvId="1" onSubmit={mockOnSubmit} isLoading={false} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add experience/i })); // Add an experience entry

    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'New Company' } });
    fireEvent.change(screen.getByLabelText('Start Date (YYYY-MM-DD)'), { target: { value: '2023-01-01' } }); // Use full label

    fireEvent.click(screen.getByRole('button', { name: 'Save All Work Experiences' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          experiences: [
            expect.objectContaining({
              title: 'New Title',
              company: 'New Company',
              start_date: '2023-01-01',
            }),
          ],
        })
      );
    });
  });

  it('shows validation errors for required fields', async () => {
    render(<WorkExperienceForm cvId="1" onSubmit={mockOnSubmit} isLoading={false} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add experience/i })); // Add an experience entry

    fireEvent.click(screen.getByRole('button', { name: 'Save All Work Experiences' }));

    await waitFor(() => {
      expect(screen.getByText('Job title is required')).toBeInTheDocument();
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
    });

    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables the submit button when isLoading is true', () => {
    render(<WorkExperienceForm cvId="1" onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByRole('button', { name: /Saving.../i })).toBeDisabled();
  });
});