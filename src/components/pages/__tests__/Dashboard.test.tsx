import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import '@testing-library/jest-dom';

describe('Dashboard', () => {
    it('renders welcome message', () => {
        render(<Dashboard />);
        expect(screen.getByText('Welcome to the Vote Counter App')).toBeInTheDocument();
    });

    it('renders introduction paragraph', () => {
        render(<Dashboard />);
        expect(screen.getByText(/Welcome to the Vote Counter App, your straightforward solution/)).toBeInTheDocument();
    });

    it('renders features list', () => {
        render(<Dashboard />);
        expect(screen.getByText("Here's what our app offers:")).toBeInTheDocument();
        
        // Check all feature list items
        const features = [
            'Simple Vote Counting: Easily tally votes and get accurate results quickly.',
            'Manage Candidates and Positions: Update and manage candidates and positions with ease.',
            'Results Display: View the election results in a clear and no-fuss format.',
            'Voting Setup: Set up your election with essential features for a straightforward voting process.'
        ];
        
        features.forEach(feature => {
            expect(screen.getByText(feature)).toBeInTheDocument();
        });
    });

    it('renders closing paragraph', () => {
        render(<Dashboard />);
        expect(screen.getByText(/Our goal is to offer an easy-to-use tool/)).toBeInTheDocument();
    });
});
