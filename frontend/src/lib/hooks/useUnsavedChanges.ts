// frontend/src/lib/hooks/useUnsavedChanges.ts
import { useEffect } from 'react';

/**
 * Custom hook to warn users about unsaved changes when they try to leave the page
 * @param hasUnsavedChanges - Boolean indicating if there are unsaved changes
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean): void {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    // Add event listener for browser tab close/navigation
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}
