import {PersonKey, PositionKey} from "../types.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";

interface BallotState {
    ballots: Array<Ballot>
    currentBallotIndex: number
    addBallot: (newBallot: Ballot) => void
    removeBallot: (ballot: Ballot) => void
    removeAllBallots: () => void
    nextVote: () => void
    previousVote: () => void
    setVoteIndex: (index: number) => void
    saveVote: (ballot: Ballot) => void
    setBallotVote: (index: number, position: PositionKey, person: PersonKey, checked: boolean) => void
    importBallots: (newBallots: Array<Ballot>) => void
    // countVoted: (position: PositionKey, person: PersonKey)=> number
}

export function createNewBallot(index: number) {
    console.log('create new ballot', index)
    return {
        index: index,
        vote: []
    } as Ballot;
}

export const useBallotStore = create<BallotState>()(persist(
    (set) => {
        const createDefault = () => {
            return {
                ballots: [createNewBallot(0)],
                currentBallotIndex: 0
            }
        }

        return ({
            ...createDefault(),
            addBallot: (newBallot) => set((state) => ({ballots: state.ballots.concat([newBallot])})),
            removeBallot: (ballot) => set((state) => {
                if (state.ballots.length == 1) {
                    return ({}) // disable removal of the first vote.
                }
                // remove ballot from array, recalculate indexes, and update currentBallotIndex only if the last ballot was removed.
                let index = 0;
                return ({
                    ballots: state.ballots.filter(b => b.index != ballot.index).map(b => {
                        b.index = index;
                        index++
                        return b
                    }),
                    currentBallotIndex: Math.max(ballot.index == state.currentBallotIndex ? state.currentBallotIndex - 1 : state.currentBallotIndex, 0)
                });
            }),
            removeAllBallots: () => set(() => createDefault()),
            setVoteIndex: (newBallotIndex) => set(() => {
                console.log("setVoteIndex", newBallotIndex)
                return ({currentBallotIndex: newBallotIndex});
            }),
            saveVote: (ballotToAdd) => set((state) => {
                return ({ballots: state.ballots.filter((ballot: Ballot) => ballot.index != ballotToAdd.index).concat([ballotToAdd])});
            }),
            setBallotVote: (index, position, person, checked) => set((state) => {
                // console.log("setBallotVote", index, position, person, checked)

                const updatedBallot = state.ballots.find(b => b.index == index) ?? createNewBallot(index);
                if (person == "invalid" && checked) {
                    // remove all votes, add invalid
                    updatedBallot.vote = updatedBallot.vote.filter(v => v.position != position)
                        .concat({
                            position,
                            person
                        } as Vote)
                } else if (checked) {
                    // add
                    updatedBallot.vote = updatedBallot.vote
                        .filter(v => v.position != position || v.person !== "invalid")
                        .concat({
                            position,
                            person
                        } as Vote)
                } else {
                    // remove
                    updatedBallot.vote = updatedBallot.vote.filter(v => v.position != position || v.person != person)
                }
                // replace one vote within the ballot

                // replace one ballot in the list of ballots
                const updatedBallots = state.ballots.filter((ballot: Ballot) => ballot.index != index).concat([updatedBallot])
                return ({
                    ballots: updatedBallots
                });
            }),
            nextVote: () => set((state) => {
                const newBallotIndex = state.currentBallotIndex + 1;
                let updatedBallots;
                if (!state.ballots.find(b => b.index == newBallotIndex)) {
                    // create empty ballot if not existing
                    updatedBallots = state.ballots.concat([createNewBallot(newBallotIndex)])
                } else {
                    updatedBallots = state.ballots
                }
                console.log("nextVote", newBallotIndex)
                return ({currentBallotIndex: newBallotIndex, ballots: updatedBallots});
            }),
            previousVote: () => set((state) => ({currentBallotIndex: Math.max(state.currentBallotIndex - 1, 0)})),
            importBallots: (newBallots: Array<Ballot>) => {
                console.log("[DEBUG_LOG] Setting ballots:", newBallots);
                set({
                    ballots: newBallots,
                    currentBallotIndex: newBallots.length - 1
                });
            }
        });
    },
    {
        name: "vote-store", // by default localStorage is used.
    }
))

export interface Ballot {
    index: number
    vote: Array<Vote>
}

export interface Vote {
    position: PositionKey
    person: PersonKey
}
