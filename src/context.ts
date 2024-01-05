import {createContext, useContext} from "react";
import {PersonKey, Position, PositionKey} from "./types.ts";
import {create} from "zustand";

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
}

export const useVoteStore = create<VotesState>((set) =>
    ({
        votes: new Array<Ballot>(),
        currentVoteIndex: 0,
        addVotes: (newVote) => set((state) => ({votes: state.votes.concat([newVote])})),
        setVoteIndex: (newVoteIndex) => set(() => ({currentVoteIndex: newVoteIndex})),
        saveVote: (ballotToAdd) => set((state) => {
            return ({votes: state.votes.filter((ballot: Ballot) => ballot.index != ballotToAdd.index).concat([ballotToAdd])});
        }),
        setBallotVote: (index, position, person, checked) => set((state) => {
            console.log("update ", index, position, person, checked)
            const ballotWithIndex = state.votes.find(b => b.index == index) ?? {
                index: index,
                vote: new Map<PositionKey, Map<PersonKey, boolean>>()
            } as Ballot;
            const positionVote = ballotWithIndex.vote.get(position) ?? new Map<PersonKey, boolean>();
            ballotWithIndex.vote.set(position, positionVote.set(person, checked))

            console.log("updated", ballotWithIndex)
            const updatedState = state.votes.filter((ballot: Ballot) => ballot.index != index).concat([ballotWithIndex])
            console.log("new state", updatedState)
            return ({
                votes: updatedState
            });
        }),
        nextVote: () => set((state) => ({currentVoteIndex: state.currentVoteIndex + 1})),
        previousVote: () => set((state) => ({currentVoteIndex: state.currentVoteIndex - 1}))
    })
)

export interface Ballot {
    index: number
    vote: Map<PositionKey, Map<PersonKey, boolean>>
}
