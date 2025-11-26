// frontend/src/components/features/cv-management/WorkExperienceList.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkExperienceList } from './WorkExperienceList';
import { useToast } from '@/components/ui/use-toast'; // Mock useToast

// Mock WorkExperienceForm component to avoid testing its internal logic here
jest.mock('./WorkExperienceForm', () => ({
  WorkExperienceForm: jest.fn(({ initialData, onSave, onCancel, isSaving }) => (
    <form data-testid="mock-form">
      <input data-testid="mock-title" value={initialData?.title || ''} onChange={(e) => {}} />
      <button type="button" onClick={() => onSave(initialData || { title: 'New', company: 'XYZ', startDate: '2023-01-01' } as any)}>Save Mock</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel Mock</button>}
    </form>
  )),
}));

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe('WorkExperienceList', () => {
  const mockCvId = 'testCvId';
  const mockExperience = [
    { title: 'Engineer', company: 'ABC Inc.', startDate: '2018-01-01', endDate: '2020-12-31', location: 'City', description: 'desc1' },
    { title: 'Senior Engineer', company: 'XYZ Corp.', startDate: '2021-01-01', location: 'City', description: 'desc2' },
  ];
  const mockOnAdd = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('renders existing work experience entries', () => {
    render(
      <WorkExperienceList
        cvId={mockCvId}
        experience={mockExperience}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Engineer at ABC Inc.')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer at XYZ Corp.')).toBeInTheDocument();
  });

  it('shows WorkExperienceForm when adding new entry', () => {
    render(
      <WorkExperienceList
        cvId={mockCvId}
        experience={[]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('mock-form')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cancel Mock/i })).not.toBeInTheDocument(); // No cancel when adding fresh
  });

  it('enters edit mode when edit button is clicked', async () => {
    render(
      <WorkExperienceList
        cvId={mockCvId}
        experience={mockExperience}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Click edit button for the first entry
    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);

    await waitFor(() => {
      expect(screen.getAllByTestId('mock-form').length).toBe(1); // Only the editing form is visible
      expect(screen.getByTestId('mock-title')).toHaveValue('Engineer');
      expect(screen.getByRole('button', { name: /Cancel Mock/i })).toBeInTheDocument();
    });
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    window.confirm = jest.fn(() => true); // Mock window.confirm to return true

    render(
      <WorkExperienceList
        cvId={mockCvId}
        experience={mockExperience}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getAllByRole('button', { name: /trash/i })[0]); // Click delete for first entry

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(0);
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
    });
  });

  it('does not call onDelete when delete is cancelled', async () => {
    window.confirm = jest.fn(() => false); // Mock window.confirm to return false

    render(
      <WorkExperienceList
        cvId={mockCvId}
        experience={mockExperience}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getAllByRole('button', { name: /trash/i })[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(onDelete).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  it('calls onAdd when new experience form is submitted', async () => {
    render(
      <WorkExperienceList
        cvId={mockCvId}
        experience={[]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Save Mock/i })); // Simulate submitting the new form

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ title: 'New' }));
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
    });
  });

  it('calls onUpdate when editing form is submitted', async () => {
    render(
      <WorkExperienceList
        cvId={mockCvId}
        experience={mockExperience}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]); // Enter edit mode

    const { WorkExperienceForm } = require('./WorkExperienceForm');
    // Simulate saving the edited form
    fireEvent.click(screen.getByRole('button', { name: /Save Mock/i }));


    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(0, expect.objectContaining({ title: 'Engineer' }));
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
    });
  });
});
