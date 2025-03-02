import { render, screen, fireEvent } from '@testing-library/react';
import { BallotPosition } from '../Votes';
import { Position } from '../../../types';
import { expect, jest, describe, it } from '@jest/globals';

describe('BallotPosition', () => {
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

    const mockProps = {
        position: mockPosition,
        positionTabIndex: 1,
        focussed: false,
        setFocusPosition: jest.fn(),
        isChecked: jest.fn().mockReturnValue(false),
        setChecked: jest.fn(),
        maxReached: jest.fn().mockReturnValue(false)
    };

    it('renders position title and persons', () => {
        render(<BallotPosition {...mockProps} />);
        expect(screen.getByText('Test Position')).toBeInTheDocument();
        expect(screen.getByText('Person 1')).toBeInTheDocument();
        expect(screen.getByText('Person 2')).toBeInTheDocument();
    });

    it('shows max votes per ballot', () => {
        render(<BallotPosition {...mockProps} />);
        expect(screen.getByText('Max votes per ballot: 1')).toBeInTheDocument();
    });

    it('renders checkboxes for each person', () => {
        render(<BallotPosition {...mockProps} />);
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3); // 2 persons + 1 invalid option
    });

    it('calls setChecked when checkbox is clicked', () => {
        render(<BallotPosition {...mockProps} />);
        const checkbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(checkbox);
        expect(mockProps.setChecked).toHaveBeenCalledWith('test-position', 'person1', true);
    });

    it('disables checkboxes when max is reached', () => {
        const maxReachedProps = {
            ...mockProps,
            maxReached: jest.fn().mockReturnValue(true)
        };
        render(<BallotPosition {...maxReachedProps} />);
        const checkboxes = screen.getAllByRole('checkbox').slice(0, 2); // Exclude invalid checkbox
        checkboxes.forEach(checkbox => {
            expect(checkbox).toBeDisabled();
        });
    });

    it('shows number chips when focused', () => {
        const focusedProps = {
            ...mockProps,
            focussed: true
        };
        render(<BallotPosition {...focusedProps} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('calls setFocusPosition when focused', () => {
        render(<BallotPosition {...mockProps} />);
        const positionElement = screen.getByText('Test Position').closest('[tabindex]');
        fireEvent.focus(positionElement!);
        expect(mockProps.setFocusPosition).toHaveBeenCalledWith(mockPosition);
    });

    it('handles invalid vote selection', () => {
        render(<BallotPosition {...mockProps} />);
        const invalidCheckbox = screen.getByLabelText('Invalid');
        fireEvent.click(invalidCheckbox);
        expect(mockProps.setChecked).toHaveBeenCalledWith('test-position', 'invalid', true);
    });

    it('disables person checkboxes when invalid is selected', () => {
        const invalidSelectedProps = {
            ...mockProps,
            isChecked: jest.fn().mockImplementation((_, person) => person === 'invalid')
        };
        render(<BallotPosition {...invalidSelectedProps} />);
        const personCheckboxes = screen.getAllByRole('checkbox').slice(0, 2); // Exclude invalid checkbox
        personCheckboxes.forEach(checkbox => {
            expect(checkbox).toBeDisabled();
        });
    });
});
