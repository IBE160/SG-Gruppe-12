// frontend/src/components/features/cv-upload/CVUploadForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CVUploadForm } from './CVUploadForm';

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

describe('CVUploadForm Component', () => {
  const mockOnFileUploadSuccess = jest.fn();
  const mockOnFileUploadError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the upload form with file input and submit button', () => {
    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    expect(screen.getByText('Add Your CV')).toBeInTheDocument();
    expect(screen.getByLabelText('CV File')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload and Parse/i })).toBeInTheDocument();
  });

  it('displays validation error when no file is selected', async () => {
    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('CV file is required.')).toBeInTheDocument();
    });

    expect(mockOnFileUploadSuccess).not.toHaveBeenCalled();
    expect(mockOnFileUploadError).not.toHaveBeenCalled();
  });

  it('displays validation error when file size exceeds limit', async () => {
    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Max file size is 5MB.')).toBeInTheDocument();
    });

    expect(mockOnFileUploadSuccess).not.toHaveBeenCalled();
    expect(mockOnFileUploadError).not.toHaveBeenCalled();
  });

  it('displays validation error when file type is not accepted', async () => {
    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const invalidFile = new File(['content'], 'file.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Only PDF, DOCX, DOC, and TXT files are accepted.')).toBeInTheDocument();
    });

    expect(mockOnFileUploadSuccess).not.toHaveBeenCalled();
    expect(mockOnFileUploadError).not.toHaveBeenCalled();
  });

  it('successfully uploads a valid PDF file', async () => {
    const mockCvId = '123';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cvId: mockCvId } }),
    });

    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const validFile = new File(['content'], 'cv.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnFileUploadSuccess).toHaveBeenCalledWith(mockCvId);
    });

    expect(mockOnFileUploadError).not.toHaveBeenCalled();
  });

  it('successfully uploads a valid DOCX file', async () => {
    const mockCvId = '456';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cvId: mockCvId } }),
    });

    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const validFile = new File(['content'], 'cv.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnFileUploadSuccess).toHaveBeenCalledWith(mockCvId);
    });

    expect(mockOnFileUploadError).not.toHaveBeenCalled();
  });

  it('shows loading state during upload', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({ data: { cvId: '789' } }) }), 100))
    );

    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const validFile = new File(['content'], 'cv.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText(/Uploading and parsing\.\.\./i)).toBeInTheDocument();
    });

    // Wait for completion
    await waitFor(() => {
      expect(mockOnFileUploadSuccess).toHaveBeenCalled();
    });
  });

  it('handles upload failure and displays error', async () => {
    const errorMessage = 'Upload failed due to server error';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const validFile = new File(['content'], 'cv.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnFileUploadError).toHaveBeenCalledWith(errorMessage);
    });

    expect(mockOnFileUploadSuccess).not.toHaveBeenCalled();
  });

  it('handles network error during upload', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const validFile = new File(['content'], 'cv.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnFileUploadError).toHaveBeenCalledWith('Network error');
    });

    expect(mockOnFileUploadSuccess).not.toHaveBeenCalled();
  });

  it('disables form inputs during upload', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({ data: { cvId: '999' } }) }), 100))
    );

    render(
      <CVUploadForm
        onFileUploadSuccess={mockOnFileUploadSuccess}
        onFileUploadError={mockOnFileUploadError}
      />
    );

    const fileInput = screen.getByLabelText('CV File');
    const validFile = new File(['content'], 'cv.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const submitButton = screen.getByRole('button', { name: /Upload and Parse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fileInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(mockOnFileUploadSuccess).toHaveBeenCalled();
    });
  });
});
