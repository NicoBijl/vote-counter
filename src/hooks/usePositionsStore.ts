import {Position} from "../types.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";

const defaultPositions = [{
    max: 1,
    key: "diaken",
    title: "Diaken",
    persons: [
        {key: "diaken1", name: "Diaken 1"},
        {key: "diaken2", name: "Diaken 2"}
    ]
},
    {
        max: 2,
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
        max: 1,
        key: "secretaris",
        title: "Secretaris",
        persons: [
            {key: "sec1", name: "Secretaris 1"}
        ]
    }
] as Array<Position>;

export const usePositionsStore = create<PositionStore>()(persist(
    (set) => {
        return ({
            positions: defaultPositions,
            setPositions : (newPositions) => set(() => ({positions: newPositions}))
        })
    },
    {
        name: "positions-store", // by default localStorage is used.
    }
))

interface PositionStore {
    positions: Array<Position>
    setPositions: (newPositions: Array<Position>) => void
}