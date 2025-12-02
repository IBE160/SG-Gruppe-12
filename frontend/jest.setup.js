require('@testing-library/jest-dom');
const React = require('react');

// Make React available globally
global.React = React;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Zustand stores
jest.mock('@/store/cvStore', () => ({
  useCvStore: jest.fn((selector) => {
    const state = {
      cv: null,
      setCV: jest.fn(),
      updatePersonalInfo: jest.fn(),
      updateExperience: jest.fn(),
      updateEducation: jest.fn(),
      updateSkills: jest.fn(),
      updateLanguages: jest.fn(),
      reset: jest.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

jest.mock('@/store/uiStore', () => ({
  useUiStore: jest.fn((selector) => {
    const state = {
      hasUnsavedChanges: false,
      setHasUnsavedChanges: jest.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Warning: useLayoutEffect') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
