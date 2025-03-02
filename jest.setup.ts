import '@testing-library/jest-dom';
import { jest, beforeEach } from '@jest/globals';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(() => null),
  length: 0
} as Storage & {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  key: jest.Mock;
};

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset all mocks before each test
beforeEach(() => {
  (localStorageMock.clear as jest.Mock).mockClear();
  (localStorageMock.getItem as jest.Mock).mockClear();
  (localStorageMock.setItem as jest.Mock).mockClear();
});
