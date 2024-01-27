import {create} from "zustand";
import {persist} from "zustand/middleware";

export const useSettingsStore = create<SettingsStore>()(persist(
    (set) => {
        return ({
            electoralDivisorVariable: 0.8,
            setElectoralDivisorVariable: (newValue) => set({electoralDivisorVariable: newValue})
        })
    },
    {
        name: "positions-store", // by default localStorage is used.
    }
))

interface SettingsStore {
    electoralDivisorVariable: number
    setElectoralDivisorVariable: (newValue: number) => void
}