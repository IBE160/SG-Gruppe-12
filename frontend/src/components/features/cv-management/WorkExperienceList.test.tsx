// frontend/src/components/features/cv-management/WorkExperienceList.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkExperienceList from './WorkExperienceList';
import { ExperienceEntry } from '@/types/cv';

describe('WorkExperienceList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockExperiences: ExperienceEntry[] = [
    {
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      startDate: '2020-01-01',
      endDate: '2022-12-31',
      description: 'Developed amazing things.',
    },
    {
      title: 'Senior Engineer',
      company: 'Innovate LLC',
      location: 'New York, NY',
      startDate: '2023-01-01',
      endDate: '', // Present
      description: 'Led a team of developers.',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a message when no experiences are provided', () => {
    render(<WorkExperienceList experiences={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} isLoading={false} />);
    expect(screen.getByText('No work experience added yet.')).toBeInTheDocument();
  });

  it('renders a list of work experiences', () => {
    render(<WorkExperienceList experiences={mockExperiences} onEdit={mockOnEdit} onDelete={mockOnDelete} isLoading={false} />);
    
    expect(screen.getByText('Software Engineer at Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer at Innovate LLC')).toBeInTheDocument();
    expect(screen.getByText('2020-01-01 - 2022-12-31')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01 - Present')).toBeInTheDocument();
  });

  it('calls onEdit with the correct index when the edit button is clicked', () => {
    render(<WorkExperienceList experiences={mockExperiences} onEdit={mockOnEdit} onDelete={mockOnDelete} isLoading={false} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[1]); // Click edit on the second item

    expect(mockOnEdit).toHaveBeenCalledWith(1);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete with the correct index when the delete button is clicked', () => {
    render(<WorkExperienceList experiences={mockExperiences} onEdit={mockOnEdit} onDelete={mockOnDelete} isLoading={false} />);

    const deleteButtons = screen.getAllByRole('button', { name: /trash/i });
    fireEvent.click(deleteButtons[0]); // Click delete on the first item

    expect(mockOnDelete).toHaveBeenCalledWith(0);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isLoading is true', () => {
    render(<WorkExperienceList experiences={mockExperiences} onEdit={mockOnEdit} onDelete={mockOnDelete} isLoading={true} />);

    const allButtons = screen.getAllByRole('button');
    allButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});