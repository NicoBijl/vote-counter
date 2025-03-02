import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';
import { Position, Ballot } from '../../../types';
import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// Mock the stores
const mockPositionsStore = {
    positions: [] as Position[],
    setPositions: jest.fn(),
};

const mockBallotStore = {
    ballots: [] as Ballot[],
    removeAllBallots: jest.fn(),
};

const mockSettingsStore = {
    electoralDivisorVariable: 0.8,
    setElectoralDivisorVariable: jest.fn(),
    sortResultsByVoteCount: true,
    setSortResultsByVoteCount: jest.fn(),
    totalAllowedVoters: 100,
    setTotalAllowedVoters: jest.fn(),
};

jest.mock('../../../hooks/usePositionsStore', () => ({
    usePositionsStore: () => mockPositionsStore
}));

jest.mock('../../../hooks/useBallotStore', () => ({
    useBallotStore: () => mockBallotStore
}));

jest.mock('../../../hooks/useSettingsStore', () => ({
    useSettingsStore: () => mockSettingsStore
}));

describe('Settings', () => {
    beforeEach(() => {
        // Reset mock data and functions
        mockPositionsStore.positions = [];
        mockPositionsStore.setPositions.mockClear();
        mockBallotStore.removeAllBallots.mockClear();
        mockSettingsStore.setElectoralDivisorVariable.mockClear();
        mockSettingsStore.setSortResultsByVoteCount.mockClear();
        mockSettingsStore.setTotalAllowedVoters.mockClear();

        // Mock file operations
        global.URL.createObjectURL = jest.fn();
        global.URL.revokeObjectURL = jest.fn();
    });

    it('renders all sections', () => {
        render(<Settings />);
        expect(screen.getByText('Positions')).toBeInTheDocument();
        expect(screen.getByText('Votes')).toBeInTheDocument();
        expect(screen.getByText('Results')).toBeInTheDocument();
    });

    it('handles position export', () => {
        const mockPositions = [
            { key: 'pos1', title: 'Position 1', persons: [], maxVotesPerBallot: 1, maxVacancies: 1 }
        ];
        mockPositionsStore.positions = mockPositions;

        const mockLink = { click: jest.fn() };
        jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

        render(<Settings />);
        fireEvent.click(screen.getByText('Export Positions'));

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(mockLink.click).toHaveBeenCalled();
    });

    it('handles position import with valid file', async () => {
        const validPositions = [
            { key: 'pos1', title: 'Position 1', persons: [], maxVotesPerBallot: 1, maxVacancies: 1 }
        ];

        const file = new File([JSON.stringify(validPositions)], 'positions.json', { type: 'application/json' });
        
        render(<Settings />);
        const importButton = screen.getByText('Import Positions');
        fireEvent.click(importButton);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockPositionsStore.setPositions).toHaveBeenCalledWith(validPositions);
            expect(screen.getByText(/Positions successfully imported/)).toBeInTheDocument();
        });
    });

    it('handles position import with invalid file', async () => {
        const invalidData = { notAnArray: true };
        const file = new File([JSON.stringify(invalidData)], 'positions.json', { type: 'application/json' });
        
        render(<Settings />);
        const importButton = screen.getByText('Import Positions');
        fireEvent.click(importButton);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Uploaded file must contain an array of positions')).toBeInTheDocument();
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

    it('toggles sort by vote count', () => {
        render(<Settings />);
        const toggle = screen.getByRole('checkbox');
        fireEvent.click(toggle);
        expect(mockSettingsStore.setSortResultsByVoteCount).toHaveBeenCalledWith(false);
    });
});
