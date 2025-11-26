// frontend/src/components/features/cv-management/WorkExperienceForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkExperienceForm from './WorkExperienceForm';
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
    startDate: '2020-01-01',
    endDate: '2022-12-31',
    description: 'Developed amazing things.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for adding a new experience', () => {
    render(<WorkExperienceForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText('Job Title')).toHaveValue('');
    expect(screen.getByLabelText('Company')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Save Experience' })).toBeInTheDocument();
  });

  it('renders with initial data for editing an experience', () => {
    render(<WorkExperienceForm onSubmit={mockOnSubmit} initialData={initialData} isLoading={false} />);

    expect(screen.getByLabelText('Job Title')).toHaveValue(initialData.title);
    expect(screen.getByLabelText('Company')).toHaveValue(initialData.company);
    expect(screen.getByLabelText('Description')).toHaveValue(initialData.description);
  });

  it('calls onSubmit with form data when submitted with valid data', async () => {
    render(<WorkExperienceForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'New Company' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2023-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save Experience' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Title',
          company: 'New Company',
          startDate: '2023-01-01',
        })
      );
    });
  });

  it('shows validation errors for required fields', async () => {
    render(<WorkExperienceForm onSubmit={mockOnSubmit} isLoading={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Experience' }));

    await waitFor(() => {
      expect(screen.getByText('Job title is required')).toBeInTheDocument();
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
    });

    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables the submit button when isLoading is true', () => {
    render(<WorkExperienceForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });
});