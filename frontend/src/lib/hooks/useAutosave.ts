// frontend/src/lib/hooks/useAutosave.ts
import { useRef, useCallback } from 'react';

/**
 * Custom hook for debounced autosave functionality
 * @param callback - The async function to call when autosaving
 * @param delay - Delay in milliseconds before triggering autosave (default: 3000ms)
 * @returns A function that triggers autosave with debouncing
 */
export function useAutosave<T>(
  callback: (data: T) => Promise<void>,
  delay: number = 3000
): (data: T) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (data: T) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(data);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedSave;
}
