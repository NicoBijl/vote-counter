import {Position} from "../types.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";
import {convertLegacyPositions} from "../utils/positionUtils";

const defaultPositions = [{
    maxVotesPerBallot: 1,
    maxVacancies: 1,
    key: "diaken",
    title: "Diaken",
    persons: [
        {key: "diaken1", name: "Diaken 1"},
        {key: "diaken2", name: "Diaken 2"}
    ]
},
    {
        maxVotesPerBallot: 2,
        maxVacancies: 2,
        key: "ouderling",
        title: "Ouderling",
        persons: [
            {key: "ouderling1", name: "Ouderling 1"},
            {key: "ouderling2", name: "Ouderling 2"},
            {key: "ouderling3", name: "Ouderling 3"},
            {key: "ouderling4", name: "Ouderling 4"}
        ]
    },
    {
        maxVotesPerBallot: 1,
        maxVacancies: 1,
        key: "secretaris",
        title: "Secretaris",
        persons: [
            {key: "sec1", name: "Secretaris 1"}
        ]
    }
] as Array<Position>;

export const usePositionsStore = create<PositionStore>()(persist(
    (set) => ({
        positions: defaultPositions,  // Start with default positions
        setPositions: (newPositions: Position[]) => {
            console.log("[DEBUG_LOG] Setting positions:", newPositions);
            set({ positions: newPositions });
        }
    }),
    {
        name: "positions-store",
        version: 1,
        onRehydrateStorage: () => (state) => {
            console.log("[DEBUG_LOG] Starting rehydration");

            // If no state, return early
            if (!state) {
                console.log("[DEBUG_LOG] No state found");
                return;
            }

            // Get stored positions or empty array
            const storedPositions = state.positions || [];
            console.log("[DEBUG_LOG] Found positions in state:", storedPositions);

            // Only process if we have stored positions
            if (storedPositions.length > 0) {
                const migratedPositions = convertLegacyPositions(storedPositions);
                console.log("[DEBUG_LOG] Setting migrated positions:", migratedPositions);
                state.setPositions(migratedPositions);
            }
        }
    }
))

interface PositionStore {
    positions: Array<Position>
    setPositions: (newPositions: Array<Position>) => void
}
