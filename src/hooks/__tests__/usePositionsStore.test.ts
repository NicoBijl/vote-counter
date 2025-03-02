import { usePositionsStore } from '../usePositionsStore';
import { act } from '@testing-library/react';
import { Position } from '../../types';

describe('usePositionsStore', () => {
    beforeEach(() => {
        // Clear storage and reset store before each test
        localStorage.clear();
        const store = usePositionsStore.getState();
        store.setPositions([]);
    });

    it('should migrate from version 0 to version 1', async () => {
        // Set up version 0 state in localStorage
        const oldState = {
            state: {
                positions: [{
                    key: "test",
                    title: "Test Position",
                    persons: [],
                    max: 2
                }]
            },
            version: 0
        };
        localStorage.setItem('positions-store', JSON.stringify(oldState));

        // Initialize store which should trigger migration
        let state = usePositionsStore.getState();
        await act(async () => {
            // Wait for any async operations to complete
            await new Promise(resolve => setTimeout(resolve, 0));
            state = usePositionsStore.getState();
        });

        // Verify migration
        expect(state.positions).toHaveLength(1);
        expect(state.positions[0]).toEqual({
            key: "test",
            title: "Test Position",
            persons: [],
            maxVotesPerBallot: 2,
            maxVacancies: 2
        });
    });

    it('should preserve positions after migration', async () => {
        // Set up state with positions
        const positions = [{
            key: "test",
            title: "Test Position",
            persons: [],
            maxVotesPerBallot: 2,
            maxVacancies: 1
        }];

        await act(async () => {
            usePositionsStore.getState().setPositions(positions);
            // Wait for any async operations to complete
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Re-initialize store
        let state = usePositionsStore.getState();
        await act(async () => {
            // Wait for any async operations to complete
            await new Promise(resolve => setTimeout(resolve, 0));
            state = usePositionsStore.getState();
        });

        // Verify positions are preserved
        expect(state.positions).toEqual(positions);
    });

    it('should persist positions after page reload', async () => {
        // This test reproduces the bug where positions are lost after page reload
        
        // Setup: Set custom positions
        const customPositions: Position[] = [{
            key: "custom",
            title: "Custom Position",
            persons: [{ key: "person1", name: "Person 1" }],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        }];
        
        // Act: Set positions in the store
        act(() => {
            usePositionsStore.getState().setPositions(customPositions);
        });
        
        // Verify positions were set
        expect(usePositionsStore.getState().positions).toEqual(customPositions);
        
        // Simulate page reload by recreating the store
        // This should read from localStorage if persistence is working correctly
        
        // Get the stored data directly from localStorage
        const storedData = localStorage.getItem('positions-store');
        expect(storedData).not.toBeNull();
        
        // Clear the store's state in memory (but not localStorage)
        // This simulates what happens during a page reload
        usePositionsStore.setState({ positions: [] });
        
        // Now the store should be empty
        expect(usePositionsStore.getState().positions).toHaveLength(0);
        
        // Force rehydration from localStorage
        // This should restore the positions if persistence is working
        await act(async () => {
            // Trigger rehydration
            const saved = JSON.parse(localStorage.getItem('positions-store')!);
            usePositionsStore.setState(saved.state);
            
            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 50));
        });
        
        // Assert: Positions should be restored from localStorage
        expect(usePositionsStore.getState().positions).toEqual(customPositions);
    });
});
