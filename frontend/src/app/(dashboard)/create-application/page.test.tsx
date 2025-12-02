// frontend/src/app/(dashboard)/create-application/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateApplicationPage from './page';
import { analyzeJobDescriptionApi } from '@/lib/api/job-analysis';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Mock the dependencies
jest.mock('@/lib/api/job-analysis');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('CreateApplicationPage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockAnalyzeJobDescriptionApi = analyzeJobDescriptionApi as jest.MockedFunction<typeof analyzeJobDescriptionApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the page with correct title and description', () => {
    render(<CreateApplicationPage />);

    expect(screen.getByText('Create New Application')).toBeInTheDocument();
    expect(screen.getByText(/Paste or type the job description below/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Job Description' })).toBeInTheDocument();
  });

  it('renders the JobDescriptionInput component', () => {
    render(<CreateApplicationPage />);

    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze job description/i })).toBeInTheDocument();
  });

  it('displays tips section', () => {
    render(<CreateApplicationPage />);

    expect(screen.getByText(/Tips for best results:/i)).toBeInTheDocument();
    expect(screen.getByText(/Include the complete job description/i)).toBeInTheDocument();
  });

  it('successfully submits job description and redirects', async () => {
    mockAnalyzeJobDescriptionApi.mockResolvedValue({
      success: true,
      message: 'Analysis successful',
      data: {},
    });

    render(<CreateApplicationPage />);

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'This is a valid job description with sufficient length for testing purposes.' }
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAnalyzeJobDescriptionApi).toHaveBeenCalledWith(
        'This is a valid job description with sufficient length for testing purposes.'
      );
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success!',
        description: 'Job description has been analyzed successfully.',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/applications');
    });
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to analyze job description';
    mockAnalyzeJobDescriptionApi.mockRejectedValue(new Error(errorMessage));

    render(<CreateApplicationPage />);

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'This is a valid job description for error testing.' }
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays error when API returns unsuccessful response', async () => {
    mockAnalyzeJobDescriptionApi.mockResolvedValue({
      success: false,
      message: 'Server error',
      data: null,
    });

    render(<CreateApplicationPage />);

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'Job description for testing unsuccessful response.' }
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Server error',
        variant: 'destructive',
      });
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockAnalyzeJobDescriptionApi.mockReturnValue(promise as any);

    render(<CreateApplicationPage />);

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'Job description for loading state testing.' }
    });
    fireEvent.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /analyzing.../i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyzing.../i })).toBeDisabled();
    });

    // Resolve the promise
    resolvePromise!({
      success: true,
      message: 'Analysis successful',
      data: {},
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /analyze job description/i })).toBeInTheDocument();
    });
  });
});
