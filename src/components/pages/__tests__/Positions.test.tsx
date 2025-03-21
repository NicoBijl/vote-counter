import { render } from '@testing-library/react';
import { Positions } from '../Positions';
import { Position } from '../../../types';
import '@testing-library/jest-dom';

// Mock the store
const mockStore = {
    positions: [] as Position[],
    setPositions: jest.fn()
};

jest.mock('../../../hooks/usePositionsStore', () => ({
    usePositionsStore: () => mockStore
}));

describe('Positions', () => {
    beforeEach(() => {
        mockStore.positions = [];
        mockStore.setPositions.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<Positions />);
    });
});
