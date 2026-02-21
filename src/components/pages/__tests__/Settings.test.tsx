import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';
import { Position, Ballot } from '../../../types';
import '@testing-library/jest-dom';

// Create store states
const mockPositionsStore = {
    positions: [] as Position[],
    setPositions: jest.fn()
};

const mockBallotStore = {
    ballots: [] as Ballot[],
    removeAllBallots: jest.fn(),
    currentBallotIndex: 0,
    removeBallot: jest.fn(),
    nextVote: jest.fn(),
    previousVote: jest.fn(),
    setVoteIndex: jest.fn(),
    setBallotVote: jest.fn(),
    importBallots: jest.fn()
};

const mockSettingsStore = {
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
            return selector(mockPositionsStore);
        }
        return mockPositionsStore;
    })
}));

jest.mock('../../../hooks/useBallotStore', () => ({
    useBallotStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockBallotStore);
        }
        return mockBallotStore;
    })
}));

jest.mock('../../../hooks/useSettingsStore', () => ({
    useSettingsStore: jest.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockSettingsStore);
        }
        return mockSettingsStore;
    })
}));

describe('Settings', () => {
    beforeEach(() => {
        // Reset mock data and functions
        mockPositionsStore.positions = [];
        mockPositionsStore.setPositions.mockClear();
        mockBallotStore.removeAllBallots.mockClear();
        mockBallotStore.importBallots.mockClear();
        mockSettingsStore.setElectoralDivisorVariable.mockClear();
        mockSettingsStore.setSortResultsByVoteCount.mockClear();
        mockSettingsStore.setTotalAllowedVoters.mockClear();

        // Mock file operations
        if (global.URL.createObjectURL === undefined) {
            global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url') as unknown as (blob: Blob | MediaSource) => string;
            global.URL.revokeObjectURL = jest.fn();
        }
    });

    it('renders all sections', () => {
        render(<Settings />);
        expect(screen.getByText('Positions')).toBeInTheDocument();
        expect(screen.getByText('Votes')).toBeInTheDocument();
        expect(screen.getByText('Results')).toBeInTheDocument();
    });

    it('handles position import with valid file', async () => {
        const validPositions = [
            { key: 'pos1', title: 'Position 1', persons: [], maxVotesPerBallot: 1, maxVacancies: 1 }
        ];

        const file = new File([JSON.stringify(validPositions)], 'positions.json', { type: 'application/json' });

        render(<Settings />);
        const fileInput = document.querySelector('input[id="importPositions"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockPositionsStore.setPositions).toHaveBeenCalledWith(validPositions);
            expect(screen.getByText(/Positions successfully imported/)).toBeInTheDocument();
        });
    });

    it('handles legacy position format conversion', async () => {
        const legacyPositions = [{ key: 'p1', title: 'P1', persons: [], max: 2 }];
        const file = new File([JSON.stringify(legacyPositions)], 'legacy.json', { type: 'application/json' });
        
        render(<Settings />);
        const fileInput = document.querySelector('input[id="importPositions"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        await waitFor(() => {
            expect(mockPositionsStore.setPositions).toHaveBeenCalled();
            const converted = mockPositionsStore.setPositions.mock.calls[0][0][0];
            expect(converted.maxVotesPerBallot).toBe(2);
        });
    });

    it('handles vote import with valid file', async () => {
        const validBallots = [{ id: '1', index: 0, vote: [] }];
        const file = new File([JSON.stringify(validBallots)], 'ballots.json', { type: 'application/json' });

        render(<Settings />);
        const fileInput = document.querySelector('input[id="importVotes"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockBallotStore.importBallots).toHaveBeenCalledWith(validBallots);
            expect(screen.getByText(/Votes successfully imported/)).toBeInTheDocument();
        });
    });

    it('handles vote import with invalid format', async () => {
        const invalidData = [{ notABallot: true }];
        const file = new File([JSON.stringify(invalidData)], 'invalid.json', { type: 'application/json' });

        render(<Settings />);
        const fileInput = document.querySelector('input[id="importVotes"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Invalid ballot format. Please check the file structure.')).toBeInTheDocument();
        });
    });

    it('removes all votes when clicked', () => {
        render(<Settings />);
        fireEvent.click(screen.getByText('Remove all votes'));
        expect(mockBallotStore.removeAllBallots).toHaveBeenCalled();
    });

    it('updates electoral divisor', () => {
        render(<Settings />);
        const input = screen.getByLabelText('Electoral Divisor');
        fireEvent.change(input, { target: { value: '0.9' } });
        expect(mockSettingsStore.setElectoralDivisorVariable).toHaveBeenCalledWith(0.9);
    });

    it('updates total allowed voters', () => {
        render(<Settings />);
        const input = screen.getByLabelText('Total Allowed Voters');
        fireEvent.change(input, { target: { value: '150' } });
        expect(mockSettingsStore.setTotalAllowedVoters).toHaveBeenCalledWith(150);
    });

    it('exports positions when clicked', () => {
        const testPositions = [{ key: 'pos1', title: 'P1', persons: [], maxVotesPerBallot: 1, maxVacancies: 1 }];
        mockPositionsStore.positions = testPositions;
        render(<Settings />);
        
        const mockLink = { href: '', download: '', click: jest.fn() };
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
        
        fireEvent.click(screen.getByText('Export Positions'));
        
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(mockLink.href).toContain(encodeURIComponent(JSON.stringify(testPositions)));
        expect(mockLink.click).toHaveBeenCalled();
        
        createElementSpy.mockRestore();
    });

    it('exports votes when clicked', () => {
        const testBallots = [{ id: '1', index: 0, vote: [] }];
        mockBallotStore.ballots = testBallots;
        render(<Settings />);
        
        const mockLink = { href: '', download: '', click: jest.fn() };
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
        
        fireEvent.click(screen.getByText('Export Votes'));
        
        expect(mockLink.href).toContain(encodeURIComponent(JSON.stringify(testBallots)));
        expect(mockLink.download).toContain('ballots');
        expect(mockLink.click).toHaveBeenCalled();
        
        createElementSpy.mockRestore();
    });
});
