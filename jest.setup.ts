import '@testing-library/jest-dom';
import { jest, beforeEach } from '@jest/globals';

// Make TypeScript aware of jest-dom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeVisible(): R;
      toContainElement(element: Element | null): R;
      toContainHTML(htmlText: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, unknown>): R;
      toHaveStyle(css: string | Record<string, unknown>): R;
      toHaveTextContent(text: string | RegExp, options?: {normalizeWhitespace: boolean}): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text?: string | RegExp): R;
    }
  }
}


// Mock zustand/middleware
jest.mock('zustand/middleware', () => ({
  persist: (config: (set: (state: unknown) => void, get: () => unknown) => unknown, options: { name: string; version: number; migrate?: (persistedState: unknown, version: number) => unknown; onRehydrateStorage?: () => (state: unknown) => void }) => (set: (state: unknown) => void, get: () => unknown) => {
    // Initialize with the config state
    const state = config(set, get) as Record<string, unknown>;

    // Configure storage (we'll use localStorage directly in tests)

    // Load state from storage
    try {
      const storedState = localStorage.getItem(options.name);
      if (storedState) {
        const parsed = JSON.parse(storedState);
        const version = parsed.version ?? 0;

        // Handle migration if needed
        if (options.migrate && version !== options.version) {
          const migrated = options.migrate(parsed.state, version);
          set(migrated);
        } else {
          // If no migration needed, just set the state
          set(parsed.state);
        }

        // Save migrated state back to localStorage
        localStorage.setItem(options.name, JSON.stringify({
          state: get(),
          version: options.version
        }));
      }
    } catch (e) {
      console.error('Error handling stored state:', e);
    }

    // Set up a subscription to persist state changes
    const originalSet = set;
    const mockedSet = (nextState: unknown) => {
      originalSet(nextState);
      const state = get();
      localStorage.setItem(options.name, JSON.stringify({
        state,
        version: options.version
      }));
    };
    set = mockedSet;

    // Handle onRehydrateStorage
    if (options.onRehydrateStorage) {
      const onRehydrateStorage = options.onRehydrateStorage();
      if (onRehydrateStorage) {
        onRehydrateStorage(get());
      }
    }

    return {
      ...state,
      // Add persist methods
      persist: {
        setOptions: () => {},
        clearStorage: () => {
          localStorage.removeItem(options.name);
        },
        rehydrate: () => Promise.resolve(),
        hasHydrated: () => true,
      }
    };
  },
  createJSONStorage: (getStorage: () => Storage) => ({
    getItem: (name: string) => {
      const str = getStorage().getItem(name);
      return str ? JSON.parse(str) : null;
    },
    setItem: (name: string, value: unknown) => {
      getStorage().setItem(name, JSON.stringify(value));
    },
    removeItem: (name: string) => {
      getStorage().removeItem(name);
    }
  })
}));

// Mock react-hotkeys-hook
jest.mock('react-hotkeys-hook', () => ({
  useHotkeys: jest.fn(),
  isHotkeyPressed: jest.fn(),
}));

// Mock localStorage with a working implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() { 
      return Object.keys(store).length; 
    }
  } as Storage & {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
    key: jest.Mock;
  };
})();

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset all mocks before each test
beforeEach(() => {
  (localStorageMock.clear as jest.Mock).mockClear();
  (localStorageMock.getItem as jest.Mock).mockClear();
  (localStorageMock.setItem as jest.Mock).mockClear();
});
