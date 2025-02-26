import {create} from "zustand";
import {persist} from "zustand/middleware";

export const useSettingsStore = create<SettingsStore>()(persist(
    (set) => {
        return ({
            electoralDivisorVariable: 0.8,
            setElectoralDivisorVariable: (newValue) => set({electoralDivisorVariable: newValue}),
            sortResultsByVoteCount: false,
            setSortResultsByVoteCount: (newValue) => set({sortResultsByVoteCount: newValue}),
            totalAllowedVoters: 0,
            setTotalAllowedVoters: (newValue) => set({totalAllowedVoters: newValue})
        })
    },
    {
        name: "positions-store", // by default localStorage is used.
    }
))

interface SettingsStore {
    electoralDivisorVariable: number
    setElectoralDivisorVariable: (newValue: number) => void
    sortResultsByVoteCount: boolean
    setSortResultsByVoteCount: (newValue: boolean) => void
    totalAllowedVoters: number
    setTotalAllowedVoters: (newValue: number) => void
}
