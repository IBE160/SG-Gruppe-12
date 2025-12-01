// frontend/src/components/features/auth/LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from './LoginForm'; // Ensure this path is correct for your component

describe('LoginForm Component', () => {
  const mockOnSubmit = jest.fn();
  const validFormData = {
    email: 'test@example.com',
    password: 'SecurePassword123!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields and submit button', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByPlaceholderText('m@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('submits valid data correctly', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    fireEvent.change(screen.getByPlaceholderText('m@example.com'), { target: { value: validFormData.email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: validFormData.password } });

    fireEvent.submit(screen.getByRole('form', { name: /login form/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(validFormData);
    });
  });

  it('displays validation errors for empty required fields', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    fireEvent.submit(screen.getByRole('form', { name: /login form/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays error message from props', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} errorMessage="Invalid credentials" />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('disables submit button when isLoading is true', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
    expect(screen.getByRole('button', { name: /Logging In.../i })).toBeDisabled();
  });
});
