import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Positions } from '../Positions';
import { Position } from '../../../types';
import { convertLegacyPositions } from '../../../utils/positionUtils';
import { expect, jest, describe, it, beforeEach, afterEach } from '@jest/globals';

// Mock the store
const mockStore = {
    positions: [] as Position[],
    setPositions: jest.fn()
};

jest.mock('../../../hooks/usePositionsStore', () => ({
    usePositionsStore: () => mockStore
}));

describe('Positions', () => {
    beforeEach(() => {
        mockStore.positions = [];
        mockStore.setPositions.mockClear();

        // Mock FileReader
        jest.spyOn(window, 'FileReader').mockImplementation(() => ({
            readAsText: jest.fn(),
            onload: null,
            result: '',
        } as unknown as FileReader));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle upload of positions in new format', async () => {
        const newFormatPositions = [
            {
                key: "test",
                title: "Test Position",
                persons: [],
                maxVotesPerBallot: 2,
                maxVacancies: 1
            }
        ];

        render(<Positions />);

        const file = new File([JSON.stringify(newFormatPositions)], 'positions.json', { type: 'application/json' });
        const input = screen.getByRole('button', { name: /upload positions/i });
        input.click();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Get the FileReader instance and simulate file load
        const fileReader = (window.FileReader as jest.Mock).mock.instances[0];
        Object.defineProperty(fileReader, 'result', { value: JSON.stringify(newFormatPositions) });
        fileReader.onload?.(new ProgressEvent('load'));

        await waitFor(() => {
            expect(mockStore.setPositions).toHaveBeenCalledWith(newFormatPositions);
        });
    });

    it('should handle upload of positions in old format', async () => {
        const oldFormatPositions = [
            {
                key: "test",
                title: "Test Position",
                persons: [],
                max: 2
            }
        ];

        const expectedConvertedPositions = convertLegacyPositions(oldFormatPositions);

        render(<Positions />);

        const file = new File([JSON.stringify(oldFormatPositions)], 'positions.json', { type: 'application/json' });
        const input = screen.getByRole('button', { name: /upload positions/i });
        input.click();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockStore.setPositions).toHaveBeenCalledWith(expectedConvertedPositions);
        });
    });

    it('should show error when uploaded file is not valid JSON', async () => {
        render(<Positions />);

        const file = new File(['not json'], 'positions.json', { type: 'application/json' });
        const input = screen.getByRole('button', { name: /upload positions/i });
        input.click();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            const errorElement = screen.queryByText(/Failed to upload positions/);
            expect(errorElement).not.toBeNull();
        });
    });

    it('should show error when uploaded file does not contain an array', async () => {
        render(<Positions />);

        const file = new File([JSON.stringify({ notAnArray: true })], 'positions.json', { type: 'application/json' });
        const input = screen.getByRole('button', { name: /upload positions/i });
        input.click();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            const errorElement = screen.queryByText(/Uploaded file must contain an array of positions/);
            expect(errorElement).not.toBeNull();
        });
    });
});
