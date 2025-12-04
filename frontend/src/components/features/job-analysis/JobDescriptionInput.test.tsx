// frontend/src/components/features/job-analysis/JobDescriptionInput.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobDescriptionInput } from './JobDescriptionInput';
import { useToast } from '@/components/ui/use-toast';
import { useCvStore } from '@/store/cvStore';

// Mock the analyzeJobDescriptionSchema
jest.mock('@/lib/schemas/job', () => ({
  analyzeJobDescriptionSchema: {
    parse: (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'jobDescription' in data) {
        const jd = (data as { jobDescription: string }).jobDescription;
        if (jd.length < 10) {
          throw new Error('Test: Job description must be at least 10 characters long.');
        }
      }
      return data;
    },
  },
}));

// Mock useCvStore
jest.mock('@/store/cvStore', () => ({
  useCvStore: jest.fn(),
}));

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('JobDescriptionInput', () => {
  const mockOnSubmit = jest.fn();
  const mockSetCV = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockSetCV.mockClear();
    mockToast.mockClear();

    // Mock Zustand store hooks
    (useCvStore as jest.Mock).mockReturnValue({
      cv: null,
      setCV: mockSetCV,
    });

    // Mock useToast hook
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders correctly', () => {
    render(<JobDescriptionInput onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze job description/i })).toBeInTheDocument();
  });

  it('displays error message for invalid input on blur (React Hook Form behavior)', async () => {
    render(<JobDescriptionInput onSubmit={mockOnSubmit} isLoading={false} />);
    const textarea = screen.getByLabelText(/job description/i);
    fireEvent.change(textarea, { target: { value: 'short' } });
    fireEvent.blur(textarea); // Trigger validation on blur

    await waitFor(() => {
      // Adjusted to check for a generic message if the exact wording is controlled by the resolver which is mocked
      expect(screen.getByText(/Job description or URL must be at least 10 characters long/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', async () => {
    render(<JobDescriptionInput onSubmit={mockOnSubmit} isLoading={false} />);
    const textarea = screen.getByLabelText(/job description/i);
    fireEvent.change(textarea, { target: { value: 'This is a valid job description with more than ten characters.' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze job description/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ jobDescription: 'This is a valid job description with more than ten characters.' });
    });
  });

  it('disables the button and shows loading text when isLoading is true', () => {
    render(<JobDescriptionInput onSubmit={mockOnSubmit} isLoading={true} />);
    const button = screen.getByRole('button', { name: /analyzing.../i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Analyzing...');
  });

  it('displays external error message', () => {
    const externalError = 'An external error occurred!';
    render(<JobDescriptionInput onSubmit={mockOnSubmit} isLoading={false} error={externalError} />);
    expect(screen.getByText(externalError)).toBeInTheDocument();
  });
});
