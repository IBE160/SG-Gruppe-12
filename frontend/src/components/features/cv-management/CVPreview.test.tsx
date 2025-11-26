// frontend/src/components/features/cv-management/CVPreview.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import CVPreview from './CVPreview';
import { useCvStore } from '@/store/cvStore';
import { CVData } from '@/types/cv';

// Get the initial state from the store to reset it before each test
const initialStoreState = useCvStore.getState();

describe('CVPreview', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    act(() => {
      useCvStore.setState(initialStoreState);
    });
  });

  it('renders the initial CV data from the store correctly', () => {
    render(<CVPreview />);

    // Check for personal info
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('your.email@example.com')).toBeInTheDocument();

    // Check for an experience entry
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Company')).toBeInTheDocument();

    // Check for an education entry
    expect(screen.getByText('University of Example')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();

    // Check for a skill
    expect(screen.getByText('React')).toBeInTheDocument();

    // Check for a language
    expect(screen.getByText('English:')).toBeInTheDocument();
  });

  it('dynamically updates when the CV data in the store changes', () => {
    render(<CVPreview />);

    // The initial name is "Your Name"
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();

    const newPersonalInfo = {
      firstName: 'Jane',
      lastName: 'Doe',
    };

    // Update the store
    act(() => {
      useCvStore.getState().updatePersonalInfo(newPersonalInfo);
    });

    // Now the component should have re-rendered with the new name
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText('Your Name')).not.toBeInTheDocument();
  });

  it('switches font style based on the template from the store', () => {
    const { container } = render(<CVPreview />);

    // Default template is 'modern', which should use font-sans
    const modernPreview = container.firstChild;
    expect(modernPreview).toHaveClass('font-sans');
    expect(modernPreview).not.toHaveClass('font-serif');
    expect(modernPreview).not.toHaveClass('font-mono');

    // Change template to 'classic'
    act(() => {
      useCvStore.getState().setTemplate('classic');
    });

    // The component should now use font-serif
    const classicPreview = container.firstChild;
    expect(classicPreview).toHaveClass('font-serif');
    expect(classicPreview).not.toHaveClass('font-sans');

     // Change template to 'simple'
     act(() => {
      useCvStore.getState().setTemplate('simple');
    });

    // The component should now use font-mono
    const simplePreview = container.firstChild;
    expect(simplePreview).toHaveClass('font-mono');
    expect(simplePreview).not.toHaveClass('font-serif');
  });
});
