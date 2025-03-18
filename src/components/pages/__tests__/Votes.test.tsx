import { render, screen, fireEvent } from '@testing-library/react';
import { Votes } from '../Votes';
import { Position, Ballot } from '../../../types';
import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// Create store states
const initialBallotState = {
    ballots: [] as Ballot[],
    currentBallotIndex: 0,
    removeBallot: jest.fn(),
    nextVote: jest.fn(),
    previousVote: jest.fn(),
    setVoteIndex: jest.fn(),
    setBallotVote: jest.fn()
};

const initialPositionsState = {
    positions: [] as Position[],
    setPositions: jest.fn()
};

// Mock the hooks with store creation
jest.mock('../../../hooks/useBallotStore', () => ({
    useBallotStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(initialBallotState);
        }
        return initialBallotState;
    })
}));

jest.mock('../../../hooks/usePositionsStore', () => ({
    usePositionsStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(initialPositionsState);
        }
        return initialPositionsState;
    })
}));

// Mock react-hotkeys-hook
jest.mock('react-hotkeys-hook', () => ({
    useHotkeys: jest.fn()
}));

describe('Votes', () => {
    const mockPosition: Position = {
        key: 'test-position',
        title: 'Test Position',
        persons: [
            { key: 'person1', name: 'Person 1' },
            { key: 'person2', name: 'Person 2' }
        ],
        maxVotesPerBallot: 1,
        maxVacancies: 1
    };

    beforeEach(() => {
        // Reset mock data
        initialBallotState.ballots = [
            { id: '1', index: 0, vote: [] }
        ];
        initialBallotState.currentBallotIndex = 0;
        initialPositionsState.positions = [mockPosition];

        // Reset mock functions
        initialBallotState.removeBallot.mockClear();
        initialBallotState.nextVote.mockClear();
        initialBallotState.previousVote.mockClear();
        initialBallotState.setVoteIndex.mockClear();
        initialBallotState.setBallotVote.mockClear();
        initialPositionsState.setPositions.mockClear();
    });

    it('renders ballot navigation', () => {
        render(<Votes />);
        expect(screen.getByText('Ballot 1 of 1')).toBeInTheDocument();
    });

    it('renders positions with checkboxes', () => {
        render(<Votes />);
        expect(screen.getByText('Test Position')).toBeInTheDocument();
        expect(screen.getByText('Person 1')).toBeInTheDocument();
        expect(screen.getByText('Person 2')).toBeInTheDocument();
    });

    it('handles vote selection', () => {
        render(<Votes />);
        const checkbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(checkbox);
        expect(mockBallotStore.setBallotVote).toHaveBeenCalledWith(0, 'test-position', 'person1', true);
    });

    it('handles navigation between ballots', () => {
        mockBallotStore.ballots = [
            { id: '1', index: 0, vote: [] },
            { id: '2', index: 1, vote: [] }
        ];

        render(<Votes />);
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
        expect(mockBallotStore.nextVote).toHaveBeenCalled();
    });

    it('shows remove ballot confirmation dialog', async () => {
        render(<Votes />);
        const removeButton = screen.getByRole('button', { name: /remove/i });
        fireEvent.click(removeButton);

        expect(screen.getByText(/Are you sure you want to remove this ballot/i)).toBeInTheDocument();

        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
        expect(mockBallotStore.removeBallot).toHaveBeenCalledWith(0);
    });

    it('handles pagination', () => {
        mockBallotStore.ballots = Array.from({ length: 15 }, (_, i) => ({
            id: String(i + 1),
            index: i,
            vote: []
        }));

        render(<Votes />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();

        const pageButton = screen.getByRole('button', { name: /page 2/i });
        fireEvent.click(pageButton);
        expect(mockBallotStore.setVoteIndex).toHaveBeenCalledWith(10);
    });

    it('handles keyboard navigation', () => {
        render(<Votes />);

        // Test arrow down for next ballot
        fireEvent.keyDown(document.body, { key: 'ArrowDown' });
        expect(mockBallotStore.nextVote).toHaveBeenCalled();

        // Test arrow up for previous ballot
        fireEvent.keyDown(document.body, { key: 'ArrowUp' });
        expect(mockBallotStore.previousVote).toHaveBeenCalled();
    });

    it('disables next button on last ballot', () => {
        mockBallotStore.currentBallotIndex = 0;
        mockBallotStore.ballots = [{ id: '1', index: 0, vote: [] }];

        render(<Votes />);
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
    });

    it('disables previous button on first ballot', () => {
        mockBallotStore.currentBallotIndex = 0;

        render(<Votes />);
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
    });
});
