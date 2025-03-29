import { usePositionsStore } from '../usePositionsStore';
import { Position } from '../../types';

// We need a simple test to verify our implementation is working
// The actual fix will be tested in the real application

describe('usePositionsStore', () => {
    it('should have the default positions initially', () => {
        const store = usePositionsStore.getState();
        expect(store.positions.length).toBeGreaterThan(0);
        expect(store.positions[0].key).toBe('diaken');
    });
    
    it('should successfully update positions', () => {
        // Create custom positions
        const customPositions: Position[] = [{
            key: "custom",
            title: "Custom Position",
            persons: [{ key: "person1", name: "Person 1" }],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        }];
        
        // Update store with custom positions
        usePositionsStore.getState().setPositions(customPositions);
        
        // Verify positions were updated in the store
        const updatedPositions = usePositionsStore.getState().positions;
        expect(updatedPositions).toEqual(customPositions);
    });
});
