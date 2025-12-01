// frontend/src/components/features/auth/SignupForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SignupForm } from './SignupForm'; // Ensure this path is correct for your component

describe('SignupForm Component', () => {
  const mockOnSubmit = jest.fn();
  const validFormData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    consent_ai_training: false,
    consent_marketing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields and submit button', () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Allow AI training with my (anonymized) data.')).toBeInTheDocument();
    expect(screen.getByLabelText('Receive marketing communications.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('submits valid data correctly', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Fill out the form fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: validFormData.name } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: validFormData.email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: validFormData.password } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: validFormData.confirmPassword } });

    // Simulate clicking the submit button
    const formElement = screen.getByRole('form', { name: /signup form/i }); // Get the form element by accessible name
    fireEvent.submit(formElement); // Trigger form submission

    // Wait for the onSubmit mock to be called with the form data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      // Ensure the mock is called with the collected form values, not a DOM event
      expect(mockOnSubmit).toHaveBeenCalledWith(validFormData);
    });
  });

  it('displays validation errors for empty required fields', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={false} />);

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Password must be at least 12 characters/i)).toHaveLength(2); // For both password fields
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays validation error if passwords do not match', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: validFormData.name } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: validFormData.email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: validFormData.password } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Mismatch123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays error message from props', () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={false} errorMessage="Email already in use" />);
    expect(screen.getByText('Email already in use')).toBeInTheDocument();
  });

  it('disables submit button when isLoading is true', () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={true} />);
    expect(screen.getByRole('button', { name: /Signing Up.../i })).toBeDisabled();
  });
});
