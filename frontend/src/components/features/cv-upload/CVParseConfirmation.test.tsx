// frontend/src/components/features/cv-upload/CVParseConfirmation.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CVParseConfirmation } from './CVParseConfirmation';

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('CVParseConfirmation Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const mockCvId = '123';

  const mockCvData = {
    personal_info: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      linkedin: 'https://linkedin.com/in/johndoe',
      portfolio: 'https://johndoe.com',
    },
    experience: [
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco',
        start_date: '2020-01',
        end_date: '2023-06',
        description: 'Developed web applications',
      },
    ],
    education: [
      {
        institution: 'University of Tech',
        degree: 'Bachelor of Science',
        location: 'Boston',
        start_date: '2016-09',
        end_date: '2020-05',
        description: 'Computer Science',
      },
    ],
    skills: [
      {
        name: 'JavaScript',
        proficiency: 'advanced',
        keywords: ['React', 'Node.js'],
      },
    ],
    languages: [
      {
        name: 'English',
        proficiency: 'native',
      },
    ],
    summary: 'Experienced software engineer with a passion for web development.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading state while fetching CV data', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    expect(screen.getByText('Loading parsed CV data...')).toBeInTheDocument();
  });

  it('displays error state when fetching CV data fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading CV')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch parsed CV data')).toBeInTheDocument();
    });
  });

  it('renders editable form with fetched CV data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCvData }),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    // Check personal info fields
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();

    // Check experience fields
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tech Corp')).toBeInTheDocument();

    // Check education fields
    expect(screen.getByDisplayValue('University of Tech')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bachelor of Science')).toBeInTheDocument();

    // Check skills
    expect(screen.getByDisplayValue('JavaScript')).toBeInTheDocument();

    // Check languages
    expect(screen.getByDisplayValue('English')).toBeInTheDocument();

    // Check summary
    expect(screen.getByDisplayValue('Experienced software engineer with a passion for web development.')).toBeInTheDocument();
  });

  it('allows editing personal information fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCvData }),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
  });

  it('allows adding new experience entry', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCvData }),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    const addExperienceButton = screen.getByRole('button', { name: /Add Experience/i });
    fireEvent.click(addExperienceButton);

    await waitFor(() => {
      expect(screen.getByText('Experience 2')).toBeInTheDocument();
    });
  });

  it('allows removing experience entry', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCvData }),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Remove Experience 1' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Software Engineer')).not.toBeInTheDocument();
    });
  });

  it('allows adding new skill entry', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCvData }),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    const addSkillButton = screen.getByRole('button', { name: /Add Skill/i });
    fireEvent.click(addSkillButton);

    await waitFor(() => {
      const skillInputs = screen.getAllByLabelText(/Skill Name/i);
      expect(skillInputs.length).toBe(2);
    });
  });

  it('submits edited CV data successfully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCvData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Confirm & Save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/cvs/${mockCvId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('handles save error gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCvData }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Confirm & Save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  it('shows saving state during submit', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCvData }),
      })
      .mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({ success: true }) }), 100))
      );

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Confirm & Save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('renders cancel button when onCancel is provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCvData }),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates required fields on submit', async () => {
    const minimalData = {
      personal_info: {},
      experience: [{ title: '', company: '', location: '', start_date: '', end_date: '', description: '' }],
      education: [],
      skills: [],
      languages: [],
      summary: '',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: minimalData }),
    });

    render(<CVParseConfirmation cvId={mockCvId} onConfirm={mockOnConfirm} />);

    await waitFor(() => {
      expect(screen.getByText('Review & Edit Your CV Data')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Confirm & Save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Job title is required')).toBeInTheDocument();
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
    });

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
