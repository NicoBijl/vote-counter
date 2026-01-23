import { usePositionsStore } from './usePositionsStore';
import { Position } from '../types';
import { convertLegacyPositions } from '../utils/positionUtils';

interface StoreData {
    positions: Array<Partial<Position> & { max?: number }>;
}

describe('usePositionsStore', () => {
    beforeEach(() => {
        // Clear localStorage and reset store before each test
        localStorage.clear();
        usePositionsStore.setState({ positions: [] });
    });

    // Test the migrate function directly by using convertLegacyPositions
    const testMigration = (data: StoreData) => {
        // Convert positions using the same function that migrate uses
        const migratedPositions = convertLegacyPositions(data.positions);

        // Update the store with the migrated positions
        usePositionsStore.setState({ positions: migratedPositions });

        // Return the store state for assertions
        return usePositionsStore.getState();
    };

    it('should migrate position without maxVacancies by setting it equal to maxVotesPerBallot', () => {
        // Setup: Position data without maxVacancies
        const oldData = {
            positions: [{
                maxVotesPerBallot: 2,
                key: "test",
                title: "Test Position",
                persons: []
            }]
        };

        const store = testMigration(oldData);

        // Verify maxVacancies was set correctly
        expect(store.positions[0].maxVacancies).toBe(2);
    });

    it('should maintain existing maxVacancies value when already set', () => {
        // Setup: Position data with existing maxVacancies
        const existingData = {
            positions: [{
                maxVotesPerBallot: 2,
                maxVacancies: 3,
                key: "test",
                title: "Test Position",
                persons: []
            }]
        };

        const store = testMigration(existingData);

        // Verify maxVacancies wasn't changed
        expect(store.positions[0].maxVacancies).toBe(3);
    });

    it('should handle migration from max to maxVotesPerBallot and set maxVacancies', () => {
        // Setup: Position data with old 'max' property
        const oldData = {
            positions: [{
                max: 2,
                key: "test",
                title: "Test Position",
                persons: []
            }]
        };

        const store = testMigration(oldData);

        // Verify both migrations happened correctly
        expect(store.positions[0].maxVotesPerBallot).toBe(2);
        expect(store.positions[0].maxVacancies).toBe(2);
        expect('max' in store.positions[0]).toBe(false);
    });
});
