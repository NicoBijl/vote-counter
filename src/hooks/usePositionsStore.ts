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

export const _positionsStoreMigration = (persistedState: unknown, version: number) => {
    const defaultPositions = [
        {
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

    console.log("[DEBUG_LOG] Migrating state version:", version);

    if (!persistedState || typeof persistedState !== 'object') {
        console.log("[DEBUG_LOG] No persisted state, using defaults");
        return { positions: defaultPositions };
    }

    const state = persistedState as { positions?: unknown };

    if (version === 0 || !('positions' in state)) {
        console.log("[DEBUG_LOG] Migrating from version 0 or invalid state");
        const positions = state.positions || defaultPositions;
        return {
            ...state,
            positions: convertLegacyPositions(positions)
        };
    }
    
    console.log("[DEBUG_LOG] Ensuring position format for version:", version);
    return {
        ...state,
        positions: convertLegacyPositions(state.positions)
    };
};

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
            migrate: _positionsStoreMigration,
        }
    )
)

interface PositionStore {
    positions: Array<Position>
    setPositions: (newPositions: Array<Position>) => void
}
