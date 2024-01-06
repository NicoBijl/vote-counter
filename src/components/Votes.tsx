import {Ballot, createNewBallot, usePositions, useVoteStore} from "../context.ts";
import {Button, Checkbox, FormControl, FormControlLabel, Pagination} from "@mui/material";
import {Person, PersonKey, Position, PositionKey} from "../types.ts";
import {ChangeEvent, useState} from "react";

export function Votes() {
    const {votes, currentVoteIndex, nextVote, setVoteIndex, setBallotVote} = useVoteStore()
    const currentVote = useVoteStore(state => state.votes.find(b => b.index == state.currentVoteIndex)!)
    const positions = usePositions()

    function togglePerson(position: Position, person: Person, checked: boolean) {
        console.log("Toggle", position.key, person.key, currentVote)
        setBallotVote(currentVoteIndex, position.key, person.key, checked)
    }

    function handleVoteChange(_event: ChangeEvent<unknown>, pageNumber: number) {
        setVoteIndex(pageNumber - 1)
    }

    function isChecked(positionKey: PositionKey, personKey: PersonKey): boolean {
        return currentVote?.vote.find(v => v.position == positionKey && v.person == personKey)?.checked ?? false
    }

    return <>
        Vote: {currentVoteIndex}
        <FormControl>
            <ul>
                {positions.map((position, positionIndex) => <li key={position.key}>
                    {position.title}
                    <ul>
                        {position.persons.map((person) => (
                            <li key={person.key}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            onChange={(_event, checked) => togglePerson(position, person, checked)}
                                            checked={isChecked(position.key, person.key)}
                                        />
                                    }
                                    label={person.name}/>
                            </li>
                        ))}
                    </ul>
                </li>)}
            </ul>
            <Button onClick={nextVote} variant="contained" color="primary">Next Vote</Button>
        </FormControl>

        <Pagination
            count={Math.max(votes.length, 1)}
            color="primary"
            page={currentVoteIndex + 1}
            onChange={handleVoteChange}/>

        <ul>
            {currentVote.vote.map((vote, index) => (
                <li key={"vote-" + index}>
                    vote : {vote.position} / {vote.person} = {vote.checked ? "yes" : "no"}
                </li>
            ))}
        </ul>
    </>;
}