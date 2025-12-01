// frontend/src/components/features/cv-management/CVVersionHistory.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CVVersionHistory from './CVVersionHistory';
import { useCvStore } from '@/store/cvStore';
import * as api from '@/lib/api/cv';

// Mock the API client
jest.mock('@/lib/api/cv', () => ({
  listCvVersions: jest.fn(),
  getCvVersionDetails: jest.fn(),
  restoreCvVersion: jest.fn(),
}));

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe('CVVersionHistory Component', () => {
  const mockCvId = 'mock-cv-id';
  const mockVersions = [
    { versionNumber: 1, createdAt: '2023-01-01T10:00:00Z' },
    { versionNumber: 2, createdAt: '2023-01-01T11:00:00Z' },
  ];
  const mockCvData = { personal_info: { firstName: 'John' } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCvStore.setState({ cv: null, setCV: jest.fn() }); // Reset Zustand store
    (api.listCvVersions as jest.Mock).mockResolvedValue(mockVersions);
    (api.getCvVersionDetails as jest.Mock).mockResolvedValue(mockCvData);
    (api.restoreCvVersion as jest.Mock).mockResolvedValue(mockCvData);
    global.confirm = jest.fn(() => true); // Mock confirm for restore
  });

  it('renders a list of CV versions', async () => {
    render(<CVVersionHistory cvId={mockCvId} />);
    
    await waitFor(() => {
      expect(api.listCvVersions).toHaveBeenCalledWith(mockCvId);
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });
  });

  it('calls setCV with version details when "View" is clicked', async () => {
    const setCvSpy = jest.spyOn(useCvStore.getState(), 'setCV');
    render(<CVVersionHistory cvId={mockCvId} />);

    // Wait for the versions to be loaded and the button to be enabled
    const viewButton = await screen.findByRole('button', { name: 'View Version 1' });
    await waitFor(() => expect(viewButton).not.toBeDisabled());

    fireEvent.click(viewButton); // Click view on Version 1

    await waitFor(() => {
      expect(api.getCvVersionDetails).toHaveBeenCalledWith(mockCvId, 1);
      expect(setCvSpy).toHaveBeenCalledWith(mockCvData);
    });
  });

  it('calls restoreCvVersion and updates CV store when "Restore" is clicked', async () => {
    const setCvSpy = jest.spyOn(useCvStore.getState(), 'setCV');
    render(<CVVersionHistory cvId={mockCvId} />);

    const restoreButton = await screen.findByRole('button', { name: 'Restore Version 1' });
    await waitFor(() => expect(restoreButton).not.toBeDisabled());

    fireEvent.click(restoreButton); // Click restore on Version 1

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledTimes(1);
      expect(api.restoreCvVersion).toHaveBeenCalledWith(mockCvId, 1);
      expect(setCvSpy).toHaveBeenCalledWith(mockCvData);
    });
  });
});
