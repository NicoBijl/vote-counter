import {Position} from "../types.ts";
import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
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

export const usePositionsStore = create<PositionStore>()(
    persist(
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
            storage: createJSONStorage(() => localStorage),
            migrate: (persistedState: any, version: number) => {
                console.log("[DEBUG_LOG] Migrating state version:", version);

                if (version === 0) {
                    // Handle migration from version 0
                    const positions = persistedState?.positions || defaultPositions;
                    return {
                        ...persistedState,
                        positions: convertLegacyPositions(positions)
                    };
                }
                return persistedState;
            },
            onRehydrateStorage: () => (state) => {
                console.log("[DEBUG_LOG] Starting rehydration");
                if (!state) {
                    console.log("[DEBUG_LOG] No state found");
                    return;
                }
                console.log("[DEBUG_LOG] Rehydrated state:", state);
            }
        }
    )
)

interface PositionStore {
    positions: Array<Position>
    setPositions: (newPositions: Array<Position>) => void
}
