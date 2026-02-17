import { usePositionsStore, _positionsStoreMigration } from '../usePositionsStore';
import { Position } from '../../types';

describe('usePositionsStore', () => {
    beforeEach(() => {
        // Reset the store before each test to ensure defaults
        const defaultPositions = [
            {
                maxVotesPerBallot: 1,
                maxVacancies: 1,
                key: "diaken",
                title: "Diaken",
                persons: [
                    {key: "diaken1", name: "Diaken 1"},
                    {key: "diaken2", name: "Diaken 2"}
                ]
            },
            {
                maxVotesPerBallot: 2,
                maxVacancies: 2,
                key: "ouderling",
                title: "Ouderling",
                persons: [
                    {key: "ouderling1", name: "Ouderling 1"},
                    {key: "ouderling2", name: "Ouderling 2"},
                    {key: "ouderling3", name: "Ouderling 3"},
                    {key: "ouderling4", name: "Ouderling 4"}
                ]
            },
            {
                maxVotesPerBallot: 1,
                maxVacancies: 1,
                key: "secretaris",
                title: "Secretaris",
                persons: [
                    {key: "sec1", name: "Secretaris 1"}
                ]
            }
        ] as Array<Position>;
        usePositionsStore.getState().setPositions(defaultPositions);
        jest.clearAllMocks();
    });

    it('should have the default positions initially', () => {
        const store = usePositionsStore.getState();
        expect(store.positions.length).toBe(3);
        expect(store.positions[0].key).toBe('diaken');
    });
    
    it('should successfully update positions', () => {
        const customPositions: Position[] = [{
            key: "custom",
            title: "Custom Position",
            persons: [{ key: "person1", name: "Person 1" }],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        }];
        
        usePositionsStore.getState().setPositions(customPositions);
        
        const updatedPositions = usePositionsStore.getState().positions;
        expect(updatedPositions).toEqual(customPositions);
    });

    describe('migrate', () => {
        it('should return default positions if persistedState is null', () => {
            const result = _positionsStoreMigration(null, 1);
            expect(result.positions).toBeDefined();
            expect(result.positions.length).toBeGreaterThan(0);
        });

        it('should migrate from version 0', () => {
            const oldState = {
                positions: [
                    {
                        key: 'legacy',
                        title: 'Legacy',
                        persons: [],
                        max: 5
                    }
                ]
            };
            const result = _positionsStoreMigration(oldState, 0);
            expect(result.positions[0].maxVotesPerBallot).toBeDefined();
            expect(result.positions[0].maxVacancies).toBeDefined();
        });

        it('should migrate if positions is missing from state', () => {
            const oldState = { someOtherData: true };
            const result = _positionsStoreMigration(oldState, 1);
            expect(result.positions).toBeDefined();
            expect(result.positions.length).toBeGreaterThan(0);
        });

        it('should ensure position format for other versions', () => {
            const state = {
                positions: [
                    {
                        key: 'v1',
                        title: 'Version 1',
                        persons: [],
                        maxVotesPerBallot: 2,
                        maxVacancies: 2
                    }
                ]
            };
            const result = _positionsStoreMigration(state, 1);
            expect(result.positions[0].key).toBe('v1');
            expect(result.positions[0].maxVotesPerBallot).toBe(2);
        });
    });
});
