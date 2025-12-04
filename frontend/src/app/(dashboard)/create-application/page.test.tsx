// frontend/src/app/(dashboard)/create-application/page.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreateApplicationPage from './page';
import { analyzeJobDescriptionApi } from '@/lib/api/job-analysis';
import { listCVs } from '@/lib/api/cv';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useJobAnalysisStore } from '@/store/jobAnalysisStore';

// Mock the dependencies
jest.mock('@/lib/api/job-analysis');
jest.mock('@/lib/api/cv');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock the Zustand store's external behavior for testing
// This mock will maintain an internal state that can be updated by setJobAnalysisResult
let mockJobAnalysisResult: any = null;
const mockSetJobAnalysisResult = jest.fn((result) => {
    mockJobAnalysisResult = result;
});
const mockClearJobAnalysisResult = jest.fn(() => {
    mockJobAnalysisResult = null;
});

jest.mock('@/store/jobAnalysisStore', () => ({
  useJobAnalysisStore: jest.fn(() => ({
    jobAnalysisResult: mockJobAnalysisResult,
    setJobAnalysisResult: mockSetJobAnalysisResult,
    clearJobAnalysisResult: mockClearJobAnalysisResult,
  })),
}));

// Mock the MatchScoreGauge component
jest.mock('@/components/features/job-analysis/MatchScoreGauge', () => ({
  MatchScoreGauge: ({ score }: { score: number }) => `MatchScoreGauge: ${score}%`,
}));

