import {createContext, useContext} from "react";
import {PersonKey, Position, PositionKey} from "./types.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";

export const PositionsContext = createContext([{
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
] as Array<Position>);

export function usePositions() {
    return useContext(PositionsContext);
}

interface BallotState {
    ballots: Array<Ballot>
    currentBallotIndex: number
    addVotes: (newVote: Ballot) => void
    nextVote: () => void
    previousVote: () => void
    setVoteIndex: (index: number) => void
    saveVote: (ballot: Ballot) => void
    setBallotVote: (index: number, position: PositionKey, person: PersonKey, checked: boolean) => void
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
        const DEFAULT = {
            ballots: [createNewBallot(0)],
            currentBallotIndex: 0
        }
        return ({
            ...DEFAULT,
            addVotes: (newVote) => set((state) => ({ballots: state.ballots.concat([newVote])})),
            setVoteIndex: (newBallotIndex) => set(() => {
                console.log("setVoteIndex", newBallotIndex)
                return ({currentBallotIndex: newBallotIndex});
            }),
            saveVote: (ballotToAdd) => set((state) => {
                return ({ballots: state.ballots.filter((ballot: Ballot) => ballot.index != ballotToAdd.index).concat([ballotToAdd])});
            }),
            setBallotVote: (index, position, person, checked) => set((state) => {
                console.log("setBallotVote", index, position, person, checked)

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
                        .filter(v => v.position!=position || v.person !== "invalid")
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
            previousVote: () => set((state) => ({currentBallotIndex: state.currentBallotIndex - 1}))
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
