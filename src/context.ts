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

interface VotesState {
    votes: Array<Ballot>
    currentVoteIndex: number
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

export const useVoteStore = create<VotesState>()(persist(
    (set) => {
        const DEFAULT = {
            votes: [createNewBallot(0)],
            currentVoteIndex: 0
        }
        return ({
            ...DEFAULT,
            addVotes: (newVote) => set((state) => ({votes: state.votes.concat([newVote])})),
            setVoteIndex: (newVoteIndex) => set(() => {
                console.log("setVoteIndex", newVoteIndex)
                return ({currentVoteIndex: newVoteIndex});
            }),
            saveVote: (ballotToAdd) => set((state) => {
                return ({votes: state.votes.filter((ballot: Ballot) => ballot.index != ballotToAdd.index).concat([ballotToAdd])});
            }),
            setBallotVote: (index, position, person, checked) => set((state) => {
                console.log("setBallotVote", index, position, person, checked)
                const updatedBallot = state.votes.find(b => b.index == index) ?? createNewBallot(index);
                // replace one vote within the ballot
                updatedBallot.vote = updatedBallot.vote.filter(v => v.position != position || v.person != person).concat({
                    position,
                    person,
                    checked
                } as Vote)
                // replace one ballot in the list of ballots
                const updatedState = state.votes.filter((ballot: Ballot) => ballot.index != index).concat([updatedBallot])
                return ({
                    votes: updatedState
                });
            }),
            nextVote: () => set((state) => {
                const nextVoteIndex = state.currentVoteIndex + 1;
                let updatedVotes;
                if (!state.votes.find(b => b.index == nextVoteIndex)) {
                    // create empty ballot if not existing
                    updatedVotes = state.votes.concat([createNewBallot(nextVoteIndex)])
                } else {
                    updatedVotes = state.votes
                }
                console.log("nextVote", nextVoteIndex)
                return ({currentVoteIndex: nextVoteIndex, votes: updatedVotes});
            }),
            previousVote: () => set((state) => ({currentVoteIndex: state.currentVoteIndex - 1}))
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
    checked: boolean
}
