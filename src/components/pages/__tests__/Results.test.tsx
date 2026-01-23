import { render, screen } from '@testing-library/react';
import { Results } from '../Results';
import { Position, Ballot } from '../../../types';
import '@testing-library/jest-dom';
import React from 'react';

// Create store states
const mockPositionsState = {
    positions: [] as Position[],
    setPositions: jest.fn()
};

const mockBallotState = {
    ballots: [] as Ballot[],
    currentBallotIndex: 0,
    removeBallot: jest.fn(),
    nextVote: jest.fn(),
    previousVote: jest.fn(),
    setVoteIndex: jest.fn(),
    setBallotVote: jest.fn(),
    importBallots: jest.fn(),
    removeAllBallots: jest.fn()
};

const mockSettingsState = {
    electoralDivisorVariable: 0.8,
    setElectoralDivisorVariable: jest.fn(),
    totalAllowedVoters: 100,
    setTotalAllowedVoters: jest.fn(),
    sortResultsByVoteCount: false,
    setSortResultsByVoteCount: jest.fn()
};

// Mock the hooks with store creation
jest.mock('../../../hooks/usePositionsStore', () => ({
    usePositionsStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockPositionsState);
        }
        return mockPositionsState;
    })
}));

jest.mock('../../../hooks/useBallotStore', () => ({
    useBallotStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockBallotState);
        }
        return mockBallotState;
    })
}));

jest.mock('../../../hooks/useSettingsStore', () => ({
    useSettingsStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockSettingsState);
        }
        return mockSettingsState;
    })
}));

// Mock the recharts components to avoid rendering issues in tests
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
        PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
        Pie: () => <div data-testid="pie"></div>,
        Cell: () => <div data-testid="cell"></div>,
        Tooltip: () => <div data-testid="tooltip"></div>,
        // Add mock for text element to prevent the "unrecognized tag" warning
        text: ({ children }: { children: React.ReactNode }) => <div data-testid="text">{children}</div>
    };
});

