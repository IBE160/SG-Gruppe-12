// frontend/src/lib/hooks/useJobAnalysis.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useJobAnalysis } from './useJobAnalysis';
import { analyzeJobDescriptionApi } from '@/lib/api/job-analysis';
import { SWRConfig } from 'swr';

// Mock the API call
jest.mock('@/lib/api/job-analysis', () => ({
  analyzeJobDescriptionApi: jest.fn(),
}));

describe('useJobAnalysis', () => {
  const mockJobDescription = 'This is a test job description for analysis.';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct state', () => {
    const { result } = renderHook(() => useJobAnalysis());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
  });

  it('calls analyzeJobDescriptionApi and updates state on success', async () => {
    const mockSuccessResponse = {
      success: true,
      message: 'Analysis initiated',
      data: { status: 'received' },
    };
    (analyzeJobDescriptionApi as jest.Mock).mockResolvedValue(mockSuccessResponse);

    const { result } = renderHook(() => useJobAnalysis());

    await result.current.analyzeJobDescription(mockJobDescription);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(analyzeJobDescriptionApi).toHaveBeenCalledWith(mockJobDescription);
    // Note: SWR's data won't update automatically here without a real SWR cache or revalidation
    // For this test, we primarily check the API call and immediate loading/error states.
  });

  it('handles API error correctly', async () => {
    const mockErrorMessage = 'API failed';
    (analyzeJobDescriptionApi as jest.Mock).mockRejectedValue(new Error(mockErrorMessage));

    const { result } = renderHook(() => useJobAnalysis());

    await waitFor(async () => {
      await expect(result.current.analyzeJobDescription(mockJobDescription)).rejects.toThrow(mockErrorMessage);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(mockErrorMessage);
    expect(analyzeJobDescriptionApi).toHaveBeenCalledWith(mockJobDescription);
  });

  it('sets loading state during API call', async () => {
    (analyzeJobDescriptionApi as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolve

    const { result } = renderHook(() => useJobAnalysis());

    const promise = result.current.analyzeJobDescription(mockJobDescription);

    expect(result.current.isLoading).toBe(true);

    // Clean up the pending promise
    await promise;
  });
});
