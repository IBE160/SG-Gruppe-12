// frontend/src/components/features/cv-management/WorkExperienceForm.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkExperienceForm } from './WorkExperienceForm';

// Mock the react-hook-form's useForm hook and zodResolver
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((cb) => (e) => {
      e.preventDefault(); // Prevent default form submission
      cb(formMockData);
    }),
    formState: { errors: {} },
  })),
}));

const formMockData = {
  title: 'Software Engineer',
  company: 'Google',
  location: 'Mountain View, CA',
  startDate: '2020-01-01',
  endDate: '2023-12-31',
  description: 'Developed and maintained software.',
};

describe('WorkExperienceForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const cvId = 'testCvId';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for adding new experience', () => {
    render(
      <WorkExperienceForm
        cvId={cvId}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Add New Work Experience')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date (YYYY-MM-DD)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Experience/i })).toBeInTheDocument();
  });

  it('renders correctly for editing existing experience', () => {
    render(
      <WorkExperienceForm
        cvId={cvId}
        initialData={formMockData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Work Experience')).toBeInTheDocument();
    // Check if initial data is populated (mocked register means we can't check value directly without more advanced mocking)
    // For a real test, you'd verify input values are correctly set.
  });

  it('calls onSave with form data when submitted', async () => {
    const { useForm } = require('react-hook-form');
    useForm.mockImplementation(() => ({
      register: jest.fn(),
      handleSubmit: jest.fn((cb) => (e) => {
        e.preventDefault();
        cb(formMockData); // Ensure it passes data
      }),
      formState: { errors: {} },
      getValues: jest.fn(() => formMockData), // Mock getValues if needed by internal logic
    }));

    render(
      <WorkExperienceForm
        cvId={cvId}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.submit(screen.getByRole('button', { name: /Save Experience/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(formMockData);
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <WorkExperienceForm
        cvId={cvId}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  // Test validation errors (requires more detailed react-hook-form mocking for errors object)
  // it('displays validation errors', async () => {
  //   const { useForm } = require('react-hook-form');
  //   useForm.mockImplementationOnce(() => ({
  //     register: jest.fn(),
  //     handleSubmit: jest.fn((cb) => (e) => { e.preventDefault(); cb({}); }), // Submit empty data
  //     formState: { errors: { title: { message: 'Job title is required' } } },
  //   }));

  //   render(
  //     <WorkExperienceForm
  //       cvId={cvId}
  //       onSave={mockOnSave}
  //       onCancel={mockOnCancel}
  //     />
  //   );

  //   fireEvent.submit(screen.getByRole('button', { name: /Save Experience/i }));

  //   await waitFor(() => {
  //     expect(screen.getByText('Job title is required')).toBeInTheDocument();
  //   });
  // });
});
