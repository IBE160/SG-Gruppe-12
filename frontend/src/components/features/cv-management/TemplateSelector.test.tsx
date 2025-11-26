// frontend/src/components/features/cv-management/TemplateSelector.test.tsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import TemplateSelector from './TemplateSelector';
import { useCvStore } from '@/store/cvStore';

// Get the initial state from the store to reset it before each test
const initialStoreState = useCvStore.getState();

describe('TemplateSelector', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    act(() => {
      useCvStore.setState(initialStoreState);
    });
  });

  it('renders the template selection buttons', () => {
    render(<TemplateSelector />);
    expect(screen.getByRole('button', { name: 'Modern' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Classic' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simple' })).toBeInTheDocument();
  });

  it('highlights the currently active template from the store', () => {
    // The initial template in the store is 'modern'
    render(<TemplateSelector />);
    const modernButton = screen.getByRole('button', { name: 'Modern' });
    const classicButton = screen.getByRole('button', { name: 'Classic' });

    // Check that 'Modern' button has active styles and 'Classic' does not
    expect(modernButton).toHaveClass('bg-blue-600');
    expect(classicButton).not.toHaveClass('bg-blue-600');
  });

  it('updates the store when a new template is selected', () => {
    render(<TemplateSelector />);
    
    // Check initial state
    expect(useCvStore.getState().template).toBe('modern');

    const classicButton = screen.getByRole('button', { name: 'Classic' });
    
    // Click the 'Classic' button
    act(() => {
        fireEvent.click(classicButton);
    });

    // Verify the store has been updated
    expect(useCvStore.getState().template).toBe('classic');

    // The component should re-render and show 'Classic' as active
    expect(classicButton).toHaveClass('bg-blue-600');
    expect(screen.getByRole('button', { name: 'Modern' })).not.toHaveClass('bg-blue-600');
  });
});
