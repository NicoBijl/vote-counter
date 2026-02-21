import { render, screen, fireEvent } from '@testing-library/react';
import { Positions } from '../Positions';
import '@testing-library/jest-dom';

// We mock the store's state but let it use the real functions if possible, 
// or mock the ones we need to verify.
const mockSetPositions = jest.fn();
const mockPositions = [
    {
        key: 'pos1',
        title: 'Position 1',
        persons: [
            { key: 'per1', name: 'Person 1' }
        ],
        maxVotesPerBallot: 1,
        maxVacancies: 1
    }
];

jest.mock('../../../hooks/usePositionsStore', () => ({
    usePositionsStore: () => ({
        positions: mockPositions,
        setPositions: mockSetPositions
    })
}));

describe('Positions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders positions and their fields', () => {
        render(<Positions />);
        expect(screen.getByText('Position 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Position 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('pos1')).toBeInTheDocument();
    });

    it('updates position fields on change', () => {
        render(<Positions />);
        
        const titleInput = screen.getByLabelText('Title');
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        
        expect(mockSetPositions).toHaveBeenCalled();
        const updatedPositions = mockSetPositions.mock.calls[0][0];
        expect(updatedPositions[0].title).toBe('Updated Title');
    });

    it('updates numeric fields correctly', () => {
        render(<Positions />);
        
        const maxVotesInput = screen.getByLabelText('Max Votes Per Ballot');
        fireEvent.change(maxVotesInput, { target: { value: '5' } });
        
        expect(mockSetPositions).toHaveBeenCalled();
        const updatedPositions = mockSetPositions.mock.calls[0][0];
        expect(updatedPositions[0].maxVotesPerBallot).toBe(5);
        expect(typeof updatedPositions[0].maxVotesPerBallot).toBe('number');
    });

    it('calls savePersonKey and savePersonName on change', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        render(<Positions />);
        
        const personKeyInputs = screen.getAllByLabelText('Key');
        // Index 0 is position key, index 1 is person key
        fireEvent.change(personKeyInputs[1], { target: { value: 'new-per-key' } });
        expect(consoleSpy).toHaveBeenCalledWith('savePersonKey', 'pos1', 'per1', 'new-per-key');
        
        const personNameInput = screen.getByLabelText('Name');
        fireEvent.change(personNameInput, { target: { value: 'New Person Name' } });
        expect(consoleSpy).toHaveBeenCalledWith('savePersonName', 'pos1', 'per1', 'New Person Name');
        
        consoleSpy.mockRestore();
    });
});
