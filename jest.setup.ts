import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { jest, beforeEach } from '@jest/globals';

declare global {
  namespace jest {
    interface Matchers<R = void> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

// Mock zustand/middleware
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('zustand/middleware', () => ({
  persist: (config: any, options: any) => (set: any, get: any) => {
    // Initialize with the config state
    const state = config(set, get);

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
    set = (...args: any) => {
      originalSet(...args);
      const state = get();
      localStorage.setItem(options.name, JSON.stringify({
        state,
        version: options.version
      }));
    };

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
  createJSONStorage: (getStorage: any) => ({
    getItem: (name: string) => {
      const str = getStorage().getItem(name);
      return str ? JSON.parse(str) : null;
    },
    setItem: (name: string, value: any) => {
      getStorage().setItem(name, JSON.stringify(value));
    },
    removeItem: (name: string) => {
      getStorage().removeItem(name);
    }
  })
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
