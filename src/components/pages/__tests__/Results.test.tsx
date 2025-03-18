import { render, screen, fireEvent } from '@testing-library/react';
import { Results } from '../Results';
import { Position, Ballot } from '../../../types';
import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// Create store states
const initialPositionsState = {
    positions: [] as Position[],
    setPositions: jest.fn()
};

const initialBallotState = {
    ballots: [] as Ballot[],
    currentBallotIndex: 0,
    removeBallot: jest.fn(),
    nextVote: jest.fn(),
    previousVote: jest.fn(),
    setVoteIndex: jest.fn(),
    setBallotVote: jest.fn()
};

const initialSettingsState = {
    electoralDivisorVariable: 0.8,
    setElectoralDivisorVariable: jest.fn(),
    totalAllowedVoters: 100,
    setTotalAllowedVoters: jest.fn(),
    sortResultsByVoteCount: true,
    setSortResultsByVoteCount: jest.fn()
};

// Mock the hooks with store creation
jest.mock('../../../hooks/usePositionsStore', () => ({
    usePositionsStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(initialPositionsState);
        }
        return initialPositionsState;
    })
}));

jest.mock('../../../hooks/useBallotStore', () => ({
    useBallotStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(initialBallotState);
        }
        return initialBallotState;
    })
}));

jest.mock('../../../hooks/useSettingsStore', () => ({
    useSettingsStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(initialSettingsState);
        }
        return initialSettingsState;
    })
}));

describe('Results', () => {
    beforeEach(() => {
        // Reset mock data
        initialPositionsState.positions = [];
        initialBallotState.ballots = [];
        initialSettingsState.setSortResultsByVoteCount.mockClear();
        initialSettingsState.setElectoralDivisorVariable.mockClear();
        initialSettingsState.setTotalAllowedVoters.mockClear();
        initialPositionsState.setPositions.mockClear();
    });

    it('renders empty state when no positions or ballots', () => {
        render(<Results />);
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('No votes cast yet')).toBeInTheDocument();
    });

    it('calculates attendance ratio correctly', () => {
        mockSettingsStore.totalAllowedVoters = 100;
        mockBallotStore.ballots = [
            { id: '1', vote: [] },
            { id: '2', vote: [] }
        ];

        render(<Results />);
        expect(screen.getByText('Attendance: 2.0%')).toBeInTheDocument();
    });

    it('displays N/A for attendance when totalAllowedVoters is 0', () => {
        mockSettingsStore.totalAllowedVoters = 0;
        render(<Results />);
        expect(screen.getByText('Attendance: N/A')).toBeInTheDocument();
    });

    it('displays position results correctly', () => {
        const testPosition: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' },
                { key: 'person2', name: 'Person 2' }
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        mockPositionsStore.positions = [testPosition];
        mockBallotStore.ballots = [
            { id: '1', vote: [{ position: 'test-position', person: 'person1' }] },
            { id: '2', vote: [{ position: 'test-position', person: 'person1' }] }
        ];

        render(<Results />);
        expect(screen.getByText('Test Position')).toBeInTheDocument();
        expect(screen.getByText('Person 1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Vote count for Person 1
    });

    it('handles invalid votes correctly', () => {
        const testPosition: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' }
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        mockPositionsStore.positions = [testPosition];
        mockBallotStore.ballots = [
            { id: '1', vote: [{ position: 'test-position', person: 'invalid' }] }
        ];

        render(<Results />);
        expect(screen.getByText('Invalid votes: 1')).toBeInTheDocument();
    });

    it('toggles sort by vote count', () => {
        render(<Results />);
        const sortToggle = screen.getByRole('checkbox', { name: /sort by vote count/i });
        fireEvent.click(sortToggle);
        expect(mockSettingsStore.setSortResultsByVoteCount).toHaveBeenCalledWith(false);
    });
});
