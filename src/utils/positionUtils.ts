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
    
    // Validate position object has the minimum required fields
    if (!position || typeof position !== 'object') {
        console.error("[DEBUG_LOG] Invalid position object:", position);
        throw new Error("Invalid position object");
    }
    
    // Ensure the position has key and title
    const key = position.key || `position_${Date.now()}`;
    const title = position.title || "Unnamed Position";
    
    // Ensure persons array exists
    const persons = Array.isArray(position.persons) ? position.persons : [];
    
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
        key,
        title,
        persons,
        maxVotesPerBallot,
        maxVacancies
    };
    console.log("[DEBUG_LOG] Created updated position:", updatedPosition);

    return updatedPosition;
}

/**
 * Converts an array of positions from legacy format to current format.
 * If the input is not an array, returns an empty array.
 */
export function convertLegacyPositions(positions: any): Position[] {
    if (!Array.isArray(positions)) {
        console.error("[DEBUG_LOG] Expected positions to be an array but got:", typeof positions);
        return [];
    }
    
    // Filter out invalid positions and convert the valid ones
    return positions
        .filter(position => position && typeof position === 'object')
        .map(position => {
            try {
                return convertLegacyPosition(position);
            } catch (error) {
                console.error("[DEBUG_LOG] Error converting position:", error);
                return null;
            }
        })
        .filter(Boolean) as Position[];
}
