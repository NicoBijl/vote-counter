import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      electoralDivisorVariable: 0.8,
      setElectoralDivisorVariable: (newValue) => set((state) => {
        state.electoralDivisorVariable = newValue;
      }),
      sortResultsByVoteCount: false,
      setSortResultsByVoteCount: (newValue) => set((state) => {
        state.sortResultsByVoteCount = newValue;
      }),
      totalAllowedVoters: 0,
      setTotalAllowedVoters: (newValue) => set((state) => {
        state.totalAllowedVoters = newValue;
      }),
    })),
    { name: "settings-store" }
  )
);

interface SettingsStore {
  electoralDivisorVariable: number;
  setElectoralDivisorVariable: (newValue: number) => void;
  sortResultsByVoteCount: boolean;
  setSortResultsByVoteCount: (newValue: boolean) => void;
  totalAllowedVoters: number;
  setTotalAllowedVoters: (newValue: number) => void;
}