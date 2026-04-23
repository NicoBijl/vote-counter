import { PersonKey, PositionKey } from "../types.ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface BallotState {
    ballots: Array<Ballot>
    addBallot: (newBallot: Ballot) => void
    removeBallot: (ballot: Ballot) => void
    removeAllBallots: () => void
    nextVote: (currentIndex: number) => void
    saveVote: (ballot: Ballot) => void
    setBallotVote: (index: number, position: PositionKey, person: PersonKey, checked: boolean) => void
    importBallots: (newBallots: Array<Ballot>) => void
}

export function createNewBallot(index: number) {
    console.log('create new ballot', index);
    return {
        index: index,
        vote: []
    } as Ballot;
}

export const useBallotStore = create<BallotState>()(
    persist(
        immer((set) => {
            // initial state
            const initialState = {
                ballots: [createNewBallot(0)]
            };

            return {
                ...initialState,
                addBallot: (newBallot) => set((state) => {
                    state.ballots.push(newBallot);
                }),
                removeBallot: (ballot) => set((state) => {
                    if (state.ballots.length === 1) return; // no change
                    // remove ballot
                    state.ballots = state.ballots.filter(b => b.index !== ballot.index);
                    // re‑index remaining ballots
                    state.ballots.forEach((b, idx) => b.index = idx);
                }),
                removeAllBallots: () => set((state) => {
                    state.ballots = [createNewBallot(0)];
                }),
                saveVote: (ballotToAdd) => set((state) => {
                    const idx = state.ballots.findIndex(b => b.index === ballotToAdd.index);
                    if (idx !== -1) {
                        state.ballots[idx] = ballotToAdd;
                    } else {
                        state.ballots.push(ballotToAdd);
                    }
                }),
                setBallotVote: (index, position, person, checked) => set((state) => {
                    let ballot = state.ballots.find(b => b.index === index);
                    if (!ballot) {
                        ballot = createNewBallot(index);
                        state.ballots.push(ballot);
                    }
                    if (person === "invalid" && checked) {
                        // remove all votes for this position, add invalid
                        ballot.vote = ballot.vote.filter(v => v.position !== position);
                        ballot.vote.push({ position, person });
                    } else if (checked) {
                        // add vote (remove any invalid for this position first)
                        ballot.vote = ballot.vote.filter(v => v.position !== position || v.person !== "invalid");
                        ballot.vote.push({ position, person });
                    } else {
                        // remove vote
                        ballot.vote = ballot.vote.filter(v => v.position !== position || v.person !== person);
                    }
                }),
                nextVote: (currentIndex) => set((state) => {
                    const newIndex = currentIndex + 1;
                    if (!state.ballots.find(b => b.index === newIndex)) {
                        state.ballots.push(createNewBallot(newIndex));
                    }
                    console.log("nextVote", newIndex);
                }),
                importBallots: (newBallots) => set((state) => {
                    state.ballots = newBallots;
                })
            };
        }),
        { name: "vote-store" }
    )
);

export interface Ballot {
    index: number
    vote: Array<Vote>
}

export interface Vote {
    position: PositionKey
    person: PersonKey
}