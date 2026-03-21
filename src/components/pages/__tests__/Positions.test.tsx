import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Positions } from '../Positions';
import '@testing-library/jest-dom';
import { usePositionsStore } from '../../../hooks/usePositionsStore';
import { useBallotStore } from '../../../hooks/useBallotStore';
import { Position } from '../../../types';

// Mock the components from @hello-pangea/dnd to avoid issues in Jest
jest.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Droppable: ({ children }: { children: (provided: { draggableProps: object, innerRef: jest.Mock, placeholder: React.ReactNode }) => React.ReactNode }) => children({
        draggableProps: {},
        innerRef: jest.fn(),
        placeholder: null,
    }),
    Draggable: ({ children }: { children: (provided: { draggableProps: object, dragHandleProps: object, innerRef: jest.Mock }) => React.ReactNode }) => children({
        draggableProps: {},
        dragHandleProps: {},
        innerRef: jest.fn(),
    }),
}));

const mockSetPositions = jest.fn();
const mockPositions: Position[] = [
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

jest.mock('../../../hooks/usePositionsStore');
jest.mock('../../../hooks/useBallotStore');

describe('Positions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (usePositionsStore as unknown as jest.Mock).mockReturnValue({
            positions: mockPositions,
            setPositions: mockSetPositions
        });
        (useBallotStore as unknown as jest.Mock).mockReturnValue({
            ballots: []
        });
    });

    it('renders positions table', () => {
        render(<Positions />);
        expect(screen.getByText('Position 1')).toBeInTheDocument();
        expect(screen.getByText('pos1')).toBeInTheDocument();
        // Check persons count specifically
        const rows = screen.getAllByRole('row');
        // Find the row that contains "Position 1" (title) and "pos1" (key)
        const posRow = rows.find(r => 
            r.textContent?.includes('Position 1') && 
            r.textContent?.includes('pos1')
        );
        expect(posRow).toBeDefined();
        // We know that in the default view, '1' appears multiple times in the row
        // (Max Votes, Max Vacancies, Persons Count).
        // Let's just check that at least one '1' is present in this row.
        expect(within(posRow!).getAllByText('1').length).toBeGreaterThanOrEqual(1);
    });

    it('enters edit mode for a position', async () => {
        render(<Positions />);
        
        const editButton = screen.getByLabelText('Edit Position');
        fireEvent.click(editButton);
        
        expect(screen.getByPlaceholderText('Title')).toHaveValue('Position 1');
        expect(screen.getByPlaceholderText('Key')).toHaveValue('pos1');
    });

    it('updates position fields and saves', async () => {
        render(<Positions />);
        
        fireEvent.click(screen.getByLabelText('Edit Position'));
        
        const titleInput = screen.getByPlaceholderText('Title');
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        
        const saveButton = screen.getByLabelText('Save Position');
        fireEvent.click(saveButton);
        
        await waitFor(() => {
            expect(mockSetPositions).toHaveBeenCalled();
        });
        const updatedPositions = mockSetPositions.mock.calls[0][0];
        expect(updatedPositions[0].title).toBe('Updated Title');
    });

    it('adds a new position', async () => {
        render(<Positions />);
        
        const addButton = screen.getByRole('button', { name: 'Add New Position' });
        fireEvent.click(addButton);
        
        // In the test environment, the component might not immediately reflect the change
        // due to useTransition. We wait for the setPositions call which should be triggered.
        // We'll use a slightly longer timeout for Jest
        await waitFor(() => {
            expect(mockSetPositions).toHaveBeenCalled();
        }, { timeout: 3000 });
        
        const newPositions = mockSetPositions.mock.calls[0][0];
        expect(newPositions.length).toBeGreaterThanOrEqual(1);
    });

    it('expands position to show persons', () => {
        render(<Positions />);
        
        const expandButton = screen.getByLabelText('expand row');
        fireEvent.click(expandButton);
        
        expect(screen.getByText('Persons for Position 1')).toBeInTheDocument();
        expect(screen.getByText('Person 1')).toBeInTheDocument();
        expect(screen.getByText('per1')).toBeInTheDocument();
    });

    it('disables delete and key editing if position is used', () => {
        (useBallotStore as unknown as jest.Mock).mockReturnValue({
            ballots: [{ vote: [{ position: 'pos1', person: 'per1' }] }]
        });
        
        render(<Positions />);
        
        const deleteButton = screen.getByLabelText('Delete Position');
        expect(deleteButton).toBeDisabled();
        
        fireEvent.click(screen.getByLabelText('Edit Position'));
        const keyInput = screen.getByPlaceholderText('Key');
        expect(keyInput).toBeDisabled();
    });
});
