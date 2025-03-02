import { usePositionsStore } from './usePositionsStore';
import { Position } from '../types';

interface StoreData {
    positions: Array<Partial<Position> & { max?: number }>;
}

describe('usePositionsStore', () => {
    beforeEach(() => {
        // Clear localStorage and reset store before each test
        localStorage.clear();
        usePositionsStore.setState({ positions: [] });
    });

    const initializeStore = async (data: StoreData) => {
        // Reset store and localStorage
        localStorage.clear();
        usePositionsStore.setState({ positions: [] });

        // Set up test data in localStorage
        localStorage.setItem('positions-store', JSON.stringify(data));

        // Reset store to trigger rehydration
        usePositionsStore.setState({ positions: [] }, true);

        // Wait for next tick to allow rehydration
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get store state after rehydration
        const state = usePositionsStore.getState();

        // Verify test data was loaded
        if (state.positions.length === 0 || state.positions[0].key !== data.positions[0].key) {
            throw new Error('Store rehydration failed');
        }

        return state;
    };

    it('should migrate position without maxVacancies by setting it equal to maxVotesPerBallot', async () => {
        jest.setTimeout(10000);
        // Setup: Store position data without maxVacancies
        const oldData = {
            positions: [{
                maxVotesPerBallot: 2,
                key: "test",
                title: "Test Position",
                persons: []
            }]
        };

        const store = await initializeStore(oldData);

        // Verify maxVacancies was set correctly
        expect(store.positions[0].maxVacancies).toBe(2);
    });

    it('should maintain existing maxVacancies value when already set', async () => {
        jest.setTimeout(10000);
        // Setup: Store position data with existing maxVacancies
        const existingData = {
            positions: [{
                maxVotesPerBallot: 2,
                maxVacancies: 3,
                key: "test",
                title: "Test Position",
                persons: []
            }]
        };

        const store = await initializeStore(existingData);

        // Verify maxVacancies wasn't changed
        expect(store.positions[0].maxVacancies).toBe(3);
    });

    it('should handle migration from max to maxVotesPerBallot and set maxVacancies', async () => {
        jest.setTimeout(10000);
        // Setup: Store position data with old 'max' property
        const oldData = {
            positions: [{
                max: 2,
                key: "test",
                title: "Test Position",
                persons: []
            }]
        };

        const store = await initializeStore(oldData);

        // Verify both migrations happened correctly
        expect(store.positions[0].maxVotesPerBallot).toBe(2);
        expect(store.positions[0].maxVacancies).toBe(2);
        expect('max' in store.positions[0]).toBe(false);
    });
});