describe('CreateApplicationPage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockAnalyzeJobDescriptionApi = analyzeJobDescriptionApi as jest.MockedFunction<typeof analyzeJobDescriptionApi>;
  const mockListCVs = listCVs as jest.MockedFunction<typeof listCVs>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJobAnalysisResult = null; // Reset store state for each test
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    // Ensure useJobAnalysisStore always returns the latest mockJobAnalysisResult
    (useJobAnalysisStore as unknown as jest.Mock).mockImplementation(() => ({
      jobAnalysisResult: mockJobAnalysisResult,
      setJobAnalysisResult: mockSetJobAnalysisResult,
      clearJobAnalysisResult: mockClearJobAnalysisResult,
    }));


    // Default mock for listCVs to return a CV
    mockListCVs.mockResolvedValue([
      { id: 123, personal_info: {}, education: [], experience: [], skills: [], languages: [] },
    ]);
  });

  it('renders loading skeleton initially while fetching CVs', async () => {
    mockListCVs.mockReturnValueOnce(new Promise(() => {})); // Never resolve to keep it in loading state
    render(<CreateApplicationPage />);

    // Expect the loading skeleton to be present
    await waitFor(() => {
        expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    // Expect the main form elements NOT to be present yet
    expect(screen.queryByLabelText(/job description/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /analyze job description/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Tips for best results:/i)).not.toBeInTheDocument();
  });

  it('renders the input form after CVs are loaded', async () => {
    render(<CreateApplicationPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /analyze job description/i })).toBeInTheDocument();
    expect(screen.getByText(/Tips for best results:/i)).toBeInTheDocument();
  });

  it('displays an error if no CVs are found', async () => {
    mockListCVs.mockResolvedValueOnce([]); // No CVs
    render(<CreateApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText(/no cvs found\. please upload a cv first\./i)).toBeInTheDocument();
    });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'No CVs',
      variant: 'destructive',
    }));
    // Ensure the main form is not rendered
    expect(screen.queryByLabelText(/job description/i)).not.toBeInTheDocument();
  });

  it('successfully submits job description and displays results', async () => {
    const mockAnalysisResult = {
      matchScore: 75,
      presentKeywords: ['React', 'TypeScript'],
      missingKeywords: ['Vue.js'],
      strengthsSummary: 'You are strong in X',
      weaknessesSummary: 'You need Y',
      jobRequirements: { keywords: [], skills: [], qualifications: [], responsibilities: [] },
      rawKeywords: [],
      submittedAt: new Date().toISOString(),
      atsScore: 85,
      atsSuggestions: ['Add more keywords'],
      atsQualitativeRating: 'Good' as const,
    };
    mockAnalyzeJobDescriptionApi.mockResolvedValue({
      success: true,
      message: 'Analysis successful',
      data: mockAnalysisResult,
    });

    render(<CreateApplicationPage />);

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'This is a valid job description.' }
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAnalyzeJobDescriptionApi).toHaveBeenCalledWith(
        'This is a valid job description.',
        '123'
      );
    });

    // Simulate Zustand store update and component re-render
    act(() => {
      mockSetJobAnalysisResult(mockAnalysisResult);
      // The mockImplementation is already set in beforeEach, it just needs the internal state to reflect the change
      // No need to re-mock useJobAnalysisStore here, as it's already set up to return mockJobAnalysisResult
    });
    
    // Expect results to be displayed
    await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Job Analysis Results' })).toBeInTheDocument();
        expect(screen.getByText('MatchScoreGauge: 75%')).toBeInTheDocument();
        expect(screen.getByText('Key Strengths')).toBeInTheDocument();
        expect(screen.getByText('You are strong in X')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
        expect(screen.getByText('You need Y')).toBeInTheDocument();
        expect(screen.getByText('Vue.js')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Analyze Another Job' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Generate Tailored Application' })).toBeInTheDocument();
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Success!',
    }));
  });

  it('displays error message when API call fails during submission', async () => {
    const errorMessage = 'Failed to analyze job description';
    mockAnalyzeJobDescriptionApi.mockRejectedValue(new Error(errorMessage));
    render(<CreateApplicationPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'Job description for error testing.' }
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      variant: 'destructive',
    }));
    // Ensure the main form is not rendered
    expect(screen.queryByLabelText(/job description/i)).not.toBeInTheDocument();
  });

  it('displays error when API returns unsuccessful response during submission', async () => {
    mockAnalyzeJobDescriptionApi.mockResolvedValue({
      success: false,
      message: 'Server error',
      data: {} as any,
    });
    render(<CreateApplicationPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'Job description for testing unsuccessful response.' }
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Server error')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      description: 'Server error',
      variant: 'destructive',
    }));
    // Ensure the main form is not rendered
    expect(screen.queryByLabelText(/job description/i)).not.toBeInTheDocument();
  });

  it('handles "Analyze Another Job" button click to reset view', async () => {
    const mockAnalysisResult = {
      matchScore: 75,
      presentKeywords: [],
      missingKeywords: [],
      strengthsSummary: '',
      weaknessesSummary: '',
      jobRequirements: { keywords: [], skills: [], qualifications: [], responsibilities: [] },
      rawKeywords: [],
      submittedAt: new Date().toISOString(),
      atsScore: 85,
      atsSuggestions: [],
      atsQualitativeRating: 'Good' as const,
    };
    mockAnalyzeJobDescriptionApi.mockResolvedValue({
      success: true,
      message: 'Analysis successful',
      data: mockAnalysisResult,
    });

    render(<CreateApplicationPage />);

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/job description/i);
    const submitButton = screen.getByRole('button', { name: /analyze job description/i });

    fireEvent.change(textarea, {
      target: { value: 'Job description to analyze and then reset.' }
    });
    fireEvent.click(submitButton);

    // Simulate Zustand store update and component re-render
    act(() => {
      mockSetJobAnalysisResult(mockAnalysisResult);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Job Analysis Results' })).toBeInTheDocument();
    });

    const analyzeAnotherButton = screen.getByRole('button', { name: 'Analyze Another Job' });
    fireEvent.click(analyzeAnotherButton);

    // Simulate Zustand store clear and component re-render
    act(() => {
      mockClearJobAnalysisResult();
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create New Application' })).toBeInTheDocument();
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });
  });
});
