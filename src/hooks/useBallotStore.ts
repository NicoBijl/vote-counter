import {PersonKey, PositionKey} from "../types.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";

interface BallotState {
    ballots: Array<Ballot>
    addBallot: (newBallot: Ballot) => void
    removeBallot: (ballot: Ballot) => void
    removeAllBallots: () => void
    nextVote: (currentIndex: number) => void
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
                ballots: [createNewBallot(0)]
            }
        }

        return ({
            ...createDefault(),
            addBallot: (newBallot) => set((state) => ({ballots: state.ballots.concat([newBallot])})),
            removeBallot: (ballot) => set((state) => {
                if (state.ballots.length === 1) {
                    return state
                }
                // remove ballot from array, recalculate indexes.
                return ({
                    ballots: state.ballots
                        .filter(b => b.index !== ballot.index)
                        .map((b, index) => ({
                            ...b,
                            index
                        }))
                });
            }),
            removeAllBallots: () => set(() => createDefault()),
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
            nextVote: (currentIndex) => set((state) => {
                const newBallotIndex = currentIndex + 1;
                let updatedBallots;
                if (!state.ballots.find(b => b.index == newBallotIndex)) {
                    // create empty ballot if not existing
                    updatedBallots = state.ballots.concat([createNewBallot(newBallotIndex)])
                } else {
                    updatedBallots = state.ballots
                }
                console.log("nextVote", newBallotIndex)
                return ({ballots: updatedBallots});
            }),
            importBallots: (newBallots: Array<Ballot>) => {
                console.log("[DEBUG_LOG] Setting ballots:", newBallots);
                set({
                    ballots: newBallots
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