describe('Results', () => {
    beforeEach(() => {
        // Reset mock data
        mockPositionsState.positions = [];
        mockBallotState.ballots = [];
        mockSettingsState.setSortResultsByVoteCount.mockClear();
        mockSettingsState.setElectoralDivisorVariable.mockClear();
        mockSettingsState.setTotalAllowedVoters.mockClear();
        mockPositionsState.setPositions.mockClear();
        mockSettingsState.sortResultsByVoteCount = false;
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

        mockPositionsState.positions = [testPosition];
        mockBallotState.ballots = [
            { id: '1', index: 0, vote: [{ position: 'test-position', person: 'person1' }] },
            { id: '2', index: 1, vote: [{ position: 'test-position', person: 'person1' }] }
        ];

        render(<Results />);
        expect(screen.getByText('Test Position')).toBeInTheDocument();
        expect(screen.getByText('Person 1')).toBeInTheDocument();
    });

    it('displays persons in original order when sortResultsByVoteCount is false', () => {
        const testPosition: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' }, // Will have 1 vote
                { key: 'person2', name: 'Person 2' }, // Will have 3 votes
                { key: 'person3', name: 'Person 3' }  // Will have 2 votes
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        mockPositionsState.positions = [testPosition];
        mockBallotState.ballots = [
            { id: '1', index: 0, vote: [{ position: 'test-position', person: 'person1' }] },
            { id: '2', index: 1, vote: [{ position: 'test-position', person: 'person2' }] },
            { id: '3', index: 2, vote: [{ position: 'test-position', person: 'person2' }] },
            { id: '4', index: 3, vote: [{ position: 'test-position', person: 'person2' }] },
            { id: '5', index: 4, vote: [{ position: 'test-position', person: 'person3' }] },
            { id: '6', index: 5, vote: [{ position: 'test-position', person: 'person3' }] }
        ];

        mockSettingsState.sortResultsByVoteCount = false;

        render(<Results />);

        // Get all list items
        const listItems = screen.getAllByRole('listitem');

        // Find the list items containing the person names
        const personItems = listItems.filter(item => 
            item.textContent?.includes('Person 1') || 
            item.textContent?.includes('Person 2') || 
            item.textContent?.includes('Person 3')
        );

        // Verify the order matches the original order in the position definition
        expect(personItems[0].textContent).toContain('Person 1');
        expect(personItems[1].textContent).toContain('Person 2');
        expect(personItems[2].textContent).toContain('Person 3');
    });

    it('splits persons by electoral divisor when sortResultsByVoteCount is true', () => {
        const testPosition: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' }, // Will have 1 vote (below divisor)
                { key: 'person2', name: 'Person 2' }, // Will have 3 votes (above divisor)
                { key: 'person3', name: 'Person 3' }  // Will have 2 votes (above divisor)
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        mockPositionsState.positions = [testPosition];
        mockBallotState.ballots = [
            { id: '1', index: 0, vote: [{ position: 'test-position', person: 'person1' }] },
            { id: '2', index: 1, vote: [{ position: 'test-position', person: 'person2' }] },
            { id: '3', index: 2, vote: [{ position: 'test-position', person: 'person2' }] },
            { id: '4', index: 3, vote: [{ position: 'test-position', person: 'person2' }] },
            { id: '5', index: 4, vote: [{ position: 'test-position', person: 'person3' }] },
            { id: '6', index: 5, vote: [{ position: 'test-position', person: 'person3' }] }
        ];

        // Set electoral divisor variable to make the divisor 2
        // With 6 votes total and 3 persons, the divisor would be 6/3*0.8 = 1.6, rounded up to 2
        mockSettingsState.electoralDivisorVariable = 0.8;
        mockSettingsState.sortResultsByVoteCount = true;

        render(<Results />);

        // Check for the electoral divisor display
        expect(screen.getByText(/Electoral Divisor: 2/)).toBeInTheDocument();

        // Get all list items
        const listItems = screen.getAllByRole('listitem');

        // Find the list items containing the person names
        const personItems = listItems.filter(item => 
            item.textContent?.includes('Person 1') || 
            item.textContent?.includes('Person 2') || 
            item.textContent?.includes('Person 3')
        );

        // When sorted by vote count with electoral divisor:
        // Person 2 (3 votes) and Person 3 (2 votes) should be above the divisor
        // Person 1 (1 vote) should be below the divisor

        // First should be Person 2 (most votes)
        expect(personItems[0].textContent).toContain('Person 2');
        expect(personItems[0].textContent).toContain('3'); // Vote count

        // Second should be Person 3
        expect(personItems[1].textContent).toContain('Person 3');
        expect(personItems[1].textContent).toContain('2'); // Vote count

        // Last should be Person 1 (below divisor)
        expect(personItems[2].textContent).toContain('Person 1');
        expect(personItems[2].textContent).toContain('1'); // Vote count
    });

    it('correctly identifies candidate status for elected candidates', () => {
        // Create a position with 4 candidates and 2 vacancies
        const testPosition: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' },
                { key: 'person2', name: 'Person 2' },
                { key: 'person3', name: 'Person 3' },
                { key: 'person4', name: 'Person 4' }
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 2
        };

        // Create ballots with votes: person1 (10), person2 (8), person3 (8), person4 (5)
        const ballots: Ballot[] = [];

        // 10 votes for person1
        for (let i = 0; i < 10; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person1'}]
            });
        }

        // 8 votes for person2 and person3
        for (let i = 0; i < 8; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person2'}]
            });

            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person3'}]
            });
        }

        // 5 votes for person4
        for (let i = 0; i < 5; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person4'}]
            });
        }

        mockPositionsState.positions = [testPosition];
        mockBallotState.ballots = ballots;

        // Set electoral divisor variable to make the divisor 7
        // With 31 votes total and 4 persons, the divisor would be 31/4*0.8 = 6.2, rounded up to 7
        mockSettingsState.electoralDivisorVariable = 0.8;
        mockSettingsState.sortResultsByVoteCount = true;

        render(<Results />);

        // Should have an electoral divisor display
        expect(screen.getByText(/Electoral Divisor: 7/)).toBeInTheDocument();

        // Verify the person list items are correctly ordered and have the proper status indicators
        const listItems = screen.getAllByRole('listitem');
        
        // Find all person items (they will have vote counts in the text)
        const personItems = listItems.filter(item => 
            item.textContent?.includes('Person 1') || 
            item.textContent?.includes('Person 2') || 
            item.textContent?.includes('Person 3') ||
            item.textContent?.includes('Person 4')
        );

        // Person items should be sorted by vote count:
        // Person 1 (10 votes) - Elected
        // Person 2 (8 votes) - Above divisor 
        // Person 3 (8 votes) - Above divisor
        // Person 4 (5 votes) - Below divisor
        expect(personItems[0].textContent).toContain('Person 1');
        expect(personItems[0].textContent).toContain('10'); // vote count
    });

    it('correctly identifies candidate status for candidates above divisor', () => {
        const testPosition: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' },
                { key: 'person2', name: 'Person 2' },
                { key: 'person3', name: 'Person 3' },
                { key: 'person4', name: 'Person 4' }
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        // Create ballots with votes:
        // person1 (10), person2 (8), person3 (8), person4 (5)
        const ballots: Ballot[] = [];

        // 10 votes for person1
        for (let i = 0; i < 10; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person1'}]
            });
        }

        // 8 votes for person2 and person3
        for (let i = 0; i < 8; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person2'}]
            });

            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person3'}]
            });
        }

        // 5 votes for person4
        for (let i = 0; i < 5; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person4'}]
            });
        }

        mockPositionsState.positions = [testPosition];
        mockBallotState.ballots = ballots;

        // Set electoral divisor variable to make the divisor 7
        mockSettingsState.electoralDivisorVariable = 0.8;
        mockSettingsState.sortResultsByVoteCount = true;

        render(<Results />);

        // Should have an electoral divisor display
        expect(screen.getByText(/Electoral Divisor: 7/)).toBeInTheDocument();

        // Person 1 should be ELECTED (has more votes than divisor and is in top candidates)
        expect(screen.getByTestId('person-chip-sorted-above-test-position-person1')).toBeInTheDocument();
        
        // Person 2 and 3 should be ABOVE_DIVISOR (has more votes than divisor but not in top candidates)
        expect(screen.getByTestId('person-chip-sorted-above-test-position-person2')).toBeInTheDocument();
        expect(screen.getByTestId('person-chip-sorted-above-test-position-person3')).toBeInTheDocument();
        
        // Person 4 should be BELOW_DIVISOR (has fewer votes than divisor)
        expect(screen.getByTestId('person-chip-sorted-below-test-position-person4')).toBeInTheDocument();
    });

    it('correctly identifies candidate status for candidates below divisor', () => {
        const testPosition: Position = {
            key: 'test-position',
            title: 'Test Position',
            persons: [
                { key: 'person1', name: 'Person 1' },
                { key: 'person2', name: 'Person 2' },
                { key: 'person3', name: 'Person 3' }
            ],
            maxVotesPerBallot: 1,
            maxVacancies: 1
        };

        // Create ballots with votes:
        // person1 (1), person2 (3), person3 (2)
        const ballots: Ballot[] = [];

        // 1 vote for person1
        ballots.push({
            id: 'ballot-1',
            index: 0,
            vote: [{position: 'test-position', person: 'person1'}]
        });

        // 3 votes for person2
        for (let i = 0; i < 3; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person2'}]
            });
        }

        // 2 votes for person3
        for (let i = 0; i < 2; i++) {
            ballots.push({
                id: `ballot-${ballots.length}`,
                index: ballots.length,
                vote: [{position: 'test-position', person: 'person3'}]
            });
        }

        mockPositionsState.positions = [testPosition];
        mockBallotState.ballots = ballots;

        // Set electoral divisor variable to make the divisor 2
        mockSettingsState.electoralDivisorVariable = 0.8;
        mockSettingsState.sortResultsByVoteCount = true;

        render(<Results />);

        // Check for the electoral divisor display
        expect(screen.getByText(/Electoral Divisor: 2/)).toBeInTheDocument();

        // Person 1 should be BELOW_DIVISOR (has fewer votes than divisor)
        expect(screen.getByTestId('person-chip-sorted-below-test-position-person1')).toBeInTheDocument();
        
        // Person 2 and 3 should be ABOVE_DIVISOR (have more votes than divisor)
        expect(screen.getByTestId('person-chip-sorted-above-test-position-person2')).toBeInTheDocument();
        expect(screen.getByTestId('person-chip-sorted-above-test-position-person3')).toBeInTheDocument();
    });
});