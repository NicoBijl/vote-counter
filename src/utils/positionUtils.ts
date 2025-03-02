import { Position } from "../types";

export interface LegacyPosition extends Omit<Position, 'maxVotesPerBallot' | 'maxVacancies'> {
    max?: number;
    maxVotesPerBallot?: number;
    maxVacancies?: number;
}

/**
 * Converts a position from legacy format to current format.
 * Handles both old format with 'max' field and partially updated formats.
 */
export function convertLegacyPosition(position: LegacyPosition): Position {
    console.log("[DEBUG_LOG] Processing position:", position);

    // First, handle migration from max to maxVotesPerBallot
    let maxVotesPerBallot = 1;
    if ('max' in position && position.max !== undefined) {
        maxVotesPerBallot = position.max;
    } else if ('maxVotesPerBallot' in position && position.maxVotesPerBallot !== undefined) {
        maxVotesPerBallot = position.maxVotesPerBallot;
    }
    console.log("[DEBUG_LOG] Determined maxVotesPerBallot:", maxVotesPerBallot);

    // Then, determine maxVacancies based on the original position
    const maxVacancies = position.maxVacancies !== undefined ? position.maxVacancies : maxVotesPerBallot;
    console.log("[DEBUG_LOG] Determined maxVacancies:", maxVacancies);

    // Create a new position with all required fields
    const updatedPosition: Position = {
        key: position.key,
        title: position.title,
        persons: position.persons,
        maxVotesPerBallot,
        maxVacancies
    };
    console.log("[DEBUG_LOG] Created updated position:", updatedPosition);

    return updatedPosition;
}

/**
 * Converts an array of positions from legacy format to current format.
 */
export function convertLegacyPositions(positions: LegacyPosition[]): Position[] {
    return positions.map(convertLegacyPosition);
}
