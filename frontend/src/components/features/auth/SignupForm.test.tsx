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
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Allow AI training/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Receive marketing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('submits valid data correctly', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: validFormData.name } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: validFormData.email } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: validFormData.password } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: validFormData.confirmPassword } });

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
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

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: validFormData.name } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: validFormData.email } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: validFormData.password } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Mismatch123!' } });

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
