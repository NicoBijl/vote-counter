import { useBallotStore, createNewBallot } from '../useBallotStore';
import { act } from '@testing-library/react';

describe('useBallotStore', () => {
    beforeEach(() => {
        act(() => {
            useBallotStore.getState().removeAllBallots();
        });
    });

    it('should initialize with a default ballot', () => {
        const state = useBallotStore.getState();
        expect(state.ballots).toHaveLength(1);
        expect(state.currentBallotIndex).toBe(0);
        expect(state.ballots[0].index).toBe(0);
    });

    it('should add a ballot', () => {
        const newBallot = createNewBallot(1);
        act(() => {
            useBallotStore.getState().addBallot(newBallot);
        });
        const state = useBallotStore.getState();
        expect(state.ballots).toHaveLength(2);
        expect(state.ballots[1]).toEqual(newBallot);
    });

    it('should remove a ballot and recalculate indexes', () => {
        act(() => {
            useBallotStore.getState().addBallot(createNewBallot(1));
            useBallotStore.getState().addBallot(createNewBallot(2));
        });
        
        let state = useBallotStore.getState();
        expect(state.ballots).toHaveLength(3);

        act(() => {
            useBallotStore.getState().removeBallot(state.ballots[1]);
        });

        state = useBallotStore.getState();
        expect(state.ballots).toHaveLength(2);
        expect(state.ballots[0].index).toBe(0);
        expect(state.ballots[1].index).toBe(1);
    });

    it('should not remove the last remaining ballot', () => {
        const state = useBallotStore.getState();
        act(() => {
            useBallotStore.getState().removeBallot(state.ballots[0]);
        });
        expect(useBallotStore.getState().ballots).toHaveLength(1);
    });

    it('should set vote index', () => {
        act(() => {
            useBallotStore.getState().setVoteIndex(5);
        });
        expect(useBallotStore.getState().currentBallotIndex).toBe(5);
    });

    it('should save a vote (replace existing ballot by index)', () => {
        const updatedBallot = { index: 0, vote: [{ position: 'pos1', person: 'pers1' }] } as any;
        act(() => {
            useBallotStore.getState().saveVote(updatedBallot);
        });
        const state = useBallotStore.getState();
        expect(state.ballots).toHaveLength(1);
        expect(state.ballots[0].vote).toEqual(updatedBallot.vote);
    });

    it('should handle setBallotVote - adding a vote', () => {
        act(() => {
            useBallotStore.getState().setBallotVote(0, 'pos1', 'pers1', true);
        });
        const state = useBallotStore.getState();
        expect(state.ballots[0].vote).toContainEqual({ position: 'pos1', person: 'pers1' });
    });

    it('should handle setBallotVote - invalid vote logic', () => {
        act(() => {
            useBallotStore.getState().setBallotVote(0, 'pos1', 'pers1', true);
            useBallotStore.getState().setBallotVote(0, 'pos1', 'invalid', true);
        });
        const state = useBallotStore.getState();
        const pos1Votes = state.ballots[0].vote.filter(v => v.position === 'pos1');
        expect(pos1Votes).toHaveLength(1);
        expect(pos1Votes[0].person).toBe('invalid');
    });

    it('should handle setBallotVote - removing invalid when a normal person is checked', () => {
        act(() => {
            useBallotStore.getState().setBallotVote(0, 'pos1', 'invalid', true);
            useBallotStore.getState().setBallotVote(0, 'pos1', 'pers1', true);
        });
        const state = useBallotStore.getState();
        const pos1Votes = state.ballots[0].vote.filter(v => v.position === 'pos1');
        expect(pos1Votes).toContainEqual({ position: 'pos1', person: 'pers1' });
        expect(pos1Votes).not.toContainEqual({ position: 'pos1', person: 'invalid' });
    });

    it('should handle setBallotVote - removing a vote', () => {
        act(() => {
            useBallotStore.getState().setBallotVote(0, 'pos1', 'pers1', true);
            useBallotStore.getState().setBallotVote(0, 'pos1', 'pers1', false);
        });
        const state = useBallotStore.getState();
        expect(state.ballots[0].vote).not.toContainEqual({ position: 'pos1', person: 'pers1' });
    });

    it('should navigate to next vote and create ballot if missing', () => {
        act(() => {
            useBallotStore.getState().nextVote();
        });
        const state = useBallotStore.getState();
        expect(state.currentBallotIndex).toBe(1);
        expect(state.ballots).toHaveLength(2);
        expect(state.ballots[1].index).toBe(1);
    });

    it('should navigate to next vote and NOT create ballot if already exists', () => {
        act(() => {
            useBallotStore.getState().addBallot(createNewBallot(1));
            useBallotStore.getState().nextVote();
        });
        const state = useBallotStore.getState();
        expect(state.currentBallotIndex).toBe(1);
        expect(state.ballots).toHaveLength(2);
    });

    it('should set currentBallotIndex to index-1 if removed ballot is current', () => {
        act(() => {
            useBallotStore.getState().addBallot(createNewBallot(1));
            useBallotStore.getState().setVoteIndex(1);
        });
        const ballotToRemove = useBallotStore.getState().ballots[1];
        act(() => {
            useBallotStore.getState().removeBallot(ballotToRemove);
        });
        expect(useBallotStore.getState().currentBallotIndex).toBe(0);
    });

    it('should NOT set currentBallotIndex to index-1 if removed ballot is NOT current', () => {
        act(() => {
            useBallotStore.getState().addBallot(createNewBallot(1));
            useBallotStore.getState().addBallot(createNewBallot(2));
            useBallotStore.getState().setVoteIndex(2);
        });
        const ballotToRemove = useBallotStore.getState().ballots[1];
        act(() => {
            useBallotStore.getState().removeBallot(ballotToRemove);
        });
        expect(useBallotStore.getState().currentBallotIndex).toBe(2);
    });

    it('should initialize missing ballot in setBallotVote', () => {
        act(() => {
            useBallotStore.getState().setBallotVote(5, 'pos1', 'pers1', true);
        });
        const state = useBallotStore.getState();
        const b5 = state.ballots.find(b => b.index === 5);
        expect(b5).toBeDefined();
        expect(b5?.vote).toContainEqual({ position: 'pos1', person: 'pers1' });
    });

    it('should navigate to previous vote', () => {
        act(() => {
            useBallotStore.getState().nextVote();
            useBallotStore.getState().previousVote();
        });
        const state = useBallotStore.getState();
        expect(state.currentBallotIndex).toBe(0);
    });

    it('should import ballots', () => {
        const newBallots = [
            { index: 0, vote: [] },
            { index: 1, vote: [{ position: 'p', person: 'v' }] }
        ] as any;
        act(() => {
            useBallotStore.getState().importBallots(newBallots);
        });
        const state = useBallotStore.getState();
        expect(state.ballots).toEqual(newBallots);
        expect(state.currentBallotIndex).toBe(1);
    });
});
